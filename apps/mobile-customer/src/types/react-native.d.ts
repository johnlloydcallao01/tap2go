// React Native and Expo compatibility types for React 19
import { ComponentType } from 'react';

// React 19 compatibility
declare module 'react' {
  interface ReactElement {
    children?: ReactNode;
  }
}

// Ionicons types - Fix for React 19 compatibility
declare module 'react-native-vector-icons/Ionicons' {
  import { ComponentType } from 'react';
  import { TextStyle } from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
  }

  const Ionicons: ComponentType<IconProps>;
  export default Ionicons;
}

// Also declare for the actual import path used in the app
declare module '@expo/vector-icons' {
  import { ComponentType } from 'react';
  import { TextStyle } from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
  }

  export const Ionicons: ComponentType<IconProps>;
}

// Expo LinearGradient types
declare module 'expo-linear-gradient' {
  import { ViewProps } from 'react-native';
  
  interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
  }
  
  export const LinearGradient: ComponentType<LinearGradientProps>;
}

// React Native Maps types
declare module 'react-native-maps' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';
  
  interface MapViewProps extends ViewProps {
    region?: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    };
    onRegionChange?: (region: any) => void;
    showsUserLocation?: boolean;
    showsMyLocationButton?: boolean;
    children?: React.ReactNode;
  }
  
  interface MarkerProps {
    coordinate: {
      latitude: number;
      longitude: number;
    };
    title?: string;
    description?: string;
    onPress?: () => void;
    children?: React.ReactNode;
  }
  
  export const MapView: ComponentType<MapViewProps>;
  export const Marker: ComponentType<MarkerProps>;
  export default MapView;
}

// React Navigation types
declare module '@react-navigation/native' {
  export function useNavigation(): any;
  export function useFocusEffect(callback: () => void): void;
  export const NavigationContainer: ComponentType<{ children: React.ReactNode }>;
}

declare module '@react-navigation/bottom-tabs' {
  export function createBottomTabNavigator(): any;
}

declare module '@react-navigation/stack' {
  export function createStackNavigator(): any;
}

// Async Storage types
declare module '@react-native-async-storage/async-storage' {
  export default class AsyncStorage {
    static getItem(key: string): Promise<string | null>;
    static setItem(key: string, value: string): Promise<void>;
    static removeItem(key: string): Promise<void>;
    static clear(): Promise<void>;
    static getAllKeys(): Promise<string[]>;
    static multiGet(keys: string[]): Promise<[string, string | null][]>;
    static multiSet(keyValuePairs: [string, string][]): Promise<void>;
    static multiRemove(keys: string[]): Promise<void>;
  }
}

// React Native Safe Area Context
declare module 'react-native-safe-area-context' {
  import { ComponentType } from 'react';
  import { ViewProps, ViewStyle } from 'react-native';

  interface SafeAreaViewProps extends ViewProps {
    children?: React.ReactNode;
    style?: ViewStyle;
    edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  }

  export const SafeAreaView: ComponentType<SafeAreaViewProps>;
  export function useSafeAreaInsets(): {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}
