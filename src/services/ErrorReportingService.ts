import { Platform, AppState } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ErrorReport {
  error: Error | string;
  stackTrace?: string;
  userId?: string;
  screen: string;
  action: string;
  timestamp: Date;
  deviceInfo: any;
  appState: any;
  fatal?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  userAgent?: string;
  sessionId?: string;
}

export interface BreadcrumbItem {
  timestamp: Date;
  category: 'navigation' | 'user_action' | 'network' | 'system' | 'error';
  message: string;
  data?: any;
  level: 'debug' | 'info' | 'warning' | 'error';
}

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private breadcrumbs: BreadcrumbItem[] = [];
  private sessionId: string = '';
  private userId?: string;
  private currentScreen: string = 'Unknown';
  private lastAction: string = 'Unknown';
  private isEnabled: boolean = true;
  private maxBreadcrumbs: number = 50;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupErrorHandlers();
    this.loadUserConsent();
  }

  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  /**
   * Initialize error reporting service
   */
  public async initialize(userId?: string) {
    this.userId = userId;
    this.addBreadcrumb({
      category: 'system',
      message: 'Error reporting service initialized',
      level: 'info',
      data: { userId, sessionId: this.sessionId },
    });
  }

  /**
   * Set user consent for error reporting
   */
  public async setUserConsent(consent: boolean) {
    this.isEnabled = consent;
    await AsyncStorage.setItem('error_reporting_consent', consent.toString());

    this.addBreadcrumb({
      category: 'system',
      message: `Error reporting ${consent ? 'enabled' : 'disabled'}`,
      level: 'info',
    });
  }

  /**
   * Load user consent from storage
   */
  private async loadUserConsent() {
    try {
      const consent = await AsyncStorage.getItem('error_reporting_consent');
      if (consent !== null) {
        this.isEnabled = consent === 'true';
      }
    } catch (error) {
      console.error('Failed to load error reporting consent:', error);
    }
  }

  /**
   * Set current screen name for context
   */
  public setCurrentScreen(screenName: string) {
    this.currentScreen = screenName;
    this.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${screenName}`,
      level: 'info',
      data: { screen: screenName },
    });
  }

  /**
   * Set last user action for context
   */
  public setLastAction(action: string, data?: any) {
    this.lastAction = action;
    this.addBreadcrumb({
      category: 'user_action',
      message: action,
      level: 'info',
      data,
    });
  }

  /**
   * Add breadcrumb for tracking user journey
   */
  public addBreadcrumb(breadcrumb: Omit<BreadcrumbItem, 'timestamp'>) {
    if (!this.isEnabled) {return;}

    const item: BreadcrumbItem = {
      ...breadcrumb,
      timestamp: new Date(),
    };

    this.breadcrumbs.push(item);

    // Keep only the latest breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * Report error manually
   */
  public async reportError(
    error: Error | string,
    context?: {
      screen?: string;
      action?: string;
      fatal?: boolean;
      extra?: any;
    }
  ) {
    if (!this.isEnabled) {return;}

    try {
      const errorReport = await this.createErrorReport(error, {
        screen: context?.screen || this.currentScreen,
        action: context?.action || this.lastAction,
        fatal: context?.fatal || false,
        extra: context?.extra,
      });

      await this.sendErrorReport(errorReport);

      this.addBreadcrumb({
        category: 'error',
        message: `Error reported: ${typeof error === 'string' ? error : error.message}`,
        level: 'error',
        data: context,
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  /**
   * Setup global error handlers
   */
  private setupErrorHandlers() {
    // Handle JavaScript errors
    if (typeof ErrorUtils !== 'undefined') {
      const originalHandler = ErrorUtils.getGlobalHandler();

      ErrorUtils.setGlobalHandler(async (error: Error, isFatal?: boolean) => {
        try {
          await this.reportError(error, {
            fatal: isFatal,
            action: 'Global Error Handler',
          });
        } catch (reportingError) {
          console.error('Failed to report global error:', reportingError);
        }

        // Call original handler
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }

    // Handle unhandled promise rejections
    const originalRejectionTracker = global.HermesInternal?.hasPromiseRejectionTracker?.();
    if (originalRejectionTracker) {
      const originalHandler = global.HermesInternal.setPromiseRejectionTracker;

      global.HermesInternal.setPromiseRejectionTracker = async (id: number, rejection: any) => {
        try {
          await this.reportError(new Error(`Unhandled Promise Rejection: ${rejection}`), {
            fatal: false,
            action: 'Promise Rejection',
          });
        } catch (reportingError) {
          console.error('Failed to report promise rejection:', reportingError);
        }

        if (originalHandler) {
          originalHandler(id, rejection);
        }
      };
    }
  }

  /**
   * Create error report with device and context information
   */
  private async createErrorReport(
    error: Error | string,
    context: {
      screen: string;
      action: string;
      fatal: boolean;
      extra?: any;
    }
  ): Promise<ErrorReport> {
    const deviceInfo = await this.getDeviceInfo();
    const appState = this.getAppState();

    let stackTrace = '';
    let errorMessage = '';

    if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = error.message;
      stackTrace = error.stack || '';
    }

    return {
      error: errorMessage,
      stackTrace,
      userId: this.userId,
      screen: context.screen,
      action: context.action,
      timestamp: new Date(),
      deviceInfo,
      appState,
      fatal: context.fatal,
      breadcrumbs: [...this.breadcrumbs], // Copy breadcrumbs
      sessionId: this.sessionId,
      userAgent: Platform.OS === 'web' ? navigator.userAgent : undefined,
      ...context.extra,
    };
  }

  /**
   * Get device information for error context
   */
  private async getDeviceInfo() {
    try {
      const [
        brand,
        model,
        systemVersion,
        appVersion,
        buildNumber,
        deviceId,
        isTablet,
        totalMemory,
        usedMemory,
        batteryLevel,
        isEmulator,
      ] = await Promise.all([
        DeviceInfo.getBrand(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getVersion(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getDeviceId(),
        DeviceInfo.isTablet(),
        DeviceInfo.getTotalMemory(),
        DeviceInfo.getUsedMemory(),
        DeviceInfo.getBatteryLevel(),
        DeviceInfo.isEmulator(),
      ]);

      return {
        platform: Platform.OS,
        brand,
        model,
        systemVersion,
        appVersion,
        buildNumber,
        deviceId,
        isTablet,
        isEmulator,
        memory: {
          total: totalMemory,
          used: usedMemory,
          available: totalMemory - usedMemory,
        },
        batteryLevel,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get device info for error report:', error);
      return {
        platform: Platform.OS,
        error: 'Failed to collect device info',
      };
    }
  }

  /**
   * Get current app state information
   */
  private getAppState() {
    return {
      currentState: AppState.currentState,
      memoryWarningLevel: Platform.OS === 'ios' ? 'unknown' : 'N/A',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send error report to backend service
   */
  private async sendErrorReport(report: ErrorReport) {
    try {
      // In production, this would send to your error reporting service
      // For now, we'll log it and store locally for debugging
      console.error('Error Report:', JSON.stringify(report, null, 2));

      // Store locally for debugging (in development)
      if (__DEV__) {
        const reports = await this.getStoredReports();
        reports.push(report);

        // Keep only last 20 reports locally
        const recentReports = reports.slice(-20);
        await AsyncStorage.setItem('error_reports', JSON.stringify(recentReports));
      }

      // TODO: Implement actual error reporting service integration
      // Example: Send to Sentry, Crashlytics, or custom backend
      // const response = await fetch('YOUR_ERROR_REPORTING_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report),
      // });
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  /**
   * Get stored error reports (for debugging)
   */
  public async getStoredReports(): Promise<ErrorReport[]> {
    try {
      const reports = await AsyncStorage.getItem('error_reports');
      return reports ? JSON.parse(reports) : [];
    } catch (error) {
      console.error('Failed to get stored reports:', error);
      return [];
    }
  }

  /**
   * Clear stored error reports
   */
  public async clearStoredReports() {
    try {
      await AsyncStorage.removeItem('error_reports');
    } catch (error) {
      console.error('Failed to clear stored reports:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get current session information
   */
  public getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      currentScreen: this.currentScreen,
      lastAction: this.lastAction,
      breadcrumbsCount: this.breadcrumbs.length,
      isEnabled: this.isEnabled,
    };
  }
}

export default ErrorReportingService;
