import 'cross-fetch/polyfill';
import { faker } from '@faker-js/faker';
import request, { SuperTest, Test } from 'supertest';
import jwt from 'jsonwebtoken';
import superAgentDefaults from 'superagent-defaults';
import {
  ApiServiceLevelEnum,
  EmailBlockTypeEnum,
  IApiRateLimitMaximum,
  IEmailBlock,
  isClerkEnabled,
  MemberRoleEnum,
  ALL_PERMISSIONS,
  StepTypeEnum,
} from '@novu/shared';
import {
  ChangeEntity,
  ChangeRepository,
  CommunityOrganizationRepository,
  EnvironmentEntity,
  FeedRepository,
  LayoutRepository,
  NotificationGroupEntity,
  NotificationGroupRepository,
  OrganizationEntity,
  SubscriberRepository,
  UserEntity,
} from '@novu/dal';

import { NotificationTemplateService } from './notification-template.service';
import { TestServer, testServer } from './test-server.service';
import { OrganizationService } from './organization.service';
import { EnvironmentService } from './environment.service';
import { CreateTemplatePayload } from './create-notification-template.interface';
import { IntegrationService } from './integration.service';
import { UserService } from './user.service';
import { JobsService } from './jobs.service';
import { EEUserService } from './ee/ee.user.service';
import { EEOrganizationService } from './ee/ee.organization.service';
import { TEST_USER_PASSWORD } from './constants';
import { ClerkJwtPayload } from './ee/types';
import { CLERK_ORGANIZATION_1, CLERK_USER_1 } from './ee/clerk-mock-data';

type UserSessionOptions = {
  noOrganization?: boolean;
  noEnvironment?: boolean;
  noWidgetSession?: boolean;
  showOnBoardingTour?: boolean;
  ee?: {
    userId: string;
    orgId: string;
  };
};

const EMAIL_BLOCK: IEmailBlock[] = [
  {
    type: EmailBlockTypeEnum.TEXT,
    content: 'Email Content',
  },
];

export class UserSession {
  private notificationGroupRepository = new NotificationGroupRepository();
  private feedRepository = new FeedRepository();
  private layoutRepository = new LayoutRepository();
  private changeRepository: ChangeRepository = new ChangeRepository();
  private environmentService: EnvironmentService = new EnvironmentService();
  private integrationService: IntegrationService = new IntegrationService();
  private jobsService: JobsService;

  token: string;

  subscriberToken: string;

  subscriberId: string;

  subscriberProfile: {
    _id: string;
  } | null = null;

  notificationGroups: NotificationGroupEntity[] = [];

  organization: OrganizationEntity;

  user: UserEntity;

  testAgent: SuperTest<Test>;

  environment: EnvironmentEntity;

  testServer: null | TestServer = testServer;

  apiKey: string;

  constructor(public serverUrl = `http://127.0.0.1:${process.env.PORT}`) {
    this.jobsService = new JobsService();
  }

  async initialize(options: UserSessionOptions = {}) {
    if (isClerkEnabled()) {
      await this.initializeEE(options);
    } else {
      await this.initializeCommunity(options);
    }
  }

  private async initializeCommunity(options: UserSessionOptions = {}) {
    const card = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };

