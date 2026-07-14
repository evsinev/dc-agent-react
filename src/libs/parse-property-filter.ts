// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import * as z from 'zod';

import { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import { NonCancelableCustomEvent, PropertyFilterProps } from '@cloudscape-design/components';

export const PROPERTY_FILTERS_QUERY_PARAM_KEY = 'propertyFilter';
export const PAGE_QUERY_PARAM_KEY = 'page';
export const SORT_QUERY_PARAM_KEY = 'sort';
export const SELECTED_FILTER_SET_QUERY_PARAM_KEY = 'filterSet';

const PropertyFilterOperation = z.enum(['and', 'or']);

const propertyFilterTokenSchema = z.object({
  // There's no other way to enforce this value as required. Using z.any() allows it to be optional, which breaks our types
  value: z.object({}).passthrough().or(z.array(z.any())).or(z.string()).or(z.number()).or(z.boolean()),
  propertyKey: z.string().optional(),
  operator: z.string(),
});

const propertyFilterQueryBaseSchema = z.object({
  tokens: z.array(propertyFilterTokenSchema),
  operation: PropertyFilterOperation,
});

// workaround to validate recursive types: https://zod.dev/?id=recursive-types
// fyi: same problem in yup and valibot
type PropertyFilterQuerySchemaType = z.infer<typeof propertyFilterQueryBaseSchema> & {
  tokenGroups?: PropertyFilterQuery['tokenGroups'];
};

const propertyFilterQuerySchema: z.ZodType<PropertyFilterQuerySchemaType> = propertyFilterQueryBaseSchema.extend({
  tokenGroups: z.lazy(() => z.array(z.union([propertyFilterTokenSchema, propertyFilterQuerySchema])).optional()),
});

export const parsePropertyFilterQuery = (stringifiedPropertyFilter: string): PropertyFilterQuery => {
  const defaultQuery = { operation: 'and', tokens: [] } as PropertyFilterQuery;

  if (!stringifiedPropertyFilter) {
    return defaultQuery;
  }
  try {
    const json = JSON.parse(stringifiedPropertyFilter.replace('(', '{'));
    return propertyFilterQuerySchema.parse(json);
  } catch (_error) {
    return defaultQuery;
  }
};

// Serialize a property-filter query to the URL param, or clear it when the query is empty. The
// leading `{`→`(` swap keeps the value readable in the query string (see parsePropertyFilterQuery).
export function writeFilterQueryParam(
  query: PropertyFilterProps.Query,
  setQueryParam: (param: string, value: string | null) => void,
) {
  const hasFilters = Boolean(query.tokens?.length) || Boolean(query.tokenGroups?.length);
  if (!hasFilters) {
    setQueryParam(PROPERTY_FILTERS_QUERY_PARAM_KEY, null);
  } else {
    setQueryParam(PROPERTY_FILTERS_QUERY_PARAM_KEY, JSON.stringify(query).replace('{', '('));
  }
}

export function saveQueryFilter(
  event: NonCancelableCustomEvent<PropertyFilterProps.Query>,
  setQueryParam: (param: string, value: string | null) => void,
) {
  writeFilterQueryParam(event.detail, setQueryParam);
}
