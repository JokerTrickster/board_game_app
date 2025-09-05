/**
 * Feedback System Integration Utilities
 * This file provides integration helpers for the feedback system
 */

import { Alert } from 'react-native';
import FeedbackService from '../services/FeedbackService';
import ErrorReportingService from '../services/ErrorReportingService';
import AnalyticsService from '../services/AnalyticsService';

/**
 * Initialize feedback system for the app
 */
export const initializeFeedbackSystem = async (userId?: string) => {
  try {
    const feedbackService = FeedbackService.getInstance();
    
    await feedbackService.initialize({
      enableErrorReporting: true,
      enableAnalytics: true,
      enableCrashReporting: true,
      batchSize: 10,
      flushInterval: 30000,
      userId,
    });

    console.log('Feedback system initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize feedback system:', error);
    return false;
  }
};

/**
 * Enhanced error handler with feedback integration
 */
export const handleErrorWithFeedback = async (
  error: Error | string,
  context: {
    screen: string;
    action: string;
    showUserAlert?: boolean;
    fatal?: boolean;
  }
) => {
  const feedbackService = FeedbackService.getInstance();
  
  try {
    // Report error through feedback system
    await feedbackService.reportError(error, {
      screen: context.screen,
      action: context.action,
      fatal: context.fatal || false,
    });

    // Show user-friendly error message if requested
    if (context.showUserAlert) {
      const errorMessage = typeof error === 'string' ? error : error.message;
      
      Alert.alert(
        '오류 발생',
        `문제가 발생했습니다: ${errorMessage}\n\n개발팀에 자동으로 보고되었습니다.`,
        [
          {
            text: '피드백 보내기',
            onPress: () => {
              // Show feedback modal
              // This would trigger the feedback modal in the UI
              console.log('Show feedback modal');
            },
          },
          { text: '확인' },
        ]
      );
    }
  } catch (reportError) {
    console.error('Failed to handle error with feedback:', reportError);
  }
};

/**
 * Track user action with analytics
 */
