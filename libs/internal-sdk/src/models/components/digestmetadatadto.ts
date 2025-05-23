/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  DigestTimedConfigDto,
  DigestTimedConfigDto$inboundSchema,
  DigestTimedConfigDto$Outbound,
  DigestTimedConfigDto$outboundSchema,
} from "./digesttimedconfigdto.js";
import {
  DigestTypeEnum,
  DigestTypeEnum$inboundSchema,
  DigestTypeEnum$outboundSchema,
} from "./digesttypeenum.js";
import {
  DigestUnitEnum,
  DigestUnitEnum$inboundSchema,
  DigestUnitEnum$outboundSchema,
} from "./digestunitenum.js";

/**
 * Unit of the digest
 */
export const DigestMetadataDtoUnit = {
  Seconds: "seconds",
  Minutes: "minutes",
  Hours: "hours",
  Days: "days",
  Weeks: "weeks",
  Months: "months",
} as const;
/**
 * Unit of the digest
 */
export type DigestMetadataDtoUnit = ClosedEnum<typeof DigestMetadataDtoUnit>;

export type DigestMetadataDto = {
  /**
   * Optional key for the digest
   */
  digestKey?: string | undefined;
  /**
   * Amount for the digest
   */
  amount?: number | undefined;
  /**
   * Unit of the digest
   */
  unit?: DigestMetadataDtoUnit | undefined;
  /**
   * The Digest Type
   */
  type: DigestTypeEnum;
  /**
   * Optional array of events associated with the digest, represented as key-value pairs
   */
  events?: Array<{ [k: string]: any }> | undefined;
  /**
   * Regular digest: Indicates if backoff is enabled for the regular digest
   */
  backoff?: boolean | undefined;
  /**
   * Regular digest: Amount for backoff
   */
  backoffAmount?: number | undefined;
  /**
   * Regular digest: Unit for backoff
   */
  backoffUnit?: DigestUnitEnum | undefined;
  /**
   * Regular digest: Indicates if the digest should update
   */
  updateMode?: boolean | undefined;
  /**
   * Configuration for timed digest
   */
  timed?: DigestTimedConfigDto | undefined;
};

/** @internal */
export const DigestMetadataDtoUnit$inboundSchema: z.ZodNativeEnum<
  typeof DigestMetadataDtoUnit
> = z.nativeEnum(DigestMetadataDtoUnit);

/** @internal */
export const DigestMetadataDtoUnit$outboundSchema: z.ZodNativeEnum<
  typeof DigestMetadataDtoUnit
> = DigestMetadataDtoUnit$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace DigestMetadataDtoUnit$ {
  /** @deprecated use `DigestMetadataDtoUnit$inboundSchema` instead. */
  export const inboundSchema = DigestMetadataDtoUnit$inboundSchema;
  /** @deprecated use `DigestMetadataDtoUnit$outboundSchema` instead. */
  export const outboundSchema = DigestMetadataDtoUnit$outboundSchema;
}

/** @internal */
export const DigestMetadataDto$inboundSchema: z.ZodType<
  DigestMetadataDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  digestKey: z.string().optional(),
  amount: z.number().optional(),
  unit: DigestMetadataDtoUnit$inboundSchema.optional(),
  type: DigestTypeEnum$inboundSchema,
  events: z.array(z.record(z.any())).optional(),
  backoff: z.boolean().optional(),
  backoffAmount: z.number().optional(),
  backoffUnit: DigestUnitEnum$inboundSchema.optional(),
  updateMode: z.boolean().optional(),
  timed: DigestTimedConfigDto$inboundSchema.optional(),
});

/** @internal */
export type DigestMetadataDto$Outbound = {
  digestKey?: string | undefined;
  amount?: number | undefined;
  unit?: string | undefined;
  type: string;
  events?: Array<{ [k: string]: any }> | undefined;
  backoff?: boolean | undefined;
  backoffAmount?: number | undefined;
  backoffUnit?: string | undefined;
  updateMode?: boolean | undefined;
  timed?: DigestTimedConfigDto$Outbound | undefined;
};

/** @internal */
export const DigestMetadataDto$outboundSchema: z.ZodType<
  DigestMetadataDto$Outbound,
  z.ZodTypeDef,
  DigestMetadataDto
> = z.object({
  digestKey: z.string().optional(),
  amount: z.number().optional(),
  unit: DigestMetadataDtoUnit$outboundSchema.optional(),
  type: DigestTypeEnum$outboundSchema,
  events: z.array(z.record(z.any())).optional(),
  backoff: z.boolean().optional(),
  backoffAmount: z.number().optional(),
  backoffUnit: DigestUnitEnum$outboundSchema.optional(),
  updateMode: z.boolean().optional(),
  timed: DigestTimedConfigDto$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace DigestMetadataDto$ {
  /** @deprecated use `DigestMetadataDto$inboundSchema` instead. */
  export const inboundSchema = DigestMetadataDto$inboundSchema;
  /** @deprecated use `DigestMetadataDto$outboundSchema` instead. */
  export const outboundSchema = DigestMetadataDto$outboundSchema;
  /** @deprecated use `DigestMetadataDto$Outbound` instead. */
  export type Outbound = DigestMetadataDto$Outbound;
}

export function digestMetadataDtoToJSON(
  digestMetadataDto: DigestMetadataDto,
): string {
  return JSON.stringify(
    DigestMetadataDto$outboundSchema.parse(digestMetadataDto),
  );
}

export function digestMetadataDtoFromJSON(
  jsonString: string,
): SafeParseResult<DigestMetadataDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => DigestMetadataDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'DigestMetadataDto' from JSON`,
  );
}
