// Slime War Game MVVM Components Export

// Models
export { 
  SlimeWarGameModel, 
  GameCanStartRule, 
  CanPlaceCardRule, 
  CanMoveCardRule 
} from './models/SlimeWarGameModel';
export type { 
  BoardPosition, 
  GameCard, 
  Player, 
  BoardCell, 
  GameSession, 
  GameConfig, 
  GameResult 
} from './models/SlimeWarGameModel';

// ViewModels
export { SlimeWarViewModel } from './viewModels/SlimeWarViewModel';

// Views
export { default as SlimeWarView } from './views/SlimeWarView';

// Screens (MVVM Controllers)
export { default as SlimeWarScreen } from './SlimeWarScreen_MVVM';

// Legacy components (for backward compatibility during migration)
export { default as SlimeWarLegacyScreen } from './screens/SlimeWarScreen';
export { slimeWarViewModel as LegacySlimeWarViewModel } from './services/SlimeWarViewModel';