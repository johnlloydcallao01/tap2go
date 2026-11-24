import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../contexts/ThemeContext';
import type { ProductVariation } from '../types/product';
import { formatCurrency } from '../utils/format';
import {
  getSelectedAttributeOptionKey,
  selectVariationForAttributeOption,
  type VariationAttributeGroup,
  type VariationAttributeOption,
} from '../utils/productVariationSelection';

const VARIATION_PICKER_KEY = '__variation_picker__';

interface ProductVariationSelectorProps {
  groups: VariationAttributeGroup[];
  variations: ProductVariation[];
  selectedVariation: ProductVariation | null;
  onSelectVariation: (variation: ProductVariation) => void;
}

export default function ProductVariationSelector({
  groups,
  variations,
  selectedVariation,
  onSelectVariation,
}: ProductVariationSelectorProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isVariationPickerOpen = openGroupKey === VARIATION_PICKER_KEY;
  const openGroup = groups.find((group) => group.key === openGroupKey) || null;
  const variationOptions = useMemo(
    () => variations.map((variation) => ({
      key: String(variation.id),
      label: variation.name,
    })),
    [variations],
  );
  const filteredOptions = useMemo(() => {
    const options = isVariationPickerOpen ? variationOptions : openGroup?.options || [];
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return normalizedQuery
      ? options.filter((option) => option.label.toLowerCase().includes(normalizedQuery))
      : options;
  }, [isVariationPickerOpen, openGroup, searchQuery, variationOptions]);

  const chooseOption = (group: VariationAttributeGroup, option: VariationAttributeOption) => {
    const matchingVariation = selectVariationForAttributeOption(
      variations,
      groups,
      selectedVariation,
      group.key,
      option.key,
    );
    if (matchingVariation) onSelectVariation(matchingVariation);
    setOpenGroupKey(null);
    setSearchQuery('');
  };

  const chooseVariation = (variationId: string) => {
    const variation = variations.find((item) => String(item.id) === variationId);
    if (variation) onSelectVariation(variation);
    setOpenGroupKey(null);
    setSearchQuery('');
  };

  const closePicker = () => {
    setOpenGroupKey(null);
    setSearchQuery('');
  };

  return (
    <>
      <View style={styles.container}>
        {groups.length > 0 ? (
          <>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Choose one option in each group.
            </Text>

            {groups.map((group) => {
              const selectedKey = getSelectedAttributeOptionKey(selectedVariation, group);
              const selectedOption = group.options.find((option) => option.key === selectedKey);
              const usesSearchablePicker = group.options.length > 6;

              return (
                <View key={group.key} style={styles.group}>
                  <View style={styles.groupHeading}>
                    <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
                  </View>

                  {usesSearchablePicker ? (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`Choose ${group.name}`}
                      style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                      onPress={() => {
                        setSearchQuery('');
                        setOpenGroupKey(group.key);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.dropdownText, { color: colors.text }]}>
                        {selectedOption?.label || `Select ${group.name}`}
                      </Text>
                      <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.options}>
                      {group.options.map((option) => {
                        const isSelected = option.key === selectedKey;
                        return (
                          <TouchableOpacity
                            key={option.key}
                            accessibilityRole="radio"
                            accessibilityLabel={`${group.name}: ${option.label}`}
                            accessibilityState={{ selected: isSelected }}
                            style={[
                              styles.option,
                              { borderColor: colors.border, backgroundColor: colors.surface },
                              isSelected && {
                                borderColor: colors.primary,
                                backgroundColor: colors.primaryLight,
                              },
                            ]}
                            onPress={() => chooseOption(group, option)}
                            activeOpacity={0.75}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                { color: colors.text },
                                isSelected && { color: colors.primary, fontWeight: '700' },
                              ]}
                            >
                              {option.label}
                            </Text>
                            {isSelected ? (
                              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        ) : variations.length > 6 ? (
          <>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Search and choose a variation.
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Choose a variation"
              style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => {
                setSearchQuery('');
                setOpenGroupKey(VARIATION_PICKER_KEY);
              }}
              activeOpacity={0.75}
            >
              <Text style={[styles.dropdownText, { color: colors.text }]}>
                {selectedVariation?.name || 'Select a variation'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Choose a variation.
            </Text>
            <View style={styles.variationOptions}>
              {variations.map((variation) => {
                const isSelected = String(selectedVariation?.id) === String(variation.id);
                return (
                  <TouchableOpacity
                    key={String(variation.id)}
                    accessibilityRole="radio"
                    accessibilityLabel={`${variation.name}, ${formatCurrency(variation.base_price || 0)}`}
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.variationOption,
                      { borderColor: colors.border, backgroundColor: colors.surface },
                      isSelected && {
                        borderColor: colors.primary,
                        backgroundColor: colors.primaryLight,
                      },
                    ]}
                    onPress={() => onSelectVariation(variation)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.variationOptionName, { color: colors.text }]}>
                      {variation.name}
                    </Text>
                    <Text style={[styles.variationOptionPrice, { color: colors.text }]}>
                      {formatCurrency(variation.base_price || 0)}
                    </Text>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </View>

      <Modal
        visible={Boolean(openGroup) || isVariationPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={closePicker}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Close options"
            style={StyleSheet.absoluteFill}
            onPress={closePicker}
          />
          <View
            accessibilityViewIsModal
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.surface,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isVariationPickerOpen
                  ? 'Choose a variation'
                  : openGroup
                    ? `Choose ${openGroup.name}`
                    : 'Choose option'}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close options"
                onPress={closePicker}
                hitSlop={8}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              accessibilityLabel={isVariationPickerOpen
                ? 'Search variations'
                : openGroup
                  ? `Search ${openGroup.name}`
                  : 'Search options'}
              style={[
                styles.searchInput,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
              ]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={isVariationPickerOpen
                ? 'Search variations'
                : openGroup
                  ? `Search ${openGroup.name}`
                  : 'Search options'}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />

            {filteredOptions.length > 0 ? (
              <FlatList
                data={filteredOptions}
                keyExtractor={(option) => option.key}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const listedVariation = isVariationPickerOpen
                    ? variations.find((variation) => String(variation.id) === item.key)
                    : null;
                  const isSelected = isVariationPickerOpen
                    ? String(selectedVariation?.id) === item.key
                    : openGroup
                      ? getSelectedAttributeOptionKey(selectedVariation, openGroup) === item.key
                      : false;
                  return (
                    <TouchableOpacity
                      accessibilityRole="radio"
                      accessibilityLabel={isVariationPickerOpen && listedVariation
                        ? `${listedVariation.name}, ${formatCurrency(listedVariation.base_price || 0)}`
                        : `${openGroup?.name || 'Option'}: ${item.label}`}
                      accessibilityState={{ selected: isSelected }}
                      style={[styles.modalOption, { borderBottomColor: colors.border }]}
                      onPress={() => {
                        if (isVariationPickerOpen) {
                          chooseVariation(item.key);
                        } else if (openGroup) {
                          chooseOption(openGroup, item);
                        }
                      }}
                    >
                      <View style={styles.modalOptionContent}>
                        <Text style={[styles.modalOptionText, { color: colors.text }]}>
                          {item.label}
                        </Text>
                        {listedVariation ? (
                          <Text style={[styles.modalOptionPrice, { color: colors.textSecondary }]}>
                            {formatCurrency(listedVariation.base_price || 0)}
                          </Text>
                        ) : null}
                      </View>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <Text style={[styles.emptySearch, { color: colors.textSecondary }]}>
                No matching options.
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  group: {
    marginBottom: 18,
  },
  groupHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '700',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  variationOptions: {
    gap: 10,
  },
  variationOption: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  variationOptionName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  variationOptionPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    marginRight: 12,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.48)',
  },
  modalSheet: {
    maxHeight: '82%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchInput: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  modalOption: {
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  modalOptionText: {
    fontSize: 15,
    marginRight: 12,
  },
  modalOptionContent: {
    flex: 1,
    marginRight: 12,
  },
  modalOptionPrice: {
    fontSize: 13,
    marginTop: 4,
  },
  emptySearch: {
    paddingVertical: 24,
    textAlign: 'center',
  },
});
