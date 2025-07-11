import React, { useState, createContext, useContext } from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../contexts/ThemeContext';
import FooterNavigation from '../components/FooterNavigation';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import CartScreen from '../screens/CartScreen';
import SearchScreen from '../screens/SearchScreen';
import AccountScreen from '../screens/AccountScreen';
import WishlistScreen from '../screens/WishlistScreen';
import NotificationsScreen from '../screens/NotificationsScreen';


// Navigation Context for fallback navigator
interface NavigationContextType {
  currentScreen: string;
  navigate: (screenName: string) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

// Using state-based navigation for Expo Go compatibility

// Fallback component for when Stack Navigator is not available
function FallbackNavigator() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const colors = useThemeColors();

  const navigate = (screenName: string) => {
    console.log(`Navigating to: ${screenName}`);
    setCurrentScreen(screenName);
  };

  const goBack = () => {
    console.log('Going back to Home screen');
    setCurrentScreen('Home');
  };

  const navigationValue = {
    currentScreen,
    navigate,
    goBack,
  };

  const renderScreen = () => {
    const mockNavigation = { navigate, goBack };

    switch (currentScreen) {
      case 'Home':
        return <HomeScreen navigation={mockNavigation} />;
      case 'Orders':
        return <OrdersScreen navigation={mockNavigation} />;
      case 'Cart':
        return <CartScreen navigation={mockNavigation} />;
      case 'Search':
        return <SearchScreen navigation={mockNavigation} />;
      case 'Account':
        return <AccountScreen navigation={mockNavigation} />;
      case 'Wishlist':
        return <WishlistScreen navigation={mockNavigation} />;
      case 'Notifications':
        return <NotificationsScreen navigation={mockNavigation} />;
      default:
        return <HomeScreen navigation={mockNavigation} />;
    }
  };

const insets = useSafeAreaInsets();

return (
  <NavigationContext.Provider value={navigationValue}>
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {renderScreen()}
      {/* Professional footer that extends to fill system bar area */}
      <View style={{
        backgroundColor: colors.background,
        paddingBottom: insets.bottom, // Extends into system bar area
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}>
        <FooterNavigation
          navigation={{ navigate, goBack }}
          activeScreen={currentScreen}
        />
      </View>
    </View>
  </NavigationContext.Provider>
);
}
// Main App Navigator (Customer App) - State-Based Navigation
export default function AppNavigator() {
  return <FallbackNavigator />;
}


