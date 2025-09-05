# Epic 3: Component System Refactoring

## Overview
Create a unified, reusable component system by consolidating duplicate components, establishing consistent APIs, and implementing a design system approach.

## Epic Goals
- Eliminate code duplication across similar components
- Establish consistent component APIs and props interfaces
- Create flexible, configurable components for common patterns
- Implement design system principles with theme integration
- Improve developer experience with better component documentation

## User Story
**As a developer**, I want reusable components for common UI patterns so that code duplication is eliminated and UI consistency is maintained across the application.

## Acceptance Criteria
- [ ] All header variants consolidated into single flexible Header component
- [ ] Modal system with consistent API for different modal types
- [ ] Button components with variants, states, and consistent styling
- [ ] Input components with validation integration and consistent UX
- [ ] Loading states and error boundaries as reusable components
- [ ] Theme integration across all components
- [ ] Component documentation and usage examples
- [ ] 60% reduction in component code duplication

## Current Component Analysis

### Header Components (7 duplicates)
```typescript
// Current scattered implementations:
- Header.tsx
- SoloHeader.tsx  
- MultiHeader.tsx
- FrogMultiHeader.tsx
- SequenceMultiHeader.tsx
- SlimeWarMultiHeader.tsx
- GameHeader.tsx
```

### Issues Identified
- Massive code duplication (80%+ similar code)
- Inconsistent prop interfaces
- Different styling approaches
- No centralized theme usage
- Hard to maintain and extend

## Tasks Breakdown

### Task 3.1: Design System Foundation
**Priority:** Critical  
**Estimate:** 2 days  
**Description:** Establish design system foundations with theme, tokens, and component standards

**Acceptance Criteria:**
- [ ] Create comprehensive theme system with design tokens
- [ ] Define component size variants (xs, sm, md, lg, xl)
- [ ] Establish color palette and semantic color usage
- [ ] Create typography scale and text styles
- [ ] Define spacing, border radius, and shadow scales
- [ ] Create component naming conventions and API patterns

**Files to Create:**
```typescript
// src/infrastructure/theme/
├── tokens.ts          // Design tokens (colors, spacing, etc.)
├── typography.ts      // Text styles and font scales  
├── components.ts      // Component-specific theme values
├── semantic.ts        // Semantic color mappings
└── index.ts          // Theme provider and exports

// Theme structure example:
interface DesignTokens {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    neutral: ColorScale;
    semantic: SemanticColors;
  };
  spacing: SpacingScale;
  typography: TypographyScale;
  shadows: ShadowScale;
  radius: RadiusScale;
}
```

### Task 3.2: Unified Header Component System
**Priority:** High  
**Estimate:** 3 days  
**Description:** Consolidate all header components into single flexible system

**Acceptance Criteria:**
- [ ] Single Header component handles all use cases
- [ ] Variant-based API (game, menu, modal, solo, multi)
- [ ] Configurable left/right actions with icon/text/custom support
- [ ] Progress bar integration for games
- [ ] Background customization with theme integration
- [ ] Responsive behavior for different screen sizes
- [ ] Accessibility compliance (screen readers, focus management)

**Component API Design:**
```typescript
interface HeaderProps {
  // Variants determine default styling and behavior
  variant: 'game' | 'menu' | 'modal' | 'minimal';
  
  // Core content
  title: string;
  subtitle?: string;
  
  // Actions configuration
  leftAction?: HeaderAction;
  rightAction?: HeaderAction;
  
  // Game-specific features
  showProgress?: boolean;
  progress?: number;
  showLives?: boolean;
  lives?: number;
  showTimer?: boolean;
  timeRemaining?: number;
  
  // Styling
  backgroundColor?: string;
  textColor?: string;
  size?: ComponentSize;
  
  // Behavior
  onBack?: () => void;
  onClose?: () => void;
}

type HeaderAction = {
  type: 'icon' | 'text' | 'custom';
  content: string | React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
};
```

**Files to Create/Replace:**
- `src/modules/ui/components/layout/Header.tsx` (new unified component)
- `src/modules/ui/components/layout/HeaderAction.tsx`
- `src/modules/ui/components/layout/HeaderProgress.tsx`
- Replace all existing header components with new unified version

