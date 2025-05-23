import { PinoLogger } from '@novu/application-generic';
import { AdditionalOperation, RulesLogic } from 'json-logic-js';

import { extractFieldsFromRules, isValidRule } from '../../shared/services/query-parser/query-parser.service';
import { JSONSchemaDto } from '../dtos';
import { extractLiquidTemplateVariables, TemplateVariables } from './template-parser/liquid-parser';
import { isStringifiedMailyJSONContent, wrapMailyInLiquid } from '../../shared/helpers/maily-utils';

export function buildVariables(
  variableSchema: JSONSchemaDto | undefined,
  controlValue: unknown | Record<string, unknown>,
  logger?: PinoLogger
): TemplateVariables {
  let variableControlValue = controlValue;

  if (isStringifiedMailyJSONContent(variableControlValue)) {
    try {
      variableControlValue = wrapMailyInLiquid(variableControlValue);
    } catch (error) {
      logger?.error(
        {
          err: error as Error,
          controlKey: 'unknown',
          message: 'Failed to transform maily content to liquid syntax',
        },
        'BuildVariables'
      );
    }
  } else if (isValidRule(variableControlValue as RulesLogic<AdditionalOperation>)) {
    const fields = extractFieldsFromRules(variableControlValue as RulesLogic<AdditionalOperation>)
      .filter((field) => field.startsWith('payload.') || field.startsWith('subscriber.data.'))
      .map((field) => `{{${field}}}`);

    variableControlValue = {
      rules: variableControlValue,
      fields,
    };
  }

  const { validVariables, invalidVariables } = extractLiquidTemplateVariables({
    template: JSON.stringify(variableControlValue),
    variableSchema,
  });

  return {
    validVariables,
    invalidVariables,
  };
}
