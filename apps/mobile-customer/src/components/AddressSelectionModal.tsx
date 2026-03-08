import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  FlatList,
  Alert,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { AddressService } from '@encreasl/client-services';
import { Ionicons } from '@expo/vector-icons';

// ─── Google Places API ────────────────────────────────────────────────────────
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const IS_PLACES_CONFIGURED = !!GOOGLE_PLACES_API_KEY;

const AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

// Fields requested from Places Details (only what we need — minimises billing SKU)
const DETAIL_FIELDS = 'formatted_address,geometry,name,address_components,types,place_id';

/** Generate a lightweight session token (groups autocomplete + details into 1 billed session) */
function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlaceSuggestion {
  place_id: string;
  description: string;       // full address string from Places API
  structured_formatting: {
    main_text: string;       // primary part e.g. "Pangi, Ipil"
    secondary_text: string;  // secondary part e.g. "Zamboanga Sibugay, Philippines"
  };
}

interface AddressSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddressSelected: (address: any) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddressSelectionModal({
  isVisible,
  onClose,
  onAddressSelected,
}: AddressSelectionModalProps) {
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

  // ── Search state ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);   // true once ≥1 request completed

  // ── Refs for request lifecycle management ───────────────────────────────────
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);           // monotonically increases; only the latest response is processed
  const sessionTokenRef = useRef(generateSessionToken());

  // ── Reset search state on modal open / close ────────────────────────────────
  useEffect(() => {
    if (isVisible) {
      // Fresh session each time the modal opens
      sessionTokenRef.current = generateSessionToken();
      setSearchQuery('');
      setSuggestions([]);
      setIsSearching(false);
      setSearchError(null);
      setHasSearched(false);
      setCurrentStep('search');

      if (user?.id && token) {
        loadUserAddresses();
      }
    } else {
      // Cancel any pending requests when modal closes
      abortControllerRef.current?.abort();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  // ── Debounced search — triggered on every searchQuery change ─────────────────
  useEffect(() => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    // Clear suggestions immediately if query is too short
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setSearchError(null);
      setHasSearched(false);
      return;
    }

    // Show loading indicator right away so the UI feels responsive
    setIsSearching(true);
    setSearchError(null);

    // Wait 350 ms after the user stops typing before firing the actual request
    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchQuery.trim());
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  /**
   * Calls Google Places Autocomplete API with the current query.
   * Uses AbortController to cancel stale requests and a requestId to
   * discard out-of-order responses.
   */
  const performSearch = useCallback(async (query: string) => {
    if (!IS_PLACES_CONFIGURED) {
      setIsSearching(false);
      return;
    }

    // Cancel any previous in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Tag this request — responses for older requests will be ignored
    const myRequestId = ++requestIdRef.current;

    try {
      const params = new URLSearchParams({
        input: query,
        key: GOOGLE_PLACES_API_KEY,
        language: 'en',
        components: 'country:ph',
        types: 'geocode',              // addresses + geographic features
        sessiontoken: sessionTokenRef.current,
      });

      const response = await fetch(`${AUTOCOMPLETE_URL}?${params.toString()}`, {
        signal: controller.signal,
      });

      // Discard stale responses (a newer request has already been sent)
      if (myRequestId !== requestIdRef.current) return;

      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK') {
        setSuggestions(data.predictions ?? []);
      } else if (data.status === 'ZERO_RESULTS') {
        setSuggestions([]);
      } else {
        throw new Error(data.error_message || data.status);
      }

      setHasSearched(true);
    } catch (err: any) {
      if (err.name === 'AbortError') return; // intentionally cancelled — not an error
      if (myRequestId !== requestIdRef.current) return;
      console.error('Places Autocomplete error:', err);
      setSearchError('Could not fetch suggestions. Check your connection.');
      setSuggestions([]);
    } finally {
      if (myRequestId === requestIdRef.current) {
        setIsSearching(false);
      }
    }
  }, []);

  /**
   * Called when the user taps a suggestion row.
   * Fetches full place details then moves to the preview step.
   */
  const handleSuggestionPress = useCallback(async (suggestion: PlaceSuggestion) => {
    Keyboard.dismiss();
    setIsFetchingDetails(true);

    try {
      const params = new URLSearchParams({
        place_id: suggestion.place_id,
        key: GOOGLE_PLACES_API_KEY,
        fields: DETAIL_FIELDS,
        sessiontoken: sessionTokenRef.current,
      });

      const response = await fetch(`${DETAILS_URL}?${params.toString()}`);

      if (!response.ok) throw new Error(`Details API error: ${response.status}`);

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(data.error_message || data.status);
      }

      const details = data.result;
      const placeResult = {
        formatted_address: details.formatted_address,
        place_id: details.place_id,
        name: details.name,
        geometry: details.geometry,
        address_components: details.address_components,
        types: details.types,
      };

      // Refresh the session token now that this session (autocomplete + details) is complete
      sessionTokenRef.current = generateSessionToken();

      setSelectedAddress(placeResult);
      setSuggestions([]);
      setSearchQuery('');
      setCurrentStep('preview');
    } catch (err) {
      console.error('Places Details error:', err);
      Alert.alert('Error', 'Could not load address details. Please try again.');
    } finally {
      setIsFetchingDetails(false);
    }
  }, []);

  // ── Address management ──────────────────────────────────────────────────────
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
          setActiveAddressId(String(typeof active === 'object' ? active.id : active));
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
  }, [user?.id, token]);

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

      setActiveAddressId(String(addressId));
      AddressService.clearCache();
      await loadUserAddresses();

      onAddressSelected(saveResponse.address);
      onClose();
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

      setActiveAddressId(String(address.id));
      AddressService.clearCache();
      await loadUserAddresses();
      onAddressSelected(address);
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

  // ── Render suggestion row ───────────────────────────────────────────────────
  const renderSuggestion = ({ item }: { item: PlaceSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionRow}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionIconWrapper}>
        <Ionicons name="location-outline" size={18} color="#6B7280" />
      </View>
      <View style={styles.suggestionTextWrapper}>
        <Text style={styles.suggestionMainText} numberOfLines={1}>
          {item.structured_formatting?.main_text ?? item.description}
        </Text>
        {!!item.structured_formatting?.secondary_text && (
          <Text style={styles.suggestionSubText} numberOfLines={1}>
            {item.structured_formatting.secondary_text}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: 'white' }}>
        {/* ── Header ── */}
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

        {/* ── Content ── */}
        {currentStep === 'search' ? (
          <View style={styles.container}>

            {/* ── Search Input ── */}
            <View style={styles.searchSection}>
              {IS_PLACES_CONFIGURED ? (
                <>
                  {/* Input row */}
                  <View style={styles.searchInputRow}>
                    <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search for an address"
                      placeholderTextColor="#9CA3AF"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="search"
                      clearButtonMode="while-editing"
                    />
                    {/* Loading spinner inside input */}
                    {isSearching && (
                      <ActivityIndicator size="small" color="#9CA3AF" style={{ marginRight: 12 }} />
                    )}
                    {/* Clear button (Android — iOS uses clearButtonMode) */}
                    {!isSearching && searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                        <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Fetching details overlay */}
                  {isFetchingDetails && (
                    <View style={styles.detailsLoader}>
                      <ActivityIndicator size="small" color="#f3a823" />
                      <Text style={styles.detailsLoaderText}>Loading address details…</Text>
                    </View>
                  )}

                  {/* Suggestions dropdown */}
                  {suggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      <FlatList
                        data={suggestions}
                        keyExtractor={item => item.place_id}
                        renderItem={renderSuggestion}
                        keyboardShouldPersistTaps="handled"
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        showsVerticalScrollIndicator={false}
                      />
                    </View>
                  )}

                  {/* No results */}
                  {!isSearching && hasSearched && suggestions.length === 0 && searchQuery.trim().length >= 2 && (
                    <View style={styles.noResults}>
                      <Ionicons name="search-outline" size={24} color="#D1D5DB" />
                      <Text style={styles.noResultsText}>No addresses found for &quot;{searchQuery}&quot;</Text>
                    </View>
                  )}

                  {/* Error */}
                  {!!searchError && (
                    <View style={styles.noResults}>
                      <Ionicons name="wifi-outline" size={24} color="#FCA5A5" />
                      <Text style={[styles.noResultsText, { color: '#EF4444' }]}>{searchError}</Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.emptyText}>
                  Address search is not available. Google Places API key is not configured.
                </Text>
              )}
            </View>

            {/* ── Manage Addresses ── */}
            <View style={styles.manageSection}>
              <Text style={styles.sectionTitle}>Manage Address</Text>

              {isLoadingAddresses ? (
                <View style={{ marginTop: 8 }}>
                  {[1, 2, 3].map(key => (
                    <View key={key} style={styles.addressCard}>
                      <View style={styles.addressInfo}>
                        <View style={{ width: '80%', height: 16, borderRadius: 8, backgroundColor: '#E5E7EB', marginBottom: 8 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{ width: 64, height: 18, borderRadius: 9, backgroundColor: '#E5E7EB', marginRight: 8 }} />
                          <View style={{ width: 64, height: 18, borderRadius: 9, backgroundColor: '#F3E8FF' }} />
                        </View>
                      </View>
                      <View style={styles.addressActions}>
                        <View style={{ flex: 1, height: 36, borderRadius: 6, backgroundColor: '#E5E7EB', marginRight: 8 }} />
                        <View style={{ width: 80, height: 36, borderRadius: 6, backgroundColor: '#FEE2E2' }} />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <FlatList
                  data={userAddresses}
                  keyExtractor={item => String(item.id)}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No saved addresses found.</Text>
                  }
                  renderItem={({ item }) => {
                    const isActive = String(activeAddressId) === String(item.id);
                    return (
                      <View style={styles.addressCard}>
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
                            <TouchableOpacity style={styles.activeButton} disabled>
                              <Text style={styles.activeButtonText}>Currently Active</Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={styles.setAsActiveButton}
                              onPress={() => handleSetActiveAddress(item)}
                              disabled={settingActiveId === item.id}
                            >
                              <Text style={styles.setAsActiveButtonText}>
                                {settingActiveId === item.id ? 'Setting…' : 'Set as Active'}
                              </Text>
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteAddress(item.id)}
                            disabled={deletingAddressId === item.id}
                          >
                            <Text style={styles.deleteText}>
                              {deletingAddressId === item.id ? 'Deleting…' : 'Delete'}
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
          /* ── Preview Step ── */
          <View style={styles.previewContainer}>
            <View style={styles.previewCard}>
              <Ionicons name="location" size={32} color="#2563EB" style={{ marginBottom: 16 }} />
              <Text style={styles.previewTitle}>Selected Address</Text>
              <Text style={styles.previewAddress}>
                {selectedAddress?.formatted_address || selectedAddress?.name}
              </Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress} disabled={isSaving}>
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

// ─── Styles ───────────────────────────────────────────────────────────────────
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

  // ── Search ──
  searchSection: {
    zIndex: 100,
    marginBottom: 20,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
    marginRight: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    zIndex: 1000,
    maxHeight: 280,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  suggestionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionTextWrapper: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  suggestionSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 14,
  },
  noResults: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    gap: 8,
  },
  noResultsText: {
    fontSize: 13,
    color: '#9CA3AF',
    flexShrink: 1,
  },
  detailsLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    gap: 8,
  },
  detailsLoaderText: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  // ── Manage addresses ──
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
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  typeBadgeText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '500',
  },
  activeBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  activeBadgeText: {
    color: '#6B21A8',
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
    backgroundColor: '#F3E8FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    opacity: 0.8,
  },
  activeButtonText: {
    color: '#9333EA',
    fontSize: 14,
    fontWeight: '500',
  },
  setAsActiveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  setAsActiveButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
  },

  // ── Preview ──
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
