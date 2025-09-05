// Authentication Module
// Handles user authentication, authorization, and session management

// Models
export * from './models';

// ViewModels
export * from './viewModels';

// Views
export * from './views';

// Services
export * from './services';

// Types
export * from './types';

// Module metadata
export const MODULE_INFO = {
  name: 'auth',
  version: '1.0.0',
  description: 'Authentication and authorization module',
  dependencies: ['@shared/services', '@infrastructure/mvvm'],
} as const;
