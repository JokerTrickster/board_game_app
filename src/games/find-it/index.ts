// Find-It Game MVVM Components Export

// Models
export { FindItGameModel, GameConfig, GameSession, Position } from './models/FindItGameModel';
export type { ClickData, GameRound } from './models/FindItGameModel';

// ViewModels
export { FindItViewModel } from './viewModels/FindItViewModel';
export { MultiplayerFindItViewModel } from './viewModels/MultiplayerFindItViewModel';
export type { PlayerData, MultiplayerGameState } from './viewModels/MultiplayerFindItViewModel';

// Views
export { default as SoloFindItView } from './views/SoloFindItView';
export { default as MultiplayerFindItView } from './views/MultiplayerFindItView';

// Screens (MVVM Controllers)
export { default as SoloFindItScreen } from './SoloFindItScreen_MVVM';
export { default as FindItScreen } from './FindItScreen_MVVM';

// Legacy components (for backward compatibility during migration)
export { default as AnimatedCircle } from './AnimatedCircle';
export { default as AnimatedX } from './AnimatedX';
export { default as AnimatedHint } from './AnimatedHint';