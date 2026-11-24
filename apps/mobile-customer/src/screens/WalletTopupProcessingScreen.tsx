import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, BackHandler, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useThemeColors } from '../contexts/ThemeContext'
import { cancelWalletTopup, reconcileWalletTopup } from '../services/customerWallet'

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

export default function WalletTopupProcessingScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    topup_id?: string | string[]
    amount_minor?: string | string[]
  }>()
  const topupId = readParam(params.topup_id)
  const amountMinor = readParam(params.amount_minor)
  const { token } = useAuth()
  const colors = useThemeColors()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('We are confirming your payment with PayMongo.')
  const [isCancelling, setIsCancelling] = useState(false)

  const cancelAndReturn = useCallback(async () => {
    if (!token || !topupId) return
    setIsCancelling(true)
    try {
      const state = await cancelWalletTopup({ token, topupId })
      if (state === 'cancelled') {
        router.replace({ pathname: '/wallet', params: { topup_result: 'cancelled' } })
      } else if (state === 'paid') {
        await queryClient.invalidateQueries({ queryKey: ['customer-wallet'] })
        router.replace({
          pathname: '/wallet-topup-success',
          params: { topup_id: topupId, amount_minor: amountMinor },
        })
      } else {
        setMessage('This payment is still processing and cannot be cancelled safely yet. We will keep checking.')
      }
    } catch (error) {
      setMessage(error instanceof Error
        ? error.message
        : 'This payment cannot be safely cancelled yet. We will keep checking.')
    } finally {
      setIsCancelling(false)
    }
  }, [amountMinor, queryClient, router, token, topupId])

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      void cancelAndReturn()
      return true
    })
    return () => subscription.remove()
  }, [cancelAndReturn])

  useEffect(() => {
    if (!topupId || !token) {
      router.replace('/wallet')
      return
    }

    let active = true
    let checking = false
    let timeout: ReturnType<typeof setTimeout> | undefined
    const checkStatus = async () => {
      if (checking) return
      checking = true
      try {
        const status = await reconcileWalletTopup({ token, topupId })
        if (!active) return
        if (status === 'paid') {
          await queryClient.invalidateQueries({ queryKey: ['customer-wallet'] })
          router.replace({
            pathname: '/wallet-topup-success',
            params: { topup_id: topupId, amount_minor: amountMinor },
          })
          active = false
          return
        }
        if (status === 'failed') {
          router.replace({ pathname: '/wallet', params: { topup_result: 'failed' } })
          active = false
          return
        }
        setMessage('Payment received or still in progress. Waiting for PayMongo confirmation…')
      } catch {
        if (active) setMessage('We are still checking your payment. Please keep this screen open.')
      } finally {
        checking = false
        if (active) timeout = setTimeout(() => void checkStatus(), 3000)
      }
    }

    void checkStatus()
    return () => {
      active = false
      if (timeout) clearTimeout(timeout)
    }
  }, [amountMinor, queryClient, router, token, topupId])

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.surface }}>
        <View
          style={{
            minHeight: 54,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity
            onPress={() => void cancelAndReturn()}
            disabled={isCancelling}
            accessibilityRole="button"
            accessibilityLabel="Cancel payment and return to wallet"
          >
            <Ionicons name="arrow-back" size={23} color={colors.text} />
          </TouchableOpacity>
          <Ionicons name="wallet-outline" size={22} color={colors.primary} />
          <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: '700', color: colors.text }}>
            Wallet payment
          </Text>
        </View>
      </SafeAreaView>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', marginTop: 22 }}>
          Confirming your top-up
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: 10 }}>
          {message}
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 13, lineHeight: 19, marginTop: 18 }}>
          Your wallet balance will change only after the server verifies this payment.
        </Text>
      </View>
      <SafeAreaView edges={['bottom']} style={{ paddingHorizontal: 18, paddingTop: 8 }}>
        <TouchableOpacity
          onPress={() => void cancelAndReturn()}
          disabled={isCancelling}
          accessibilityRole="button"
          style={{
            minHeight: 48,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          {isCancelling ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel payment and return to wallet</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}
