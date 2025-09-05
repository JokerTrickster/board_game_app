import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorReportingService from './ErrorReportingService';
import AnalyticsService from './AnalyticsService';
import { FeedbackData } from '../components/feedback/FeedbackModal';

export interface FeedbackServiceConfig {
  enableErrorReporting: boolean;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  batchSize: number;
  flushInterval: number; // milliseconds
  userId?: string;
}

export interface FeedbackStats {
  totalFeedbacks: number;
  totalErrors: number;
  totalAnalyticsEvents: number;
  averageRating: number;
  feedbackCategories: Record<string, number>;
  commonIssues: Array<{
    issue: string;
    count: number;
    category: string;
  }>;
}

class FeedbackService {
  private static instance: FeedbackService;
  private config: FeedbackServiceConfig;
  private errorReporting: ErrorReportingService;
  private analytics: AnalyticsService;
  private isInitialized: boolean = false;

  private constructor() {
    this.config = {
      enableErrorReporting: true,
      enableAnalytics: true,
      enableCrashReporting: true,
      batchSize: 10,
      flushInterval: 30000,
    };

    this.errorReporting = ErrorReportingService.getInstance();
    this.analytics = AnalyticsService.getInstance();
  }

  public static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  /**
   * Initialize the feedback system with configuration
   */
  public async initialize(config: Partial<FeedbackServiceConfig> = {}) {
    this.config = { ...this.config, ...config };

    try {
      // Initialize sub-services
      if (this.config.enableErrorReporting) {
        await this.errorReporting.initialize(this.config.userId);
      }

      if (this.config.enableAnalytics) {
        await this.analytics.initialize(this.config.userId);
      }

      // Load user consent settings
      await this.loadUserConsents();

      this.isInitialized = true;

      // Track initialization
      if (this.config.enableAnalytics) {
        await this.analytics.track('feedback_service_initialized', {
          errorReporting: this.config.enableErrorReporting,
          analytics: this.config.enableAnalytics,
          crashReporting: this.config.enableCrashReporting,
        });
      }

      console.log('FeedbackService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize FeedbackService:', error);
      throw error;
    }
  }

  /**
   * Set user information for all services
   */
  public async setUser(userId: string) {
    this.config.userId = userId;

    if (this.config.enableErrorReporting) {
      await this.errorReporting.initialize(userId);
    }

    if (this.config.enableAnalytics) {
      await this.analytics.initialize(userId);
    }
  }

