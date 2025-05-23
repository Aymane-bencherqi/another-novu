/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type CreateTopicSubscriptionsRequestDto = {
  /**
   * List of subscriber identifiers to subscribe to the topic (max: 100)
   */
  subscriberIds: Array<string>;
};

/** @internal */
export const CreateTopicSubscriptionsRequestDto$inboundSchema: z.ZodType<
  CreateTopicSubscriptionsRequestDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  subscriberIds: z.array(z.string()),
});

/** @internal */
export type CreateTopicSubscriptionsRequestDto$Outbound = {
  subscriberIds: Array<string>;
};

/** @internal */
export const CreateTopicSubscriptionsRequestDto$outboundSchema: z.ZodType<
  CreateTopicSubscriptionsRequestDto$Outbound,
  z.ZodTypeDef,
  CreateTopicSubscriptionsRequestDto
> = z.object({
  subscriberIds: z.array(z.string()),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateTopicSubscriptionsRequestDto$ {
  /** @deprecated use `CreateTopicSubscriptionsRequestDto$inboundSchema` instead. */
  export const inboundSchema = CreateTopicSubscriptionsRequestDto$inboundSchema;
  /** @deprecated use `CreateTopicSubscriptionsRequestDto$outboundSchema` instead. */
  export const outboundSchema =
    CreateTopicSubscriptionsRequestDto$outboundSchema;
  /** @deprecated use `CreateTopicSubscriptionsRequestDto$Outbound` instead. */
  export type Outbound = CreateTopicSubscriptionsRequestDto$Outbound;
}

export function createTopicSubscriptionsRequestDtoToJSON(
  createTopicSubscriptionsRequestDto: CreateTopicSubscriptionsRequestDto,
): string {
  return JSON.stringify(
    CreateTopicSubscriptionsRequestDto$outboundSchema.parse(
      createTopicSubscriptionsRequestDto,
    ),
  );
}

export function createTopicSubscriptionsRequestDtoFromJSON(
  jsonString: string,
): SafeParseResult<CreateTopicSubscriptionsRequestDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) =>
      CreateTopicSubscriptionsRequestDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'CreateTopicSubscriptionsRequestDto' from JSON`,
  );
}
