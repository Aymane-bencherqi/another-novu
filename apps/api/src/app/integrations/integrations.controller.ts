import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ChannelTypeEnum, UserSessionData, PermissionsEnum } from '@novu/shared';
import {
  CalculateLimitNovuIntegration,
  CalculateLimitNovuIntegrationCommand,
  OtelSpan,
  RequirePermissions,
} from '@novu/application-generic';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserSession } from '../shared/framework/user.decorator';
import { CreateIntegration } from './usecases/create-integration/create-integration.usecase';
import { CreateIntegrationRequestDto } from './dtos/create-integration-request.dto';
import { CreateIntegrationCommand } from './usecases/create-integration/create-integration.command';
import { GetIntegrations } from './usecases/get-integrations/get-integrations.usecase';
import { GetIntegrationsCommand } from './usecases/get-integrations/get-integrations.command';
import { UpdateIntegrationRequestDto } from './dtos/update-integration.dto';
import { UpdateIntegration } from './usecases/update-integration/update-integration.usecase';
import { UpdateIntegrationCommand } from './usecases/update-integration/update-integration.command';
import { RemoveIntegrationCommand } from './usecases/remove-integration/remove-integration.command';
import { RemoveIntegration } from './usecases/remove-integration/remove-integration.usecase';
import { GetActiveIntegrations } from './usecases/get-active-integration/get-active-integration.usecase';
import { IntegrationResponseDto } from './dtos/integration-response.dto';
import { ExternalApiAccessible } from '../auth/framework/external-api.decorator';
import { GetWebhookSupportStatus } from './usecases/get-webhook-support-status/get-webhook-support-status.usecase';
import { GetWebhookSupportStatusCommand } from './usecases/get-webhook-support-status/get-webhook-support-status.command';
import { GetInAppActivatedCommand } from './usecases/get-in-app-activated/get-in-app-activated.command';
import { GetInAppActivated } from './usecases/get-in-app-activated/get-in-app-activated.usecase';
import {
  ApiCommonResponses,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiResponse,
} from '../shared/framework/response.decorator';
import { ChannelTypeLimitDto } from './dtos/get-channel-type-limit.sto';
import { GetActiveIntegrationsCommand } from './usecases/get-active-integration/get-active-integration.command';
import { SetIntegrationAsPrimary } from './usecases/set-integration-as-primary/set-integration-as-primary.usecase';
import { SetIntegrationAsPrimaryCommand } from './usecases/set-integration-as-primary/set-integration-as-primary.command';
import { RequireAuthentication } from '../auth/framework/auth.decorator';
import { SdkGroupName, SdkMethodName } from '../shared/framework/swagger/sdk.decorators';

@ApiCommonResponses()
@Controller('/integrations')
@UseInterceptors(ClassSerializerInterceptor)
@RequireAuthentication()
@ApiTags('Integrations')
export class IntegrationsController {
  constructor(
    private getInAppActivatedUsecase: GetInAppActivated,
    private getIntegrationsUsecase: GetIntegrations,
    private getActiveIntegrationsUsecase: GetActiveIntegrations,
    private getWebhookSupportStatusUsecase: GetWebhookSupportStatus,
    private createIntegrationUsecase: CreateIntegration,
    private updateIntegrationUsecase: UpdateIntegration,
    private setIntegrationAsPrimaryUsecase: SetIntegrationAsPrimary,
    private removeIntegrationUsecase: RemoveIntegration,
    private calculateLimitNovuIntegration: CalculateLimitNovuIntegration
  ) {}

  @Get('/')
  @ApiOkResponse({
    type: [IntegrationResponseDto],
    description: 'The list of integrations belonging to the organization that are successfully returned.',
  })
  @ApiOperation({
    summary: 'Get integrations',
    description:
      'Return all the integrations the user has created for that organization. Review v.0.17.0 changelog for a breaking change',
  })
  @ExternalApiAccessible()
  @RequirePermissions(PermissionsEnum.INTEGRATION_READ)
  async listIntegrations(@UserSession() user: UserSessionData): Promise<IntegrationResponseDto[]> {
    return await this.getIntegrationsUsecase.execute(
      GetIntegrationsCommand.create({
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        userId: user._id,
      })
    );
  }

  @Get('/active')
  @ApiOkResponse({
    type: [IntegrationResponseDto],
    description: 'The list of active integrations belonging to the organization that are successfully returned.',
  })
  @ApiOperation({
    summary: 'Get active integrations',
    description:
      'Return all the active integrations the user has created for that organization. Review v.0.17.0 changelog for a breaking change',
  })
  @ExternalApiAccessible()
  @SdkMethodName('listActive')
  @RequirePermissions(PermissionsEnum.INTEGRATION_READ)
  async getActiveIntegrations(@UserSession() user: UserSessionData): Promise<IntegrationResponseDto[]> {
    return await this.getActiveIntegrationsUsecase.execute(
      GetActiveIntegrationsCommand.create({
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        userId: user._id,
      })
    );
  }

