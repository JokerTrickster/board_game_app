import { useState, useEffect, useCallback, useRef } from 'react';
import { Image, ImageRequireSource } from 'react-native';

interface ImageLoadState {
  loading: boolean;
  loaded: boolean;
  error: boolean;
  progress: number;
}

interface ImageLoaderConfig {
  priority?: 'high' | 'normal' | 'low';
  preload?: boolean;
  onProgress?: (progress: number) => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

/**
 * Hook for optimized image loading with lazy loading and progress tracking
 * Prevents blocking the main thread during image operations
 */
export const useImageLoader = (
  sources: string[],
  config: ImageLoaderConfig = {}
) => {
  const {
    priority = 'normal',
    preload = false,
    onProgress,
    onLoad,
    onError
  } = config;

  const [loadStates, setLoadStates] = useState<Map<string, ImageLoadState>>(
    () => new Map(sources.map(src => [src, {
      loading: false,
      loaded: false,
      error: false,
      progress: 0
    }]))
  );

  const loadedCount = useRef(0);
  const errorCount = useRef(0);
  const loadQueueRef = useRef<string[]>([]);
  const activeLoads = useRef<Set<string>>(new Set());

  // Priority-based loading delays
  const getLoadDelay = (priority: string) => {
    switch (priority) {
      case 'high': return 0;
      case 'normal': return 50;
      case 'low': return 200;
      default: return 50;
    }
  };

  // Load a single image with progress tracking
  const loadImage = useCallback(async (source: string): Promise<void> => {
    if (activeLoads.current.has(source)) return;
    
    activeLoads.current.add(source);
    
    setLoadStates(prev => new Map(prev).set(source, {
      ...prev.get(source)!,
      loading: true,
      error: false
    }));

    try {
      await new Promise<void>((resolve, reject) => {
        Image.prefetch(source)
          .then(() => {
            loadedCount.current++;
            const progress = loadedCount.current / sources.length;
            
            setLoadStates(prev => new Map(prev).set(source, {
              loading: false,
              loaded: true,
              error: false,
              progress: 100
            }));

            onProgress?.(progress);
            if (loadedCount.current === sources.length) {
              onLoad?.();
            }
            resolve();
          })
          .catch((error) => {
            errorCount.current++;
            
            setLoadStates(prev => new Map(prev).set(source, {
              loading: false,
              loaded: false,
              error: true,
              progress: 0
            }));

            onError?.(error);
            reject(error);
          });
      });
    } catch (error) {
      console.warn(`Failed to load image: ${source}`, error);
    } finally {
      activeLoads.current.delete(source);
    }
  }, [sources.length, onProgress, onLoad, onError]);

  // Queue-based loading with concurrency control
  const processLoadQueue = useCallback(async () => {
    const maxConcurrent = 3; // Limit concurrent loads
    const delay = getLoadDelay(priority);

    while (loadQueueRef.current.length > 0 && activeLoads.current.size < maxConcurrent) {
      const source = loadQueueRef.current.shift();
      if (source) {
        // Add delay based on priority
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        loadImage(source).catch(() => {
          // Error handled in loadImage
        });
      }
    }
  }, [loadImage, priority]);

  // Start loading images
  const startLoading = useCallback(() => {
    loadQueueRef.current = [...sources];
    processLoadQueue();
  }, [sources, processLoadQueue]);

  // Preload images on mount if enabled
  useEffect(() => {
    if (preload && sources.length > 0) {
      // Use requestAnimationFrame to defer loading until after render
      requestAnimationFrame(() => {
        startLoading();
      });
    }
  }, [preload, startLoading]);

  // Get loading stats
  const getStats = useCallback(() => {
    const states = Array.from(loadStates.values());
    return {
      total: states.length,
      loaded: states.filter(s => s.loaded).length,
      loading: states.filter(s => s.loading).length,
      errors: states.filter(s => s.error).length,
      progress: loadedCount.current / sources.length
    };
  }, [loadStates, sources.length]);

  // Check if a specific image is loaded
  const isImageLoaded = useCallback((source: string) => {
    return loadStates.get(source)?.loaded || false;
  }, [loadStates]);

  // Check if all images are loaded
  const areAllLoaded = useCallback(() => {
    return loadedCount.current === sources.length && errorCount.current === 0;
  }, [sources.length]);

  return {
    loadStates,
    startLoading,
    getStats,
    isImageLoaded,
    areAllLoaded,
    totalProgress: loadedCount.current / sources.length
  };
};

/**
 * Hook for lazy loading a single image with loading state
 */
export const useLazyImage = (source: string, config: ImageLoaderConfig = {}) => {
  const [state, setState] = useState<ImageLoadState>({
    loading: false,
    loaded: false,
    error: false,
    progress: 0
  });

  const loadImage = useCallback(async () => {
    if (state.loading || state.loaded) return;

    setState(prev => ({ ...prev, loading: true, error: false }));

    try {
      await Image.prefetch(source);
      setState({
        loading: false,
        loaded: true,
        error: false,
        progress: 100
      });
      config.onLoad?.();
    } catch (error) {
      setState({
        loading: false,
        loaded: false,
        error: true,
        progress: 0
      });
      config.onError?.(error);
    }
  }, [source, state.loading, state.loaded, config]);

  return {
    ...state,
    loadImage
  };
};

/**
 * Cache for loaded images to prevent re-loading
 */
class ImageCache {
  private cache = new Set<string>();
  private maxSize = 100;

  has(source: string): boolean {
    return this.cache.has(source);
  }

  add(source: string): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstEntry = this.cache.values().next().value;
      this.cache.delete(firstEntry);
    }
    this.cache.add(source);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const imageCache = new ImageCache();