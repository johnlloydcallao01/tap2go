import { Stack } from 'expo-router'
import WalletTopupProcessingScreen from '../src/screens/WalletTopupProcessingScreen'

export default function WalletTopupProcessingRoute() {
  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <WalletTopupProcessingScreen />
    </>
  )
}