  @Get('/webhook/provider/:providerOrIntegrationId/status')
  @ApiOkResponse({
    type: Boolean,
    description: 'The status of the webhook for the provider requested',
  })
  @ApiOperation({
    summary: 'Get webhook support status for provider',
    description:
      'Return the status of the webhook for this provider, if it is supported or if it is not based on a boolean value',
  })
  @SdkGroupName('Integrations.Webhooks')
  @ExternalApiAccessible()
  @RequirePermissions(PermissionsEnum.INTEGRATION_READ)
  async getWebhookSupportStatus(
    @UserSession() user: UserSessionData,
    @Param('providerOrIntegrationId') providerOrIntegrationId: string
  ): Promise<boolean> {
    return await this.getWebhookSupportStatusUsecase.execute(
      GetWebhookSupportStatusCommand.create({
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        providerOrIntegrationId,
        userId: user._id,
      })
    );
  }

  @Post('/')
  @ApiResponse(IntegrationResponseDto, 201)
  @ApiOperation({
    summary: 'Create integration',
    description: 'Create an integration for the current environment the user is based on the API key provided',
  })
  @ExternalApiAccessible()
  @RequirePermissions(PermissionsEnum.INTEGRATION_CREATE)
  async createIntegration(
    @UserSession() user: UserSessionData,
    @Body() body: CreateIntegrationRequestDto
  ): Promise<IntegrationResponseDto> {
    try {
      return await this.createIntegrationUsecase.execute(
        CreateIntegrationCommand.create({
          userId: user._id,
          name: body.name,
          identifier: body.identifier,
          environmentId: body._environmentId ?? user.environmentId,
          organizationId: user.organizationId,
          providerId: body.providerId,
          channel: body.channel,
          credentials: body.credentials,
          active: body.active ?? false,
          check: body.check ?? false,
          conditions: body.conditions,
        })
      );
    } catch (e) {
      if (e.message.includes('Integration validation failed') || e.message.includes('Cast to embedded')) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  @Put('/:integrationId')
  @ApiResponse(IntegrationResponseDto)
  @ApiNotFoundResponse({
    description: 'The integration with the integrationId provided does not exist in the database.',
  })
  @ApiOperation({
    summary: 'Update integration',
  })
  @ExternalApiAccessible()
  @RequirePermissions(PermissionsEnum.INTEGRATION_UPDATE)
  async updateIntegrationById(
    @UserSession() user: UserSessionData,
    @Param('integrationId') integrationId: string,
    @Body() body: UpdateIntegrationRequestDto
  ): Promise<IntegrationResponseDto> {
    try {
      return await this.updateIntegrationUsecase.execute(
        UpdateIntegrationCommand.create({
          userId: user._id,
          name: body.name,
          identifier: body.identifier,
          environmentId: body._environmentId,
          userEnvironmentId: user.environmentId,
          organizationId: user.organizationId,
          integrationId,
          credentials: body.credentials,
          removeNovuBranding: body.removeNovuBranding,
          active: body.active,
          check: body.check ?? false,
          conditions: body.conditions,
        })
      );
    } catch (e) {
      if (e.message.includes('Integration validation failed') || e.message.includes('Cast to embedded')) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  @Post('/:integrationId/set-primary')
  @ApiResponse(IntegrationResponseDto)
  @ApiNotFoundResponse({
    description: 'The integration with the integrationId provided does not exist in the database.',
  })
  @ApiOperation({
    summary: 'Set integration as primary',
  })
  @ExternalApiAccessible()
  @RequirePermissions(PermissionsEnum.INTEGRATION_UPDATE)
  @SdkMethodName('setAsPrimary')
  setIntegrationAsPrimary(
    @UserSession() user: UserSessionData,
    @Param('integrationId') integrationId: string
  ): Promise<IntegrationResponseDto> {
    return this.setIntegrationAsPrimaryUsecase.execute(
      SetIntegrationAsPrimaryCommand.create({
        userId: user._id,
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        integrationId,
      })
    );
  }

  @Delete('/:integrationId')
  @ApiResponse(IntegrationResponseDto, 200, true)
  @ApiOperation({
    summary: 'Delete integration',
  })
  @ExternalApiAccessible()
  @RequirePermissions(PermissionsEnum.INTEGRATION_DELETE)
  async removeIntegration(
    @UserSession() user: UserSessionData,
    @Param('integrationId') integrationId: string
  ): Promise<IntegrationResponseDto[]> {
    return await this.removeIntegrationUsecase.execute(
      RemoveIntegrationCommand.create({
        userId: user._id,
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        integrationId,
      })
    );
  }

  @Get('/:channelType/limit')
  @ApiExcludeEndpoint()
  @OtelSpan()
  @RequirePermissions(PermissionsEnum.INTEGRATION_READ)
  async getProviderLimit(
    @UserSession() user: UserSessionData,
    @Param('channelType') channelType: ChannelTypeEnum
  ): Promise<ChannelTypeLimitDto> {
    const result = await this.calculateLimitNovuIntegration.execute(
      CalculateLimitNovuIntegrationCommand.create({
        channelType,
        organizationId: user.organizationId,
        environmentId: user.environmentId,
      })
    );

    if (!result) {
      return { limit: 0, count: 0 };
    }

    return result;
  }

  @Get('/in-app/status')
  @ApiExcludeEndpoint()
  @RequirePermissions(PermissionsEnum.INTEGRATION_READ)
  async getInAppActivated(@UserSession() user: UserSessionData) {
    return await this.getInAppActivatedUsecase.execute(
      GetInAppActivatedCommand.create({
        organizationId: user.organizationId,
        environmentId: user.environmentId,
      })
    );
  }
}
