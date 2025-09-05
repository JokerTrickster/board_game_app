# Epic 2: Module Organization

## Overview
Reorganize codebase into logical, cohesive modules with clear boundaries and dependencies to improve maintainability and scalability.

## Epic Goals
- Establish clear module boundaries and responsibilities
- Reduce coupling between different functional areas
- Improve code discoverability and navigation
- Enable better dependency management and testing

## User Story
**As a developer**, I want code organized into logical modules so that related functionality is grouped together and the codebase is easier to navigate and maintain.

## Acceptance Criteria
- [ ] Game modules (find-it, slime-war, etc.) are self-contained
- [ ] Shared modules (auth, navigation, ui) are properly separated
- [ ] Services module contains all business logic
- [ ] Utils module contains pure functions and helpers
- [ ] Clear module boundaries and dependencies
- [ ] Module index files for clean imports
- [ ] Consistent folder structure across modules

## Target Module Structure

```
src/
├── modules/                    # Feature modules
│   ├── auth/                   # Authentication module
│   │   ├── models/
│   │   ├── viewModels/
│   │   ├── views/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── games/                  # Games module
│   │   ├── find-it/
│   │   │   ├── models/
│   │   │   ├── viewModels/
│   │   │   ├── views/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── assets/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── slime-war/
│   │   │   └── [same structure]
│   │   ├── shared/             # Shared game logic
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── navigation/             # Navigation module
│   │   ├── navigators/
│   │   ├── screens/
│   │   ├── types/
│   │   └── index.ts
│   └── ui/                     # UI module
│       ├── components/
│       ├── styles/
│       ├── hooks/
│       ├── types/
│       └── index.ts
├── shared/                     # Cross-module shared code
│   ├── components/             # Reusable UI components
│   ├── services/              # Business services
│   ├── hooks/                 # Custom hooks
│   ├── utils/                 # Pure utility functions
│   ├── types/                 # Global type definitions
│   └── constants/             # Application constants
├── infrastructure/            # App infrastructure
│   ├── theme/                 # Theme configuration
│   ├── config/                # App configuration
│   ├── api/                   # API configuration
│   ├── storage/               # Storage utilities
│   └── mvvm/                  # MVVM infrastructure
└── assets/                    # Global assets
    ├── images/
    ├── icons/
    ├── fonts/
    └── sounds/
```

## Tasks Breakdown

### Task 2.1: Create Module Structure Foundation
**Priority:** Critical  
**Estimate:** 1 day  
**Description:** Set up the basic module folder structure and create index files

**Acceptance Criteria:**
- [ ] Create all module directories according to target structure
- [ ] Create index.ts files for each module
- [ ] Set up barrel exports for clean imports
- [ ] Create module-specific type files
- [ ] Add module documentation (README.md for each module)

**Files to Create:**
```
src/modules/auth/index.ts
src/modules/games/index.ts
src/modules/games/find-it/index.ts
src/modules/games/slime-war/index.ts
src/modules/games/shared/index.ts
src/modules/navigation/index.ts
src/modules/ui/index.ts
src/shared/index.ts
src/infrastructure/index.ts
```

### Task 2.2: Migrate Authentication Module
**Priority:** High  
**Estimate:** 2 days  
**Description:** Move authentication-related code to auth module

**Acceptance Criteria:**
- [ ] Move LoginScreen to modules/auth/views/
- [ ] Move auth services to modules/auth/services/
- [ ] Create auth types in modules/auth/types/
- [ ] Update imports throughout codebase
- [ ] Create auth module barrel exports
- [ ] Add auth module documentation

**Files to Move/Create:**
- `src/screens/LoginScreen.tsx` → `src/modules/auth/views/LoginScreen.tsx`
- `src/modules/auth/services/AuthService.ts` (new)
- `src/modules/auth/types/index.ts` (new)
- `src/modules/auth/README.md` (new)

### Task 2.3: Migrate Games Module Structure
**Priority:** High  
**Estimate:** 3 days  
**Description:** Reorganize game-related code into games module with proper sub-modules

**Acceptance Criteria:**
- [ ] Move find-it game code to modules/games/find-it/
- [ ] Move slime-war game code to modules/games/slime-war/
- [ ] Extract shared game logic to modules/games/shared/
- [ ] Organize game assets within modules
- [ ] Create game-specific type definitions
- [ ] Update all import paths

**Files to Move:**
```
src/games/find-it/* → src/modules/games/find-it/
src/games/slime-war/* → src/modules/games/slime-war/
src/assets/icons/find-it/* → src/modules/games/find-it/assets/icons/
src/assets/sounds/game/* → src/modules/games/shared/assets/sounds/
```

### Task 2.4: Create UI Module
**Priority:** Medium  
**Estimate:** 2 days  
**Description:** Extract shared UI components into dedicated UI module

