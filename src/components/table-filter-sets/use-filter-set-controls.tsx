import {
  parsePropertyFilterQuery,
  SELECTED_FILTER_SET_QUERY_PARAM_KEY,
  writeFilterQueryParam,
} from '@/libs/parse-property-filter';
import { ButtonDropdown, PropertyFilterProps, Select, SelectProps } from '@cloudscape-design/components';
import { type ReactNode, useRef } from 'react';
import { FilterSet, useFilterSets } from './use-filter-sets';

/**
 * The active query used to seed `useCollection`: the URL filter when present, otherwise the default
 * saved filter set. Applying the default here (as the initial `defaultQuery`) avoids a page flash and
 * an extra history entry versus applying it in an effect.
 */
export function resolveDefaultFilterQuery(
  urlValue: string | undefined,
  savedFilterSets: FilterSet[],
): PropertyFilterProps.Query {
  if (urlValue) {
    return parsePropertyFilterQuery(urlValue);
  }
  return savedFilterSets.find((fs) => fs.default)?.query ?? { operation: 'and', tokens: [] };
}

function isQueryEmpty(query: PropertyFilterProps.Query) {
  return (!query.tokenGroups || query.tokenGroups.length === 0) && query.tokens.length === 0;
}

function getMatchesCountText(count: number) {
  return count === 1 ? '1 match' : `${count} matches`;
}

type FilterActions = { setPropertyFiltering: (query: PropertyFilterProps.Query) => void };

type FilterSetControlsProps = {
  propertyFilterProps: PropertyFilterProps;
  actions: FilterActions;
  getQueryParam: (param: string) => string | undefined;
  setQueryParam: (param: string, value: string | null) => void;
  savedFilterSets: FilterSet[];
  setSavedFilterSets: (sets: FilterSet[]) => void;
  /** Number of items matching the active filter (from useCollection), for the "N matches" count. */
  filteredItemsCount?: number;
};

/**
 * Wires the reusable saved-filter-sets hook into a table's PropertyFilter: persistence via the
 * caller's `useLocalStorage`-backed array, the active query in the URL (reusing the existing
 * `?propertyFilter=` serialization), and the selected set name in `?filterSet=`. Returns nodes to
 * drop straight onto `<PropertyFilter customControl={...} customFilterActions={...} />` plus the
 * action modal to render alongside the table.
 */
export function useFilterSetControls({
  propertyFilterProps,
  actions,
  getQueryParam,
  setQueryParam,
  savedFilterSets,
  setSavedFilterSets,
  filteredItemsCount,
}: FilterSetControlsProps): {
  customControl: ReactNode;
  customFilterActions: ReactNode;
  actionModal: ReactNode;
  countText?: string;
} {
  const selectRef = useRef<SelectProps.Ref>(null);

  const applyQuery = (query: PropertyFilterProps.Query) => {
    actions.setPropertyFiltering(query);
    writeFilterQueryParam(query, setQueryParam);
    if (isQueryEmpty(query)) {
      setQueryParam(SELECTED_FILTER_SET_QUERY_PARAM_KEY, null);
    }
  };

  const { selectProps, buttonDropdownProps, actionModal } = useFilterSets({
    filterSets: savedFilterSets,
    query: propertyFilterProps.query,
    filteringProperties: propertyFilterProps.filteringProperties,
    selectRef,
    updateFilters: applyQuery,
    updateSavedFilterSets: setSavedFilterSets,
    defaultSelectedFilterSetValue:
      getQueryParam(SELECTED_FILTER_SET_QUERY_PARAM_KEY) ?? savedFilterSets.find((fs) => fs.default)?.name ?? null,
    updateSelectedFilterValue: (value) => setQueryParam(SELECTED_FILTER_SET_QUERY_PARAM_KEY, value),
  });

  return {
    // Min width keeps the selected value / placeholder readable without the box resizing. The visible
    // "Saved filter sets" label is dropped to declutter the row; ariaLabel keeps the accessible name.
    customControl: (
      <div style={{ minWidth: 240 }}>
        <Select
          {...selectProps}
          ariaLabel="Saved filter sets"
          ref={selectRef}
        />
      </div>
    ),
    customFilterActions: <ButtonDropdown {...buttonDropdownProps} />,
    actionModal,
    // Only shown while a filter is active (the header counter already shows the unfiltered total).
    countText: isQueryEmpty(propertyFilterProps.query) ? undefined : getMatchesCountText(filteredItemsCount ?? 0),
  };
}
