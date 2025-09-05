import { action, computed, observable } from 'mobx';
import { BaseViewModel } from '../../infrastructure/mvvm/BaseViewModel';
import { 
  AuthModel, 
  LoginCredentials, 
  GoogleLoginData, 
  SignUpData,
  UserProfile,
  AuthTokens,
  UserCanLoginRule,
  UserCanSignUpRule,
  CanRequestEmailVerificationRule
} from '../models/AuthModel';
import { LoginService } from '../../services/LoginService';
import { SignUpService } from '../../services/SignUpService';
import { AuthService } from '../../services/AuthService';

export class AuthViewModel extends BaseViewModel {
  @observable private authModel: AuthModel;
  @observable public rememberMe: boolean = false;
  
  // Timer intervals
  private verificationTimerInterval: NodeJS.Timeout | null = null;
  private requestCooldownInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.authModel = new AuthModel();
  }

  // Computed properties for UI binding
  @computed get isLoggedIn(): boolean {
    return this.authModel.isLoggedIn;
  }

  @computed get currentUser(): UserProfile | null {
    return this.authModel.currentUser;
  }

  @computed get authState(): string {
    return this.authModel.authState;
  }

  @computed get emailVerification() {
    return this.authModel.emailVerification;
  }

  @computed get verificationTimer(): number {
    return this.authModel.verificationTimer;
  }

  @computed get nicknameValidation() {
    return this.authModel.nicknameValidation;
  }

  @computed get passwordValidation() {
    return this.authModel.passwordValidation;
  }

  @computed get agreements() {
    return this.authModel.agreements;
  }

  @computed get canRequestVerification(): boolean {
    return this.authModel.verificationTimer <= 0;
  }

  @computed get isFormValid(): boolean {
    return this.authModel.emailVerification?.isVerified === true &&
           this.authModel.nicknameValidation.isAvailable === true &&
           this.authModel.hasRequiredAgreements();
  }

  // Authentication methods

  /**
   * Login with email and password
   */
  @action
  public async login(credentials: LoginCredentials): Promise<boolean> {
    const rule = new UserCanLoginRule(credentials);
    if (!rule.isSatisfiedBy(this.authModel)) {
      this.setError(rule.getErrorMessage());
      return false;
    }

    return this.executeAsync(async () => {
      this.authModel.setAuthState('authenticating');

      const result = await LoginService.login(credentials.email, credentials.password);
      
      if (result.success) {
        // Fetch user data after successful login
        const userID = await AuthService.getUserID();
        if (userID) {
          const userData = await LoginService.fetchUserData(userID);
          if (userData.success) {
            const userProfile: UserProfile = {
              userID,
              email: credentials.email,
              name: userData.user?.name || '',
              profileImage: userData.profileImage
            };

            const tokens: AuthTokens = {
              accessToken: await AuthService.getAccessToken() || '',
              refreshToken: await AuthService.getRefreshToken() || undefined
            };

            this.authModel.setCurrentUser(userProfile);
            this.authModel.setTokens(tokens);
          }
        }
        
        this.authModel.setAuthState('authenticated');
        return true;
      } else {
        this.authModel.setAuthState('error');
        this.setError(result.message || '로그인에 실패했습니다.');
        return false;
      }
    }) !== null;
  }

  /**
   * Google login
   */
  @action
  public async googleLogin(data: GoogleLoginData): Promise<boolean> {
    return this.executeAsync(async () => {
      this.authModel.setAuthState('authenticating');

      const result = await LoginService.googleLogin(data.idToken);
      
      if (result.success) {
        // Fetch user data after successful Google login
        const userID = await AuthService.getUserID();
        if (userID) {
          const userData = await LoginService.fetchUserData(userID);
          if (userData.success) {
            const userProfile: UserProfile = {
              userID,
              email: userData.user?.email || '',
              name: userData.user?.name || '',
              profileImage: userData.profileImage
            };

            const tokens: AuthTokens = {
              accessToken: await AuthService.getAccessToken() || '',
              refreshToken: await AuthService.getRefreshToken() || undefined
            };

            this.authModel.setCurrentUser(userProfile);
            this.authModel.setTokens(tokens);
          }
        }
        
        this.authModel.setAuthState('authenticated');
        return true;
      } else {
        this.authModel.setAuthState('error');
        this.setError(result.message || '구글 로그인에 실패했습니다.');
        return false;
      }
    }) !== null;
  }

  /**
   * Sign up with email and password
   */
  @action
  public async signUp(data: SignUpData): Promise<boolean> {
    const rule = new UserCanSignUpRule(data);
    if (!rule.isSatisfiedBy(this.authModel)) {
      this.setError(rule.getErrorMessage());
      return false;
    }

    return this.executeAsync(async () => {
      this.authModel.setAuthState('authenticating');

      const result = await SignUpService.signUp(data.email, data.name, data.password, data.authCode);
      
      this.authModel.setAuthState('unauthenticated');
      return true; // Successful signup, user needs to login
    }) !== null;
  }

  /**
   * Logout current user
   */
  @action
  public async logout(): Promise<void> {
    return this.executeAsync(async () => {
      await AuthService.logout();
      this.authModel.clearAuthData();
      this.clearTimers();
    }) as Promise<void>;
  }

  /**
   * Check current authentication status
   */
  @action
  public async checkAuthStatus(): Promise<boolean> {
    return this.executeAsync(async () => {
      const userID = await AuthService.getUserID();
      const accessToken = await AuthService.getAccessToken();

      if (userID && accessToken) {
        const userData = await LoginService.fetchUserData(userID);
        if (userData.success) {
          const userProfile: UserProfile = {
            userID,
            email: userData.user?.email || '',
            name: userData.user?.name || '',
            profileImage: userData.profileImage
          };

          const tokens: AuthTokens = {
            accessToken,
            refreshToken: await AuthService.getRefreshToken() || undefined
          };

          this.authModel.setCurrentUser(userProfile);
          this.authModel.setTokens(tokens);
          return true;
        }
      }

      this.authModel.setAuthState('unauthenticated');
      return false;
    }) !== null;
  }

  // Email verification methods

  /**
   * Request email verification code
   */
  @action
  public async requestEmailVerification(email: string): Promise<boolean> {
    const rule = new CanRequestEmailVerificationRule(email);
    if (!rule.isSatisfiedBy(this.authModel)) {
      this.setError(rule.getErrorMessage());
      return false;
    }

    return this.executeAsync(async () => {
      await SignUpService.requestEmailVerification(email);
      
      this.authModel.setEmailVerification({
        email,
        code: '',
        isVerified: false,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      this.startVerificationTimer();
      return true;
    }) !== null;
  }

  /**
   * Verify email with code
   */
  @action
  public async verifyEmailCode(email: string, code: string): Promise<boolean> {
    return this.executeAsync(async () => {
      await SignUpService.verifyEmailCode(email, code);
      
      this.authModel.setEmailVerification({
        email,
        code,
        isVerified: true,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });

      this.clearTimers();
      return true;
    }) !== null;
  }

  /**
   * Start verification timer
   */
  @action
  private startVerificationTimer(): void {
    this.clearTimers();
    this.authModel.startVerificationTimer(600); // 10 minutes

    this.verificationTimerInterval = setInterval(() => {
      const newTime = this.authModel.verificationTimer - 1;
      this.authModel.updateVerificationTimer(newTime);
      
      if (newTime <= 0) {
        this.clearTimers();
      }
    }, 1000);
  }

  // Nickname validation methods

  /**
   * Check nickname availability
   */
  @action
  public async checkNickname(name: string): Promise<boolean> {
    if (!name.trim()) {
      this.authModel.setNicknameValidation(false, null, '닉네임을 입력해주세요.');
      return false;
    }

    return this.executeAsync(async () => {
      this.authModel.setNicknameValidation(true, null, '확인 중...');

      const result = await SignUpService.checkNickname(name);
      
      this.authModel.setNicknameValidation(
        false,
        result.isAvailable,
        result.message
      );

      return result.isAvailable;
    }, { showLoading: false }) !== null;
  }

  // Password validation

  /**
   * Validate password
   */
  @action
  public validatePassword(password: string): void {
    this.authModel.validatePassword(password);
  }

  // Agreement management

  /**
   * Set individual agreement
   */
  @action
  public setAgreement(type: keyof typeof this.authModel.agreements, value: boolean): void {
    this.authModel.setAgreement(type, value);
  }

  /**
   * Set all agreements
   */
  @action
  public setAllAgreements(value: boolean): void {
    this.authModel.setAllAgreements(value);
  }

  // Form validation

  /**
   * Validate login form
   */
  @action
  public validateLoginForm(credentials: LoginCredentials): string[] {
    return this.authModel.validateLoginCredentials(credentials);
  }

  /**
   * Validate signup form
   */
  @action
  public validateSignUpForm(data: SignUpData): string[] {
    return this.authModel.validateSignUpData(data);
  }

  // Event handlers for external subscriptions

  /**
   * Subscribe to authentication state changes
   */
  public onAuthStateChange(callback: (isLoggedIn: boolean, user: UserProfile | null) => void): () => void {
    // This would typically use MobX reactions or observers
    // For now, return a simple unsubscribe function
    return () => {};
  }

  /**
   * Subscribe to error events
   */
  public onError(callback: (error: string) => void): () => void {
    // This would typically use MobX reactions
    return () => {};
  }

  // Cleanup methods

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.verificationTimerInterval) {
      clearInterval(this.verificationTimerInterval);
      this.verificationTimerInterval = null;
    }

    if (this.requestCooldownInterval) {
      clearInterval(this.requestCooldownInterval);
      this.requestCooldownInterval = null;
    }
  }

  /**
   * Initialize the auth system
   */
  public async initialize(): Promise<void> {
    await this.checkAuthStatus();
    this.setInitialized(true);
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.clearTimers();
    super.cleanup();
  }
}