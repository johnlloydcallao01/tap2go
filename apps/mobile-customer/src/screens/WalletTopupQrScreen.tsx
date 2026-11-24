import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, BackHandler, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useThemeColors } from '../contexts/ThemeContext'
import { cancelWalletTopup, reconcileWalletTopup } from '../services/customerWallet'
import { formatCurrency } from '../utils/format'

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

export default function WalletTopupQrScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    topup_id?: string | string[]
    amount_minor?: string | string[]
    qr_image?: string | string[]
  }>()
  const topupId = readParam(params.topup_id)
  const amountMinor = Number(readParam(params.amount_minor))
  const qrImage = readParam(params.qr_image)
  const { token } = useAuth()
  const colors = useThemeColors()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('Waiting for payment confirmation from PayMongo.')
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
          params: { topup_id: topupId, amount_minor: String(amountMinor || '') },
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
            params: { topup_id: topupId, amount_minor: String(amountMinor || '') },
          })
          active = false
          return
        }
        if (status === 'failed') {
          router.replace({ pathname: '/wallet', params: { topup_result: 'failed' } })
          active = false
          return
        }
        setMessage('Waiting for PayMongo to confirm your payment. Keep this QR payment open.')
      } catch {
        if (active) setMessage('We are still checking your payment. Keep this screen open.')
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
            paddingHorizontal: 10,
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
            accessibilityLabel="Cancel QR payment and return to wallet"
          >
            <Ionicons name="arrow-back" size={23} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ marginLeft: 15, fontSize: 20, fontWeight: '700', color: colors.text }}>
            QR Ph top-up
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 20, alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center' }}>
          Scan to add money
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', lineHeight: 21, marginTop: 8 }}>
          Use your banking or e-wallet app on another device to scan this QR Ph code.
        </Text>

        <View
          style={{
            width: '100%',
            maxWidth: 340,
            marginTop: 22,
            padding: 18,
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {qrImage ? (
            <Image source={{ uri: qrImage }} style={{ width: 260, height: 260 }} resizeMode="contain" />
          ) : (
            <View style={{ width: 260, height: 260, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="alert-circle-outline" size={36} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 10 }}>
                The QR code is unavailable.
              </Text>
            </View>
          )}
        </View>

        {Number.isSafeInteger(amountMinor) && amountMinor > 0 && (
          <View
            style={{
              width: '100%',
              maxWidth: 340,
              marginTop: 16,
              padding: 16,
              backgroundColor: colors.surface,
              borderRadius: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.textSecondary }}>Top-up amount</Text>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 4 }}>
              {formatCurrency(amountMinor / 100)}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginLeft: 9, flexShrink: 1 }}>
            {message}
          </Text>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ paddingHorizontal: 10, paddingTop: 8 }}>
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
            <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel payment</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}
