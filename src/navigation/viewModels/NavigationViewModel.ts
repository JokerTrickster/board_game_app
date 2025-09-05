import { action, computed, observable } from 'mobx';
import { AppState as RNAppState } from 'react-native';
import { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { BaseViewModel } from '../../infrastructure/mvvm/BaseViewModel';
import { NavigationModel, RouteInfo, AppState } from '../models/NavigationModel';
import { RootStackParamList } from '../navigationTypes';

export class NavigationViewModel extends BaseViewModel {
  @observable private navigationModel: NavigationModel;
  @observable public navigationRef: NavigationContainerRefWithCurrent<RootStackParamList> | null = null;

  // App state listener
  private appStateSubscription: any = null;

  constructor() {
    super();
    this.navigationModel = new NavigationModel();
    this.setupAppStateListener();
  }

  // Computed properties for UI binding
  @computed get currentRoute(): RouteInfo | null {
    return this.navigationModel.currentRoute;
  }

  @computed get previousRoute(): RouteInfo | null {
    return this.navigationModel.previousRoute;
  }

  @computed get isNavigating(): boolean {
    return this.navigationModel.isNavigating;
  }

  @computed get canGoBack(): boolean {
    return this.navigationModel.canGoBack;
  }

  @computed get appState(): AppState {
    return this.navigationModel.appState;
  }

  @computed get isAppFocused(): boolean {
    return this.navigationModel.isAppFocused;
  }

  @computed get navigationHistory() {
    return this.navigationModel.getRecentHistory(10);
  }

  @computed get navigationStats() {
    return this.navigationModel.getNavigationStats();
  }

  // Navigation Reference Management

  /**
   * Set navigation reference
   */
  @action
  public setNavigationRef(ref: NavigationContainerRefWithCurrent<RootStackParamList> | null): void {
    this.navigationRef = ref;
    this.touch();
  }

  /**
   * Check if navigation is ready
   */
  @action
  public isNavigationReady(): boolean {
    return !!this.navigationRef?.isReady();
  }

  // Core Navigation Methods

  /**
   * Navigate to a screen
   */
  @action
  public async navigate<RouteName extends keyof RootStackParamList>(
    name: RouteName,
    params?: RootStackParamList[RouteName]
  ): Promise<boolean> {
    if (!this.isNavigationReady()) {
      this.setError('Navigation not ready');
      return false;
    }

    // Check navigation guard
    if (!this.navigationModel.canNavigateTo(name, params)) {
      this.setError('Navigation blocked by guard');
      return false;
    }

    return this.executeAsync(async () => {
      this.navigationModel.setNavigating(true);

      try {
        // Apply route interceptor
        const interceptedParams = this.navigationModel.applyRouteInterceptor(name, params);
        
        // Record navigation in history
        const fromRoute = this.navigationModel.currentRoute;
        this.navigationModel.addHistoryEntry('navigate', { 
          name, 
          params: interceptedParams, 
          timestamp: new Date() 
        }, fromRoute || undefined);

        // Update current route
        this.navigationModel.setCurrentRoute(name, interceptedParams);

        // Perform navigation
        this.navigationRef!.navigate(name as any, interceptedParams);

        return true;
      } finally {
        this.navigationModel.setNavigating(false);
      }
    }) !== null;
  }

  /**
   * Replace current screen
   */
  @action
  public async replace<RouteName extends keyof RootStackParamList>(
    name: RouteName,
    params?: RootStackParamList[RouteName]
  ): Promise<boolean> {
    if (!this.isNavigationReady()) {
      this.setError('Navigation not ready');
      return false;
    }

    return this.executeAsync(async () => {
      this.navigationModel.setNavigating(true);

      try {
        // Apply route interceptor
        const interceptedParams = this.navigationModel.applyRouteInterceptor(name, params);
        
        // Record navigation in history
        const fromRoute = this.navigationModel.currentRoute;
        this.navigationModel.addHistoryEntry('replace', { 
          name, 
          params: interceptedParams, 
          timestamp: new Date() 
        }, fromRoute || undefined);

        // Update current route
        this.navigationModel.setCurrentRoute(name, interceptedParams);

        // Perform replace
        this.navigationRef!.dispatch({
          type: 'REPLACE',
          payload: { name, params: interceptedParams }
        });

        return true;
      } finally {
        this.navigationModel.setNavigating(false);
      }
    }) !== null;
  }

  /**
   * Go back to previous screen
   */
  @action
  public async goBack(): Promise<boolean> {
    if (!this.isNavigationReady() || !this.navigationModel.canGoBack) {
      return false;
    }

    return this.executeAsync(async () => {
      this.navigationModel.setNavigating(true);

      try {
        // Record navigation in history
        const fromRoute = this.navigationModel.currentRoute;
        if (this.navigationModel.previousRoute) {
          this.navigationModel.addHistoryEntry('goBack', 
            this.navigationModel.previousRoute, 
            fromRoute || undefined
          );
        }

        // Perform go back
        this.navigationRef!.goBack();

        // Update current route to previous
        const previousRoute = this.navigationModel.previousRoute;
        if (previousRoute) {
          this.navigationModel.setCurrentRoute(previousRoute.name, previousRoute.params);
        }

        return true;
      } finally {
        this.navigationModel.setNavigating(false);
      }
    }) !== null;
  }

  /**
   * Reset navigation stack
   */
  @action
  public async reset(routes: Array<{ name: keyof RootStackParamList; params?: any }>): Promise<boolean> {
    if (!this.isNavigationReady()) {
      this.setError('Navigation not ready');
      return false;
    }

    return this.executeAsync(async () => {
      this.navigationModel.setNavigating(true);

      try {
        // Record navigation in history
        const fromRoute = this.navigationModel.currentRoute;
        const targetRoute = routes[routes.length - 1];
        
        this.navigationModel.addHistoryEntry('reset', {
          name: targetRoute.name,
          params: targetRoute.params,
          timestamp: new Date()
        }, fromRoute || undefined);

        // Reset navigation stack
        this.navigationRef!.reset({
          index: routes.length - 1,
          routes: routes.map(route => ({ name: route.name, params: route.params }))
        });

        // Update current route
        this.navigationModel.setCurrentRoute(targetRoute.name, targetRoute.params);

        return true;
      } finally {
        this.navigationModel.setNavigating(false);
      }
    }) !== null;
  }

  // Deep Linking

  /**
   * Handle deep link
   */
  @action
  public async handleDeepLink(url: string): Promise<boolean> {
    const parsedLink = this.navigationModel.parseDeepLink(url);
    if (!parsedLink) {
      this.setError('Invalid deep link format');
      return false;
    }

    if (!this.isNavigationReady()) {
      this.navigationModel.setPendingDeepLink(url);
      return false;
    }

    return this.navigate(parsedLink.route, parsedLink.params);
  }

  /**
   * Process pending deep link
   */
  @action
  public async processPendingDeepLink(): Promise<boolean> {
    const pendingLink = this.navigationModel.pendingDeepLink;
    if (!pendingLink) return false;

    this.navigationModel.setPendingDeepLink(null);
    return this.handleDeepLink(pendingLink);
  }

  // Navigation Guards and Interceptors

  /**
   * Add authentication guard
   */
  @action
  public addAuthGuard(routes: (keyof RootStackParamList)[]): void {
    routes.forEach(route => {
      this.navigationModel.addNavigationGuard(route, () => {
        // Check authentication status
        // This would typically check with AuthViewModel
        return true; // Simplified for now
      });
    });
  }

  /**
   * Add loading interceptor
   */
  @action
  public addLoadingInterceptor(route: keyof RootStackParamList): void {
    this.navigationModel.addRouteInterceptor(route, (params) => {
      // Add loading state to params
      return { ...params, showLoading: true };
    });
  }

  /**
   * Remove navigation guard
   */
  @action
  public removeNavigationGuard(route: keyof RootStackParamList): void {
    this.navigationModel.removeNavigationGuard(route);
  }

  // App Lifecycle Management

  /**
   * Setup app state listener
   */
  private setupAppStateListener(): void {
    this.appStateSubscription = RNAppState.addEventListener('change', (nextAppState) => {
      this.handleAppStateChange(nextAppState as AppState);
    });
  }

  /**
   * Handle app state change
   */
  @action
  private handleAppStateChange(nextAppState: AppState): void {
    const previousState = this.navigationModel.appState;
    this.navigationModel.setAppState(nextAppState);

    // Handle app state transitions
    if (previousState === 'background' && nextAppState === 'active') {
      this.onAppForegrounded();
    } else if (previousState === 'active' && nextAppState === 'background') {
      this.onAppBackgrounded();
    }
  }

  /**
   * Handle app foregrounded
   */
  @action
  private async onAppForegrounded(): Promise<void> {
    // Process pending deep link if any
    await this.processPendingDeepLink();

    // Refresh current screen data if needed
    this.notifyScreenRefresh();
  }

  /**
   * Handle app backgrounded
   */
  @action
  private onAppBackgrounded(): void {
    // Clear sensitive data if needed
    this.handleAppBackgrounding();
  }

  // Screen Management

  /**
   * Get current screen name
   */
  @action
  public getCurrentScreenName(): keyof RootStackParamList | null {
    return this.navigationModel.currentRoute?.name || null;
  }

  /**
   * Check if screen is current
   */
  @action
  public isCurrentScreen(screenName: keyof RootStackParamList): boolean {
    return this.navigationModel.currentRoute?.name === screenName;
  }

  /**
   * Get screen parameters
   */
  @action
  public getScreenParams<RouteName extends keyof RootStackParamList>(
    screenName?: RouteName
  ): RootStackParamList[RouteName] | undefined {
    const route = screenName 
      ? this.navigationModel.navigationHistory.find(entry => entry.route.name === screenName)?.route
      : this.navigationModel.currentRoute;
    
    return route?.params;
  }

  // Event Handlers for external subscriptions

  /**
   * Subscribe to navigation events
   */
  public onNavigationChange(callback: (route: RouteInfo | null) => void): () => void {
    // This would typically use MobX reactions
    return () => {};
  }

  /**
   * Subscribe to app state changes
   */
  public onAppStateChange(callback: (state: AppState) => void): () => void {
    // This would typically use MobX reactions
    return () => {};
  }

  /**
   * Notify screen refresh
   */
  @action
  private notifyScreenRefresh(): void {
    // Emit refresh event for current screen
    // This would typically be handled by screen-specific ViewModels
  }

  /**
   * Handle app backgrounding
   */
  @action
  private handleAppBackgrounding(): void {
    // Handle any cleanup needed when app goes to background
    // This could include clearing sensitive data, pausing operations, etc.
  }

  // Analytics and Monitoring

  /**
   * Track screen view
   */
  @action
  public trackScreenView(screenName: keyof RootStackParamList, params?: any): void {
    // This would integrate with analytics services
    console.log(`Screen view: ${screenName}`, params);
  }

  /**
   * Get navigation performance metrics
   */
  @action
  public getPerformanceMetrics(): any {
    return {
      navigationStats: this.navigationModel.getNavigationStats(),
      currentMemoryUsage: this.navigationModel.navigationHistory.length,
      isPerformanceOptimal: this.navigationModel.navigationHistory.length < 30
    };
  }

  // Initialization and Cleanup

  /**
   * Initialize navigation system
   */
  public async initialize(): Promise<void> {
    // Setup deep link configuration
    this.navigationModel.setDeepLinkConfig({
      scheme: 'boardgameapp',
      prefixes: ['https://boardgame.app', 'boardgameapp://'],
      config: {
        screens: {
          Home: 'home',
          Login: 'login',
          SignUp: 'signup',
          FindIt: 'findit',
          SoloFindIt: 'findit/solo',
          SlimeWar: 'slimewar',
          GameDetail: 'game/:game',
          Loading: 'loading',
          FindItGameOver: 'findit/gameover',
          SoloFindItResult: 'findit/solo/result',
          MultiFindItResult: 'findit/multi/result',
          SlimeWarResult: 'slimewar/result',
          Password: 'password',
          Sequence: 'sequence',
          SequenceResult: 'sequence/result',
          Frog: 'frog',
          FrogResult: 'frog/result'
        }
      }
    });

    this.setInitialized(true);
  }

  /**
   * Cleanup navigation resources
   */
  public cleanup(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    this.navigationModel.resetNavigationState();
    super.cleanup();
  }
}