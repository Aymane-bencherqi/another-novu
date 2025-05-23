import { expect } from 'chai';
import axios from 'axios';

import { UserSession } from '@novu/testing';
import {
  MessageEntity,
  MessageRepository,
  NotificationTemplateEntity,
  SubscriberEntity,
  SubscriberRepository,
} from '@novu/dal';
import { ChannelTypeEnum, MessagesStatusEnum } from '@novu/shared';
import { Novu } from '@novu/api';
import { expectSdkExceptionGeneric, initNovuClassSdk } from '../../shared/helpers/e2e/sdk/e2e-sdk.helper';

const axiosInstance = axios.create();

describe('Mark as Seen - /widgets/messages/mark-as (POST) #novu-v2', async () => {
  const messageRepository = new MessageRepository();
  const subscriberRepository = new SubscriberRepository();
  let session: UserSession;
  let template: NotificationTemplateEntity;
  let subscriberId;
  let subscriber: SubscriberEntity;
  let message: MessageEntity;
  let novuClient: Novu;
  before(async () => {
    session = new UserSession();
    await session.initialize();
    subscriberId = SubscriberRepository.createObjectId();

    template = await session.createTemplate();
    novuClient = initNovuClassSdk(session);
  });

  beforeEach(async () => {
    await novuClient.trigger({ workflowId: template.triggers[0].identifier, to: subscriberId });
    await session.waitForJobCompletion(template._id);

    subscriber = await getSubscriber(session, subscriberRepository, subscriberId);
    message = await getMessage(session, messageRepository, subscriber);

    expect(message.seen).to.equal(false);
    expect(message.read).to.equal(false);
    expect(message.lastSeenDate).to.be.not.ok;
    expect(message.lastReadDate).to.be.not.ok;
  });

  afterEach(async () => {
    await pruneMessages(messageRepository);
  });

  it('should change the seen status', async function () {
    await novuClient.subscribers.messages.markAllAs(
      {
        messageId: message._id,
        markAs: MessagesStatusEnum.SEEN,
      },
      subscriberId
    );

    const updatedMessage = await getMessage(session, messageRepository, subscriber);

    expect(updatedMessage.seen).to.equal(true);
    expect(updatedMessage.read).to.equal(false);
    expect(updatedMessage.lastSeenDate).to.be.ok;
    expect(updatedMessage.lastReadDate).to.be.not.ok;
  });

  it('should change the read status', async function () {
    await novuClient.subscribers.messages.markAllAs(
      {
        messageId: message._id,
        markAs: MessagesStatusEnum.READ,
      },
      subscriberId
    );

    const updatedMessage = await getMessage(session, messageRepository, subscriber);

    expect(updatedMessage.seen).to.equal(true);
    expect(updatedMessage.read).to.equal(true);
    expect(updatedMessage.lastSeenDate).to.be.ok;
    expect(updatedMessage.lastReadDate).to.be.ok;
  });

  it('should change the seen status to unseen', async function () {
    // simulate user seen
    await novuClient.subscribers.messages.markAllAs(
      {
        messageId: message._id,
        markAs: MessagesStatusEnum.SEEN,
      },
      subscriberId
    );

    const seenMessage = await getMessage(session, messageRepository, subscriber);
    expect(seenMessage.seen).to.equal(true);
    expect(seenMessage.read).to.equal(false);
    expect(seenMessage.lastSeenDate).to.be.ok;
    expect(seenMessage.lastReadDate).to.be.not.ok;

    await novuClient.subscribers.messages.markAllAs(
      {
        messageId: message._id,
        markAs: MessagesStatusEnum.UNSEEN,
      },
      subscriberId
    );

    const updatedMessage = await getMessage(session, messageRepository, subscriber);
    expect(updatedMessage.seen).to.equal(false);
    expect(updatedMessage.read).to.equal(false);
    expect(updatedMessage.lastSeenDate).to.be.ok;
    expect(updatedMessage.lastReadDate).to.be.not.ok;
  });

  it('should change the read status to unread', async function () {
    // simulate user read
    await novuClient.subscribers.messages.markAllAs(
      {
        messageId: message._id,
        markAs: MessagesStatusEnum.READ,
      },
      subscriberId
    );

    const readMessage = await getMessage(session, messageRepository, subscriber);
    expect(readMessage.seen).to.equal(true);
    expect(readMessage.read).to.equal(true);
    expect(readMessage.lastSeenDate).to.be.ok;
    expect(readMessage.lastReadDate).to.be.ok;

    await novuClient.subscribers.messages.markAllAs(
      {
        messageId: message._id,
        markAs: MessagesStatusEnum.UNREAD,
      },
      subscriberId
    );
    const updateMessage = await getMessage(session, messageRepository, subscriber);
    expect(updateMessage.seen).to.equal(true);
    expect(updateMessage.read).to.equal(false);
    expect(updateMessage.lastSeenDate).to.be.ok;
    expect(updateMessage.lastReadDate).to.be.ok;
  });

  it('should throw exception if messages were not provided', async function () {
    const failureMessage = 'should not reach here, should throw error';

    try {
      await markAs(session.apiKey, undefined, MessagesStatusEnum.SEEN, subscriberId);

      expect.fail(failureMessage);
    } catch (e) {
      if (e.message === failureMessage) {
        expect(e.message).to.be.empty;
      }

      expect(e.response.data.message).to.equal('messageId is required');
      expect(e.response.data.statusCode).to.equal(400);
    }
    const { error } = await expectSdkExceptionGeneric(() =>
      novuClient.subscribers.messages.markAllAs(
        {
          messageId: [],
          markAs: MessagesStatusEnum.SEEN,
        },
        subscriberId
      )
    );

    expect(error?.message).to.equal('messageId is required');
    expect(error?.statusCode).to.equal(400);
  });
});

async function getMessage(
  session: UserSession,
  messageRepository: MessageRepository,
  subscriber: SubscriberEntity
): Promise<MessageEntity> {
  const message = await messageRepository.findOne({
    _environmentId: session.environment._id,
    _subscriberId: subscriber._id,
    channel: ChannelTypeEnum.IN_APP,
  });

  if (!message) {
    expect(message).to.be.ok;
    throw new Error('message not found');
  }

  return message;
}

async function markAs(
  apiKey: string,
  messageIds: string | string[] | undefined,
  mark: MessagesStatusEnum,
  subscriberId: string
) {
  return await axiosInstance.post(
    `http://127.0.0.1:${process.env.PORT}/v1/subscribers/${subscriberId}/messages/mark-as`,
    {
      messageId: messageIds,
      markAs: mark,
    },
    {
      headers: {
        authorization: `ApiKey ${apiKey}`,
      },
    }
  );
}

async function getSubscriber(
  session: UserSession,
  subscriberRepository: SubscriberRepository,
  subscriberId: string
): Promise<SubscriberEntity> {
  const subscriberRes = await subscriberRepository.findOne({
    _environmentId: session.environment._id,
    subscriberId,
  });

  if (!subscriberRes) {
    expect(subscriberRes).to.be.ok;
    throw new Error('subscriber not found');
  }

  return subscriberRes;
}

async function pruneMessages(messageRepository) {
  await messageRepository.delete({});
}
