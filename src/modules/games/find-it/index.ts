// Find-It Game Module
// Spot-the-difference puzzle game with solo and multiplayer modes

// Models
export * from './models';

// ViewModels
export * from './viewModels';

// Views
export * from './views';

// Components
export * from './components';

// Services
export * from './services';

// Types
export * from './types';

// Module metadata
export const MODULE_INFO = {
  name: 'find-it',
  version: '1.0.0',
  description: 'Spot-the-difference puzzle game',
  gameType: 'puzzle',
  modes: ['solo', 'multiplayer'],
  dependencies: ['@modules/games/shared', '@shared/services'],
} as const;
