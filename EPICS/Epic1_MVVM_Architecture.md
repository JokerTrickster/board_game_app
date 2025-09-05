# Epic 1: MVVM Architecture Implementation

## Overview
Implement Model-View-ViewModel (MVVM) architectural pattern to separate business logic from UI components, improving maintainability and testability.

## Epic Goals
- Clear separation of concerns between data, business logic, and UI
- Consistent state management patterns across the application
- Improved testability through isolated business logic
- Better code organization and developer experience

## User Story
**As a developer**, I want components to follow MVVM pattern so that business logic is separated from UI concerns and the codebase is more maintainable.

## Acceptance Criteria
- [ ] All game screens refactored to MVVM pattern
- [ ] Models handle data structures and business rules
- [ ] ViewModels manage component state and business logic
- [ ] Views focus purely on rendering and user interaction
- [ ] Clear data flow: View ↔ ViewModel ↔ Model
- [ ] Service layer properly abstracted from UI components
- [ ] State management library integrated (MobX/Zustand)

## Technical Requirements

### Architecture Pattern
```typescript
// Model - Data structures and business rules
interface GameModel {
  id: string;
  score: number;
  lives: number;
  level: number;
  timeRemaining: number;
  isGameOver: boolean;
  
  // Business rules
  canContinue(): boolean;
  calculateFinalScore(): number;
  shouldLevelUp(): boolean;
}

// ViewModel - State management and business logic
class GameViewModel {
  private model: GameModel;
  private gameService: GameService;
  
  // Observable state
  public readonly state = observable({
    currentGame: null as GameModel | null,
    loading: false,
    error: null as string | null,
  });
  
  // Actions
  public readonly actions = {
    startGame: action(this.startGame.bind(this)),
    updateScore: action(this.updateScore.bind(this)),
    loseLife: action(this.loseLife.bind(this)),
    endGame: action(this.endGame.bind(this)),
  };
  
  private async startGame(gameType: string) {
    this.state.loading = true;
    try {
      this.state.currentGame = await this.gameService.createGame(gameType);
    } catch (error) {
      this.state.error = error.message;
    } finally {
      this.state.loading = false;
    }
  }
}

// View - Pure UI component
const GameView: React.FC<{viewModel: GameViewModel}> = observer(({viewModel}) => {
  const {state, actions} = viewModel;
  
  return (
    <GameContainer>
      {state.loading && <LoadingSpinner />}
      {state.error && <ErrorDisplay error={state.error} />}
      {state.currentGame && (
        <GameUI 
          game={state.currentGame}
          onScoreUpdate={actions.updateScore}
          onLifeLost={actions.loseLife}
        />
      )}
    </GameContainer>
  );
});
```

## Tasks Breakdown

### Task 1.1: Setup MVVM Foundation
**Priority:** Critical  
**Estimate:** 2 days  
**Description:** Set up base classes and infrastructure for MVVM pattern

**Acceptance Criteria:**
- [ ] Install and configure MobX for state management
- [ ] Create BaseViewModel abstract class
- [ ] Create BaseModel interface
- [ ] Set up dependency injection container
- [ ] Create ViewModel provider system

**Files to Create/Modify:**
- `src/infrastructure/mvvm/BaseViewModel.ts`
- `src/infrastructure/mvvm/BaseModel.ts`
- `src/infrastructure/mvvm/DIContainer.ts`
- `src/infrastructure/mvvm/ViewModelProvider.tsx`

### Task 1.2: Refactor Find-It Game to MVVM
**Priority:** High  
**Estimate:** 3 days  
**Description:** Convert Find-It game screens to MVVM pattern

**Acceptance Criteria:**
- [ ] Create FindItGameModel with game state and rules
- [ ] Create FindItViewModel for state management
- [ ] Refactor SoloFindItScreen to use ViewModel
- [ ] Refactor FindItScreen (multiplayer) to use ViewModel
- [ ] Extract UI components to pure views
- [ ] Add proper error handling and loading states

**Files to Create/Modify:**
- `src/modules/games/find-it/models/FindItGameModel.ts`
- `src/modules/games/find-it/viewModels/FindItViewModel.ts`
- `src/modules/games/find-it/views/SoloFindItView.tsx`
- `src/modules/games/find-it/views/FindItView.tsx`
- `src/games/find-it/SoloFindItScreen.tsx` (refactor)
- `src/games/find-it/FindItScreen.tsx` (refactor)

