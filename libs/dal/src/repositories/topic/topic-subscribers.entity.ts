import type { ChangePropsValueType } from '../../types/helpers';
import {
  EnvironmentId,
  ExternalSubscriberId,
  OrganizationId,
  SubscriberId,
  TopicId,
  TopicKey,
  TopicSubscriberId,
} from './types';

export class TopicSubscribersEntity {
  _id: TopicSubscriberId;
  _environmentId: EnvironmentId;
  _organizationId: OrganizationId;
  _subscriberId: SubscriberId;
  _topicId: TopicId;
  topicKey: TopicKey;
  // TODO: Rename to subscriberId, to align with workflowId and stepId that are also externally provided identifiers by Novu users
  externalSubscriberId: ExternalSubscriberId;

  createdAt?: string;
  updatedAt?: string;
}

export type TopicSubscribersDBModel = ChangePropsValueType<
  TopicSubscribersEntity,
  '_environmentId' | '_organizationId' | '_subscriberId' | '_topicId'
>;

export type CreateTopicSubscribersEntity = Omit<TopicSubscribersEntity, '_id'>;
