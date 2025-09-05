import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export interface UserActionEvent {
  eventType: string;
  screen: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
}

export interface ScreenViewEvent {
  screen: string;
  timestamp: Date;
  duration?: number; // Duration in milliseconds
  userId?: string;
  sessionId: string;
  previousScreen?: string;
}

export interface GameAnalyticsEvent {
  gameType: 'find-it' | 'frog' | 'sequence' | 'slime-war';
  action: 'start' | 'end' | 'pause' | 'resume' | 'hint_used' | 'item_used' | 'correct_answer' | 'wrong_answer';
  timestamp: Date;
  userId?: string;
  sessionId: string;
  gameData: {
    level?: number;
    score?: number;
    timeElapsed?: number; // in seconds
    livesRemaining?: number;
    hintsUsed?: number;
    itemsUsed?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    multiplayer?: boolean;
    opponentUserId?: string;
  };
}

export interface PerformanceMetrics {
  timestamp: Date;
  screen: string;
  userId?: string;
  sessionId: string;
  metrics: {
    loadTime?: number; // Screen load time in ms
    memoryUsage?: number; // in MB
    batteryLevel?: number; // 0-1
    networkType?: string;
    crashCount?: number;
    errorCount?: number;
  };
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean = true;
  private currentScreen: string = '';
  private screenStartTime: number = 0;
  private eventQueue: UserActionEvent[] = [];
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.loadUserConsent();
    this.startBatchFlush();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize analytics with user information
   */
  public async initialize(userId?: string) {
    this.userId = userId;

    await this.track('analytics_initialized', {
      userId,
      sessionId: this.sessionId,
      platform: Platform.OS,
      appVersion: await DeviceInfo.getVersion(),
    });
  }

  /**
   * Set user consent for analytics
   */
  public async setUserConsent(consent: boolean) {
    this.isEnabled = consent;
    await AsyncStorage.setItem('analytics_consent', consent.toString());

    if (consent) {
      await this.track('analytics_enabled', {});
    } else {
      // Clear any pending events if user opts out
      this.eventQueue = [];
      await this.clearStoredEvents();
    }
  }

  /**
   * Load user consent from storage
   */
  private async loadUserConsent() {
    try {
      const consent = await AsyncStorage.getItem('analytics_consent');
      if (consent !== null) {
        this.isEnabled = consent === 'true';
      }
    } catch (error) {
      console.error('Failed to load analytics consent:', error);
    }
  }

  /**
   * Track user action event
   */
  public async track(eventType: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) {return;}

    const event: UserActionEvent = {
      eventType,
      screen: this.currentScreen,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties: {
        ...properties,
        platform: Platform.OS,
      },
    };

    this.eventQueue.push(event);