**Acceptance Criteria:**
- [ ] Move common components to modules/ui/components/
- [ ] Move component styles to modules/ui/styles/
- [ ] Create UI types and interfaces
- [ ] Organize components by category (buttons, inputs, layout, etc.)
- [ ] Create UI module documentation
- [ ] Update component imports across app

**Files to Move/Create:**
```
src/components/Header.tsx → src/modules/ui/components/layout/Header.tsx
src/components/ItemBar.tsx → src/modules/ui/components/game/ItemBar.tsx
src/components/GameHeader.tsx → src/modules/ui/components/game/GameHeader.tsx
src/components/feedback/* → src/modules/ui/components/feedback/
src/components/styles/* → src/modules/ui/styles/
```

### Task 2.5: Organize Navigation Module
**Priority:** Medium  
**Estimate:** 1 day  
**Description:** Consolidate navigation-related code into navigation module

**Acceptance Criteria:**
- [ ] Move AppNavigator to modules/navigation/navigators/
- [ ] Move navigation types to modules/navigation/types/
- [ ] Move screen wrappers to modules/navigation/screens/
- [ ] Create navigation utilities
- [ ] Update navigation imports

**Files to Move:**
```
src/navigation/* → src/modules/navigation/navigators/
src/navigation/navigationTypes.ts → src/modules/navigation/types/index.ts
```

### Task 2.6: Create Shared Services Module
**Priority:** High  
**Estimate:** 2 days  
**Description:** Organize business services and utilities into shared module

**Acceptance Criteria:**
- [ ] Move services to shared/services/
- [ ] Move utility functions to shared/utils/
- [ ] Move custom hooks to shared/hooks/
- [ ] Create shared types and constants
- [ ] Organize by functional area
- [ ] Update service imports across app

**Files to Move:**
```
src/services/* → src/shared/services/
src/hooks/* → src/shared/hooks/
src/utils/* → src/shared/utils/
src/constants/* → src/shared/constants/
```

### Task 2.7: Setup Infrastructure Module
**Priority:** Medium  
**Estimate:** 1 day  
**Description:** Create infrastructure module for app-wide configuration and setup

**Acceptance Criteria:**
- [ ] Move theme configuration to infrastructure/theme/
- [ ] Move app config to infrastructure/config/
- [ ] Create API configuration structure
- [ ] Move MVVM base classes to infrastructure/mvvm/
- [ ] Create storage utilities
- [ ] Setup infrastructure documentation

**Files to Move/Create:**
```
src/config.ts → src/infrastructure/config/index.ts
src/infrastructure/theme/index.ts (new)
src/infrastructure/api/index.ts (new)
src/infrastructure/storage/index.ts (new)
```

## Module Dependency Rules

### Dependency Guidelines
1. **Modules can import from:**
   - Their own internal structure
   - Shared module
   - Infrastructure module
   
2. **Modules CANNOT import from:**
   - Other feature modules directly
   - Specific implementation details of other modules

3. **Shared module can import from:**
   - Infrastructure module only
   - No feature modules

4. **Infrastructure module:**
   - No dependencies on other modules
   - Contains only foundational code

### Import Patterns
```typescript
// ✅ Good - Module importing from shared
import { Button } from '@shared/components';
import { useTimer } from '@shared/hooks';

// ✅ Good - Module importing from infrastructure  
import { Theme } from '@infrastructure/theme';
import { BaseViewModel } from '@infrastructure/mvvm';

// ❌ Bad - Direct module-to-module import
import { FindItService } from '@modules/games/find-it';

// ✅ Good - Module communication through shared services
import { GameEventService } from '@shared/services';
```

## Testing Strategy
- Test module boundaries with import linting rules
- Unit tests for module index files
- Integration tests for module interactions
- Dependency graph validation
- Import cycle detection

## Migration Strategy
1. Create module structure foundation
2. Migrate one module at a time starting with smallest
3. Update imports incrementally 
4. Validate no circular dependencies
5. Update build configuration and paths
6. Run full test suite after each module migration

## Definition of Done
- [ ] All code organized into appropriate modules
- [ ] No circular dependencies between modules
- [ ] Clean barrel exports for each module
- [ ] Module documentation completed
- [ ] Import paths updated throughout codebase
- [ ] Build process working with new structure
- [ ] All tests passing
- [ ] Dependency rules enforced with linting

## Performance Considerations
- Tree-shaking optimization with proper exports
- Bundle analysis to ensure no module bloat
- Dynamic imports for large modules where appropriate
- Asset organization for optimal loading

## Tooling Updates
- Update TypeScript path mapping
- Configure ESLint for module boundary rules
- Update build scripts for new structure
- Configure IDE workspace for better navigation

## Success Metrics
- Clear module boundaries with <5% cross-module coupling
- 100% of code properly organized into modules
- Import cycle count = 0
- Bundle size maintained or improved
- Developer productivity metrics (code navigation time)