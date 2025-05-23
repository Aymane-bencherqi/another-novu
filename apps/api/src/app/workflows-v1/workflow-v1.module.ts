import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChangeModule } from '../change/change.module';
import { IntegrationModule } from '../integrations/integrations.module';
import { MessageTemplateModule } from '../message-template/message-template.module';
import { SharedModule } from '../shared/shared.module';
import { NotificationTemplateController } from './notification-template.controller';
import { USE_CASES } from './usecases';
import { WorkflowControllerV1 } from './workflow-v1.controller';
import { PreferencesModule } from '../preferences';
import { WebhooksModule } from '../webhooks/webhooks.module';

const MODULES = [SharedModule, MessageTemplateModule, ChangeModule, AuthModule, IntegrationModule, PreferencesModule];

if (process.env.NOVU_ENTERPRISE === 'true') {
  MODULES.push(WebhooksModule);
}

@Module({
  imports: MODULES,
  controllers: [NotificationTemplateController, WorkflowControllerV1],
  providers: [...USE_CASES],
  exports: [...USE_CASES],
})
export class WorkflowModuleV1 implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {}
}