### Task 1.3: Refactor Slime War Game to MVVM
**Priority:** High  
**Estimate:** 3 days  
**Description:** Convert Slime War game screen to MVVM pattern

**Acceptance Criteria:**
- [ ] Create SlimeWarGameModel with game mechanics
- [ ] Create SlimeWarViewModel for game state
- [ ] Refactor SlimeWarScreen to use ViewModel
- [ ] Extract game UI components
- [ ] Implement proper state transitions
- [ ] Add game over and restart logic

**Files to Create/Modify:**
- `src/modules/games/slime-war/models/SlimeWarGameModel.ts`
- `src/modules/games/slime-war/viewModels/SlimeWarViewModel.ts`
- `src/modules/games/slime-war/views/SlimeWarView.tsx`
- `src/games/slime-war/screens/SlimeWarScreen.tsx` (refactor)

### Task 1.4: Refactor Authentication to MVVM
**Priority:** Medium  
**Estimate:** 2 days  
**Description:** Convert authentication screens to MVVM pattern

**Acceptance Criteria:**
- [ ] Create AuthModel with user state and validation
- [ ] Create AuthViewModel for authentication logic
- [ ] Refactor LoginScreen to use ViewModel
- [ ] Extract form components to pure views
- [ ] Add proper form validation and error handling
- [ ] Implement authentication state persistence

**Files to Create/Modify:**
- `src/modules/auth/models/AuthModel.ts`
- `src/modules/auth/viewModels/AuthViewModel.ts`
- `src/modules/auth/views/LoginView.tsx`
- `src/screens/LoginScreen.tsx` (refactor)

### Task 1.5: Refactor Navigation and Common Screens
**Priority:** Medium  
**Estimate:** 2 days  
**Description:** Convert remaining screens to MVVM pattern

**Acceptance Criteria:**
- [ ] Create HomeViewModel for main menu logic
- [ ] Create LoadingViewModel for loading states
- [ ] Refactor LoadingScreen to use ViewModel
- [ ] Extract common UI patterns
- [ ] Implement consistent navigation patterns
- [ ] Add error boundaries with ViewModels

**Files to Create/Modify:**
- `src/modules/navigation/viewModels/HomeViewModel.ts`
- `src/modules/navigation/viewModels/LoadingViewModel.ts`
- `src/screens/LoadingScreen.tsx` (refactor)
- `src/components/ErrorBoundary.tsx`

## Dependencies
- MobX or Zustand for state management
- React Context for ViewModel providers
- TypeScript for strong typing
- Existing service layer (CommonAudioManager, WebSocketService, etc.)

## Testing Strategy
- Unit tests for ViewModels (business logic)
- Integration tests for Model methods
- Component tests for Views (UI rendering)
- Mock services for ViewModel testing
- Snapshot tests for consistent UI

## Performance Considerations
- Optimize observable updates to prevent unnecessary re-renders
- Use MobX computed values for derived state
- Implement proper cleanup in ViewModels
- Monitor memory usage with new architecture

## Migration Strategy
1. Set up MVVM foundation first
2. Migrate games one by one (Find-It → Slime War)
3. Migrate authentication and common screens
4. Update tests and documentation
5. Performance validation and optimization

## Definition of Done
- [ ] All screens follow MVVM pattern
- [ ] Business logic isolated from UI components
- [ ] State management consistent across app
- [ ] Unit tests for all ViewModels
- [ ] Documentation updated with MVVM examples
- [ ] Performance validated against baseline
- [ ] Code review completed
- [ ] Manual testing passed

## Risks & Mitigation
- **Risk:** Breaking existing functionality during refactor
  - **Mitigation:** Incremental migration with feature flags
- **Risk:** Performance degradation from state management overhead
  - **Mitigation:** Performance monitoring and optimization
- **Risk:** Team learning curve for MVVM pattern
  - **Mitigation:** Documentation and code examples

## Success Metrics
- 100% of screens follow MVVM pattern
- Business logic unit test coverage > 80%
- UI component test coverage > 90%
- No performance regression in game screens
- Reduced coupling between components