### Task 3.3: Modal System Implementation
**Priority:** High  
**Estimate:** 2 days  
**Description:** Create flexible modal system for all dialog needs

**Acceptance Criteria:**
- [ ] Modal provider with context-based state management
- [ ] Support for alert, confirm, custom, and form modals
- [ ] Configurable animations and transitions
- [ ] Backdrop behavior configuration
- [ ] Keyboard and gesture handling
- [ ] Accessibility compliance (focus trap, escape key)
- [ ] Theme integration with consistent styling

**Modal System API:**
```typescript
// Modal hook for easy usage
const useModal = () => ({
  show: (config: ModalConfig) => Promise<ModalResult>,
  hide: () => void,
  isVisible: boolean,
});

// Modal configuration
interface ModalConfig {
  type: 'alert' | 'confirm' | 'custom' | 'form';
  title: string;
  message?: string;
  content?: React.ReactNode;
  actions: ModalAction[];
  backdrop?: 'static' | 'dismissible';
  animation?: 'slide' | 'fade' | 'scale';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Usage examples:
const modal = useModal();

// Simple alert
await modal.show({
  type: 'alert',
  title: 'Game Over',
  message: 'Your final score is 1250 points!',
  actions: [{ text: 'OK', style: 'primary' }]
});

// Confirmation dialog  
const result = await modal.show({
  type: 'confirm',
  title: 'Quit Game',
  message: 'Are you sure you want to quit? Progress will be lost.',
  actions: [
    { text: 'Cancel', style: 'secondary' },
    { text: 'Quit', style: 'destructive' }
  ]
});
```

**Files to Create:**
- `src/modules/ui/components/feedback/Modal.tsx`
- `src/modules/ui/components/feedback/ModalProvider.tsx`
- `src/modules/ui/hooks/useModal.ts`
- `src/modules/ui/types/modal.ts`

### Task 3.4: Button Component System
**Priority:** Medium  
**Estimate:** 2 days  
**Description:** Create comprehensive button system with variants and states

**Acceptance Criteria:**
- [ ] Support for multiple variants (primary, secondary, outline, ghost, destructive)
- [ ] Size variants (xs, sm, md, lg, xl) with consistent scaling
- [ ] State management (loading, disabled, pressed) with visual feedback
- [ ] Icon support (left, right, icon-only) with proper spacing
- [ ] Accessibility compliance (focus states, screen reader support)
- [ ] Theme integration with semantic color usage
- [ ] Consistent touch targets and interaction feedback

**Button API Design:**
```typescript
interface ButtonProps {
  // Variants
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  // Content
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // States
  loading?: boolean;
  disabled?: boolean;
  
  // Behavior
  onPress: () => void;
  onLongPress?: () => void;
  
  // Styling
  fullWidth?: boolean;
  testID?: string;
}

// Usage examples:
<Button variant="primary" size="lg" onPress={handleStart}>
  Start Game
</Button>

<Button 
  variant="outline" 
  size="md" 
  leftIcon={<BackIcon />} 
  onPress={handleBack}
>
  Go Back
</Button>

<Button 
  variant="destructive" 
  size="sm" 
  loading={isDeleting}
  onPress={handleDelete}
>
  Delete Game
</Button>
```

### Task 3.5: Input Component System
**Priority:** Medium  
**Estimate:** 2 days  
**Description:** Create flexible input system with validation integration

**Acceptance Criteria:**
- [ ] TextInput with variants (default, filled, outline) and states
- [ ] Built-in validation with error display
- [ ] Support for different input types (text, number, password, etc.)
- [ ] Icon support and action buttons (clear, visibility toggle)
- [ ] Consistent styling with theme integration
- [ ] Accessibility compliance (labels, hints, error announcements)
- [ ] Form integration with validation libraries

**Input API Design:**
```typescript
interface TextInputProps {
  // Variants and styling
  variant: 'default' | 'filled' | 'outline';
  size: 'sm' | 'md' | 'lg';
  
  // Input configuration
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  
  // Validation
  error?: string;
  isValid?: boolean;
  required?: boolean;
  
  // Enhancements
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  
  // Accessibility
  label?: string;
  hint?: string;
  testID?: string;
}
```

