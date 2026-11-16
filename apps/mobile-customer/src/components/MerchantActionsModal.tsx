import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../contexts/ThemeContext';

type Props = {
  visible: boolean;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: () => void;
  onShare: () => void;
  onShowInformation: () => void;
};

export default function MerchantActionsModal({
  visible,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onShare,
  onShowInformation,
}: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const selectAction = (action: () => void) => {
    onClose();
    requestAnimationFrame(action);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close merchant options"
        />
        <View
          style={[
            styles.menu,
            {
              top: insets.top + 52,
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
          accessibilityViewIsModal
          accessibilityLabel="Merchant options"
        >
          <Text style={[styles.menuTitle, { color: colors.text }]}>Merchant options</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => selectAction(onToggleWishlist)}
            accessibilityRole="button"
            accessibilityState={{ selected: isWishlisted }}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={21}
              color={isWishlisted ? colors.primary : colors.text}
            />
            <Text style={[styles.menuItemText, { color: colors.text }]}>
              {isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            </Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => selectAction(onShare)}
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={21} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Share merchant</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => selectAction(onShowInformation)}
            accessibilityRole="button"
          >
            <Ionicons name="information-circle-outline" size={21} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Show information</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  menu: {
    position: 'absolute',
    right: 12,
    width: 276,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  menuTitle: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    fontSize: 13,
    fontWeight: '700',
  },
  menuItem: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50,
  },
});
