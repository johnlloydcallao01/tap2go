import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useThemeColors } from '../contexts/ThemeContext'
import { apiConfig } from '../config/environment'
import {
  cancelWalletTopup,
  fetchCustomerWallet,
  prepareWalletTopup,
  reconcileWalletTopup,
} from '../services/customerWallet'
import {
  AVAILABLE_PAYMENT_METHODS,
  BANK_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  type BankCode,
  type PaymentMethod,
} from '../utils/paymentMethods'
import { formatCurrency } from '../utils/format'

type TopupMethod = Exclude<PaymentMethod, 'wallet'>

function isTopupMethod(value: string): value is TopupMethod {
  return AVAILABLE_PAYMENT_METHODS.some((method) => method === value && method !== 'wallet')
}

function parseAmountMinor(value: string): number | null {
  const normalized = value.trim().replace(/,/g, '')
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null
  const amount = Number(normalized)
  if (!Number.isFinite(amount)) return null
  const minor = Math.round(amount * 100)
  return minor >= 100 && Number.isSafeInteger(minor) ? minor : null
}

export default function WalletScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    topup_id?: string | string[]
    topup_result?: string | string[]
  }>()
  const colors = useThemeColors()
  const { user, token } = useAuth()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('200')
  const amountEditedRef = useRef(false)
  const [paymentMethod, setPaymentMethod] = useState<TopupMethod>('gcash')
  const paymentMethodEditedRef = useRef(false)
  const paymentMethodEditedUserIdRef = useRef<string | null>(null)
  const paymentPreferenceUserIdRef = useRef<string | null>(null)
  const selectedPaymentMethodRef = useRef<TopupMethod>('gcash')
  const [bankCode, setBankCode] = useState<BankCode | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [pendingTopupId, setPendingTopupId] = useState<string | number | null>(null)
  const [topupMessage, setTopupMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    let active = true
    amountEditedRef.current = false
    setAmount('200')
    const loadLastAmount = async () => {
      try {
        const savedAmount = await AsyncStorage.getItem(
          `tap2go:wallet-topup-amount:${user.id}`,
        )
        if (active && !amountEditedRef.current && savedAmount && parseAmountMinor(savedAmount)) {
          setAmount(savedAmount)
        }
      } catch (error) {
        console.error('[wallet] failed to restore the last top-up amount:', error)
      }
    }
    void loadLastAmount()
    return () => {
      active = false
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    let active = true
    const preferenceUserId = String(user.id)
    if (paymentPreferenceUserIdRef.current !== preferenceUserId) {
      paymentPreferenceUserIdRef.current = preferenceUserId
      const hasSelectionForUser = paymentMethodEditedRef.current && (
        paymentMethodEditedUserIdRef.current === null ||
        paymentMethodEditedUserIdRef.current === preferenceUserId
      )
      if (hasSelectionForUser) {
        paymentMethodEditedUserIdRef.current = preferenceUserId
        void AsyncStorage.setItem(
          `tap2go:wallet-topup-payment-method:${preferenceUserId}`,
          selectedPaymentMethodRef.current,
        ).catch((error) => {
          console.error('[wallet] failed to save the selected top-up payment method:', error)
        })
      } else {
        paymentMethodEditedRef.current = false
        paymentMethodEditedUserIdRef.current = null
        selectedPaymentMethodRef.current = 'gcash'
        setPaymentMethod('gcash')
      }
    }
    const loadLastPaymentMethod = async () => {
      try {
        const savedMethod = await AsyncStorage.getItem(
          `tap2go:wallet-topup-payment-method:${preferenceUserId}`,
        )
        if (
          active &&
          !paymentMethodEditedRef.current &&
          savedMethod &&
          isTopupMethod(savedMethod)
        ) {
          selectedPaymentMethodRef.current = savedMethod
          setPaymentMethod(savedMethod)
        }
      } catch (error) {
        console.error('[wallet] failed to restore the last top-up payment method:', error)
      }
    }
    void loadLastPaymentMethod()
    return () => {
      active = false
    }
  }, [user?.id])

  const handleAmountChange = useCallback((value: string) => {
    amountEditedRef.current = true
    setAmount(value)
    if (!user?.id || !parseAmountMinor(value)) return
    void AsyncStorage.setItem(`tap2go:wallet-topup-amount:${user.id}`, value).catch((error) => {
      console.error('[wallet] failed to save the last top-up amount:', error)
    })
  }, [user?.id])

  const handlePaymentMethodChange = useCallback((method: TopupMethod) => {
    paymentMethodEditedRef.current = true
    paymentMethodEditedUserIdRef.current = user?.id ? String(user.id) : null
    selectedPaymentMethodRef.current = method
    setPaymentMethod(method)
    setBankCode(null)
    if (!user?.id) return
    void AsyncStorage.setItem(`tap2go:wallet-topup-payment-method:${user.id}`, method).catch((error) => {
      console.error('[wallet] failed to save the last top-up payment method:', error)
    })
  }, [user?.id])

  const resetTopupForm = useCallback((message: string) => {
    setPendingTopupId(null)
    setBankCode(null)
    setTopupMessage(message)
  }, [])

  const cancelTopupAttempt = useCallback(async (
    topupId: string | number,
    amountMinor?: number,
  ) => {
    if (!token) throw new Error('Sign in again before cancelling this top-up.')
    setIsCancelling(true)
    try {
      const state = await cancelWalletTopup({ token, topupId })
      if (state === 'cancelled') {
        resetTopupForm('Payment cancelled. You can start a fresh top-up.')
        return
      }
      if (state === 'paid') {
        await queryClient.invalidateQueries({ queryKey: ['customer-wallet'] })
        router.replace({
          pathname: '/wallet-topup-success',
          params: {
            topup_id: String(topupId),
            ...(amountMinor ? { amount_minor: String(amountMinor) } : {}),
          },
        })
        return
      }
      router.replace({
        pathname: '/wallet-topup-processing',
        params: {
          topup_id: String(topupId),
          ...(amountMinor ? { amount_minor: String(amountMinor) } : {}),
        },
      })
    } finally {
      setIsCancelling(false)
    }
  }, [queryClient, resetTopupForm, router, token])

  const walletQuery = useQuery({
    queryKey: ['customer-wallet', String(user?.id ?? '')],
    enabled: Boolean(token && user?.id),
    queryFn: ({ signal }) => {
      if (!token) throw new Error('Sign in to view your wallet.')
      return fetchCustomerWallet(token, signal)
    },
  })

  const topupMethods = useMemo(
    () => AVAILABLE_PAYMENT_METHODS.filter((method): method is TopupMethod => method !== 'wallet'),
    [],
  )

  useEffect(() => {
    const topupId = Array.isArray(params.topup_id) ? params.topup_id[0] : params.topup_id
    if (topupId) setPendingTopupId(topupId)
  }, [params.topup_id])

  useEffect(() => {
    const result = Array.isArray(params.topup_result)
      ? params.topup_result[0]
      : params.topup_result
    if (result === 'cancelled') {
      resetTopupForm('Payment cancelled. You can start a fresh top-up.')
    } else if (result === 'failed') {
      resetTopupForm('This top-up was not completed. You can start a fresh top-up.')
    } else if (result === 'paid') {
      resetTopupForm('Top-up confirmed and added to your wallet.')
    }
  }, [params.topup_result, resetTopupForm])

  useEffect(() => {
    if (!pendingTopupId || !token) return
    let active = true
    const check = async () => {
      try {
        const status = await reconcileWalletTopup({ token, topupId: pendingTopupId })
        if (!active) return
        if (status === 'paid') {
          resetTopupForm('Top-up confirmed and added to your wallet.')
          await queryClient.invalidateQueries({ queryKey: ['customer-wallet'] })
        } else if (status === 'failed') {
          resetTopupForm('This top-up was not completed. You can start a fresh top-up.')
        }
      } catch (error) {
        if (active) {
          setTopupMessage(error instanceof Error ? error.message : 'Could not verify this top-up yet.')
        }
      }
    }
    void check()
    const interval = setInterval(() => void check(), 4000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [pendingTopupId, queryClient, resetTopupForm, token])

  const handleTopup = async () => {
    if (!token) {
      Alert.alert('Sign in required', 'Sign in again before adding money to your wallet.')
      return
    }
    const amountMinor = parseAmountMinor(amount)
    if (!amountMinor) {
      Alert.alert('Invalid amount', 'Enter at least PHP 1.00, using no more than two decimal places.')
      return
    }
    const selectedPaymentMethod = selectedPaymentMethodRef.current
    if (BANK_OPTIONS[selectedPaymentMethod] && !bankCode) {
      Alert.alert('Choose a bank', 'Select a bank for this online banking payment.')
      return
    }

    setIsSubmitting(true)
    setTopupMessage(null)
    let preparedTopupId: string | number | null = null
    try {
      const prepared = await prepareWalletTopup({
        token,
        amountMinor,
        paymentMethod: selectedPaymentMethod,
        bankCode,
        idempotencyKey: `wallet-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`,
      })
      preparedTopupId = prepared.topupId
      setPendingTopupId(prepared.topupId)
      const publicKey = apiConfig.paymongoPublicKey
      if (!publicKey) throw new Error('PayMongo is not configured in this app build.')

      const billing = {
        name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Tap2Go Customer',
        email: user?.email || 'customer@example.com',
        phone: '',
        address: { line1: '', line2: '', city: '', state: '', postal_code: '', country: 'PH' },
      }
      const methodResponse = await fetch('https://api.paymongo.com/v1/payment_methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`${publicKey}:`)}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type: selectedPaymentMethod,
              billing,
              ...(BANK_OPTIONS[selectedPaymentMethod] && bankCode
                ? { details: { bank_code: bankCode } }
                : {}),
            },
          },
        }),
      })
      const methodData = await methodResponse.json().catch(() => ({}))
      const paymentMethodId = methodData?.data?.id
      if (!methodResponse.ok || !paymentMethodId) {
        throw new Error(methodData?.errors?.[0]?.detail || 'Could not create the selected payment method.')
      }

      const appReturnUrl = Linking.createURL('wallet-topup-processing', {
        queryParams: {
          topup_id: String(prepared.topupId),
          amount_minor: String(prepared.amountMinor),
        },
      })
      const returnUrl =
        `https://app.tap2goph.com/checkout/wallet/return?payment_intent_id=${encodeURIComponent(prepared.paymentIntentId)}` +
        `&order_id=${encodeURIComponent(String(prepared.topupId))}` +
        `&app_redirect=${encodeURIComponent(appReturnUrl)}`
      const attachResponse = await fetch(
        `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(prepared.paymentIntentId)}/attach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${btoa(`${publicKey}:`)}`,
          },
          body: JSON.stringify({
            data: {
              attributes: {
                payment_method: paymentMethodId,
                client_key: prepared.clientKey,
                return_url: returnUrl,
              },
            },
          }),
        },
      )
      const attachData = await attachResponse.json().catch(() => ({}))
      if (!attachResponse.ok) {
        throw new Error(attachData?.errors?.[0]?.detail || 'PayMongo could not start this top-up.')
      }

      const status = String(attachData?.data?.attributes?.status || '')
      const nextAction = attachData?.data?.attributes?.next_action
      if (status === 'succeeded') {
        router.replace({
          pathname: '/wallet-topup-processing',
          params: {
            topup_id: String(prepared.topupId),
            amount_minor: String(prepared.amountMinor),
          },
        })
      } else if (nextAction?.redirect?.url) {
        const subscription = Linking.addEventListener('url', ({ url }) => {
          if (url.startsWith('gcash://')) {
            Linking.openURL(url)
          }
        })
        try {
          const result = await WebBrowser.openAuthSessionAsync(nextAction.redirect.url, appReturnUrl)
          if (result.type === 'success' && result.url) {
            return
          }
          router.replace({
            pathname: '/wallet-topup-processing',
            params: {
              topup_id: String(prepared.topupId),
              amount_minor: String(prepared.amountMinor),
            },
          })
        } finally {
          subscription.remove()
        }
      } else if (nextAction?.code?.image_url) {
        router.push({
          pathname: '/wallet-topup-qr',
          params: {
            topup_id: String(prepared.topupId),
            amount_minor: String(prepared.amountMinor),
            qr_image: String(nextAction.code.image_url),
          },
        })
      } else {
        router.replace({
          pathname: '/wallet-topup-processing',
          params: {
            topup_id: String(prepared.topupId),
            amount_minor: String(prepared.amountMinor),
          },
        })
      }
    } catch (error) {
      if (preparedTopupId) {
        try {
          await cancelTopupAttempt(preparedTopupId)
        } catch (cancelError) {
          setTopupMessage(
            cancelError instanceof Error
              ? cancelError.message
              : 'The payment attempt could not be safely cancelled. Do not start another top-up yet.',
          )
        }
      }
      Alert.alert(
        'Top-up not started',
        error instanceof Error ? error.message : 'Could not start this wallet top-up.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ backgroundColor: colors.primary }} edges={['top']} />
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 12,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={23} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 16, fontSize: 22, fontWeight: '700', color: colors.text }}>
          Your Wallet
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 16, paddingBottom: 36 }}>
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 18,
            padding: 22,
            marginBottom: 18,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 14, opacity: 0.9 }}>Available balance</Text>
          {walletQuery.isLoading ? (
            <ActivityIndicator color="#fff" style={{ alignSelf: 'flex-start', marginTop: 12 }} />
          ) : (
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700', marginTop: 8 }}>
              {walletQuery.data
                ? formatCurrency(walletQuery.data.balanceMinor / 100)
                : walletQuery.isError
                  ? 'Unavailable'
                  : formatCurrency(0)}
            </Text>
          )}
          {walletQuery.isError && (
            <TouchableOpacity onPress={() => void walletQuery.refetch()} style={{ marginTop: 10 }}>
              <Text style={{ color: '#fff', textDecorationLine: 'underline' }}>Try again</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 18 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
            Add money
          </Text>
          <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>Amount (PHP)</Text>
          <TextInput
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="decimal-pad"
            placeholder="e.g. 500.00"
            placeholderTextColor={colors.textSecondary}
            accessibilityLabel="Top-up amount in Philippine pesos"
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: colors.text,
              fontSize: 18,
              marginBottom: 14,
            }}
          />
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {['100', '500', '1000'].map((preset) => (
              <TouchableOpacity
                key={preset}
                onPress={() => handleAmountChange(preset)}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 18,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: colors.text }}>₱{preset}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 10 }}>
            Pay with
          </Text>
          {topupMethods.map((method) => {
            const config = PAYMENT_METHOD_OPTIONS[method]
            const selected = paymentMethod === method
            return (
              <TouchableOpacity
                key={method}
                onPress={() => handlePaymentMethodChange(method)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={{
                  borderWidth: 1,
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: 11,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  {config.srcs.map((source, index) => (
                    <Image
                      key={`${method}-${index}`}
                      source={source}
                      style={{ width: 34, height: 22, marginRight: 5 }}
                      resizeMode="contain"
                    />
                  ))}
                  <Text
                    style={{
                      color: colors.text,
                      marginLeft: config.srcs.length ? 6 : 0,
                      flex: 1,
                      flexShrink: 1,
                    }}
                  >
                    {config.label}
                  </Text>
                </View>
                {selected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
            )
          })}

          {BANK_OPTIONS[paymentMethod] && (
            <View style={{ marginTop: 6, marginBottom: 10 }}>
              <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8 }}>Choose your bank</Text>
              <View style={{ gap: 8 }}>
                {BANK_OPTIONS[paymentMethod]?.map((bank) => {
                  const selected = bankCode === bank.code
                  return (
                    <TouchableOpacity
                      key={bank.code}
                      onPress={() => setBankCode(bank.code)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      activeOpacity={0.7}
                      style={{
                        minHeight: 44,
                        paddingHorizontal: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        borderColor: selected ? colors.primary : colors.border,
                        borderRadius: 10,
                        backgroundColor: selected ? colors.primaryLight : colors.surface,
                      }}
                    >
                      <Text style={{ color: colors.text, fontSize: 13, fontWeight: '500', flex: 1, flexShrink: 1 }}>
                        {bank.label}
                      </Text>
                      {selected && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={() => void handleTopup()}
            disabled={isSubmitting || isCancelling || Boolean(pendingTopupId)}
            activeOpacity={1}
            accessibilityRole="button"
            style={{
              marginTop: 6,
              borderRadius: 11,
              paddingVertical: 14,
              alignItems: 'center',
              backgroundColor: colors.primary,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                {pendingTopupId ? 'Payment pending' : 'Continue to payment'}
              </Text>
            )}
          </TouchableOpacity>
          {pendingTopupId && (
            <TouchableOpacity
              onPress={() => void cancelTopupAttempt(pendingTopupId).catch((error) => {
                setTopupMessage(error instanceof Error
                  ? error.message
                  : 'This payment cannot be safely cancelled yet. Keep checking its status.')
              })}
              disabled={isCancelling || isSubmitting}
              accessibilityRole="button"
              style={{ alignItems: 'center', paddingVertical: 12 }}
            >
              {isCancelling ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={{ color: colors.primary, fontWeight: '600' }}>
                  Cancel payment and start over
                </Text>
              )}
            </TouchableOpacity>
          )}
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 10, lineHeight: 17 }}>
            Your wallet is credited only after the server verifies payment with PayMongo.
          </Text>
          {topupMessage && (
            <Text accessibilityRole="alert" style={{ color: colors.text, marginTop: 12, lineHeight: 19 }}>
              {topupMessage}
            </Text>
          )}
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, flex: 1 }}>
              Wallet activity
            </Text>
            <TouchableOpacity onPress={() => void walletQuery.refetch()} accessibilityLabel="Refresh wallet activity">
              <Ionicons name="refresh-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {walletQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : walletQuery.isError ? (
            <Text style={{ color: colors.textSecondary, paddingVertical: 12 }}>
              Wallet activity could not be loaded.
            </Text>
          ) : walletQuery.data?.entries.length ? (
            walletQuery.data.entries.map((entry) => (
              <View
                key={String(entry.id)}
                style={{
                  paddingVertical: 13,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>
                    {entry.description || (entry.amountMinor >= 0 ? 'Wallet top-up' : 'Wallet payment')}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                    {new Date(entry.createdAt).toLocaleString()}
                  </Text>
                </View>
                <Text
                  style={{
                    color: entry.amountMinor >= 0 ? '#15803d' : colors.text,
                    fontWeight: '700',
                  }}
                >
                  {entry.amountMinor >= 0 ? '+' : '-'}
                  {formatCurrency(Math.abs(entry.amountMinor) / 100)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: colors.textSecondary, paddingVertical: 12 }}>
              Top-ups and wallet payments will appear here.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