### Task 3.6: Loading and Error Components
**Priority:** Medium  
**Estimate:** 1 day  
**Description:** Create consistent loading states and error handling components

**Acceptance Criteria:**
- [ ] Loading spinner with size variants and custom messages
- [ ] Skeleton loading components for different content types
- [ ] Error boundary with retry functionality and custom fallbacks
- [ ] Empty state component with customizable content
- [ ] Progress indicators for multi-step processes
- [ ] Consistent animations and transitions

**Components to Create:**
```typescript
// Loading components
<LoadingSpinner size="lg" message="Loading game..." />
<SkeletonLoader type="card" count={3} />
<ProgressBar progress={0.75} showPercentage />

// Error components  
<ErrorBoundary fallback={<CustomErrorPage />}>
  <GameContent />
</ErrorBoundary>

<ErrorDisplay 
  title="Connection Failed"
  message="Unable to connect to game servers"
  actions={[
    { text: 'Retry', onPress: handleRetry },
    { text: 'Go Back', onPress: handleBack }
  ]}
/>

// Empty states
<EmptyState
  icon={<NoGamesIcon />}
  title="No Games Found"
  message="Start your first game to see it here"
  action={<Button onPress={startGame}>Start Game</Button>}
/>
```

### Task 3.7: Component Documentation and Testing
**Priority:** Medium  
**Estimate:** 2 days  
**Description:** Create comprehensive documentation and testing for component system

**Acceptance Criteria:**
- [ ] Storybook integration for component showcase
- [ ] Usage examples and API documentation
- [ ] Unit tests for all component variants and states
- [ ] Visual regression tests for consistent styling
- [ ] Accessibility testing and compliance validation
- [ ] Performance testing for complex components
- [ ] Migration guide for updating existing usage

**Documentation Structure:**
```
src/modules/ui/docs/
├── README.md                 # Component system overview
├── design-tokens.md         # Theme and token documentation
├── components/
│   ├── Header.stories.tsx   # Storybook stories
│   ├── Header.test.tsx     # Component tests
│   ├── Header.md           # Usage documentation
│   └── ...
└── migration-guide.md      # Migration from old components
```

## Migration Strategy

### Phase 1: Foundation (Task 3.1)
- Set up design system and theme
- No breaking changes to existing code

### Phase 2: High-Impact Components (Tasks 3.2-3.3)
- Replace header components one by one
- Implement modal system
- Update usage throughout app

### Phase 3: Form Components (Tasks 3.4-3.5)
- Replace buttons and inputs incrementally
- Update forms and interactive elements

### Phase 4: Polish and Documentation (Tasks 3.6-3.7)
- Add loading and error components
- Complete documentation and testing

## Testing Strategy
- Unit tests for component logic and API
- Snapshot tests for visual consistency
- Integration tests for component interactions
- Accessibility testing with automated tools
- Visual regression testing with screenshots
- Performance testing for render optimization

## Definition of Done
- [ ] All duplicate components consolidated into reusable systems
- [ ] Component API consistent and well-documented
- [ ] Theme integration across all components
- [ ] 60% reduction in component code duplication measured
- [ ] All components tested and documented
- [ ] Migration completed with no functionality loss
- [ ] Storybook integration for component showcase
- [ ] Performance validated (no regression in render times)

## Success Metrics
- Code duplication reduction: Target 60%
- Component count reduction: Target 50%
- Theme consistency: 100% of components use design tokens
- Developer experience: Faster component implementation time
- Bundle size: Maintain or reduce despite added flexibility
- Test coverage: >90% for component system

## Risks & Mitigation
- **Risk:** Breaking changes during migration
  - **Mitigation:** Incremental replacement with backward compatibility
- **Risk:** Performance impact from added abstraction
  - **Mitigation:** Performance monitoring and optimization
- **Risk:** Over-engineering components
  - **Mitigation:** Start simple, add complexity as needed
- **Risk:** Team adoption of new component system
  - **Mitigation:** Clear documentation, examples, and training