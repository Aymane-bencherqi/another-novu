import { ISubscribersDefine, ITenantDefine, ITopic, ProvidersIdEnum } from '../../types';

export type TriggerRecipientSubscriber = string | ISubscribersDefine;

export type TriggerRecipient = TriggerRecipientSubscriber | ITopic;

export type TriggerRecipients = TriggerRecipient[];

export type TriggerRecipientsPayload = TriggerRecipientSubscriber | TriggerRecipients;

export type TriggerTenantContext = string | ITenantDefine;

export type TriggerOverrides = {
  providers?: Record<ProvidersIdEnum, Record<string, unknown>>;
  steps?: Record<
    string,
    {
      providers: Record<ProvidersIdEnum, Record<string, unknown>>;
    }
  >;
  email?: Record<string, unknown>;
  sms?: Record<string, unknown>;
  push?: Record<string, unknown>;
  inApp?: Record<string, unknown>;
  chat?: Record<string, unknown>;
  layoutIdentifier?: string;
};
