import type { ProductVariation } from '../types/product';

export interface VariationAttributeOption {
  key: string;
  label: string;
}

export interface VariationAttributeGroup {
  key: string;
  name: string;
  options: VariationAttributeOption[];
}

interface VariationAttributeValue {
  attributeId?: string | number;
  attributeName: string;
  attributeSlug?: string;
  termId?: string | number;
  termName: string;
  termSlug?: string;
}

function getAttributeValues(variation: ProductVariation): VariationAttributeValue[] {
  if (variation.attributeItems?.length) {
    return variation.attributeItems.map((item) => ({
      attributeId: item.attributeId,
      attributeName: item.attributeName,
      attributeSlug: item.attributeSlug,
      termId: item.termId,
      termName: item.termName,
      termSlug: item.termSlug,
    }));
  }

  return Object.entries(variation.attributes || {}).map(([attributeName, termName]) => ({
    attributeName,
    termName,
  }));
}

function getAttributeKey(value: VariationAttributeValue): string {
  const slug = value.attributeSlug?.trim().toLowerCase();
  const name = value.attributeName?.trim().toLowerCase();
  return `attribute:${slug || name || String(value.attributeId ?? '')}`;
}

function getTermKey(value: VariationAttributeValue): string {
  if (value.termId !== undefined && value.termId !== null) {
    return `term:${String(value.termId)}`;
  }
  const slug = value.termSlug?.trim().toLowerCase();
  const name = value.termName?.trim().toLowerCase();
  return `term:${slug || name || ''}`;
}

export function buildVariationAttributeGroups(
  variations: ProductVariation[],
): VariationAttributeGroup[] {
  if (variations.length === 0) return [];

  const firstValues = getAttributeValues(variations[0]);
  if (firstValues.length === 0 || firstValues.some((value) => !value.attributeName?.trim() || !value.termName?.trim())) {
    return [];
  }

  const groupKeys = firstValues.map(getAttributeKey);
  if (new Set(groupKeys).size !== groupKeys.length) return [];

  const valuesByVariation = variations.map((variation) => {
    const values = getAttributeValues(variation);
    if (values.length !== groupKeys.length || values.some((value) => !value.attributeName?.trim() || !value.termName?.trim())) {
      return null;
    }

    const valuesByKey = new Map(values.map((value) => [getAttributeKey(value), value]));
    if (valuesByKey.size !== groupKeys.length || groupKeys.some((key) => !valuesByKey.has(key))) {
      return null;
    }
    return valuesByKey;
  });

  if (valuesByVariation.some((values) => values === null)) return [];

  return firstValues.map((firstValue, index) => {
    const key = groupKeys[index];
    const options = new Map<string, VariationAttributeOption>();

    valuesByVariation.forEach((values) => {
      const value = values?.get(key);
      if (!value) return;
      const termKey = getTermKey(value);
      if (!options.has(termKey)) {
        options.set(termKey, { key: termKey, label: value.termName });
      }
    });

    return {
      key,
      name: firstValue.attributeName,
      options: Array.from(options.values()),
    };
  });
}

export function shouldUseCompactVariationSelector(
  variations: ProductVariation[],
  groups: VariationAttributeGroup[],
): boolean {
  if (groups.length === 0) return variations.length > 4;

  const isSmallImageRichFamily =
    groups.length === 1 &&
    variations.length > 1 &&
    variations.length <= 4 &&
    variations.every((variation) => Boolean(variation.image));

  return !isSmallImageRichFamily;
}

export function getSelectedAttributeOptionKey(
  variation: ProductVariation | null,
  group: VariationAttributeGroup,
): string | null {
  if (!variation) return null;
  const value = getAttributeValues(variation).find((item) => getAttributeKey(item) === group.key);
  return value ? getTermKey(value) : null;
}

export function selectVariationForAttributeOption(
  variations: ProductVariation[],
  groups: VariationAttributeGroup[],
  currentVariation: ProductVariation | null,
  groupKey: string,
  optionKey: string,
): ProductVariation | null {
  const candidates = variations.filter((variation) =>
    getSelectedAttributeOptionKey(variation, { key: groupKey, name: '', options: [] }) === optionKey
  );
  if (candidates.length === 0) return null;
  if (!currentVariation) return candidates[0];

  let bestCandidate = candidates[0];
  let bestScore = -1;

  for (const candidate of candidates) {
    const score = groups.reduce((matches, group) => {
      if (group.key === groupKey) return matches;
      const currentOption = getSelectedAttributeOptionKey(currentVariation, group);
      return currentOption && getSelectedAttributeOptionKey(candidate, group) === currentOption
        ? matches + 1
        : matches;
    }, 0);

    if (score > bestScore) {
      bestCandidate = candidate;
      bestScore = score;
    }
  }

  return bestCandidate;
}
