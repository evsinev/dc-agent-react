import { PropertyFilterProps } from '@cloudscape-design/components';

export function isTokenGroup(
  tokenOrGroup: PropertyFilterProps.Token | PropertyFilterProps.TokenGroup,
): tokenOrGroup is PropertyFilterProps.TokenGroup {
  const key: keyof PropertyFilterProps.TokenGroup = 'operation';
  return key in tokenOrGroup;
}

export function isToken(
  tokenOrGroup: PropertyFilterProps.Token | PropertyFilterProps.TokenGroup,
): tokenOrGroup is PropertyFilterProps.Token {
  const key: keyof PropertyFilterProps.Token = 'operator';
  return key in tokenOrGroup;
}