    const userService = new UserService();
    const userEntity: Partial<UserEntity> = {
      lastName: card.lastName,
      firstName: card.firstName,
      email: `${card.firstName}_${card.lastName}_${faker.datatype.uuid()}@gmail.com`.toLowerCase(),
      profilePicture: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 60) + 1}.jpg`,
      tokens: [],
      password: TEST_USER_PASSWORD,
      showOnBoarding: true,
      showOnBoardingTour: options.showOnBoardingTour ? 0 : 2,
    };

    this.user = await userService.createUser(userEntity);

    if (!options.noOrganization) {
      await this.addOrganizationCommunity();
    }

    if (!options.noOrganization && !options?.noEnvironment) {
      await this.createEnvironmentsAndFeeds();
    }

    await this.fetchJwtCommunity();

    if (!options.noOrganization) {
      if (!options?.noEnvironment) {
        await this.updateOrganizationDetails();
      }
    }

    if (!options.noOrganization && !options.noEnvironment && !options.noWidgetSession) {
      const { token, profile } = await this.initializeWidgetSession();
      this.subscriberToken = token;
      this.subscriberProfile = profile;
    }
  }

  private async initializeEE(options: UserSessionOptions) {
    const userService = new EEUserService();

    const externalUserId = options.ee?.userId || CLERK_USER_1.id;
    const externalOrgId = options.ee?.orgId || CLERK_ORGANIZATION_1.id;

    const user = await userService.getUser(externalUserId);

    if (!user._id) {
      // not linked in clerk
      this.user = await userService.createUser(externalUserId);
    } else {
      this.user = user;
    }

    if (!options.noOrganization) {
      await this.addOrganizationEE(externalOrgId);
    }

    await this.fetchJwtEE();

    if (!options.noOrganization && !options?.noEnvironment) {
      await this.createEnvironmentsAndFeeds();
    }

    await this.fetchJwtEE();

    if (!options.noOrganization) {
      if (!options?.noEnvironment) {
        await this.updateOrganizationDetails();
      }
    }

    if (!options.noOrganization && !options.noEnvironment && !options.noWidgetSession) {
      const { token, profile } = await this.initializeWidgetSession();
      this.subscriberToken = token;
      this.subscriberProfile = profile;
    }
  }

  private async initializeWidgetSession() {
    this.subscriberId = SubscriberRepository.createObjectId();

    const { body } = await this.testAgent
      .post('/v1/widgets/session/initialize')
      .send({
        applicationIdentifier: this.environment.identifier,
        subscriberId: this.subscriberId,
        firstName: 'Widget User',
        lastName: 'Test',
        email: 'test@example.com',
      })
      .expect(201);

    const { token, profile } = body.data;

    return { token, profile };
  }

  private shouldUseTestServer() {
    return this.testServer && !this.serverUrl;
  }

  private get requestEndpoint() {
    return this.shouldUseTestServer() ? this.testServer?.getHttpServer() : this.serverUrl;
  }

  async fetchJWT() {
    if (isClerkEnabled()) {
      await this.fetchJwtEE();
    } else {
      await this.fetchJwtCommunity();
    }
  }

  async addOrganization() {
    if (!isClerkEnabled()) {
      return await this.addOrganizationCommunity();
    } else {
      throw new Error('Not implemented');
    }
  }

  private async fetchJwtCommunity() {
    const response = await request(this.requestEndpoint).get(
      `/v1/auth/test/token/${this.user._id}?organizationId=${this.organization ? this.organization._id : ''}`
    );

    this.token = `Bearer ${response.body.data}`;
    this.testAgent = superAgentDefaults(request(this.requestEndpoint))
      .set('Authorization', this.token)
      .set('Novu-Environment-Id', this.environment ? this.environment._id : '');
  }

  private async fetchJwtEE() {
    await this.updateEETokenClaims({
      externalId: this.user ? this.user._id : '',
      externalOrgId: this.organization ? this.organization._id : '',
      org_role: MemberRoleEnum.OWNER,
      org_permissions: ALL_PERMISSIONS,
      _id: this.user ? this.user.externalId : 'does_not_matter',
      org_id: this.organization ? this.organization.externalId : 'does_not_matter',
    });
  }

  async updateEETokenClaims(claims: Partial<ClerkJwtPayload>) {
    try {
      const currentPayload = this.token ? jwt.decode(this.token.replace('Bearer ', '')) : null;

      const baseToken = process.env.CLERK_LONG_LIVED_TOKEN as string;
      const payload = {
        ...jwt.decode(baseToken),
        ...(currentPayload || {}),
        ...claims,
      };

      const encodedToken = jwt.sign(payload, process.env.CLERK_MOCK_JWT_PRIVATE_KEY, {
        algorithm: 'RS256',
      });

      this.token = `Bearer ${encodedToken}`;

      // Update test agent with new token and current environment
      this.testAgent = superAgentDefaults(request(this.requestEndpoint))
        .set('Authorization', this.token)
        .set('Novu-Environment-Id', this.environment?._id || '');
    } catch (error) {
      console.error('Error in updateEETokenClaims:', error);
      throw error;
    }
  }

  async createEnvironmentsAndFeeds(): Promise<void> {
    const development = await this.createEnvironment('Development');
    this.environment = development;
    const production = await this.createEnvironment('Production', development._id);
    this.apiKey = this.environment.apiKeys[0].key;

    await this.createIntegrations([development, production]);

    await this.createFeed();
    await this.createFeed('New');
  }

  async createEnvironment(name = 'Test environment', parentId?: string): Promise<EnvironmentEntity> {
    const environment = await this.environmentService.createEnvironment(
      this.organization._id,
      this.user._id,
      name,
      parentId
    );

    let parentGroup;
    if (parentId) {
      parentGroup = await this.notificationGroupRepository.findOne({
        _environmentId: parentId,
        _organizationId: this.organization._id,
      });
    }

    await this.notificationGroupRepository.create({
      name: 'General',
      _environmentId: environment._id,
      _organizationId: this.organization._id,
      _parentId: parentGroup?._id,
    });

    await this.layoutRepository.create({
      name: 'Default',
      identifier: 'default-layout',
      _environmentId: environment._id,
      _organizationId: this.organization._id,
      isDefault: true,
    });

    return environment;
  }

  async updateOrganizationDetails() {
    await this.testAgent
      .put('/v1/organizations/branding')
      .send({
        color: '#2a9d8f',
        logo: 'https://dashboard.novu.co/static/images/logo-light.png',
        fontColor: '#214e49',
        contentBackground: '#c2cbd2',
        fontFamily: 'Montserrat',
      })
      .expect(200);

    const groupsResponse = await this.testAgent.get('/v1/notification-groups');

    this.notificationGroups = groupsResponse.body.data;
  }

  async createTemplate(template?: Partial<CreateTemplatePayload>) {
    const service = new NotificationTemplateService(this.user._id, this.organization._id, this.environment._id);

    return await service.createTemplate(template);
  }

  async createIntegrations(environments: EnvironmentEntity[]): Promise<void> {
    for (const environment of environments) {
      await this.integrationService.createChannelIntegrations(environment._id, this.organization._id);
    }
  }

  async createChannelTemplate(channel: StepTypeEnum) {
    const service = new NotificationTemplateService(this.user._id, this.organization._id, this.environment._id);

    return await service.createTemplate({
      steps: [
        {
          type: channel,
          content: channel === StepTypeEnum.EMAIL ? EMAIL_BLOCK : 'Test notification content',
        },
      ],
    });
  }

  private async addOrganizationCommunity() {
    const organizationService = new OrganizationService();

    this.organization = await organizationService.createOrganization();
    await organizationService.addMember(this.organization._id, this.user._id);

    return this.organization;
  }

  private async addOrganizationEE(orgId: string) {
    const organizationService = new EEOrganizationService();

    try {
      // is not linked
      this.organization = await organizationService.createOrganization(orgId);
    } catch (e) {
      // is already linked
      this.organization = (await organizationService.getOrganization(orgId)) as OrganizationEntity;
    }

    return this.organization;
  }

  async switchToProdEnvironment() {
    const prodEnvironment = await this.environmentService.getProductionEnvironment(this.organization._id);
    if (prodEnvironment) {
      await this.switchEnvironment(prodEnvironment._id);
    }
  }

  // TODO: Replace with a getDevId
  async switchToDevEnvironment() {
    const devEnvironment = await this.environmentService.getDevelopmentEnvironment(this.organization._id);
    if (devEnvironment) {
      await this.switchEnvironment(devEnvironment._id);
    }
  }

  // TODO: create EE version
  async switchEnvironment(environmentId: string) {
    const environment = await this.environmentService.getEnvironment(environmentId);

    if (environment) {
      this.environment = environment;
      await this.testAgent.post(`/v1/auth/environments/${environmentId}/switch`);

      if (isClerkEnabled()) {
        await this.fetchJwtEE();
      } else {
        await this.fetchJwtCommunity();
      }
    }
  }

  async createFeed(name?: string) {
    // eslint-disable-next-line no-param-reassign
    name = name || 'Activities';
    const feed = await this.feedRepository.create({
      name,
      identifier: name,
      _environmentId: this.environment._id,
      _organizationId: this.organization._id,
    });

    return feed;
  }

  public async waitForJobCompletion(templateId?: string | string[], organizationId = this.organization._id) {
    return this.jobsService.waitForJobCompletion({
      templateId,
      organizationId,
    });
  }

  public async waitForDbJobCompletion({
    templateId,
    organizationId,
  }: {
    templateId?: string | string[];
    organizationId?: string | string[];
  }) {
    return this.jobsService.waitForDbJobCompletion({ templateId, organizationId });
  }

  public async waitForWorkflowQueueCompletion() {
    return this.jobsService.waitForWorkflowQueueCompletion();
  }

  public async waitForSubscriberQueueCompletion() {
    return this.jobsService.waitForSubscriberQueueCompletion();
  }

  public async waitForStandardQueueCompletion() {
    return this.jobsService.waitForStandardQueueCompletion();
  }

  public async runStandardQueueDelayedJobsImmediately() {
    return this.jobsService.runStandardQueueDelayedJobsImmediately();
  }

  public async applyChanges(where: Partial<ChangeEntity> = {}) {
    const changes = await this.changeRepository.find(
      {
        _environmentId: this.environment._id,
        _organizationId: this.organization._id,
        _parentId: { $exists: false, $eq: null },
        ...where,
      },
      '',
      {
        sort: { createdAt: 1 },
      }
    );

    for (const change of changes) {
      await this.testAgent.post(`/v1/changes/${change._id}/apply`);
    }
  }

  public async updateOrganizationServiceLevel(serviceLevel: ApiServiceLevelEnum) {
    const communityOrganizationRepository = new CommunityOrganizationRepository();

    await communityOrganizationRepository.update({ _id: this.organization._id }, { apiServiceLevel: serviceLevel });
  }

  public async updateEnvironmentApiRateLimits(apiRateLimits: Partial<IApiRateLimitMaximum>) {
    await this.environmentService.updateApiRateLimits(this.environment._id, apiRateLimits);
  }
}
