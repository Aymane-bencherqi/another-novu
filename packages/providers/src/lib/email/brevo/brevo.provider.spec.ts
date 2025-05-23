import { describe, expect, test, vi } from 'vitest';
import { EmailEventStatusEnum } from '@novu/stateless';
import { BrevoEmailProvider } from './brevo.provider';
import { axiosSpy } from '../../../utils/test/spy-axios';

const mockConfig = {
  apiKey: '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',
  from: 'test@novu.co',
  senderName: 'test',
};

const mockNovuMessage = {
  from: 'test@test.com',
  to: ['test@test.com'],
  html: '<div> Mail Content </div>',
  subject: 'Test subject',
  attachments: [{ mime: 'text/plain', file: Buffer.from('dGVzdA=='), name: 'test.txt' }],
};

const mockSendinblueMessage = {
  event: 'delivered',
  email: 'test@test.com',
  id: 26224,
  date: '2022-10-11 14:13:07',
  ts: 1598634509,
  'message-id': '<xxxxxxxxxxxx.xxxxxxxxx@domain.com>',
  ts_event: 1598034509,
  subject: 'Subject Line',
  tag: '["transactionalTag"]',
  sending_ip: '185.41.28.109',
  ts_epoch: 1598634509223,
  tags: ['test'],
};

test('should send message', async () => {
  const { mockRequest } = axiosSpy({
    data: {
      messageId: 'id',
    },
  });
  const provider = new BrevoEmailProvider(mockConfig);

  await provider.sendMessage(mockNovuMessage);

  expect(mockRequest).toBeCalled();
  expect(mockRequest).toBeCalledWith({
    data: '{"sender":{"email":"test@test.com","name":"test"},"to":[{"email":"test@test.com"}],"subject":"Test subject","htmlContent":"<div> Mail Content </div>","attachment":[{"name":"test.txt","content":"ZEdWemRBPT0="}]}',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'api-key': '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',
    },
    method: 'POST',
    url: '/smtp/email',
  });
});

test('should send message with _passthrough', async () => {
  const { mockRequest } = axiosSpy({
    data: {
      messageId: 'id',
    },
  });
  const provider = new BrevoEmailProvider(mockConfig);

  await provider.sendMessage(mockNovuMessage, {
    _passthrough: {
      body: {
        subject: 'Test subject _passthrough',
      },
    },
  });

  expect(mockRequest).toBeCalled();
  expect(mockRequest).toBeCalledWith({
    data: '{"sender":{"email":"test@test.com","name":"test"},"to":[{"email":"test@test.com"}],"subject":"Test subject _passthrough","htmlContent":"<div> Mail Content </div>","attachment":[{"name":"test.txt","content":"ZEdWemRBPT0="}]}',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'api-key': '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',
    },
    method: 'POST',
    url: '/smtp/email',
  });
});

test('should correctly use sender email and name from the config', async () => {
  const provider = new BrevoEmailProvider(mockConfig);
  const spy = vi.spyOn(provider, 'sendMessage').mockImplementation(async () => {
    return {
      id: 'id',
      date: new Date().toISOString(),
    };
  });
  const { from, ...mockNovuMessageWithoutFrom } = mockNovuMessage;

  // use config.from if message.from is not provided
  await provider.sendMessage(mockNovuMessageWithoutFrom);
  expect(spy).toHaveBeenCalled();

  // Use the message.from instead of config.from if available
  const res = await provider.sendMessage(mockNovuMessage);
  expect(spy).toHaveBeenCalled();
  expect(res.id).toBe('id');
});

describe('getMessageId', () => {
  test('should return messageId when body is valid', async () => {
    const provider = new BrevoEmailProvider(mockConfig);
    const messageId = provider.getMessageId(mockSendinblueMessage);
    expect(messageId).toEqual([mockSendinblueMessage['message-id']]);
  });

  test('should return messageId when body is array', async () => {
    const provider = new BrevoEmailProvider(mockConfig);
    const messageId = provider.getMessageId([mockSendinblueMessage]);
    expect(messageId).toEqual([mockSendinblueMessage['message-id']]);
  });

  test('should return undefined when event body is undefined', async () => {
    const provider = new BrevoEmailProvider(mockConfig);
    const messageId = provider.parseEventBody(undefined, 'test');
    expect(messageId).toBeUndefined();
  });

  test('should return undefined when event body is empty', async () => {
    const provider = new BrevoEmailProvider(mockConfig);
    const messageId = provider.parseEventBody([], 'test');
    expect(messageId).toBeUndefined();
  });
});

describe('parseEventBody', () => {
  test('should return IEmailEventBody object when body is valid', async () => {
    const provider = new BrevoEmailProvider(mockConfig);
    const eventBody = provider.parseEventBody(mockSendinblueMessage, 'test');
    const dateISO = new Date(mockSendinblueMessage.date).toISOString();
    expect(eventBody).toEqual({
      status: EmailEventStatusEnum.DELIVERED,
      date: dateISO,
      externalId: mockSendinblueMessage.id,
      attempts: undefined,
      response: undefined,
      row: mockSendinblueMessage,
    });
  });

  test('should return undefined when event body is undefined', async () => {
    const provider = new BrevoEmailProvider(mockConfig);
    const eventBody = provider.parseEventBody(undefined, 'test');
    expect(eventBody).toBeUndefined();
  });

  test('should return undefined when status is unrecognized', async () => {
    const provider = new BrevoEmailProvider(mockConfig);
    const messageId = provider.parseEventBody({ event: 'not-real-event' }, 'test');
    expect(messageId).toBeUndefined();
  });
});
