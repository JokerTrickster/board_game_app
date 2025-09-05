// Authentication Module Types

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptMarketing?: boolean;
}

export interface EmailVerification {
  email: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthConfig {
  loginEndpoint: string;
  signupEndpoint: string;
  refreshEndpoint: string;
  verifyEmailEndpoint: string;
  tokenStorageKey: string;
  userStorageKey: string;
}

export type AuthEvent =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthUser; tokens: AuthTokens } }
  | { type: 'LOGIN_ERROR'; payload: { error: string } }
  | { type: 'LOGOUT' }
  | { type: 'TOKEN_REFRESH'; payload: { tokens: AuthTokens } }
  | { type: 'SESSION_EXPIRED' };

export interface AuthServiceInterface {
  login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }>;
  signup(data: SignUpData): Promise<void>;
  logout(): Promise<void>;
  refreshToken(): Promise<AuthTokens>;
  verifyEmail(email: string, code: string): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
}

// Error types
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public rule: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
