# Epic 4: Code Structure Optimization

## Overview
Establish consistent code structure, naming conventions, and development patterns to improve code quality, maintainability, and developer productivity.

## Epic Goals
- Standardize file naming conventions across the entire codebase
- Implement consistent folder structure patterns within modules
- Establish TypeScript interfaces and type organization best practices
- Create standardized patterns for custom hooks, services, and utilities
- Improve import/export patterns for better tree-shaking and clarity
- Implement code quality tools and enforcement mechanisms

## User Story
**As a developer**, I want consistent code structure and patterns so that the codebase is maintainable, navigable, and follows industry best practices.

## Acceptance Criteria
- [ ] Consistent file naming conventions across all files
- [ ] Standard folder structure patterns implemented in all modules
- [ ] TypeScript interfaces and types properly organized and documented
- [ ] Custom hooks follow consistent patterns and naming
- [ ] Service classes follow single responsibility and consistent structure
- [ ] Clear import/export patterns with proper tree-shaking
- [ ] ESLint/Prettier configuration enforcing code standards
- [ ] Documentation standards implemented across codebase

## Current Code Structure Issues

### Naming Inconsistencies
```
Current mixed patterns:
- SoloFindItScreen.tsx vs LoginScreen.tsx
- ItemBarStyles.ts vs HomeHeaderStyles.ts
- CommonAudioManager.ts vs WebSocketService.ts
- useTimers.ts vs useImageLoader.ts (inconsistent hook patterns)
```

### Import/Export Issues
```typescript
// Inconsistent import patterns:
import React from 'react';                    // Default import
import { View, Text } from 'react-native';   // Named imports
import styles from './styles/ItemBarStyles'; // Relative import
import { performanceMonitor } from '../services/PerformanceMonitor'; // Mixed patterns

// Inconsistent exports:
export default ItemBar;                      // Default export
export const performanceMonitor = new...;   // Named export
export { CommonAudioManager } from './...'; // Re-export
```

### TypeScript Organization Issues
- Types scattered across different files
- Inconsistent interface naming (some with 'I' prefix, some without)
- Mixed use of types vs interfaces
- No clear organization of global vs module-specific types

## Tasks Breakdown

### Task 4.1: Establish Naming Conventions Standard
**Priority:** Critical  
**Estimate:** 2 days  
**Description:** Define and document consistent naming conventions for all code elements

**Acceptance Criteria:**
- [ ] File naming convention documented and implemented
- [ ] Component naming standards established
- [ ] Service and utility class naming patterns defined
- [ ] Hook naming conventions standardized
- [ ] Variable and function naming patterns documented
- [ ] TypeScript interface and type naming conventions
- [ ] Asset naming conventions (images, icons, sounds)

**Naming Standards to Implement:**
```typescript
// File Naming Conventions
Components: PascalCase (e.g., GameHeader.tsx)
Screens: PascalCase + Screen suffix (e.g., LoginScreen.tsx)
Services: PascalCase + Service suffix (e.g., AuthService.ts)
Utilities: camelCase (e.g., stringUtils.ts)
Hooks: camelCase with use prefix (e.g., useGameState.ts)
Types: camelCase (e.g., gameTypes.ts)
Styles: PascalCase + Styles suffix (e.g., GameHeaderStyles.ts)
Constants: SCREAMING_SNAKE_CASE (e.g., API_ENDPOINTS.ts)

// Code Element Naming
Interfaces: PascalCase without 'I' prefix (e.g., GameState)
Types: PascalCase (e.g., GameMode)
Enums: PascalCase (e.g., GameStatus)
Functions: camelCase (e.g., calculateScore)
Variables: camelCase (e.g., currentScore)
Constants: SCREAMING_SNAKE_CASE (e.g., MAX_LIVES)
Components: PascalCase (e.g., GameBoard)
Hooks: camelCase with 'use' prefix (e.g., useGameLogic)
```

**Files to Create:**
- `CODING_STANDARDS.md` - Complete coding standards documentation
- `NAMING_CONVENTIONS.md` - Detailed naming convention guide
- `.eslintrc.naming.js` - ESLint rules for naming enforcement

