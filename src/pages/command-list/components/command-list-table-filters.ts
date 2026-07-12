import { PropertyFilterProperty } from '@cloudscape-design/collection-hooks';

const stringOperators = [':', '!:', '=', '!=', '^', '!^'];

export const COMMAND_FILTERING_PROPERTIES: PropertyFilterProperty[] = [
  {
    propertyLabel: 'Host',
    key: 'host',
    groupValuesLabel: 'Host values',
    operators: stringOperators,
  },
  {
    propertyLabel: 'Command',
    key: 'name',
    groupValuesLabel: 'Command values',
    operators: stringOperators,
  },
  {
    propertyLabel: 'Type',
    key: 'type',
    groupValuesLabel: 'Type values',
    operators: stringOperators,
  },
];
