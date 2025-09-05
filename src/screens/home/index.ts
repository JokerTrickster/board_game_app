// Home Screen MVVM Components Export

// Models
export {
  HomeModel,
  UserCanPlayGameRule,
  CanAccessFeaturesRule,
} from './models/HomeModel';
export type {
  GameItem,
  HomeUserProfile,
  Achievement,
  HomeStats,
  AppNotification,
  QuickAction,
} from './models/HomeModel';

// ViewModels
export { HomeViewModel } from './viewModels/HomeViewModel';

// Views
export { default as HomeView } from './views/HomeView';

// Screens (MVVM Controllers)
export { default as HomeScreen } from './HomeScreen_MVVM';

// Legacy components (for backward compatibility during migration)
export { default as LegacyHomeScreen } from '../HomeScreen';