### Task 4.2: TypeScript Organization and Standards
**Priority:** High  
**Estimate:** 2 days  
**Description:** Organize TypeScript interfaces, types, and establish consistent typing patterns

**Acceptance Criteria:**
- [ ] Global types organized in shared/types/ with clear categorization
- [ ] Module-specific types organized within each module
- [ ] Consistent interface vs type usage patterns
- [ ] Generic type patterns documented and implemented
- [ ] Utility types created for common patterns
- [ ] Type exports organized with barrel pattern
- [ ] TypeScript strict mode enabled with proper configuration

**Type Organization Structure:**
```typescript
// Global Types (src/shared/types/)
├── api.ts              // API-related types
├── auth.ts             // Authentication types  
├── game.ts             // Game-related types
├── navigation.ts       // Navigation types
├── ui.ts              // UI component types
├── utils.ts           // Utility types
└── index.ts           // Barrel exports

// Module-specific Types (src/modules/*/types/)
├── models.ts          // Data model types
├── viewModels.ts      // ViewModel types
├── services.ts        // Service types
├── components.ts      // Component prop types
└── index.ts          // Module type exports

// Type Standards
interface GameState {     // Use interface for object shapes
  score: number;
  level: number;
  isActive: boolean;
}

type GameMode = 'solo' | 'multiplayer';  // Use type for unions
type GameEvent = 'start' | 'pause' | 'end'; // Use type for string literals

// Generic patterns
interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

interface ComponentProps<T = {}> {
  children?: React.ReactNode;
  testID?: string;
} & T;
```

### Task 4.3: Service Class Structure Standardization
**Priority:** High  
**Estimate:** 2 days  
**Description:** Establish consistent patterns for service classes and business logic

**Acceptance Criteria:**
- [ ] Abstract base service class with common functionality
- [ ] Consistent error handling patterns across services
- [ ] Standard dependency injection patterns
- [ ] Service interface definitions for better testability
- [ ] Consistent async/await patterns and error propagation
- [ ] Standard logging and monitoring integration
- [ ] Service lifecycle management patterns

**Service Structure Pattern:**
```typescript
// Base Service Pattern
abstract class BaseService {
  protected abstract serviceName: string;
  protected logger: Logger;
  
  constructor(protected dependencies: ServiceDependencies) {
    this.logger = dependencies.logger.child({ service: this.serviceName });
  }
  
  protected abstract initialize(): Promise<void>;
  protected abstract cleanup(): Promise<void>;
  
  protected handleError(error: Error, context: string): never {
    this.logger.error({ error, context }, 'Service error occurred');
    throw new ServiceError(`${this.serviceName}: ${error.message}`, error);
  }
}

// Service Interface Pattern
interface GameService {
  startGame(config: GameConfig): Promise<GameSession>;
  endGame(sessionId: string): Promise<GameResult>;
  updateScore(sessionId: string, score: number): Promise<void>;
  getLeaderboard(gameType: GameType): Promise<LeaderboardEntry[]>;
}

// Service Implementation Pattern  
class GameServiceImpl extends BaseService implements GameService {
  protected serviceName = 'GameService';
  
  constructor(
    dependencies: ServiceDependencies,
    private repository: GameRepository,
    private eventBus: EventBus
  ) {
    super(dependencies);
  }
  
  async startGame(config: GameConfig): Promise<GameSession> {
    try {
      this.logger.info({ config }, 'Starting new game');
      const session = await this.repository.createSession(config);
      this.eventBus.emit('game:started', { sessionId: session.id });
      return session;
    } catch (error) {
      return this.handleError(error, 'startGame');
    }
  }
}
```

### Task 4.4: Custom Hook Patterns and Standards
**Priority:** Medium  
**Estimate:** 1 day  
**Description:** Standardize custom hook patterns, naming, and structure

**Acceptance Criteria:**
- [ ] Consistent hook naming with 'use' prefix
- [ ] Standard hook structure with clear return patterns
- [ ] Consistent parameter and options patterns
- [ ] Standard cleanup and dependency management
- [ ] Hook composition patterns documented
- [ ] Testing patterns for custom hooks
- [ ] Performance optimization patterns (useMemo, useCallback usage)

