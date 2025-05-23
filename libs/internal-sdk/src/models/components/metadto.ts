/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type MetaDto = {
  /**
   * The total count of subscriber IDs provided
   */
  totalCount: number;
  /**
   * The count of successfully created subscriptions
   */
  successful: number;
  /**
   * The count of failed subscription attempts
   */
  failed: number;
};

/** @internal */
export const MetaDto$inboundSchema: z.ZodType<MetaDto, z.ZodTypeDef, unknown> =
  z.object({
    totalCount: z.number(),
    successful: z.number(),
    failed: z.number(),
  });

/** @internal */
export type MetaDto$Outbound = {
  totalCount: number;
  successful: number;
  failed: number;
};

/** @internal */
export const MetaDto$outboundSchema: z.ZodType<
  MetaDto$Outbound,
  z.ZodTypeDef,
  MetaDto
> = z.object({
  totalCount: z.number(),
  successful: z.number(),
  failed: z.number(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace MetaDto$ {
  /** @deprecated use `MetaDto$inboundSchema` instead. */
  export const inboundSchema = MetaDto$inboundSchema;
  /** @deprecated use `MetaDto$outboundSchema` instead. */
  export const outboundSchema = MetaDto$outboundSchema;
  /** @deprecated use `MetaDto$Outbound` instead. */
  export type Outbound = MetaDto$Outbound;
}

export function metaDtoToJSON(metaDto: MetaDto): string {
  return JSON.stringify(MetaDto$outboundSchema.parse(metaDto));
}

export function metaDtoFromJSON(
  jsonString: string,
): SafeParseResult<MetaDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => MetaDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'MetaDto' from JSON`,
  );
}
