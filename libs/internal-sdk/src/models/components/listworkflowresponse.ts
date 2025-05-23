/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  WorkflowListResponseDto,
  WorkflowListResponseDto$inboundSchema,
  WorkflowListResponseDto$Outbound,
  WorkflowListResponseDto$outboundSchema,
} from "./workflowlistresponsedto.js";

export type ListWorkflowResponse = {
  /**
   * List of workflows
   */
  workflows: Array<WorkflowListResponseDto>;
  /**
   * Total number of workflows
   */
  totalCount: number;
};

/** @internal */
export const ListWorkflowResponse$inboundSchema: z.ZodType<
  ListWorkflowResponse,
  z.ZodTypeDef,
  unknown
> = z.object({
  workflows: z.array(WorkflowListResponseDto$inboundSchema),
  totalCount: z.number(),
});

/** @internal */
export type ListWorkflowResponse$Outbound = {
  workflows: Array<WorkflowListResponseDto$Outbound>;
  totalCount: number;
};

/** @internal */
export const ListWorkflowResponse$outboundSchema: z.ZodType<
  ListWorkflowResponse$Outbound,
  z.ZodTypeDef,
  ListWorkflowResponse
> = z.object({
  workflows: z.array(WorkflowListResponseDto$outboundSchema),
  totalCount: z.number(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace ListWorkflowResponse$ {
  /** @deprecated use `ListWorkflowResponse$inboundSchema` instead. */
  export const inboundSchema = ListWorkflowResponse$inboundSchema;
  /** @deprecated use `ListWorkflowResponse$outboundSchema` instead. */
  export const outboundSchema = ListWorkflowResponse$outboundSchema;
  /** @deprecated use `ListWorkflowResponse$Outbound` instead. */
  export type Outbound = ListWorkflowResponse$Outbound;
}

export function listWorkflowResponseToJSON(
  listWorkflowResponse: ListWorkflowResponse,
): string {
  return JSON.stringify(
    ListWorkflowResponse$outboundSchema.parse(listWorkflowResponse),
  );
}

export function listWorkflowResponseFromJSON(
  jsonString: string,
): SafeParseResult<ListWorkflowResponse, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => ListWorkflowResponse$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'ListWorkflowResponse' from JSON`,
  );
}