**Hook Standards:**
```typescript
// Hook Structure Pattern
interface UseGameStateOptions {
  gameType: GameType;
  autoSave?: boolean;
  onGameEnd?: (result: GameResult) => void;
}

interface UseGameStateReturn {
  // State
  gameState: GameState;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  actions: {
    startGame: (config: GameConfig) => Promise<void>;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: () => Promise<GameResult>;
  };
  
  // Computed values
  computed: {
    canPause: boolean;
    timeRemaining: number;
    progress: number;
  };
}

const useGameState = (options: UseGameStateOptions): UseGameStateReturn => {
  // State management
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Actions (memoized)
  const actions = useMemo(() => ({
    startGame: async (config: GameConfig) => {
      // Implementation
    },
    pauseGame: () => {
      // Implementation  
    },
    // ... other actions
  }), [/* dependencies */]);
  
  // Computed values (memoized)
  const computed = useMemo(() => ({
    canPause: gameState.status === 'playing',
    timeRemaining: Math.max(0, gameState.endTime - Date.now()),
    progress: gameState.score / gameState.targetScore,
  }), [gameState]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      // Cleanup resources
    };
  }, []);
  
  return {
    gameState,
    isLoading,
    error,
    actions,
    computed,
  };
};
```

### Task 4.5: Import/Export Pattern Optimization
**Priority:** Medium  
**Estimate:** 2 days  
**Description:** Standardize import/export patterns for better tree-shaking and clarity

**Acceptance Criteria:**
- [ ] Consistent import ordering and grouping patterns
- [ ] Barrel exports implemented for all modules
- [ ] Tree-shaking optimized exports
- [ ] Absolute vs relative import rules established
- [ ] Re-export patterns standardized
- [ ] Import path mapping configured in TypeScript
- [ ] Bundle analyzer integration for import impact assessment

**Import/Export Standards:**
```typescript
// Import Order Standards
// 1. React and React Native imports
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. Third-party library imports (alphabetical)
import { observer } from 'mobx-react-lite';
import { NavigationProp } from '@react-navigation/native';

// 3. Internal imports (from general to specific)
import { Theme } from '@infrastructure/theme';
import { Button } from '@shared/components';
import { useGameState } from '@shared/hooks';
import { GameService } from '@modules/games/services';
import { styles } from './GameScreenStyles';

// Barrel Export Pattern
// src/modules/games/index.ts
export { FindItGame } from './find-it';
export { SlimeWarGame } from './slime-war';
export { GameService } from './services';
export type { GameConfig, GameResult } from './types';

// Module Internal Exports
// src/modules/games/find-it/index.ts
export { FindItScreen } from './views/FindItScreen';
export { FindItViewModel } from './viewModels/FindItViewModel';
export { FindItService } from './services/FindItService';
export type * from './types';

// Path Mapping (tsconfig.json)
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@infrastructure/*": ["infrastructure/*"],
      "@shared/*": ["shared/*"],
      "@modules/*": ["modules/*"]
    }
  }
}
```

### Task 4.6: Code Quality Tools and Enforcement
**Priority:** Medium  
**Estimate:** 2 days  
**Description:** Set up comprehensive code quality tools and automated enforcement

**Acceptance Criteria:**
- [ ] ESLint configuration with comprehensive rules
- [ ] Prettier configuration for consistent formatting
- [ ] Husky pre-commit hooks for quality enforcement
- [ ] TypeScript strict mode enabled and configured
- [ ] Import sorting and unused import detection
- [ ] Code complexity analysis and limits
- [ ] Documentation linting for comments and JSDoc

**Quality Tools Configuration:**
```typescript
// .eslintrc.js - Comprehensive ESLint Configuration
module.exports = {
  extends: [
    '@react-native/eslint-config',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: [
    '@typescript-eslint',
    'react-hooks',
    'import',
    'unused-imports'
  ],
  rules: {
    // Naming conventions
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase']
      },
      {
        selector: 'typeAlias', 
        format: ['PascalCase']
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase']
      }
    ],
    
    // Import organization
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external', 
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' }
      }
    ],
    
    // Code quality
    'complexity': ['error', 10],
    'max-lines': ['error', 300],
    'max-lines-per-function': ['error', 50],
    
    // React/Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // TypeScript
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
  }
};

// package.json scripts
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write 'src/**/*.{ts,tsx}'",
    "type-check": "tsc --noEmit",
    "quality": "npm run lint && npm run type-check && npm run test"
  }
}

// .husky/pre-commit
#!/bin/sh
npm run quality
```

