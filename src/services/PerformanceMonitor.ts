import { AppState, AppStateStatus } from 'react-native';
import { webSocketService } from './WebSocketService';
import { CommonAudioManager } from './CommonAudioManager';

interface PerformanceMetrics {
  timestamp: number;
  memoryUsage: {
    jsHeapSizeLimit?: number;
    jsHeapSizeUsed?: number;
    totalJSHeapSize?: number;
  };
  renderMetrics: {
    frameDropCount: number;
    averageFPS: number;
    slowFrameCount: number;
  };
  networkMetrics: {
    webSocketHealth: boolean;
    queueUtilization: number;
    connectionAttempts: number;
  };
  audioMetrics: {
    backgroundMusicActive: boolean;
    gameMusicActive: boolean;
  };
  appMetrics: {
    appState: AppStateStatus;
    sessionDuration: number;
    crashCount: number;
  };
}

interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  category: 'memory' | 'render' | 'network' | 'audio';
  message: string;
  timestamp: number;
  value?: number;
  threshold?: number;
}

class PerformanceMonitorService {
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private sessionStartTime: number = Date.now();
  private frameDropCount: number = 0;
  private slowFrameCount: number = 0;
  private crashCount: number = 0;
  private isMonitoring: boolean = false;

  // Thresholds for performance alerts
  private readonly thresholds = {
    memory: {
      warning: 50 * 1024 * 1024, // 50MB
      critical: 80 * 1024 * 1024, // 80MB
    },
    fps: {
      warning: 45, // Below 45 FPS
      critical: 30, // Below 30 FPS
    },
    queueUtilization: {
      warning: 70, // 70% queue full
      critical: 90, // 90% queue full
    },
  };

