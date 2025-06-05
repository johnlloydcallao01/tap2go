/**
 * Strapi API Client for Tap2Go CMS Integration
 * Handles all communication with Strapi CMS backend
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for Strapi API responses
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiError {
  status: number;
  name: string;
  message: string;
  details?: any;
}

export interface StrapiQueryParams {
  populate?: string | string[] | object;
  filters?: object;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
  };
  fields?: string[];
  locale?: string;
  publicationState?: 'live' | 'preview';
}

/**
 * Strapi API Client Class
 * Provides methods for interacting with Strapi CMS
 */
export class StrapiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private apiToken: string;

  constructor() {
    this.baseURL = process.env.STRAPI_URL || 'http://localhost:1337';
    this.apiToken = process.env.STRAPI_API_TOKEN || '';

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: `${this.baseURL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        if (this.apiToken) {
          config.headers.Authorization = `Bearer ${this.apiToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Strapi API Error:', error.response?.data || error.message);
        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Format error response from Strapi
   */
  private formatError(error: any): StrapiError {
    if (error.response?.data?.error) {
      return {
        status: error.response.status,
        name: error.response.data.error.name,
        message: error.response.data.error.message,
        details: error.response.data.error.details,
      };
    }

    return {
      status: error.response?.status || 500,
      name: 'UnknownError',
      message: error.message || 'An unknown error occurred',
    };
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: StrapiQueryParams): string {
    const searchParams = new URLSearchParams();

    // Handle populate parameter
    if (params.populate) {
      if (typeof params.populate === 'string') {
        searchParams.append('populate', params.populate);
      } else if (Array.isArray(params.populate)) {
        params.populate.forEach(field => searchParams.append('populate', field));
      } else {
        searchParams.append('populate', JSON.stringify(params.populate));
      }
    }

    // Handle filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        searchParams.append(`filters[${key}]`, JSON.stringify(value));
      });
    }

    // Handle sort
    if (params.sort) {
      if (Array.isArray(params.sort)) {
        params.sort.forEach(field => searchParams.append('sort', field));
      } else {
        searchParams.append('sort', params.sort);
      }
    }

    // Handle pagination
    if (params.pagination) {
      Object.entries(params.pagination).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(`pagination[${key}]`, value.toString());
        }
      });
    }

    // Handle fields
    if (params.fields) {
      params.fields.forEach(field => searchParams.append('fields', field));
    }

    // Handle locale
    if (params.locale) {
      searchParams.append('locale', params.locale);
    }

    // Handle publication state
    if (params.publicationState) {
      searchParams.append('publicationState', params.publicationState);
    }

    return searchParams.toString();
  }

  /**
   * Generic GET request
   */
  async get<T>(endpoint: string, params?: StrapiQueryParams): Promise<StrapiResponse<T>> {
    const queryString = params ? this.buildQueryString(params) : '';
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response: AxiosResponse<StrapiResponse<T>> = await this.client.get(url);
    return response.data;
  }

  /**
   * Generic POST request
   */
  async post<T>(endpoint: string, data: any): Promise<StrapiResponse<T>> {
    const response: AxiosResponse<StrapiResponse<T>> = await this.client.post(endpoint, { data });
    return response.data;
  }

  /**
   * Generic PUT request
   */
  async put<T>(endpoint: string, data: any): Promise<StrapiResponse<T>> {
    const response: AxiosResponse<StrapiResponse<T>> = await this.client.put(endpoint, { data });
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(endpoint: string): Promise<StrapiResponse<T>> {
    const response: AxiosResponse<StrapiResponse<T>> = await this.client.delete(endpoint);
    return response.data;
  }

  /**
   * Check if Strapi is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/');
      return true;
    } catch (error) {
      console.error('Strapi health check failed:', error);
      return false;
    }
  }

  /**
   * Get API information
   */
  async getApiInfo(): Promise<any> {
    try {
      const response = await this.client.get('/');
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }
}

// Export singleton instance
export const strapiClient = new StrapiClient();

// Export default client for convenience
export default strapiClient;
