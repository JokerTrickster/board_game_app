import { DomainModel, ModelValidationError, BusinessRule } from '../../infrastructure/mvvm/BaseModel';

/**
 * User profile data
 */
export interface UserProfile {
  userID: number;
  email: string;
  name: string;
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Google login data
 */
export interface GoogleLoginData {
  idToken: string;
  serverAuthCode?: string;
}

/**
 * Sign up form data
 */
export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  authCode: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeAge: boolean;
  agreeMarketing?: boolean;
}

/**
 * Email verification data
 */
export interface EmailVerificationData {
  email: string;
  code: string;
  isVerified: boolean;
  expiresAt?: Date;
}

/**
 * Authentication state
 */
export type AuthState = 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated' | 'error';

/**
 * Domain model for Authentication state and user data
 */
export class AuthModel extends DomainModel {
  // Authentication state
  public authState: AuthState = 'idle';
  public isLoggedIn: boolean = false;
  public lastLoginAt: Date | null = null;

  // User data
  public currentUser: UserProfile | null = null;
  public tokens: AuthTokens | null = null;

  // Email verification state
  public emailVerification: EmailVerificationData | null = null;
  public verificationTimer: number = 0;

  // Nickname validation
  public nicknameValidation: {
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  } = {
    isChecking: false,
    isAvailable: null,
    message: '',
  };

  // Password validation
  public passwordValidation: {
    isValid: boolean;
    errors: string[];
  } = {
    isValid: false,
    errors: [],
  };

  // Agreement states
  public agreements: {
    agreeAll: boolean;
    agreeAge: boolean;
    agreeTerms: boolean;
    agreePrivacy: boolean;
    agreeMarketing: boolean;
  } = {
    agreeAll: false,
    agreeAge: false,
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  };

  constructor() {
    super();
  }

  // Authentication methods

  /**
   * Set authentication state
   */
  setAuthState(state: AuthState): void {
    this.authState = state;
    this.isLoggedIn = state === 'authenticated';
    this.touch();
  }

  /**
   * Set current user data
   */
  setCurrentUser(user: UserProfile | null): void {
    this.currentUser = user;
    if (user) {
      this.setAuthState('authenticated');
      this.lastLoginAt = new Date();
    } else {
      this.setAuthState('unauthenticated');
      this.lastLoginAt = null;
    }
  }

  /**
   * Set authentication tokens
   */
  setTokens(tokens: AuthTokens | null): void {
    this.tokens = tokens;
    this.touch();
  }

  /**
   * Check if tokens are expired
   */
  areTokensExpired(): boolean {
    if (!this.tokens?.expiresAt) {return false;}
    return new Date() > this.tokens.expiresAt;
  }

  /**
   * Clear authentication data
   */
  clearAuthData(): void {
    this.currentUser = null;
    this.tokens = null;
    this.setAuthState('unauthenticated');
    this.touch();
  }

  // Email verification methods

  /**
   * Set email verification data
   */
  setEmailVerification(data: EmailVerificationData | null): void {
    this.emailVerification = data;
    this.touch();
  }

  /**
   * Start verification timer
   */
  startVerificationTimer(seconds: number = 600): void {
    this.verificationTimer = seconds;
    this.touch();
  }

  /**
   * Update verification timer
   */
  updateVerificationTimer(seconds: number): void {
    this.verificationTimer = Math.max(0, seconds);
    this.touch();
  }

  /**
   * Check if verification code is expired
   */
  isVerificationExpired(): boolean {
    if (!this.emailVerification?.expiresAt) {return false;}
    return new Date() > this.emailVerification.expiresAt;
  }

  // Nickname validation methods

  /**
   * Set nickname validation state
   */
  setNicknameValidation(isChecking: boolean, isAvailable: boolean | null, message: string): void {
    this.nicknameValidation = {
      isChecking,
      isAvailable,
      message,
    };
    this.touch();
  }

  // Password validation methods

  /**
   * Validate password strength
   */
  validatePassword(password: string): void {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('비밀번호는 8자 이상이어야 합니다.');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('대문자를 포함해야 합니다.');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('소문자를 포함해야 합니다.');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('숫자를 포함해야 합니다.');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('특수문자를 포함해야 합니다.');
    }

