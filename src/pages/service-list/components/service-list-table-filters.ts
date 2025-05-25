import { PropertyFilterProperty } from '@cloudscape-design/collection-hooks';

export const stringOperators = [':', '!:', '=', '!=', '^', '!^'];

export const enumOperators = [
  { operator: '=', tokenType: 'enum' },
  { operator: '!=', tokenType: 'enum' },
  ':',
  '!:',
] as const;

export const SERVICE_LIST_FILTERING_PROPERTIES : PropertyFilterProperty[] = [
  {
    propertyLabel: 'Host',
    key: 'host',
    groupValuesLabel: 'Host values',
    operators: stringOperators,
  },
  {
    propertyLabel: 'Service',
    key: 'serviceName',
    groupValuesLabel: 'Service values',
    operators: stringOperators,
  },
  {
    propertyLabel: 'Status',
    key: 'statusName',
    groupValuesLabel: 'Status values',
    operators: enumOperators,
  },
];
