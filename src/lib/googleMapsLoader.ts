// Professional Google Maps API Loader
// Singleton pattern to prevent multiple API loads
// Industry standard implementation

interface GoogleMapsLoaderOptions {
  apiKey: string;
  libraries?: string[];
  language?: string;
  region?: string;
}

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;
  private callbacks: Array<() => void> = [];
  private errorCallbacks: Array<(error: string) => void> = [];

  private constructor() {}

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  public async load(options: GoogleMapsLoaderOptions): Promise<void> {
    // If already loaded, resolve immediately
    if (this.isLoaded && window.google && window.google.maps) {
      return Promise.resolve();
    }

    // If currently loading, return the existing promise
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading
    this.isLoading = true;
    this.loadPromise = this.loadGoogleMaps(options);
    
    return this.loadPromise;
  }

  private loadGoogleMaps(options: GoogleMapsLoaderOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        this.isLoaded = true;
        this.isLoading = false;
        this.notifyCallbacks();
        resolve();
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Script exists, wait for it to load
        const checkLoaded = () => {
          if (window.google && window.google.maps) {
            this.isLoaded = true;
            this.isLoading = false;
            this.notifyCallbacks();
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Create unique callback name
      const callbackName = `googleMapsCallback_${Date.now()}`;
      
      // Set up global callback
      (window as unknown as Record<string, unknown>)[callbackName] = () => {
        this.isLoaded = true;
        this.isLoading = false;
        this.notifyCallbacks();

        // Clean up
        delete (window as unknown as Record<string, unknown>)[callbackName];
        resolve();
      };

      // Build URL
      const libraries = options.libraries?.join(',') || 'places';
      const language = options.language || 'en';
      const region = options.region || 'PH';
      
      const url = `https://maps.googleapis.com/maps/api/js?key=${options.apiKey}&libraries=${libraries}&language=${language}&region=${region}&callback=${callbackName}`;

      // Create and load script
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        this.isLoading = false;
        this.loadPromise = null;
        const error = 'Failed to load Google Maps API';
        this.notifyErrorCallbacks(error);
        reject(new Error(error));
      };

      document.head.appendChild(script);
    });
  }

  public onLoad(callback: () => void): void {
    if (this.isLoaded) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }

  public onError(callback: (error: string) => void): void {
    this.errorCallbacks.push(callback);
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback());
    this.callbacks = [];
  }

  private notifyErrorCallbacks(error: string): void {
    this.errorCallbacks.forEach(callback => callback(error));
    this.errorCallbacks = [];
  }

  public isGoogleMapsLoaded(): boolean {
    return this.isLoaded && !!(window.google && window.google.maps);
  }
}

// Export singleton instance
export const googleMapsLoader = GoogleMapsLoader.getInstance();

// Convenience function
export const loadGoogleMaps = async (apiKey: string): Promise<void> => {
  return googleMapsLoader.load({
    apiKey,
    libraries: ['places'],
    region: 'PH'
  });
};

// Type declarations
declare global {
  interface Window {
    google: typeof google;
  }
}