  constructor() {
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && !this.isMonitoring) {
        this.startMonitoring();
      } else if (nextAppState === 'background' && this.isMonitoring) {
        this.pauseMonitoring();
      }
    });
  }

  startMonitoring(intervalMs: number = 5000) {
    if (this.isMonitoring) return;

    console.log('📊 Starting performance monitoring');
    this.isMonitoring = true;
    this.sessionStartTime = Date.now();

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    // Collect initial metrics
    this.collectMetrics();
  }

  pauseMonitoring() {
    if (!this.isMonitoring) return;

    console.log('⏸️ Pausing performance monitoring');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  stopMonitoring() {
    this.pauseMonitoring();
    console.log('🛑 Performance monitoring stopped');
  }

  private collectMetrics() {
    const now = Date.now();
    
    // Collect memory metrics
    const memoryUsage = this.getMemoryMetrics();
    
    // Collect render metrics
    const renderMetrics = this.getRenderMetrics();
    
    // Collect network metrics
    const networkMetrics = this.getNetworkMetrics();
    
    // Collect audio metrics
    const audioMetrics = this.getAudioMetrics();
    
    // Collect app metrics
    const appMetrics = this.getAppMetrics();

    const metrics: PerformanceMetrics = {
      timestamp: now,
      memoryUsage,
      renderMetrics,
      networkMetrics,
      audioMetrics,
      appMetrics,
    };

    // Store metrics (keep only last 100 entries)
    this.metrics.push(metrics);
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Check for performance issues
    this.analyzeMetrics(metrics);
  }

  private getMemoryMetrics() {
    // In React Native, memory metrics are limited
    // This is a placeholder for potential memory monitoring
    const mockMemory = {
      jsHeapSizeLimit: 128 * 1024 * 1024, // Mock 128MB limit
      jsHeapSizeUsed: Math.random() * 64 * 1024 * 1024, // Random usage up to 64MB
      totalJSHeapSize: 128 * 1024 * 1024,
    };

    return mockMemory;
  }

  private getRenderMetrics() {
    // Mock render metrics - in real app, you'd use performance API or bridge
    return {
      frameDropCount: this.frameDropCount,
      averageFPS: Math.max(30, 60 - Math.random() * 15), // Mock FPS between 45-60
      slowFrameCount: this.slowFrameCount,
    };
  }

  private getNetworkMetrics() {
    const wsStats = webSocketService.getQueueStats();
    
    return {
      webSocketHealth: webSocketService.isHealthy(),
      queueUtilization: wsStats.queueUtilization,
      connectionAttempts: wsStats.connectionAttempts,
    };
  }

  private getAudioMetrics() {
    return {
      backgroundMusicActive: CommonAudioManager.isPlaying('background'),
      gameMusicActive: CommonAudioManager.isPlaying('game'),
    };
  }

  private getAppMetrics() {
    return {
      appState: AppState.currentState,
      sessionDuration: Date.now() - this.sessionStartTime,
      crashCount: this.crashCount,
    };
  }

  private analyzeMetrics(metrics: PerformanceMetrics) {
    // Check memory usage
    if (metrics.memoryUsage.jsHeapSizeUsed) {
      if (metrics.memoryUsage.jsHeapSizeUsed > this.thresholds.memory.critical) {
        this.addAlert({
          type: 'error',
          category: 'memory',
          message: 'Critical memory usage detected',
          timestamp: metrics.timestamp,
          value: metrics.memoryUsage.jsHeapSizeUsed,
          threshold: this.thresholds.memory.critical,
        });
      } else if (metrics.memoryUsage.jsHeapSizeUsed > this.thresholds.memory.warning) {
        this.addAlert({
          type: 'warning',
          category: 'memory',
          message: 'High memory usage detected',
          timestamp: metrics.timestamp,
          value: metrics.memoryUsage.jsHeapSizeUsed,
          threshold: this.thresholds.memory.warning,
        });
      }
    }

    // Check FPS
    if (metrics.renderMetrics.averageFPS < this.thresholds.fps.critical) {
      this.addAlert({
        type: 'error',
        category: 'render',
        message: 'Critical FPS drop detected',
        timestamp: metrics.timestamp,
        value: metrics.renderMetrics.averageFPS,
        threshold: this.thresholds.fps.critical,
      });
    } else if (metrics.renderMetrics.averageFPS < this.thresholds.fps.warning) {
      this.addAlert({
        type: 'warning',
        category: 'render',
        message: 'Low FPS detected',
        timestamp: metrics.timestamp,
        value: metrics.renderMetrics.averageFPS,
        threshold: this.thresholds.fps.warning,
      });
    }

    // Check WebSocket queue
    if (metrics.networkMetrics.queueUtilization > this.thresholds.queueUtilization.critical) {
      this.addAlert({
        type: 'error',
        category: 'network',
        message: 'WebSocket queue critical utilization',
        timestamp: metrics.timestamp,
        value: metrics.networkMetrics.queueUtilization,
        threshold: this.thresholds.queueUtilization.critical,
      });
    } else if (metrics.networkMetrics.queueUtilization > this.thresholds.queueUtilization.warning) {
      this.addAlert({
        type: 'warning',
        category: 'network',
        message: 'WebSocket queue high utilization',
        timestamp: metrics.timestamp,
        value: metrics.networkMetrics.queueUtilization,
        threshold: this.thresholds.queueUtilization.warning,
      });
    }

    // Check WebSocket health
    if (!metrics.networkMetrics.webSocketHealth) {
      this.addAlert({
        type: 'warning',
        category: 'network',
        message: 'WebSocket connection unhealthy',
        timestamp: metrics.timestamp,
      });
    }
  }

  private addAlert(alert: PerformanceAlert) {
    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }

    // Log alert based on type
    const logMessage = `🔔 ${alert.type.toUpperCase()}: ${alert.message}`;
    if (alert.value !== undefined && alert.threshold !== undefined) {
      console.log(`${logMessage} (${alert.value} > ${alert.threshold})`);
    } else {
      console.log(logMessage);
    }
  }

  // Public methods for getting performance data
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getMetricsHistory(count: number = 10): PerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  getRecentAlerts(count: number = 10): PerformanceAlert[] {
    return this.alerts.slice(-count);
  }

  getPerformanceSummary() {
    const current = this.getCurrentMetrics();
    if (!current) return null;

    return {
      status: this.getOverallHealth(),
      memoryUsage: current.memoryUsage.jsHeapSizeUsed || 0,
      averageFPS: current.renderMetrics.averageFPS,
      webSocketHealth: current.networkMetrics.webSocketHealth,
      queueUtilization: current.networkMetrics.queueUtilization,
      sessionDuration: current.appMetrics.sessionDuration,
      alertCount: this.alerts.filter(a => a.timestamp > Date.now() - 300000).length, // Last 5 minutes
    };
  }

  private getOverallHealth(): 'excellent' | 'good' | 'fair' | 'poor' {
    const recentAlerts = this.alerts.filter(a => a.timestamp > Date.now() - 300000);
    const errorCount = recentAlerts.filter(a => a.type === 'error').length;
    const warningCount = recentAlerts.filter(a => a.type === 'warning').length;

    if (errorCount > 0) return 'poor';
    if (warningCount > 3) return 'fair';
    if (warningCount > 0) return 'good';
    return 'excellent';
  }

  // Method to trigger manual metric collection
  collectNow(): PerformanceMetrics | null {
    if (this.isMonitoring) {
      this.collectMetrics();
      return this.getCurrentMetrics();
    }
    return null;
  }

  // Method to report crashes
  reportCrash(error: Error) {
    this.crashCount++;
    this.addAlert({
      type: 'error',
      category: 'memory', // Crashes often relate to memory
      message: `App crash reported: ${error.message}`,
      timestamp: Date.now(),
    });
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitorService();