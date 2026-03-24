import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { AddressService } from '@encreasl/client-services';
import { AddressSearchInput } from '../shared/AddressSearchInput';

interface CheckoutAddressSectionProps {
  onAddressChange?: (addressId: string) => void;
  style?: any;
}

export function CheckoutAddressSection({ onAddressChange, style }: CheckoutAddressSectionProps) {
  const { user, token } = useAuth();

  // ── Step state ──────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<'search' | 'preview'>('search');

  // ── Address management state ────────────────────────────────────────────────
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [activeAddressId, setActiveAddressId] = useState<string | null>(null);
  const [settingActiveId, setSettingActiveId] = useState<string | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  const loadUserAddresses = useCallback(async () => {
    if (!user?.id || !token) return;

    setIsLoadingAddresses(true);
    try {
      const response = await AddressService.getUserAddresses(user.id, token, false);
      setUserAddresses(response.success && response.addresses ? response.addresses : []);

      try {
        const activeResponse = await AddressService.getActiveAddress(user.id, token);
        if (activeResponse.success && activeResponse.address) {
          const active = activeResponse.address;
          const newActiveId = String(typeof active === 'object' ? active.id : active);
          setActiveAddressId(newActiveId);
          onAddressChange?.(newActiveId);
        } else {
          setActiveAddressId(null);
        }
      } catch {
        setActiveAddressId(null);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setUserAddresses([]);
      setActiveAddressId(null);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [user?.id, token, onAddressChange]);

  useEffect(() => {
    if (user?.id && token) {
      loadUserAddresses();
    }
  }, [user?.id, token, loadUserAddresses]);

  const handleAddressSelect = (placeDetails: any) => {
    setSelectedAddress(placeDetails);
    setCurrentStep('preview');
  };

  const handleSaveAddress = async () => {
    if (!selectedAddress || !user?.id || !token) return;

    setIsSaving(true);
    try {
      const saveResponse = await AddressService.saveAddress(
        {
          place: selectedAddress,
          address_type: 'home',
          is_default: false,
          userId: user.id,
        },
        token,
      );

      if (!saveResponse.success || !saveResponse.address) {
        throw new Error(saveResponse.error || 'Failed to save address');
      }

      const addressId = saveResponse.address.id;
      if (!addressId) throw new Error('Address ID not found in response');

      const setActiveResponse = await AddressService.setActiveAddressForUser(user.id, addressId, token);
      if (!setActiveResponse.success) {
        throw new Error(setActiveResponse.error || 'Failed to set address as active');
      }

      const newActiveId = String(addressId);
      setActiveAddressId(newActiveId);
      AddressService.clearCache();
      await loadUserAddresses();
      onAddressChange?.(newActiveId);
      
      setCurrentStep('search');
      setSelectedAddress(null);
      Alert.alert('Success', 'Address saved and activated successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetActiveAddress = async (address: any) => {
    if (!user?.id || !token) return;

    setSettingActiveId(address.id);
    try {
      const response = await AddressService.setActiveAddressForUser(user.id, address.id, token);
      if (!response.success) throw new Error(response.error || 'Failed to set active address');

      const newActiveId = String(address.id);
      setActiveAddressId(newActiveId);
      AddressService.clearCache();
      await loadUserAddresses();
      onAddressChange?.(newActiveId);
      Alert.alert('Success', 'Active address updated successfully!');
    } catch (error) {
      console.error('Error setting active address:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to set active address');
      await loadUserAddresses();
    } finally {
      setSettingActiveId(null);
    }
  };

  const handleDeleteAddress = (id: string) => {
    if (!token) return;

    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingAddressId(id);
          try {
            const response = await AddressService.deleteAddress(id, token);
            if (!response.success) throw new Error(response.error || 'Failed to delete address');

            setUserAddresses(prev => prev.filter(a => a.id !== id));
            if (activeAddressId === String(id)) setActiveAddressId(null);
            Alert.alert('Success', 'Address deleted successfully!');
          } catch (error) {
            console.error('Error deleting address:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete address');
            await loadUserAddresses();
          } finally {
            setDeletingAddressId(null);
          }
        },
      },
    ]);
  };

  const handleBackToSearch = () => {
    setCurrentStep('search');
    setSelectedAddress(null);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.headerTitle}>
        {currentStep === 'preview' ? 'Confirm Delivery Address' : 'Delivery Address'}
      </Text>
      
      {currentStep === 'search' ? (
        <>
          <AddressSearchInput 
            onAddressSelect={handleAddressSelect} 
            containerStyle={styles.searchContainer}
          />

          {user?.id && (
            <View style={styles.savedAddressesContainer}>
              <Text style={styles.savedAddressesTitle}>SAVED ADDRESSES</Text>

              {isLoadingAddresses ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color="#9CA3AF" />
                </View>
              ) : userAddresses.length === 0 ? (
                <Text style={styles.emptyText}>No saved addresses found.</Text>
              ) : (
                <View style={styles.addressList}>
                  {userAddresses.map((address) => {
                    const isActive = String(activeAddressId) === String(address.id);
                    return (
                      <View 
                        key={address.id} 
                        style={[
                          styles.addressCard,
                          isActive ? styles.addressCardActive : styles.addressCardInactive
                        ]}
                      >
                        <View style={styles.addressInfo}>
                          <Text style={styles.addressText}>{address.formatted_address}</Text>
                          <View style={styles.badgesContainer}>
                            {address.address_type && (
                              <View style={styles.typeBadge}>
                                <Text style={styles.typeBadgeText}>{address.address_type}</Text>
                              </View>
                            )}
                            {isActive && (
                              <View style={styles.activeBadge}>
                                <Text style={styles.activeBadgeText}>Active</Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <View style={styles.addressActions}>
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              isActive ? styles.activeButton : styles.useButton
                            ]}
                            onPress={() => !isActive && handleSetActiveAddress(address)}
                            disabled={settingActiveId === address.id || isActive}
                          >
                            <Text style={[
                              styles.actionButtonText,
                              isActive ? styles.activeButtonText : styles.useButtonText
                            ]}>
                              {settingActiveId === address.id ? 'Setting...' : isActive ? 'Active' : 'Use'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDeleteAddress(address.id)}
                            disabled={deletingAddressId === address.id}
                          >
                            <Text style={[styles.actionButtonText, styles.deleteText]}>
                              {deletingAddressId === address.id ? '...' : 'Delete'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </>
      ) : (
        <View style={styles.previewContainer}>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>
              {selectedAddress?.name || selectedAddress?.formatted_address}
            </Text>
            <Text style={styles.previewAddress}>
              {selectedAddress?.formatted_address}
            </Text>
          </View>

          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToSearch}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleSaveAddress}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm & Use</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 0,
  },
  savedAddressesContainer: {
    marginTop: 16,
  },
  savedAddressesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  loaderContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    paddingVertical: 12,
  },
  addressList: {
    gap: 12,
  },
  addressCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  addressCardInactive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  addressCardActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#E9D5FF',
  },
  addressInfo: {
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 6,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#1E40AF',
    fontSize: 10,
    fontWeight: '500',
  },
  activeBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  activeBadgeText: {
    color: '#6B21A8',
    fontSize: 10,
    fontWeight: '500',
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: '500',
  },
  useButton: {
    borderColor: '#DBEAFE',
  },
  useButtonText: {
    color: '#2563EB',
  },
  activeButton: {
    borderColor: '#E9D5FF',
  },
  activeButtonText: {
    color: '#9333EA',
  },
  deleteButton: {
    borderColor: '#FECACA',
  },
  deleteText: {
    color: '#DC2626',
  },
  previewContainer: {
    gap: 16,
  },
  previewCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  previewAddress: {
    fontSize: 14,
    color: '#4B5563',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#000',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});