### Task 4.7: Documentation Standards Implementation
**Priority:** Medium  
**Estimate:** 1 day  
**Description:** Establish comprehensive documentation standards and templates

**Acceptance Criteria:**
- [ ] README templates for modules and components
- [ ] JSDoc standards for functions and classes
- [ ] Code comment guidelines and enforcement
- [ ] API documentation generation setup
- [ ] Architecture decision record (ADR) template
- [ ] Contributing guidelines with code standards
- [ ] Examples and usage documentation

**Documentation Standards:**
```typescript
/**
 * Game state management hook for handling game logic and state
 * 
 * @param options - Configuration options for the game
 * @param options.gameType - Type of game to initialize
 * @param options.autoSave - Whether to automatically save game state
 * @param options.onGameEnd - Callback fired when game ends
 * 
 * @returns Object containing game state, actions, and computed values
 * 
 * @example
 * ```typescript
 * const { gameState, actions, computed } = useGameState({
 *   gameType: 'find-it',
 *   autoSave: true,
 *   onGameEnd: (result) => console.log('Game ended:', result)
 * });
 * 
 * // Start a new game
 * await actions.startGame({ difficulty: 'easy', timeLimit: 300 });
 * ```
 */
const useGameState = (options: UseGameStateOptions): UseGameStateReturn => {
  // Implementation
};

// Module README Template
# Module Name

## Overview
Brief description of the module's purpose and responsibilities.

## Structure
```
module-name/
├── components/     # UI components
├── services/      # Business logic services  
├── types/         # TypeScript definitions
├── utils/         # Utility functions
└── index.ts       # Public exports
```

## Usage
```typescript
import { ComponentName } from '@modules/module-name';
```

## API Reference
### Components
- [ComponentName](./components/ComponentName.md)

### Services  
- [ServiceName](./services/ServiceName.md)

## Testing
```bash
npm test -- --testPathPattern=module-name
```
```

## Migration Strategy

### Phase 1: Standards Definition (Tasks 4.1-4.2)
- Document standards and conventions
- Set up TypeScript organization
- No breaking changes

### Phase 2: Service and Hook Standardization (Tasks 4.3-4.4)  
- Refactor services to standard patterns
- Update custom hooks to consistent structure
- Gradual migration with backward compatibility

### Phase 3: Import/Export Optimization (Task 4.5)
- Update import patterns across codebase
- Implement barrel exports
- Configure path mapping

### Phase 4: Quality Enforcement (Tasks 4.6-4.7)
- Set up automated quality tools
- Add documentation standards
- Enable enforcement mechanisms

## Testing Strategy
- Lint rule testing for standard enforcement
- Import/export validation
- Documentation coverage measurement
- Bundle analysis for tree-shaking effectiveness
- Code complexity monitoring

## Definition of Done
- [ ] All files follow established naming conventions
- [ ] TypeScript types properly organized and documented
- [ ] Services follow consistent structure patterns
- [ ] Hooks use standardized patterns and naming
- [ ] Import/export patterns optimized for tree-shaking
- [ ] Quality tools enforcing standards automatically
- [ ] Documentation standards implemented
- [ ] Migration completed with no functionality loss
- [ ] Bundle size maintained or reduced
- [ ] Developer experience improved (faster navigation, clearer patterns)

## Success Metrics
- Code consistency score: >95% adherence to standards
- Bundle size: Maintained or reduced despite standardization
- Developer productivity: Faster code navigation and implementation
- Code review time: Reduced due to consistent patterns
- Documentation coverage: >80% of public APIs documented
- Lint violations: <10 across entire codebase
- TypeScript errors: 0 with strict mode enabled

## Performance Impact
- Bundle analysis to ensure no size increase
- Build time monitoring during migration
- Runtime performance validation
- Import performance optimization measurement