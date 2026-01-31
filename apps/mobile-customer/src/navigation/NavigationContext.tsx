import { createContext, useContext } from 'react';

export interface NavigationContextType {
  currentScreen: string;
  navigate: (screenName: string) => void;
  goBack: () => void;
}

export const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
