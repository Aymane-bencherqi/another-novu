/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  RedirectTargetEnum,
  RedirectTargetEnum$inboundSchema,
  RedirectTargetEnum$outboundSchema,
} from "./redirecttargetenum.js";

export type RedirectDto = {
  /**
   * URL to redirect to
   */
  url: string;
  /**
   * Target of the redirect
   */
  target?: RedirectTargetEnum | undefined;
};

/** @internal */
export const RedirectDto$inboundSchema: z.ZodType<
  RedirectDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  url: z.string(),
  target: RedirectTargetEnum$inboundSchema.optional(),
});

/** @internal */
export type RedirectDto$Outbound = {
  url: string;
  target?: string | undefined;
};

/** @internal */
export const RedirectDto$outboundSchema: z.ZodType<
  RedirectDto$Outbound,
  z.ZodTypeDef,
  RedirectDto
> = z.object({
  url: z.string(),
  target: RedirectTargetEnum$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace RedirectDto$ {
  /** @deprecated use `RedirectDto$inboundSchema` instead. */
  export const inboundSchema = RedirectDto$inboundSchema;
  /** @deprecated use `RedirectDto$outboundSchema` instead. */
  export const outboundSchema = RedirectDto$outboundSchema;
  /** @deprecated use `RedirectDto$Outbound` instead. */
  export type Outbound = RedirectDto$Outbound;
}

export function redirectDtoToJSON(redirectDto: RedirectDto): string {
  return JSON.stringify(RedirectDto$outboundSchema.parse(redirectDto));
}

export function redirectDtoFromJSON(
  jsonString: string,
): SafeParseResult<RedirectDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => RedirectDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'RedirectDto' from JSON`,
  );
}
