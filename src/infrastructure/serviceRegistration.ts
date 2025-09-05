import { ServiceLocator } from './mvvm/DIContainer';
import { performanceMonitor } from '../services/PerformanceMonitor';
import { webSocketService } from '../services/WebSocketService';
import { CommonAudioManager } from '../services/CommonAudioManager';

/**
 * Register all application services with the DI container
 * This should be called during app initialization
 */
export function registerServices(): void {
  // Register existing singleton services
  ServiceLocator.registerInstance('PerformanceMonitor', performanceMonitor);
  ServiceLocator.registerInstance('WebSocketService', webSocketService);
  ServiceLocator.registerInstance('CommonAudioManager', CommonAudioManager);

  // Register logger service
  ServiceLocator.registerInstance('Logger', {
    info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data),
    warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data),
    error: (message: string, data?: any) => console.error(`[ERROR] ${message}`, data),
    debug: (message: string, data?: any) => {
      if (__DEV__) {
        console.debug(`[DEBUG] ${message}`, data);
      }
    },
  });

  // Register navigation service (will be injected later when navigation is ready)
  ServiceLocator.register(
    'NavigationService',
    () => ({
      navigate: (routeName: string, params?: any) => {
        // Will be implemented when navigation is integrated
        console.log('Navigate to:', routeName, params);
      },
      goBack: () => {
        console.log('Go back');
      },
    }),
    { singleton: true }
  );

  console.log('✅ Services registered successfully');
}

/**
 * Service interfaces for dependency injection
 */
export interface Logger {
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
  debug(message: string, data?: any): void;
}

export interface NavigationService {
  navigate(routeName: string, params?: any): void;
  goBack(): void;
}

// Service identifiers for type safety
export const ServiceIdentifiers = {
  PerformanceMonitor: 'PerformanceMonitor',
  WebSocketService: 'WebSocketService',
  CommonAudioManager: 'CommonAudioManager',
  Logger: 'Logger',
  NavigationService: 'NavigationService',
} as const;