  /**
   * Submit user feedback
   */
  public async submitFeedback(feedback: FeedbackData): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('FeedbackService not initialized');
    }

    try {
      // Store feedback locally
      await this.storeFeedbackLocally(feedback);

      // Track feedback submission
      if (this.config.enableAnalytics) {
        await this.analytics.track('feedback_submitted', {
          category: feedback.category,
          rating: feedback.rating,
          hasScreenshot: !!feedback.screenshot,
          messageLength: feedback.message.length,
        });
      }

      // TODO: Send to backend service
      // await this.sendFeedbackToBackend(feedback);

      return true;
    } catch (error) {
      console.error('Failed to submit feedback:', error);

      if (this.config.enableErrorReporting) {
        await this.errorReporting.reportError(error as Error, {
          screen: 'FeedbackService',
          action: 'submit_feedback',
        });
      }

      return false;
    }
  }

  /**
   * Report error through the feedback system
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
    if (!this.isInitialized || !this.config.enableErrorReporting) {return;}

    try {
      await this.errorReporting.reportError(error, context);

      // Also track as analytics event
      if (this.config.enableAnalytics) {
        await this.analytics.trackError(error, context);
      }
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  /**
   * Track user action
   */
  public async trackAction(
    eventType: string,
    properties: Record<string, any> = {}
  ) {
    if (!this.isInitialized || !this.config.enableAnalytics) {return;}

    try {
      await this.analytics.track(eventType, properties);
    } catch (error) {
      console.error('Failed to track action:', error);
    }
  }

  /**
   * Track screen view
   */
  public async trackScreenView(screenName: string) {
    if (!this.isInitialized) {return;}

    try {
      // Set current screen for error reporting context
      if (this.config.enableErrorReporting) {
        this.errorReporting.setCurrentScreen(screenName);
      }

      // Track screen view in analytics
      if (this.config.enableAnalytics) {
        await this.analytics.trackScreenView(screenName);
      }
    } catch (error) {
      console.error('Failed to track screen view:', error);
    }
  }

  /**
   * Set user action context for error reporting
   */
  public setLastAction(action: string, data?: any) {
    if (!this.isInitialized || !this.config.enableErrorReporting) {return;}

    this.errorReporting.setLastAction(action, data);
  }

  /**
   * Request user consent for data collection
   */
  public async requestUserConsent(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        '데이터 수집 동의',
        '앱 개선을 위해 사용 데이터와 오류 정보를 수집할 수 있나요?\n\n수집된 정보는 앱 품질 향상에만 사용되며, 개인정보는 포함되지 않습니다.',
        [
          {
            text: '동의 안함',
            style: 'cancel',
            onPress: async () => {
              await this.setUserConsent(false);
              resolve(false);
            },
          },
          {
            text: '동의',
            onPress: async () => {
              await this.setUserConsent(true);
              resolve(true);
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Set user consent for data collection
   */
  public async setUserConsent(consent: boolean) {
    try {
      await AsyncStorage.setItem('user_consent_feedback', consent.toString());

      if (this.config.enableErrorReporting) {
        await this.errorReporting.setUserConsent(consent);
      }

      if (this.config.enableAnalytics) {
        await this.analytics.setUserConsent(consent);
      }

      // Track consent decision
      if (consent && this.config.enableAnalytics) {
        await this.analytics.track('user_consent_given', {
          consent,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to set user consent:', error);
    }
  }

  /**
   * Load user consent settings
   */
  private async loadUserConsents() {
    try {
      const consent = await AsyncStorage.getItem('user_consent_feedback');
      if (consent !== null) {
        const hasConsent = consent === 'true';

        if (this.config.enableErrorReporting) {
          await this.errorReporting.setUserConsent(hasConsent);
        }

        if (this.config.enableAnalytics) {
          await this.analytics.setUserConsent(hasConsent);
        }
      } else {
        // First time user - request consent
        setTimeout(() => {
          this.requestUserConsent();
        }, 3000); // Show after 3 seconds
      }
    } catch (error) {
      console.error('Failed to load user consents:', error);
    }
  }

  /**
   * Store feedback locally
   */
  private async storeFeedbackLocally(feedback: FeedbackData) {
    try {
      const existingFeedbacks = await this.getStoredFeedbacks();
      existingFeedbacks.push(feedback);

      // Keep only last 50 feedbacks
      const recentFeedbacks = existingFeedbacks.slice(-50);

      await AsyncStorage.setItem('user_feedbacks', JSON.stringify(recentFeedbacks));
    } catch (error) {
      console.error('Failed to store feedback locally:', error);
    }
  }

  /**
   * Get stored feedbacks
   */
  public async getStoredFeedbacks(): Promise<FeedbackData[]> {
    try {
      const feedbacks = await AsyncStorage.getItem('user_feedbacks');
      return feedbacks ? JSON.parse(feedbacks) : [];
    } catch (error) {
      console.error('Failed to get stored feedbacks:', error);
      return [];
    }
  }

  /**
   * Generate feedback statistics
   */
  public async generateFeedbackStats(): Promise<FeedbackStats> {
    try {
      const feedbacks = await this.getStoredFeedbacks();
      const errors = await this.errorReporting.getStoredReports();
      const events = await this.analytics.getStoredEvents();

      // Calculate feedback stats
      const totalFeedbacks = feedbacks.length;
      const averageRating = feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

      const feedbackCategories = feedbacks.reduce((acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Find common issues from error reports
      const errorMessages = errors.map(e => typeof e.error === 'string' ? e.error : e.error.message);
      const commonIssues = this.findCommonIssues(errorMessages);

      return {
        totalFeedbacks,
        totalErrors: errors.length,
        totalAnalyticsEvents: events.length,
        averageRating: Math.round(averageRating * 10) / 10,
        feedbackCategories,
        commonIssues,
      };
    } catch (error) {
      console.error('Failed to generate feedback stats:', error);
      return {
        totalFeedbacks: 0,
        totalErrors: 0,
        totalAnalyticsEvents: 0,
        averageRating: 0,
        feedbackCategories: {},
        commonIssues: [],
      };
    }
  }

  /**
   * Find common issues from error messages
   */
  private findCommonIssues(errorMessages: string[]): Array<{ issue: string; count: number; category: string }> {
    const issueMap = new Map<string, number>();

    errorMessages.forEach(message => {
      // Normalize error message (remove specific details)
      const normalized = this.normalizeErrorMessage(message);
      issueMap.set(normalized, (issueMap.get(normalized) || 0) + 1);
    });

    // Convert to array and sort by frequency
    const issues = Array.from(issueMap.entries())
      .map(([issue, count]) => ({
        issue,
        count,
        category: this.categorizeError(issue),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 issues

    return issues;
  }

  /**
   * Normalize error message for grouping
   */
  private normalizeErrorMessage(message: string): string {
    return message
      .replace(/\d+/g, 'N') // Replace numbers with N
      .replace(/['"]/g, '') // Remove quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase();
  }

  /**
   * Categorize error by type
   */
  private categorizeError(error: string): string {
    if (error.includes('network') || error.includes('fetch') || error.includes('connection')) {
      return 'network';
    }
    if (error.includes('memory') || error.includes('out of memory')) {
      return 'performance';
    }
    if (error.includes('permission') || error.includes('unauthorized')) {
      return 'permission';
    }
    if (error.includes('ui') || error.includes('render') || error.includes('layout')) {
      return 'ui';
    }
    return 'general';
  }

  /**
   * Clean up and save data before app termination
   */
  public async cleanup() {
    try {
      if (this.config.enableAnalytics) {
        await this.analytics.cleanup();
      }

      console.log('FeedbackService cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup FeedbackService:', error);
    }
  }

  /**
   * Get service status information
   */
  public getServiceInfo() {
    return {
      isInitialized: this.isInitialized,
      config: this.config,
      errorReportingInfo: this.errorReporting.getSessionInfo(),
      analyticsInfo: this.analytics.getSessionInfo(),
    };
  }
}

export default FeedbackService;
