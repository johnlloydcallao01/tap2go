import React, { useCallback, useEffect } from 'react'
import { BackHandler, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useThemeColors } from '../contexts/ThemeContext'
import { formatCurrency } from '../utils/format'

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

export default function WalletTopupSuccessScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ amount_minor?: string | string[] }>()
  const amountMinor = Number(readParam(params.amount_minor))
  const colors = useThemeColors()
  const returnToWallet = useCallback(
    () => router.replace({ pathname: '/wallet', params: { topup_result: 'paid' } }),
    [router],
  )

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      returnToWallet()
      return true
    })
    return () => subscription.remove()
  }, [returnToWallet])

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
          <Ionicons name="wallet-outline" size={22} color={colors.primary} />
          <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: '700', color: colors.text }}>
            Wallet
          </Text>
        </View>
      </SafeAreaView>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View
          style={{
            width: 82,
            height: 82,
            borderRadius: 41,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#dcfce7',
          }}
        >
          <Ionicons name="checkmark" size={48} color="#15803d" />
        </View>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 22 }}>
          Top-up successful
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: 8 }}>
          Your payment has been confirmed and added to your wallet.
        </Text>
        {Number.isSafeInteger(amountMinor) && amountMinor > 0 && (
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 18 }}>
            {formatCurrency(amountMinor / 100)}
          </Text>
        )}
      </View>

      <SafeAreaView edges={['bottom']} style={{ paddingHorizontal: 18, paddingTop: 8 }}>
        <TouchableOpacity
          onPress={returnToWallet}
          accessibilityRole="button"
          style={{
            minHeight: 50,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Back to wallet</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}
