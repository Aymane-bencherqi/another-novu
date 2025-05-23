import { IntegrationEntity } from '@novu/dal';
import {
  AfricasTalkingSmsHandler,
  AfroSmsHandler,
  AzureSmsHandler,
  BandwidthHandler,
  BrevoSmsHandler,
  BurstSmsHandler,
  ClickatellHandler,
  ClicksendSmsHandler,
  EazySmsHandler,
  FiretextSmsHandler,
  FortySixElksHandler,
  GenericSmsHandler,
  GupshupSmsHandler,
  InfobipSmsHandler,
  ISendSmsHandler,
  KannelSmsHandler,
  MaqsamHandler,
  MessageBirdHandler,
  MobishastraHandler,
  NexmoHandler,
  NovuSmsHandler,
  PlivoHandler,
  RingCentralHandler,
  SendchampSmsHandler,
  SimpletextingSmsHandler,
  Sms77Handler,
  SmsCentralHandler,
  SnsHandler,
  TelnyxHandler,
  TermiiSmsHandler,
  TwilioHandler,
} from './handlers';
import { ISmsFactory, ISmsHandler } from './interfaces';

export class SmsFactory implements ISmsFactory {
  handlers: ISmsHandler[] = [
    new SnsHandler(),
    new TelnyxHandler(),
    new TwilioHandler(),
    new Sms77Handler(),
    new TermiiSmsHandler(),
    new PlivoHandler(),
    new ClickatellHandler(),
    new GupshupSmsHandler(),
    new FiretextSmsHandler(),
    new InfobipSmsHandler(),
    new BurstSmsHandler(),
    new FortySixElksHandler(),
    new KannelSmsHandler(),
    new MaqsamHandler(),
    new SmsCentralHandler(),
    new AfricasTalkingSmsHandler(),
    new SendchampSmsHandler(),
    new ClicksendSmsHandler(),
    new SimpletextingSmsHandler(),
    new BandwidthHandler(),
    new GenericSmsHandler(),
    new MessageBirdHandler(),
    new AzureSmsHandler(),
    new NovuSmsHandler(),
    new NexmoHandler(),
    new ISendSmsHandler(),
    new RingCentralHandler(),
    new BrevoSmsHandler(),
    new EazySmsHandler(),
    new MobishastraHandler(),
    new AfroSmsHandler(),
  ];

  getHandler(integration: IntegrationEntity) {
    const handler =
      this.handlers.find((handlerItem) => handlerItem.canHandle(integration.providerId, integration.channel)) ?? null;

    if (!handler) return null;

    handler.buildProvider(integration.credentials);

    return handler;
  }
}
