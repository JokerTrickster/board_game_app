// Games Module
// Central hub for all game-related functionality

// Game modules
export * from './find-it';
export * from './slime-war';
export * from './shared';

// Module metadata
export const MODULE_INFO = {
  name: 'games',
  version: '1.0.0',
  description: 'Game modules container',
  submodules: ['find-it', 'slime-war', 'shared'],
  dependencies: ['@shared/services', '@infrastructure/mvvm'],
} as const;

// Game registry
export interface GameInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  minPlayers: number;
  maxPlayers: number;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
}

export const AVAILABLE_GAMES: Record<string, GameInfo> = {
  'find-it': {
    id: 'find-it',
    name: '틀린그림찾기',
    description: '두 그림의 차이점을 찾아보세요',
    category: 'puzzle',
    minPlayers: 1,
    maxPlayers: 4,
    estimatedTime: 300, // 5 minutes
    difficulty: 'easy',
    isActive: true,
  },
  'slime-war': {
    id: 'slime-war',
    name: '슬라임 워',
    description: '전략적 보드 게임',
    category: 'strategy',
    minPlayers: 2,
    maxPlayers: 2,
    estimatedTime: 600, // 10 minutes
    difficulty: 'medium',
    isActive: true,
  },
};
