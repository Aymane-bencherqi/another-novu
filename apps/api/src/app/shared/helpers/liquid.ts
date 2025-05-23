import { Liquid } from 'liquidjs';
import { toSentence, pluralize } from '@novu/framework/internal';

export const parseLiquid = async (value: string, variables: object): Promise<string> => {
  const client = new Liquid({
    outputEscape: (output) => {
      return stringifyDataStructureWithSingleQuotes(output);
    },
  });
  client.registerFilter('toSentence', toSentence);
  client.registerFilter('pluralize', pluralize);

  const template = client.parse(value);

  return await client.render(template, variables);
};

const stringifyDataStructureWithSingleQuotes = (value: unknown, spaces: number = 0): string => {
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    const valueStringified = JSON.stringify(value, null, spaces);
    const valueSingleQuotes = valueStringified.replace(/"/g, "'");
    const valueEscapedNewLines = valueSingleQuotes.replace(/\n/g, '\\n');

    return valueEscapedNewLines;
  } else {
    return value == null ? '' : String(value as unknown);
  }
};
