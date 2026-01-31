import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import FooterNavigation from '../components/FooterNavigation';
import { NavigationContext } from './NavigationContext';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import CartScreen from '../screens/CartScreen';
import SearchScreen from '../screens/SearchScreen';
import AccountScreen from '../screens/AccountScreen';
import WishlistScreen from '../screens/WishlistScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

// Import Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';


// Using state-based navigation for Expo Go compatibility

// Fallback component for when Stack Navigator is not available
function FallbackNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('Home');
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  // Reset navigation on auth state change
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        setCurrentScreen('Home');
      } else {
        setCurrentScreen('Login');
      }
    }
  }, [isAuthenticated, isLoading]);

  const navigate = (screenName: string) => {
    console.log(`Navigating to: ${screenName}`);
    setCurrentScreen(screenName);
  };

  const goBack = () => {
    console.log('Going back');
    if (isAuthenticated) {
      setCurrentScreen('Home');
    } else {
      setCurrentScreen('Login');
    }
  };

  const navigationValue = {
    currentScreen,
    navigate,
    goBack,
  };

  const renderScreen = () => {
    const mockNavigation = { navigate, goBack };

    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!isAuthenticated) {
      switch (currentScreen) {
        case 'Signup':
          return <SignupScreen />;
        case 'ForgotPassword':
          return <ForgotPasswordScreen />;
        case 'Login':
        default:
          return <LoginScreen />;
      }
    }

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

  if (isLoading) {
     return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
  }

  return (
    <NavigationContext.Provider value={navigationValue}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {renderScreen()}
        
        {/* Professional footer that extends to fill system bar area - ONLY IF AUTHENTICATED */}
        {isAuthenticated && (
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
        )}
      </View>
    </NavigationContext.Provider>
  );
}

// Main App Navigator (Customer App) - State-Based Navigation
export default function AppNavigator() {
  return <FallbackNavigator />;
}
