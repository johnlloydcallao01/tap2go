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
import MerchantScreen from '../screens/MerchantScreen';
import MerchantCartScreen from '../screens/MerchantCartScreen';
import ProductScreen from '../screens/ProductScreen';
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
  const [currentParams, setCurrentParams] = useState<any>({});
  // Add navigation history stack
  const [navigationStack, setNavigationStack] = useState<{screen: string, params: any}[]>([]);
  
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  // Reset navigation on auth state change
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        setCurrentScreen('Home');
        setNavigationStack([]);
      } else {
        setCurrentScreen('Login');
        setNavigationStack([]);
      }
      setCurrentParams({});
    }
  }, [isAuthenticated, isLoading]);

  const navigate = (screenName: string, params?: any) => {
    console.log(`Navigating to: ${screenName}`, params);
    
    // Only add to stack if moving forward to a new screen
    if (currentScreen !== screenName) {
      setNavigationStack(prev => [...prev, { screen: currentScreen, params: currentParams }]);
    }
    
    setCurrentScreen(screenName);
    setCurrentParams(params || {});
  };

  const goBack = () => {
    console.log('Going back from', currentScreen);
    
    if (navigationStack.length > 0) {
      // Pop the last screen from history
      const prev = navigationStack[navigationStack.length - 1];
      const newStack = navigationStack.slice(0, -1);
      
      console.log('Returning to:', prev.screen);
      
      setNavigationStack(newStack);
      setCurrentScreen(prev.screen);
      setCurrentParams(prev.params);
    } else {
      console.log('No history, going to default');
      // Default fallback
      if (isAuthenticated) {
        setCurrentScreen('Home');
      } else {
        setCurrentScreen('Login');
      }
    }
  };

  const navigationValue = {
    currentScreen,
    navigate,
    goBack,
  };

  const renderScreen = () => {
    const mockNavigation = { navigate, goBack };
    const mockRoute = { params: currentParams };

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
        return <HomeScreen navigation={mockNavigation} route={mockRoute} />;
      case 'Orders':
        return <OrdersScreen navigation={mockNavigation} route={mockRoute} />;
      case 'Cart':
        return <CartScreen navigation={mockNavigation} route={mockRoute} />;
      case 'Search':
        return <SearchScreen navigation={mockNavigation} route={mockRoute} />;
      case 'Merchant':
        return <MerchantScreen navigation={mockNavigation} route={mockRoute} />;
      case 'MerchantCart':
        return <MerchantCartScreen navigation={mockNavigation} route={mockRoute} />;
      case 'Product':
        return <ProductScreen navigation={mockNavigation} route={mockRoute} />;
      case 'Account':
        return <AccountScreen navigation={mockNavigation} route={mockRoute} />;
      case 'Wishlist':
        return <WishlistScreen navigation={mockNavigation} route={mockRoute} />;
      case 'Notifications':
        return <NotificationsScreen navigation={mockNavigation} route={mockRoute} />;
      default:
        return <HomeScreen navigation={mockNavigation} route={mockRoute} />;
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
        
        {/* Professional footer that extends to fill system bar area - ONLY IF AUTHENTICATED AND NOT IN PRODUCT VIEW */}
        {isAuthenticated && currentScreen !== 'Product' && (
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