export const trackUserAction = async (
  eventType: string,
  screen: string,
  properties: Record<string, any> = {}
) => {
  const feedbackService = FeedbackService.getInstance();
  
  try {
    await feedbackService.trackAction(eventType, {
      screen,
      ...properties,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to track user action:', error);
  }
};

/**
 * Track screen navigation
 */
export const trackScreenNavigation = async (
  screenName: string,
  previousScreen?: string
) => {
  const feedbackService = FeedbackService.getInstance();
  
  try {
    await feedbackService.trackScreenView(screenName);
    
    // Track navigation event
    await trackUserAction('screen_navigation', screenName, {
      previousScreen,
      navigationType: 'user_navigation',
    });
  } catch (error) {
    console.error('Failed to track screen navigation:', error);
  }
};

/**
 * Track game events with enhanced context
 */
export const trackGameEvent = async (
  gameType: 'find-it' | 'frog' | 'sequence' | 'slime-war',
  action: string,
  gameData: Record<string, any> = {}
) => {
  const analytics = AnalyticsService.getInstance();
  const feedbackService = FeedbackService.getInstance();
  
  try {
    // Track through analytics service
    await analytics.trackGameEvent(gameType, action as any, gameData);
    
    // Also track as general action
    await feedbackService.trackAction('game_event', {
      gameType,
      gameAction: action,
      ...gameData,
    });
  } catch (error) {
    console.error('Failed to track game event:', error);
  }
};

/**
 * Track button clicks with position data
 */
export const trackButtonClick = async (
  buttonName: string,
  screen: string,
  additionalContext: Record<string, any> = {}
) => {
  const analytics = AnalyticsService.getInstance();
  
  try {
    await analytics.trackButtonClick(buttonName, {
      screen,
      ...additionalContext,
    });
  } catch (error) {
    console.error('Failed to track button click:', error);
  }
};

/**
 * Enhanced login tracking with feedback
 */
export const trackLoginAttempt = async (
  method: 'email' | 'google',
  success: boolean,
  error?: string
) => {
  const feedbackService = FeedbackService.getInstance();
  
  try {
    await feedbackService.trackAction('login_attempt', {
      method,
      success,
      error,
      timestamp: new Date().toISOString(),
    });

    if (!success && error) {
      await feedbackService.reportError(new Error(error), {
        screen: 'LoginScreen',
        action: 'login_attempt',
        fatal: false,
      });
    }
  } catch (trackError) {
    console.error('Failed to track login attempt:', trackError);
  }
};

/**
 * Track performance metrics
 */
export const trackPerformanceMetric = async (
  metricName: string,
  value: number,
  screen: string,
  additionalData: Record<string, any> = {}
) => {
  const analytics = AnalyticsService.getInstance();
  
  try {
    await analytics.trackPerformance({
      [metricName]: value,
      ...additionalData,
    });
    
    // Also track as general event
    await analytics.track('performance_metric', {
      metricName,
      value,
      screen,
      ...additionalData,
    });
  } catch (error) {
    console.error('Failed to track performance metric:', error);
  }
};

/**
 * Breadcrumb helper for error context
 */
export const addBreadcrumb = (
  category: 'navigation' | 'user_action' | 'network' | 'system' | 'error',
  message: string,
  data?: any,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
) => {
  const errorReporting = ErrorReportingService.getInstance();
  
  errorReporting.addBreadcrumb({
    category,
    message,
    data,
    level,
  });
};

/**
 * Test feedback system integration
 */
export const testFeedbackIntegration = async () => {
  console.log('🧪 Testing Feedback System Integration...');
  
  try {
    const feedbackService = FeedbackService.getInstance();
    
    // Test 1: Analytics tracking
    console.log('📊 Testing analytics tracking...');
    await feedbackService.trackAction('test_event', {
      testType: 'integration_test',
      timestamp: new Date().toISOString(),
    });
    
    // Test 2: Screen view tracking
    console.log('📱 Testing screen view tracking...');
    await feedbackService.trackScreenView('TestScreen');
    
    // Test 3: Error reporting
    console.log('🚨 Testing error reporting...');
    await feedbackService.reportError('Test error message', {
      screen: 'TestScreen',
      action: 'integration_test',
      fatal: false,
    });
    
    // Test 4: Service info
    console.log('ℹ️ Getting service info...');
    const serviceInfo = feedbackService.getServiceInfo();
    console.log('Service Info:', serviceInfo);
    
    // Test 5: Generate stats
    console.log('📈 Testing stats generation...');
    const stats = await feedbackService.generateFeedbackStats();
    console.log('Feedback Stats:', stats);
    
    console.log('✅ Feedback system integration test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Feedback system integration test failed:', error);
    return false;
  }
};

/**
 * Get feedback system status for debugging
 */
export const getFeedbackSystemStatus = () => {
  const feedbackService = FeedbackService.getInstance();
  const errorReporting = ErrorReportingService.getInstance();
  const analytics = AnalyticsService.getInstance();
  
  return {
    feedbackService: feedbackService.getServiceInfo(),
    errorReporting: errorReporting.getSessionInfo(),
    analytics: analytics.getSessionInfo(),
  };
};

/**
 * Debug helper to show stored data
 */
export const showStoredFeedbackData = async () => {
  try {
    const feedbackService = FeedbackService.getInstance();
    const errorReporting = ErrorReportingService.getInstance();
    const analytics = AnalyticsService.getInstance();
    
    const [feedbacks, errors, events, stats] = await Promise.all([
      feedbackService.getStoredFeedbacks(),
      errorReporting.getStoredReports(),
      analytics.getStoredEvents(),
      feedbackService.generateFeedbackStats(),
    ]);
    
    console.log('=== Stored Feedback Data ===');
    console.log('Feedbacks:', feedbacks.length);
    console.log('Errors:', errors.length);
    console.log('Events:', events.length);
    console.log('Stats:', stats);
    
    return {
      feedbacks,
      errors,
      events,
      stats,
    };
  } catch (error) {
    console.error('Failed to show stored feedback data:', error);
    return null;
  }
};