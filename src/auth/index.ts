// Authentication MVVM Components Export

// Models
export { 
  AuthModel,
  UserCanLoginRule,
  UserCanSignUpRule,
  CanRequestEmailVerificationRule
} from './models/AuthModel';
export type {
  UserProfile,
  AuthTokens,
  LoginCredentials,
  GoogleLoginData,
  SignUpData,
  EmailVerificationData,
  AuthState
} from './models/AuthModel';

// ViewModels
export { AuthViewModel } from './viewModels/AuthViewModel';

// Views
export { default as LoginView } from './views/LoginView';
export { default as SignUpView } from './views/SignUpView';

// Screens (MVVM Controllers)
export { default as LoginScreen } from './LoginScreen_MVVM';
export { default as SignUpScreen } from './SignUpScreen_MVVM';

// Legacy components (for backward compatibility during migration)
export { default as LegacyLoginScreen } from '../screens/LoginScreen';
export { default as LegacySignUpScreen } from '../screens/SignUpScreen';