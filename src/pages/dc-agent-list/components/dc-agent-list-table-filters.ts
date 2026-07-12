import { PropertyFilterProperty } from '@cloudscape-design/collection-hooks';

const stringOperators = [':', '!:', '=', '!=', '^', '!^'];

export const AGENT_FILTERING_PROPERTIES: PropertyFilterProperty[] = [
  {
    propertyLabel: 'Agent',
    key: 'name',
    groupValuesLabel: 'Agent values',
    operators: stringOperators,
  },
  {
    propertyLabel: 'URL',
    key: 'url',
    groupValuesLabel: 'URL values',
    operators: stringOperators,
  },
  {
    propertyLabel: 'Instance',
    key: 'appInstanceName',
    groupValuesLabel: 'Instance values',
    operators: stringOperators,
  },
  {
    propertyLabel: 'Version',
    key: 'appVersion',
    groupValuesLabel: 'Version values',
    operators: stringOperators,
  },
  {
    propertyLabel: 'Reported host',
    key: 'hostname',
    groupValuesLabel: 'Host values',
    operators: stringOperators,
  },
];