    this.passwordValidation = {
      isValid: errors.length === 0,
      errors,
    };
    this.touch();
  }

  // Agreement methods

  /**
   * Set individual agreement
   */
  setAgreement(type: keyof typeof this.agreements, value: boolean): void {
    this.agreements[type] = value;

    // Update agreeAll based on required agreements
    if (type !== 'agreeAll') {
      this.agreements.agreeAll = this.agreements.agreeAge &&
                                 this.agreements.agreeTerms &&
                                 this.agreements.agreePrivacy;
    }

    this.touch();
  }

  /**
   * Set all agreements
   */
  setAllAgreements(value: boolean): void {
    this.agreements.agreeAll = value;
    this.agreements.agreeAge = value;
    this.agreements.agreeTerms = value;
    this.agreements.agreePrivacy = value;
    if (value) {
      this.agreements.agreeMarketing = value;
    }
    this.touch();
  }

  /**
   * Check if required agreements are accepted
   */
  hasRequiredAgreements(): boolean {
    return this.agreements.agreeAge &&
           this.agreements.agreeTerms &&
           this.agreements.agreePrivacy;
  }

  // Validation methods

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate login credentials
   */
  validateLoginCredentials(credentials: LoginCredentials): string[] {
    const errors: string[] = [];

    if (!credentials.email.trim()) {
      errors.push('이메일을 입력해주세요.');
    } else if (!this.validateEmail(credentials.email)) {
      errors.push('올바른 이메일 형식을 입력해주세요.');
    }

    if (!credentials.password.trim()) {
      errors.push('비밀번호를 입력해주세요.');
    }

    return errors;
  }

  /**
   * Validate sign up data
   */
  validateSignUpData(data: SignUpData): string[] {
    const errors: string[] = [];

    if (!data.email.trim()) {
      errors.push('이메일을 입력해주세요.');
    } else if (!this.validateEmail(data.email)) {
      errors.push('올바른 이메일 형식을 입력해주세요.');
    }

    if (!data.name.trim()) {
      errors.push('닉네임을 입력해주세요.');
    }

    if (!data.password.trim()) {
      errors.push('비밀번호를 입력해주세요.');
    } else {
      this.validatePassword(data.password);
      if (!this.passwordValidation.isValid) {
        errors.push(...this.passwordValidation.errors);
      }
    }

    if (data.password !== data.confirmPassword) {
      errors.push('비밀번호가 일치하지 않습니다.');
    }

    if (!data.authCode.trim()) {
      errors.push('인증코드를 입력해주세요.');
    }

    if (!data.agreeAge || !data.agreeTerms || !data.agreePrivacy) {
      errors.push('필수 약관에 동의해주세요.');
    }

    return errors;
  }

  // Domain Model Implementation
  protected serialize(): Record<string, any> {
    return {
      authState: this.authState,
      isLoggedIn: this.isLoggedIn,
      lastLoginAt: this.lastLoginAt,
      currentUser: this.currentUser,
      tokens: this.tokens ? {
        accessToken: '***', // Don't expose tokens in serialization
        hasRefreshToken: !!this.tokens.refreshToken,
        expiresAt: this.tokens.expiresAt,
      } : null,
      emailVerification: this.emailVerification,
      verificationTimer: this.verificationTimer,
      nicknameValidation: this.nicknameValidation,
      passwordValidation: {
        isValid: this.passwordValidation.isValid,
        errorCount: this.passwordValidation.errors.length,
      },
      agreements: this.agreements,
    };
  }

  protected validateModel(): ModelValidationError[] {
    const errors: ModelValidationError[] = [];

    if (this.isLoggedIn && !this.currentUser) {
      errors.push({
        field: 'currentUser',
        message: 'User must be set when logged in',
        code: 'REQUIRED',
      });
    }

    if (this.isLoggedIn && !this.tokens) {
      errors.push({
        field: 'tokens',
        message: 'Tokens must be set when logged in',
        code: 'REQUIRED',
      });
    }

    if (this.currentUser && !this.validateEmail(this.currentUser.email)) {
      errors.push({
        field: 'currentUser.email',
        message: 'Invalid email format',
        code: 'INVALID_FORMAT',
      });
    }

    if (this.verificationTimer < 0) {
      errors.push({
        field: 'verificationTimer',
        message: 'Timer cannot be negative',
        code: 'INVALID_RANGE',
      });
    }

    return errors;
  }
}

// Business Rules

export class UserCanLoginRule implements BusinessRule<AuthModel> {
  constructor(
    private credentials: LoginCredentials
  ) {}

  isSatisfiedBy(model: AuthModel): boolean {
    if (model.authState === 'authenticating') {
      return false; // Already authenticating
    }

    const errors = model.validateLoginCredentials(this.credentials);
    return errors.length === 0;
  }

  getErrorMessage(): string {
    return 'Invalid login credentials or authentication in progress';
  }
}

export class UserCanSignUpRule implements BusinessRule<AuthModel> {
  constructor(
    private signUpData: SignUpData
  ) {}

  isSatisfiedBy(model: AuthModel): boolean {
    if (model.authState === 'authenticating') {
      return false; // Already authenticating
    }

    if (!model.emailVerification?.isVerified) {
      return false; // Email not verified
    }

    if (model.nicknameValidation.isAvailable !== true) {
      return false; // Nickname not available
    }

    const errors = model.validateSignUpData(this.signUpData);
    return errors.length === 0;
  }

  getErrorMessage(): string {
    return 'Sign up requirements not met: verify email, check nickname, and ensure all fields are valid';
  }
}

export class CanRequestEmailVerificationRule implements BusinessRule<AuthModel> {
  constructor(
    private email: string
  ) {}

  isSatisfiedBy(model: AuthModel): boolean {
    if (!model.validateEmail(this.email)) {
      return false;
    }

    // Check if we can request (not currently requesting or recently requested)
    if (model.verificationTimer > 0) {
      return false;
    }

    return true;
  }

  getErrorMessage(): string {
    return 'Cannot request email verification: invalid email or too soon since last request';
  }
}
