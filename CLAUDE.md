# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **React Native multiplayer board game application** written in **TypeScript** featuring multiple games including "Find It" (spot the difference), Slime War, Sequence, and Frog games. The app uses **WebSocket for real-time multiplayer functionality** and **MobX for state management**.

## Development Commands

```bash
# Start Metro bundler
npm start
# or
react-native start

# Run on iOS simulator
npm run ios

# Run on Android emulator/device  
npm run android

# Linting
npm run lint

# Testing
npm test
```

## Architecture & Key Patterns

### MVVM Architecture
The project follows **Model-View-ViewModel (MVVM)** pattern with MobX:
- **Views**: React components in `src/screens/` and `src/components/`
- **ViewModels**: MobX stores in `src/games/*/services/*ViewModel.ts` using `makeAutoObservable`
- **Services**: Business logic and API communication in `src/services/`

### Game Architecture Pattern
Each game follows this modular structure:
```
src/games/{game-name}/
├── screens/           # Game UI screens  
├── services/          # ViewModel + WebSocketService + Service
└── styles/           # Game-specific styles
```

### Core Services
- **AuthService**: JWT token management with AsyncStorage persistence
- **GameService**: Global game state and user data management
- **WebSocketService**: Base real-time communication (singleton with message queue)
- **CommonAudioManager**: Global audio lifecycle management

### Navigation & State Flow
- **Stack Navigation** with React Navigation v7
- **Auto-login**: Initial route determined by stored access token
- **Global Navigation Ref**: WebSocket services can trigger navigation programmatically
- **Cross-Component Events**: EventEmitter for service-to-component communication

### WebSocket Integration
- **Per-Game WebSocket Services**: Each multiplayer game has dedicated WebSocket service extending base service
- **Message Queue**: Handles offline message storage and replay on reconnection
- **Real-time Synchronization**: Game state synced between players in real-time
- **Connection Recovery**: Automatic reconnection with queued message replay

## Configuration

### API Endpoints (`src/config.ts`)
- **API_BASE_URL**: Backend server (currently AWS EC2)
- **WS_BASE_URL**: WebSocket server 
- **GOOGLE_SIGNIN_CONFIG**: OAuth configuration

### Key Dependencies
- **MobX 6**: State management with auto-observables
- **React Navigation v7**: Navigation stack
- **Firebase Auth + Google Sign-In**: Authentication flow
- **React Native Paper**: UI component framework
- **AsyncStorage**: Local persistence layer

## Development Guidelines (from .cursor/rules)

### Code Style
- **Indentation**: 2 spaces
- **Line Length**: 80 characters max
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Component Structure**: Each component has corresponding `styles/ComponentNameStyles.ts`

### Architecture Principles
- **Single Responsibility**: Each component/service has one clear purpose
- **DRY**: Extract reusable functions and components
- **Constants**: No hardcoded values, use constants files
- **Layered Architecture**: Clear separation between UI, business logic, and services

## Asset Organization

### Structured Asset Paths
- **Game Icons**: `src/assets/icons/{game-name}/`
- **Backgrounds**: `src/assets/images/common/`
- **Game-Specific Images**: `src/assets/images/{game-name}/`
- **Configuration Data**: `src/assets/data/`

## Backend Integration

- **Technology Stack**: Golang backend with MySQL + Redis
- **Real-time Communication**: WebSocket for multiplayer synchronization
- **Authentication**: JWT tokens with refresh token rotation
- **Deployment**: AWS infrastructure (EC2, S3, RDS)