import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AnalyticsService, ExternalApiAccessible, UserSession, SkipPermissionsCheck } from '@novu/application-generic';
import { UserSessionData } from '@novu/shared';
import { HubspotIdentifyFormCommand } from './usecases/hubspot-identify-form/hubspot-identify-form.command';
import { HubspotIdentifyFormUsecase } from './usecases/hubspot-identify-form/hubspot-identify-form.usecase';
import { RequireAuthentication } from '../auth/framework/auth.decorator';

@Controller({
  path: 'telemetry',
})
@SkipThrottle()
@RequireAuthentication()
@ApiExcludeController()
export class AnalyticsController {
  constructor(
    private analyticsService: AnalyticsService,
    private hubspotIdentifyFormUsecase: HubspotIdentifyFormUsecase
  ) {}

  @Post('/measure')
  @ExternalApiAccessible()
  @SkipPermissionsCheck()
  async trackEvent(@Body('event') event, @Body('data') data = {}, @UserSession() user: UserSessionData): Promise<any> {
    this.analyticsService.track(event, user._id, {
      ...(data || {}),
      _organization: user?.organizationId,
    });

    return {
      success: true,
    };
  }

  @Post('/identify')
  @ExternalApiAccessible()
  @HttpCode(HttpStatus.NO_CONTENT)
  @SkipPermissionsCheck()
  async identifyUser(@Body() body: any, @UserSession() user: UserSessionData) {
    if (body.anonymousId) {
      this.analyticsService.alias(body.anonymousId, user._id);
    }

    this.analyticsService.upsertUser(user, user._id, {
      organizationType: body.organizationType,
      companySize: body.companySize,
      jobTitle: body.jobTitle,
    });

    this.analyticsService.updateGroup(user._id, user.organizationId, {
      organizationType: body.organizationType,
      companySize: body.companySize,
      jobTitle: body.jobTitle,
    });

    await this.hubspotIdentifyFormUsecase.execute(
      HubspotIdentifyFormCommand.create({
        email: user.email as string,
        lastName: user.lastName,
        firstName: user.firstName,
        hubspotContext: body.hubspotContext,
        pageUri: body.pageUri,
        pageName: body.pageName,
        organizationId: user.organizationId,
      })
    );
  }
}
