// Shared Games Module
// Common game functionality shared across all games

// Components
export * from './components';

// Services
export * from './services';

// Types
export * from './types';

// Module metadata
export const MODULE_INFO = {
  name: 'games-shared',
  version: '1.0.0',
  description: 'Shared game components and utilities',
  dependencies: ['@shared/services', '@infrastructure/mvvm'],
} as const;