    // Flush immediately for critical events
    if (this.isCriticalEvent(eventType)) {
      await this.flushEvents();
    } else if (this.eventQueue.length >= this.batchSize) {
      await this.flushEvents();
    }
  }

  /**
   * Track screen view
   */
  public async trackScreenView(screenName: string) {
    if (!this.isEnabled) {return;}

    const now = Date.now();
    const previousScreen = this.currentScreen;
    const duration = this.screenStartTime > 0 ? now - this.screenStartTime : undefined;

    // Record duration for previous screen
    if (previousScreen && duration) {
      const screenViewEvent: ScreenViewEvent = {
        screen: previousScreen,
        timestamp: new Date(this.screenStartTime),
        duration,
        userId: this.userId,
        sessionId: this.sessionId,
        previousScreen: undefined,
      };

      await this.track('screen_exit', {
        ...screenViewEvent,
        durationSeconds: Math.round(duration / 1000),
      });
    }

    // Start tracking new screen
    this.currentScreen = screenName;
    this.screenStartTime = now;

    const screenViewEvent: ScreenViewEvent = {
      screen: screenName,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
      previousScreen,
    };

    await this.track('screen_view', screenViewEvent);
  }

  /**
   * Track game-specific events
   */
  public async trackGameEvent(
    gameType: GameAnalyticsEvent['gameType'],
    action: GameAnalyticsEvent['action'],
    gameData: GameAnalyticsEvent['gameData'] = {}
  ) {
    if (!this.isEnabled) {return;}

    const event: GameAnalyticsEvent = {
      gameType,
      action,
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
      gameData,
    };

    await this.track('game_event', {
      gameType,
      gameAction: action,
      ...gameData,
    });
  }

  /**
   * Track performance metrics
   */
  public async trackPerformance(metrics: PerformanceMetrics['metrics']) {
    if (!this.isEnabled) {return;}

    try {
      const batteryLevel = await DeviceInfo.getBatteryLevel();
      const memoryUsage = await DeviceInfo.getUsedMemory();

      const performanceEvent: PerformanceMetrics = {
        timestamp: new Date(),
        screen: this.currentScreen,
        userId: this.userId,
        sessionId: this.sessionId,
        metrics: {
          ...metrics,
          batteryLevel: batteryLevel >= 0 ? batteryLevel : undefined,
          memoryUsage: memoryUsage ? Math.round(memoryUsage / 1024 / 1024) : undefined, // Convert to MB
        },
      };

      await this.track('performance_metrics', performanceEvent);
    } catch (error) {
      console.error('Failed to track performance metrics:', error);
    }
  }

  /**
   * Track button clicks with detailed context
   */
  public async trackButtonClick(
    buttonName: string,
    context: {
      screen?: string;
      position?: { x: number; y: number };
      size?: { width: number; height: number };
      extra?: Record<string, any>;
    } = {}
  ) {
    await this.track('button_click', {
      buttonName,
      screen: context.screen || this.currentScreen,
      ...context,
    });
  }

  /**
   * Track user flow completions
   */
  public async trackFlowCompletion(
    flowName: string,
    steps: string[],
    completedSteps: string[],
    totalTime?: number
  ) {
    await this.track('flow_completion', {
      flowName,
      totalSteps: steps.length,
      completedStepsCount: completedSteps.length,
      completionRate: completedSteps.length / steps.length,
      totalTimeSeconds: totalTime ? Math.round(totalTime / 1000) : undefined,
      steps,
      completedSteps,
    });
  }

  /**
   * Track errors and exceptions
   */
  public async trackError(
    error: string | Error,
    context: {
      screen?: string;
      action?: string;
      fatal?: boolean;
      extra?: Record<string, any>;
    } = {}
  ) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = typeof error === 'object' && error.stack ? error.stack : undefined;

    await this.track('error_occurred', {
      errorMessage,
      stackTrace,
      screen: context.screen || this.currentScreen,
      action: context.action,
      fatal: context.fatal || false,
      ...context.extra,
    });
  }

  /**
   * Start batch flush timer
   */
  private startBatchFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(async () => {
      if (this.eventQueue.length > 0) {
        await this.flushEvents();
      }
    }, this.flushInterval);
  }

  /**
   * Flush events to storage/backend
   */
  private async flushEvents() {
    if (this.eventQueue.length === 0 || !this.isEnabled) {return;}

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Store events locally for debugging
      if (__DEV__) {
        await this.storeEventsLocally(eventsToFlush);
      }

      // TODO: Send to analytics backend
      // await this.sendToAnalyticsBackend(eventsToFlush);

      console.log(`Analytics: Flushed ${eventsToFlush.length} events`);
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-add events to queue if flush failed
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  /**
   * Store events locally for debugging
   */
  private async storeEventsLocally(events: UserActionEvent[]) {
    try {
      const existingEvents = await this.getStoredEvents();
      const allEvents = [...existingEvents, ...events];

      // Keep only last 100 events
      const recentEvents = allEvents.slice(-100);

      await AsyncStorage.setItem('analytics_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Failed to store events locally:', error);
    }
  }

  /**
   * Get stored events (for debugging)
   */
  public async getStoredEvents(): Promise<UserActionEvent[]> {
    try {
      const events = await AsyncStorage.getItem('analytics_events');
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Failed to get stored events:', error);
      return [];
    }
  }

  /**
   * Clear stored events
   */
  public async clearStoredEvents() {
    try {
      await AsyncStorage.removeItem('analytics_events');
    } catch (error) {
      console.error('Failed to clear stored events:', error);
    }
  }

  /**
   * Check if event requires immediate flushing
   */
  private isCriticalEvent(eventType: string): boolean {
    const criticalEvents = [
      'error_occurred',
      'crash_detected',
      'payment_completed',
      'user_signup',
      'user_login',
    ];
    return criticalEvents.includes(eventType);
  }

  /**
   * Generate session analytics report
   */
  public async generateSessionReport() {
    const events = await this.getStoredEvents();
    const sessionEvents = events.filter(e => e.sessionId === this.sessionId);

    const screens = [...new Set(sessionEvents.map(e => e.screen))];
    const eventTypes = [...new Set(sessionEvents.map(e => e.eventType))];

    const gameEvents = sessionEvents.filter(e => e.eventType === 'game_event');
    const buttonClicks = sessionEvents.filter(e => e.eventType === 'button_click');
    const errors = sessionEvents.filter(e => e.eventType === 'error_occurred');

    return {
      sessionId: this.sessionId,
      userId: this.userId,
      totalEvents: sessionEvents.length,
      screens,
      eventTypes,
      gameEventsCount: gameEvents.length,
      buttonClicksCount: buttonClicks.length,
      errorsCount: errors.length,
      sessionStart: sessionEvents[0]?.timestamp,
      sessionEnd: sessionEvents[sessionEvents.length - 1]?.timestamp,
      events: sessionEvents,
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get current session info
   */
  public getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      currentScreen: this.currentScreen,
      queuedEvents: this.eventQueue.length,
      isEnabled: this.isEnabled,
    };
  }

  /**
   * Clean up on app termination
   */
  public async cleanup() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Flush remaining events
    if (this.eventQueue.length > 0) {
      await this.flushEvents();
    }
  }
}

export default AnalyticsService;
