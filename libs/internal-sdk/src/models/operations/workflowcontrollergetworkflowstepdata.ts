/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type WorkflowControllerGetWorkflowStepDataRequest = {
  workflowId: string;
  stepId: string;
  /**
   * A header for idempotency purposes
   */
  idempotencyKey?: string | undefined;
};

export type WorkflowControllerGetWorkflowStepDataResponse = {
  headers: { [k: string]: Array<string> };
  result: components.StepResponseDto;
};

/** @internal */
export const WorkflowControllerGetWorkflowStepDataRequest$inboundSchema:
  z.ZodType<
    WorkflowControllerGetWorkflowStepDataRequest,
    z.ZodTypeDef,
    unknown
  > = z.object({
    workflowId: z.string(),
    stepId: z.string(),
    "idempotency-key": z.string().optional(),
  }).transform((v) => {
    return remap$(v, {
      "idempotency-key": "idempotencyKey",
    });
  });

/** @internal */
export type WorkflowControllerGetWorkflowStepDataRequest$Outbound = {
  workflowId: string;
  stepId: string;
  "idempotency-key"?: string | undefined;
};

/** @internal */
export const WorkflowControllerGetWorkflowStepDataRequest$outboundSchema:
  z.ZodType<
    WorkflowControllerGetWorkflowStepDataRequest$Outbound,
    z.ZodTypeDef,
    WorkflowControllerGetWorkflowStepDataRequest
  > = z.object({
    workflowId: z.string(),
    stepId: z.string(),
    idempotencyKey: z.string().optional(),
  }).transform((v) => {
    return remap$(v, {
      idempotencyKey: "idempotency-key",
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace WorkflowControllerGetWorkflowStepDataRequest$ {
  /** @deprecated use `WorkflowControllerGetWorkflowStepDataRequest$inboundSchema` instead. */
  export const inboundSchema =
    WorkflowControllerGetWorkflowStepDataRequest$inboundSchema;
  /** @deprecated use `WorkflowControllerGetWorkflowStepDataRequest$outboundSchema` instead. */
  export const outboundSchema =
    WorkflowControllerGetWorkflowStepDataRequest$outboundSchema;
  /** @deprecated use `WorkflowControllerGetWorkflowStepDataRequest$Outbound` instead. */
  export type Outbound = WorkflowControllerGetWorkflowStepDataRequest$Outbound;
}

export function workflowControllerGetWorkflowStepDataRequestToJSON(
  workflowControllerGetWorkflowStepDataRequest:
    WorkflowControllerGetWorkflowStepDataRequest,
): string {
  return JSON.stringify(
    WorkflowControllerGetWorkflowStepDataRequest$outboundSchema.parse(
      workflowControllerGetWorkflowStepDataRequest,
    ),
  );
}

export function workflowControllerGetWorkflowStepDataRequestFromJSON(
  jsonString: string,
): SafeParseResult<
  WorkflowControllerGetWorkflowStepDataRequest,
  SDKValidationError
> {
  return safeParse(
    jsonString,
    (x) =>
      WorkflowControllerGetWorkflowStepDataRequest$inboundSchema.parse(
        JSON.parse(x),
      ),
    `Failed to parse 'WorkflowControllerGetWorkflowStepDataRequest' from JSON`,
  );
}

/** @internal */
export const WorkflowControllerGetWorkflowStepDataResponse$inboundSchema:
  z.ZodType<
    WorkflowControllerGetWorkflowStepDataResponse,
    z.ZodTypeDef,
    unknown
  > = z.object({
    Headers: z.record(z.array(z.string())),
    Result: components.StepResponseDto$inboundSchema,
  }).transform((v) => {
    return remap$(v, {
      "Headers": "headers",
      "Result": "result",
    });
  });

/** @internal */
export type WorkflowControllerGetWorkflowStepDataResponse$Outbound = {
  Headers: { [k: string]: Array<string> };
  Result: components.StepResponseDto$Outbound;
};

/** @internal */
export const WorkflowControllerGetWorkflowStepDataResponse$outboundSchema:
  z.ZodType<
    WorkflowControllerGetWorkflowStepDataResponse$Outbound,
    z.ZodTypeDef,
    WorkflowControllerGetWorkflowStepDataResponse
  > = z.object({
    headers: z.record(z.array(z.string())),
    result: components.StepResponseDto$outboundSchema,
  }).transform((v) => {
    return remap$(v, {
      headers: "Headers",
      result: "Result",
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace WorkflowControllerGetWorkflowStepDataResponse$ {
  /** @deprecated use `WorkflowControllerGetWorkflowStepDataResponse$inboundSchema` instead. */
  export const inboundSchema =
    WorkflowControllerGetWorkflowStepDataResponse$inboundSchema;
  /** @deprecated use `WorkflowControllerGetWorkflowStepDataResponse$outboundSchema` instead. */
  export const outboundSchema =
    WorkflowControllerGetWorkflowStepDataResponse$outboundSchema;
  /** @deprecated use `WorkflowControllerGetWorkflowStepDataResponse$Outbound` instead. */
  export type Outbound = WorkflowControllerGetWorkflowStepDataResponse$Outbound;
}

export function workflowControllerGetWorkflowStepDataResponseToJSON(
  workflowControllerGetWorkflowStepDataResponse:
    WorkflowControllerGetWorkflowStepDataResponse,
): string {
  return JSON.stringify(
    WorkflowControllerGetWorkflowStepDataResponse$outboundSchema.parse(
      workflowControllerGetWorkflowStepDataResponse,
    ),
  );
}

export function workflowControllerGetWorkflowStepDataResponseFromJSON(
  jsonString: string,
): SafeParseResult<
  WorkflowControllerGetWorkflowStepDataResponse,
  SDKValidationError
> {
  return safeParse(
    jsonString,
    (x) =>
      WorkflowControllerGetWorkflowStepDataResponse$inboundSchema.parse(
        JSON.parse(x),
      ),
    `Failed to parse 'WorkflowControllerGetWorkflowStepDataResponse' from JSON`,
  );
}
