// Slime War Game Module
// Strategic board game with turn-based gameplay

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
  name: 'slime-war',
  version: '1.0.0',
  description: 'Strategic turn-based board game',
  gameType: 'strategy',
  modes: ['multiplayer'],
  dependencies: ['@modules/games/shared', '@shared/services'],
} as const;
