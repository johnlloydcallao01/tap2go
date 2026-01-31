import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ActivityIndicator,
  FlatList,
  Alert,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AddressService } from '@encreasl/client-services';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';

// Hardcoded API Key (ideally from ENV)
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const IS_PLACES_CONFIGURED = !!GOOGLE_PLACES_API_KEY;

interface AddressSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddressSelected: (address: any) => void;
}

export default function AddressSelectionModal({ 
  isVisible, 
  onClose, 
  onAddressSelected 
}: AddressSelectionModalProps) {
  const { user, token } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<'search' | 'preview'>('search');
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
      if (response.success && response.addresses) {
        setUserAddresses(response.addresses);
      } else {
        setUserAddresses([]);
      }

      try {
        const activeResponse = await AddressService.getActiveAddress(user.id, token);
        if (activeResponse.success && activeResponse.address) {
          const active = activeResponse.address;
          const activeId = typeof active === 'object' ? active.id : active;
          setActiveAddressId(String(activeId));
        } else {
          setActiveAddressId(null);
        }
      } catch (error) {
        console.error('Error loading active address:', error);
        setActiveAddressId(null);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setUserAddresses([]);
      setActiveAddressId(null);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [user?.id, token]);

  // Load addresses when modal opens
  useEffect(() => {
    if (isVisible && user?.id && token) {
      loadUserAddresses();
      setCurrentStep('search');
    }
  }, [isVisible, user?.id, token, loadUserAddresses]);

  const handlePlaceSelect = (data: any, details: any = null) => {
    if (details) {
      const placeResult = {
        formatted_address: details.formatted_address,
        place_id: details.place_id,
        name: details.name,
        geometry: details.geometry,
        address_components: details.address_components,
        types: details.types
      };
      
      setSelectedAddress(placeResult);
      setCurrentStep('preview');
    }
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
        token
      );

      if (!saveResponse.success || !saveResponse.address) {
        throw new Error(saveResponse.error || 'Failed to save address');
      }

      const newAddress = saveResponse.address;
      const addressId = newAddress.id;

      if (!addressId) {
        throw new Error('Address ID not found in response');
      }

      const setActiveResponse = await AddressService.setActiveAddressForUser(
        user.id,
        addressId,
        token
      );

      if (!setActiveResponse.success) {
        throw new Error(setActiveResponse.error || 'Failed to set address as active');
      }

      setActiveAddressId(String(addressId));
      AddressService.clearCache();
      await loadUserAddresses();

      onAddressSelected(newAddress);
      onClose();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save address'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetActiveAddress = async (address: any) => {
    if (!user?.id || !token) return;

    const addressId = address.id;
    setSettingActiveId(addressId);
    try {
      const response = await AddressService.setActiveAddressForUser(
        user.id,
        addressId,
        token
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to set active address');
      }

      setActiveAddressId(String(addressId));
      AddressService.clearCache();
      await loadUserAddresses();
      onAddressSelected(address);
    } catch (error) {
      console.error('Error setting active address:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to set active address'
      );
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
            if (!response.success) {
              throw new Error(response.error || 'Failed to delete address');
            }

            setUserAddresses(prev => prev.filter(a => a.id !== id));

            if (activeAddressId === String(id)) {
              setActiveAddressId(null);
            }
          } catch (error) {
            console.error('Error deleting address:', error);
            Alert.alert(
              'Error',
              error instanceof Error ? error.message : 'Failed to delete address'
            );
            await loadUserAddresses();
          } finally {
            setDeletingAddressId(null);
          }
        },
      },
    ]);
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Header */}
        <View style={styles.header}>
          {currentStep === 'preview' ? (
            <TouchableOpacity onPress={() => setCurrentStep('search')} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          )}
          
          <Text style={styles.headerTitle}>
            {currentStep === 'preview' ? 'Address Preview' : 'Addresses'}
          </Text>
          
          <View style={{ width: 40 }} /> 
        </View>

        {/* Content */}
        {currentStep === 'search' ? (
          <View style={styles.container}>
            <View style={styles.searchSection}>
              {IS_PLACES_CONFIGURED ? (
                <GooglePlacesAutocomplete
                  placeholder='Search for an address'
                  onPress={handlePlaceSelect}
                  query={{
                    key: GOOGLE_PLACES_API_KEY,
                    language: 'en',
                    components: 'country:ph',
                  }}
                  fetchDetails={true}
                  minLength={2}
                  listViewDisplayed="auto"
                  onFail={(error) => {
                    console.error('Google Places error:', error);
                  }}
                  onNotFound={() => {
                    console.log('No places found for query');
                  }}
                  styles={{
                    container: {
                      flex: 0,
                    },
                    textInputContainer: {
                      backgroundColor: 'transparent',
                      borderTopWidth: 0,
                      borderBottomWidth: 0,
                      paddingHorizontal: 0,
                    },
                    textInput: {
                      backgroundColor: '#F3F4F6',
                      height: 48,
                      borderRadius: 12,
                      paddingVertical: 5,
                      paddingHorizontal: 16,
                      fontSize: 16,
                      color: '#000',
                    },
                    listView: {
                      position: 'absolute',
                      top: 55,
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      borderRadius: 8,
                      elevation: 5,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      zIndex: 1000,
                    },
                    row: {
                      backgroundColor: 'white',
                      padding: 13,
                      height: 44,
                      flexDirection: 'row',
                    },
                    separator: {
                      height: 0.5,
                      backgroundColor: '#c8c7cc',
                    },
                  }}
                  enablePoweredByContainer={false}
                />
              ) : (
                <Text style={styles.emptyText}>
                  Address search is not available. Google Places API key is not configured.
                </Text>
              )}
            </View>

            {/* 2. Manage Address Section */}
            <View style={styles.manageSection}>
              <Text style={styles.sectionTitle}>Manage Address</Text>
              
              {isLoadingAddresses ? (
                <View style={{ marginTop: 8 }}>
                  {[1, 2, 3].map(key => (
                    <View key={key} style={styles.addressCard}>
                      <View style={styles.addressInfo}>
                        <View
                          style={{
                            width: '80%',
                            height: 16,
                            borderRadius: 8,
                            backgroundColor: '#E5E7EB',
                            marginBottom: 8,
                          }}
                        />
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <View
                            style={{
                              width: 64,
                              height: 18,
                              borderRadius: 9,
                              backgroundColor: '#E5E7EB',
                              marginRight: 8,
                            }}
                          />
                          <View
                            style={{
                              width: 64,
                              height: 18,
                              borderRadius: 9,
                              backgroundColor: '#F3E8FF',
                            }}
                          />
                        </View>
                      </View>

                      <View style={styles.addressActions}>
                        <View
                          style={{
                            flex: 1,
                            height: 36,
                            borderRadius: 6,
                            backgroundColor: '#E5E7EB',
                            marginRight: 8,
                          }}
                        />
                        <View
                          style={{
                            width: 80,
                            height: 36,
                            borderRadius: 6,
                            backgroundColor: '#FEE2E2',
                          }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <FlatList
                  data={userAddresses}
                  keyExtractor={(item) => String(item.id)}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No saved addresses found.</Text>
                  }
                  renderItem={({ item }) => {
                    const isActive = String(activeAddressId) === String(item.id);
                    return (
                      <View style={[styles.addressCard, isActive && styles.activeAddressCard]}>
                        <View style={styles.addressInfo}>
                          <Text style={styles.addressText}>{item.formatted_address}</Text>
                          <View style={styles.badgesContainer}>
                            {item.address_type && (
                               <View style={styles.typeBadge}>
                                 <Text style={styles.typeBadgeText}>{item.address_type}</Text>
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
                          {isActive ? (
                            <TouchableOpacity 
                                style={styles.activeButton}
                                disabled={true}
                            >
                                <Text style={styles.activeButtonText}>Currently Active</Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity 
                              style={styles.setAsActiveButton}
                              onPress={() => handleSetActiveAddress(item)}
                              disabled={settingActiveId === item.id}
                            >
                              <Text style={styles.setAsActiveButtonText}>
                                {settingActiveId === item.id ? 'Setting...' : 'Set as Active'}
                              </Text>
                            </TouchableOpacity>
                          )}
                          
                          <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={() => handleDeleteAddress(item.id)}
                            disabled={deletingAddressId === item.id}
                          >
                            <Text style={styles.deleteText}>
                                {deletingAddressId === item.id ? 'Deleting...' : 'Delete'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <View style={styles.previewCard}>
              <Ionicons name="location" size={32} color="#2563EB" style={{ marginBottom: 16 }} />
              <Text style={styles.previewTitle}>Selected Address</Text>
              <Text style={styles.previewAddress}>
                {selectedAddress?.formatted_address || selectedAddress?.name}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveAddress}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save and Activate</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'white',
  },
  searchSection: {
    zIndex: 100, // Ensure search dropdown is above manage section
    marginBottom: 20,
  },
  manageSection: {
    flex: 1,
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeAddressCard: {
    borderColor: '#E5E7EB', // Should strictly match screenshot, but web uses active color. Let's stick to neutral border unless active. 
    // Screenshot shows white card for active too, just badges and buttons differ? 
    // Wait, screenshot top card IS active. It has white bg.
    // Let's keep it clean.
  },
  addressInfo: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: '#DBEAFE', // blue-100
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  typeBadgeText: {
    color: '#1E40AF', // blue-800
    fontSize: 12,
    fontWeight: '500',
  },
  activeBadge: {
    backgroundColor: '#F3E8FF', // purple-100
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  activeBadgeText: {
    color: '#6B21A8', // purple-800
    fontSize: 12,
    fontWeight: '500',
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  activeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3E8FF', // purple-100
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9D5FF', // purple-200
    opacity: 0.8,
  },
  activeButtonText: {
    color: '#9333EA', // purple-600
    fontSize: 14,
    fontWeight: '500',
  },
  setAsActiveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF', // blue-50
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE', // blue-200
  },
  setAsActiveButtonText: {
    color: '#2563EB', // blue-600
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2', // red-50
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA', // red-200
  },
  deleteText: {
    color: '#DC2626', // red-600
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
  },
  previewContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  previewCard: {
    backgroundColor: '#F9FAFB',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  previewAddress: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
