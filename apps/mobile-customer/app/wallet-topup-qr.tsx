import { Stack } from 'expo-router'
import WalletTopupQrScreen from '../src/screens/WalletTopupQrScreen'

export default function WalletTopupQrRoute() {
  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <WalletTopupQrScreen />
    </>
  )
}
