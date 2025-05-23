/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { ClosedEnum } from "../../types/enums.js";

export const WorkflowResponseDtoSortField = {
  CreatedAt: "createdAt",
  UpdatedAt: "updatedAt",
  Name: "name",
  LastTriggeredAt: "lastTriggeredAt",
} as const;
export type WorkflowResponseDtoSortField = ClosedEnum<
  typeof WorkflowResponseDtoSortField
>;

/** @internal */
export const WorkflowResponseDtoSortField$inboundSchema: z.ZodNativeEnum<
  typeof WorkflowResponseDtoSortField
> = z.nativeEnum(WorkflowResponseDtoSortField);

/** @internal */
export const WorkflowResponseDtoSortField$outboundSchema: z.ZodNativeEnum<
  typeof WorkflowResponseDtoSortField
> = WorkflowResponseDtoSortField$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace WorkflowResponseDtoSortField$ {
  /** @deprecated use `WorkflowResponseDtoSortField$inboundSchema` instead. */
  export const inboundSchema = WorkflowResponseDtoSortField$inboundSchema;
  /** @deprecated use `WorkflowResponseDtoSortField$outboundSchema` instead. */
  export const outboundSchema = WorkflowResponseDtoSortField$outboundSchema;
}
