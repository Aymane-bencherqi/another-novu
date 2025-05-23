/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type TopicDto = {
  /**
   * The internal unique identifier of the topic
   */
  id: string;
  /**
   * The key identifier of the topic used in your application. Should be unique on the environment level.
   */
  key: string;
  /**
   * The name of the topic
   */
  name?: string | undefined;
};

/** @internal */
export const TopicDto$inboundSchema: z.ZodType<
  TopicDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  _id: z.string(),
  key: z.string(),
  name: z.string().optional(),
}).transform((v) => {
  return remap$(v, {
    "_id": "id",
  });
});

/** @internal */
export type TopicDto$Outbound = {
  _id: string;
  key: string;
  name?: string | undefined;
};

/** @internal */
export const TopicDto$outboundSchema: z.ZodType<
  TopicDto$Outbound,
  z.ZodTypeDef,
  TopicDto
> = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string().optional(),
}).transform((v) => {
  return remap$(v, {
    id: "_id",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace TopicDto$ {
  /** @deprecated use `TopicDto$inboundSchema` instead. */
  export const inboundSchema = TopicDto$inboundSchema;
  /** @deprecated use `TopicDto$outboundSchema` instead. */
  export const outboundSchema = TopicDto$outboundSchema;
  /** @deprecated use `TopicDto$Outbound` instead. */
  export type Outbound = TopicDto$Outbound;
}

export function topicDtoToJSON(topicDto: TopicDto): string {
  return JSON.stringify(TopicDto$outboundSchema.parse(topicDto));
}

export function topicDtoFromJSON(
  jsonString: string,
): SafeParseResult<TopicDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => TopicDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'TopicDto' from JSON`,
  );
}
