// Navigation MVVM Components Export

// Models
export { NavigationModel } from './models/NavigationModel';
export type {
  RouteInfo,
  NavigationHistoryEntry,
  AppState,
  NavigationStackState,
  DeepLinkConfig
} from './models/NavigationModel';

// ViewModels
export { NavigationViewModel } from './viewModels/NavigationViewModel';

// Types
export type { RootStackParamList, NavigationRefType } from './navigationTypes';

// Navigation Container
export { default as AppNavigator, navigationRef } from './AppNavigator';