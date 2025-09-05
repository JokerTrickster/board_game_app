import { DomainModel, ModelValidationError } from '../../infrastructure/mvvm/BaseModel';
import { RootStackParamList } from '../navigationTypes';

/**
 * Navigation route information
 */
export interface RouteInfo {
  name: keyof RootStackParamList;
  params?: any;
  timestamp: Date;
}

/**
 * Navigation history entry
 */
export interface NavigationHistoryEntry {
  route: RouteInfo;
  action: 'navigate' | 'replace' | 'goBack' | 'reset';
  fromRoute?: RouteInfo;
}

/**
 * App state for navigation context
 */
export type AppState = 'active' | 'background' | 'inactive';

/**
 * Navigation stack state
 */
export interface NavigationStackState {
  index: number;
  routes: RouteInfo[];
  stale?: boolean;
}

/**
 * Deep linking configuration
 */
export interface DeepLinkConfig {
  scheme: string;
  prefixes: string[];
  config: {
    screens: Record<keyof RootStackParamList, string>;
  };
}

/**
 * Domain model for Navigation state and routing logic
 */
export class NavigationModel extends DomainModel {
  // Current navigation state
  public currentRoute: RouteInfo | null = null;
  public previousRoute: RouteInfo | null = null;
  public isNavigating: boolean = false;
  public canGoBack: boolean = false;

  // Navigation history
  public navigationHistory: NavigationHistoryEntry[] = [];
  public maxHistorySize: number = 50;

  // App lifecycle
  public appState: AppState = 'active';
  public isAppFocused: boolean = true;

  // Navigation stack
  public navigationStack: NavigationStackState = {
    index: 0,
    routes: []
  };

  // Deep linking
  public deepLinkConfig: DeepLinkConfig | null = null;
  public pendingDeepLink: string | null = null;

  // Navigation guards and interceptors
  public navigationGuards: Map<keyof RootStackParamList, (params?: any) => boolean> = new Map();
  public routeInterceptors: Map<keyof RootStackParamList, (params?: any) => any> = new Map();

  constructor() {
    super();
  }

  // Current Route Management

  /**
   * Set current route
   */
  setCurrentRoute(routeName: keyof RootStackParamList, params?: any): void {
    const newRoute: RouteInfo = {
      name: routeName,
      params,
      timestamp: new Date()
    };

    this.previousRoute = this.currentRoute;
    this.currentRoute = newRoute;
    this.updateNavigationStack(newRoute);
    this.touch();
  }

  /**
   * Update navigation stack
   */
  private updateNavigationStack(route: RouteInfo): void {
    const existingIndex = this.navigationStack.routes.findIndex(r => r.name === route.name);
    
    if (existingIndex >= 0) {
      // Update existing route
      this.navigationStack.routes[existingIndex] = route;
      this.navigationStack.index = existingIndex;
    } else {
      // Add new route
      this.navigationStack.routes.push(route);
      this.navigationStack.index = this.navigationStack.routes.length - 1;
    }

    this.canGoBack = this.navigationStack.index > 0;
  }

  /**
   * Set navigation state
   */
  setNavigating(isNavigating: boolean): void {
    this.isNavigating = isNavigating;
    this.touch();
  }

  // History Management

  /**
   * Add navigation history entry
   */
  addHistoryEntry(
    action: NavigationHistoryEntry['action'],
    route: RouteInfo,
    fromRoute?: RouteInfo
  ): void {
    const entry: NavigationHistoryEntry = {
      action,
      route,
      fromRoute,
    };

    this.navigationHistory.unshift(entry);
    
    // Limit history size
    if (this.navigationHistory.length > this.maxHistorySize) {
      this.navigationHistory = this.navigationHistory.slice(0, this.maxHistorySize);
    }

    this.touch();
  }

  /**
   * Clear navigation history
   */
  clearHistory(): void {
    this.navigationHistory = [];
    this.touch();
  }

  /**
   * Get recent navigation history
   */
  getRecentHistory(limit: number = 10): NavigationHistoryEntry[] {
    return this.navigationHistory.slice(0, limit);
  }

  /**
   * Find last occurrence of route in history
   */
  findLastRouteInHistory(routeName: keyof RootStackParamList): NavigationHistoryEntry | null {
    return this.navigationHistory.find(entry => entry.route.name === routeName) || null;
  }

  // App State Management

  /**
   * Set app state
   */
  setAppState(state: AppState): void {
    this.appState = state;
    this.isAppFocused = state === 'active';
    this.touch();
  }

  /**
   * Check if app is in foreground
   */
  isAppInForeground(): boolean {
    return this.appState === 'active';
  }

  // Navigation Guards

  /**
   * Add navigation guard
   */
  addNavigationGuard(
    routeName: keyof RootStackParamList, 
    guard: (params?: any) => boolean
  ): void {
    this.navigationGuards.set(routeName, guard);
    this.touch();
  }

  /**
   * Remove navigation guard
   */
  removeNavigationGuard(routeName: keyof RootStackParamList): void {
    this.navigationGuards.delete(routeName);
    this.touch();
  }

  /**
   * Check if navigation is allowed
   */
  canNavigateTo(routeName: keyof RootStackParamList, params?: any): boolean {
    const guard = this.navigationGuards.get(routeName);
    return guard ? guard(params) : true;
  }

