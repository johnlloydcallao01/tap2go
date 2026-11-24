import { Stack } from 'expo-router'
import WalletTopupSuccessScreen from '../src/screens/WalletTopupSuccessScreen'

export default function WalletTopupSuccessRoute() {
  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <WalletTopupSuccessScreen />
    </>
  )
}
