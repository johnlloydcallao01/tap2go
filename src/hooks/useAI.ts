import { useState, useCallback } from 'react';

// Types
interface AIConfig {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

interface AIResponse<T = string> {
  success: boolean;
  result?: T;
  description?: string;
  error?: string;
  details?: string;
  model?: string;
  timestamp?: string;
}

interface UseAIState {
  loading: boolean;
  error: string | null;
  lastResponse: AIResponse | null;
}

// Main AI hook
export function useAI() {
  const [state, setState] = useState<UseAIState>({
    loading: false,
    error: null,
    lastResponse: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setResponse = useCallback((response: AIResponse) => {
    setState(prev => ({ ...prev, lastResponse: response }));
  }, []);

  // Generic API call function
  const callAI = useCallback(async (
    endpoint: string,
    data: Record<string, unknown>,
    config?: AIConfig
  ): Promise<AIResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, config }),
      });

      const result = await response.json();
      setResponse(result);

      if (!response.ok) {
        throw new Error(result.error || 'AI request failed');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setResponse]);

  // Generate text
  const generateText = useCallback(async (
    prompt: string,
    config?: AIConfig
  ): Promise<string> => {
    const response = await callAI('generate-text', { prompt }, config);
    return response.result || '';
  }, [callAI]);

  // Generate restaurant description
  const generateRestaurantDescription = useCallback(async (
    restaurantName: string,
    cuisine: string,
    specialties: string[],
    config?: AIConfig
  ): Promise<string> => {
    const response = await callAI('restaurant-description', {
      restaurantName,
      cuisine,
      specialties,
    }, config);
    return response.description || '';
  }, [callAI]);

  // Generate menu item description
  const generateMenuDescription = useCallback(async (
    itemName: string,
    ingredients: string[],
    cuisine: string,
    config?: AIConfig
  ): Promise<string> => {
    const response = await callAI('menu-description', {
      itemName,
      ingredients,
      cuisine,
    }, config);
    return response.description || '';
  }, [callAI]);

  return {
    ...state,
    generateText,
    generateRestaurantDescription,
    generateMenuDescription,
  };
}

// Specialized hook for restaurant descriptions
export function useRestaurantAI() {
  const { generateRestaurantDescription, loading, error } = useAI();

  const generateDescription = useCallback(async (
    restaurantData: {
      name: string;
      cuisine: string;
      specialties: string[];
    },
    config?: AIConfig
  ) => {
    return generateRestaurantDescription(
      restaurantData.name,
      restaurantData.cuisine,
      restaurantData.specialties,
      config
    );
  }, [generateRestaurantDescription]);

  return {
    generateDescription,
    loading,
    error,
  };
}

// Specialized hook for menu items
export function useMenuAI() {
  const { generateMenuDescription, loading, error } = useAI();

  const generateDescription = useCallback(async (
    menuData: {
      name: string;
      ingredients: string[];
      cuisine: string;
    },
    config?: AIConfig
  ) => {
    return generateMenuDescription(
      menuData.name,
      menuData.ingredients,
      menuData.cuisine,
      config
    );
  }, [generateMenuDescription]);

  return {
    generateDescription,
    loading,
    error,
  };
}

// Hook for general text generation
export function useTextGeneration() {
  const { generateText, loading, error } = useAI();

  return {
    generateText,
    loading,
    error,
  };
}
