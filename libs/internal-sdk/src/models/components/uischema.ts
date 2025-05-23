/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  UiSchemaGroupEnum,
  UiSchemaGroupEnum$inboundSchema,
  UiSchemaGroupEnum$outboundSchema,
} from "./uischemagroupenum.js";
import {
  UiSchemaProperty,
  UiSchemaProperty$inboundSchema,
  UiSchemaProperty$Outbound,
  UiSchemaProperty$outboundSchema,
} from "./uischemaproperty.js";

export type UiSchema = {
  /**
   * Group of the UI Schema
   */
  group?: UiSchemaGroupEnum | undefined;
  /**
   * Properties of the UI Schema
   */
  properties?: { [k: string]: UiSchemaProperty } | undefined;
};

/** @internal */
export const UiSchema$inboundSchema: z.ZodType<
  UiSchema,
  z.ZodTypeDef,
  unknown
> = z.object({
  group: UiSchemaGroupEnum$inboundSchema.optional(),
  properties: z.record(UiSchemaProperty$inboundSchema).optional(),
});

/** @internal */
export type UiSchema$Outbound = {
  group?: string | undefined;
  properties?: { [k: string]: UiSchemaProperty$Outbound } | undefined;
};

/** @internal */
export const UiSchema$outboundSchema: z.ZodType<
  UiSchema$Outbound,
  z.ZodTypeDef,
  UiSchema
> = z.object({
  group: UiSchemaGroupEnum$outboundSchema.optional(),
  properties: z.record(UiSchemaProperty$outboundSchema).optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UiSchema$ {
  /** @deprecated use `UiSchema$inboundSchema` instead. */
  export const inboundSchema = UiSchema$inboundSchema;
  /** @deprecated use `UiSchema$outboundSchema` instead. */
  export const outboundSchema = UiSchema$outboundSchema;
  /** @deprecated use `UiSchema$Outbound` instead. */
  export type Outbound = UiSchema$Outbound;
}

export function uiSchemaToJSON(uiSchema: UiSchema): string {
  return JSON.stringify(UiSchema$outboundSchema.parse(uiSchema));
}

export function uiSchemaFromJSON(
  jsonString: string,
): SafeParseResult<UiSchema, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => UiSchema$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'UiSchema' from JSON`,
  );
}
