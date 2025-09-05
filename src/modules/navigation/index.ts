// Navigation Module
// Core navigation functionality and routing

// Models
export * from './models';

// ViewModels
export * from './viewModels';

// Components
export * from './components';

// Types
export * from './types';

// Module metadata
export const MODULE_INFO = {
  name: 'navigation',
  version: '1.0.0',
  description: 'Core navigation and routing functionality',
  dependencies: ['@infrastructure/mvvm', '@shared/types'],
} as const;
