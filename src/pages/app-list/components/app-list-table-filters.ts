import { PropertyFilterProperty } from '@cloudscape-design/collection-hooks';

export const stringOperators = [':', '!:', '=', '!=', '^', '!^'];

export const enumOperators = [
  { operator: '=', tokenType: 'enum' },
  { operator: '!=', tokenType: 'enum' },
  ':',
  '!:',
] as const;

export const APP_LIST_FILTERING_PROPERTIES : PropertyFilterProperty[] = [
  {
    propertyLabel: 'Host',
    key: 'taskHost',
    groupValuesLabel: 'Host values',
    operators: stringOperators,
  },
  {
    propertyLabel: 'Task',
    key: 'taskName',
    groupValuesLabel: 'Task values',
    operators: stringOperators,
  },
  {
    propertyLabel: 'App',
    key: 'appName',
    groupValuesLabel: 'App values',
    operators: stringOperators,
  },
];