  // Route Interceptors

  /**
   * Add route interceptor
   */
  addRouteInterceptor(
    routeName: keyof RootStackParamList,
    interceptor: (params?: any) => any
  ): void {
    this.routeInterceptors.set(routeName, interceptor);
    this.touch();
  }

  /**
   * Remove route interceptor
   */
  removeRouteInterceptor(routeName: keyof RootStackParamList): void {
    this.routeInterceptors.delete(routeName);
    this.touch();
  }

  /**
   * Apply route interceptor
   */
  applyRouteInterceptor(routeName: keyof RootStackParamList, params?: any): any {
    const interceptor = this.routeInterceptors.get(routeName);
    return interceptor ? interceptor(params) : params;
  }

  // Deep Linking

  /**
   * Set deep link configuration
   */
  setDeepLinkConfig(config: DeepLinkConfig): void {
    this.deepLinkConfig = config;
    this.touch();
  }

  /**
   * Set pending deep link
   */
  setPendingDeepLink(url: string | null): void {
    this.pendingDeepLink = url;
    this.touch();
  }

  /**
   * Parse deep link URL
   */
  parseDeepLink(url: string): { route: keyof RootStackParamList; params?: any } | null {
    if (!this.deepLinkConfig) return null;

    // Simple URL parsing logic
    const urlObj = new URL(url);
    const path = urlObj.pathname.substring(1); // Remove leading slash
    
    // Find matching screen
    for (const [screenName, pattern] of Object.entries(this.deepLinkConfig.config.screens)) {
      if (path === pattern || path.startsWith(pattern + '/')) {
        return {
          route: screenName as keyof RootStackParamList,
          params: this.extractParamsFromUrl(urlObj)
        };
      }
    }

    return null;
  }

  /**
   * Extract parameters from URL
   */
  private extractParamsFromUrl(url: URL): any {
    const params: any = {};
    
    // Extract query parameters
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return Object.keys(params).length > 0 ? params : undefined;
  }

  // Navigation Analytics

  /**
   * Get navigation statistics
   */
  getNavigationStats(): {
    totalNavigations: number;
    routeFrequency: Record<string, number>;
    averageSessionTime: number;
    mostVisitedRoute: string | null;
  } {
    const totalNavigations = this.navigationHistory.length;
    const routeFrequency: Record<string, number> = {};
    
    // Calculate route frequency
    this.navigationHistory.forEach(entry => {
      const routeName = entry.route.name;
      routeFrequency[routeName] = (routeFrequency[routeName] || 0) + 1;
    });

    // Find most visited route
    let mostVisitedRoute: string | null = null;
    let maxFrequency = 0;
    Object.entries(routeFrequency).forEach(([route, frequency]) => {
      if (frequency > maxFrequency) {
        maxFrequency = frequency;
        mostVisitedRoute = route;
      }
    });

    // Calculate average session time (simplified)
    const sessionTimes = this.navigationHistory.map((_, index, arr) => {
      if (index === arr.length - 1) return 0;
      return arr[index].route.timestamp.getTime() - arr[index + 1].route.timestamp.getTime();
    });

    const averageSessionTime = sessionTimes.length > 0 
      ? sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length 
      : 0;

    return {
      totalNavigations,
      routeFrequency,
      averageSessionTime,
      mostVisitedRoute
    };
  }

  /**
   * Reset navigation state
   */
  resetNavigationState(): void {
    this.currentRoute = null;
    this.previousRoute = null;
    this.isNavigating = false;
    this.canGoBack = false;
    this.navigationStack = { index: 0, routes: [] };
    this.clearHistory();
    this.touch();
  }

  // Domain Model Implementation
  protected serialize(): Record<string, any> {
    const stats = this.getNavigationStats();
    
    return {
      currentRoute: this.currentRoute,
      previousRoute: this.previousRoute,
      isNavigating: this.isNavigating,
      canGoBack: this.canGoBack,
      appState: this.appState,
      isAppFocused: this.isAppFocused,
      navigationStack: this.navigationStack,
      historyCount: this.navigationHistory.length,
      hasPendingDeepLink: !!this.pendingDeepLink,
      guardsCount: this.navigationGuards.size,
      interceptorsCount: this.routeInterceptors.size,
      stats
    };
  }

  protected validateModel(): ModelValidationError[] {
    const errors: ModelValidationError[] = [];

    if (this.navigationHistory.length > this.maxHistorySize) {
      errors.push({
        field: 'navigationHistory',
        message: 'Navigation history exceeds maximum size',
        code: 'INVALID_SIZE',
      });
    }

    if (this.navigationStack.index < 0 || 
        this.navigationStack.index >= this.navigationStack.routes.length) {
      errors.push({
        field: 'navigationStack.index',
        message: 'Navigation stack index is out of bounds',
        code: 'INVALID_RANGE',
      });
    }

    if (this.currentRoute && this.navigationStack.routes.length === 0) {
      errors.push({
        field: 'navigationStack',
        message: 'Current route exists but navigation stack is empty',
        code: 'INCONSISTENT_STATE',
      });
    }

    return errors;
  }
}