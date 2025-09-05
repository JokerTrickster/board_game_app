import { performanceMonitor } from '../services/PerformanceMonitor';

/**
 * Export performance data for analysis
 */
export const exportPerformanceData = () => {
  const summary = performanceMonitor.getPerformanceSummary();
  const metrics = performanceMonitor.getMetricsHistory(20);
  const alerts = performanceMonitor.getRecentAlerts(20);

  const exportData = {
    timestamp: new Date().toISOString(),
    summary,
    metrics,
    alerts,
    systemInfo: {
      platform: 'react-native',
      // Add more system info as needed
    },
  };

  // Log to console for debugging
  console.log('📊 Performance Export:', JSON.stringify(exportData, null, 2));

  return exportData;
};

/**
 * Generate performance report
 */
export const generatePerformanceReport = () => {
  const summary = performanceMonitor.getPerformanceSummary();
  const alerts = performanceMonitor.getRecentAlerts(10);

  if (!summary) {
    return 'Performance monitoring not active';
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) {return '0 B';}
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  let report = '📊 PERFORMANCE REPORT\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;

  report += `🎯 OVERALL HEALTH: ${summary.status.toUpperCase()}\n\n`;

  report += '📈 CURRENT METRICS:\n';
  report += `Memory Usage: ${formatBytes(summary.memoryUsage)}\n`;
  report += `Average FPS: ${summary.averageFPS.toFixed(1)}\n`;
  report += `WebSocket Health: ${summary.webSocketHealth ? '✅ Healthy' : '❌ Unhealthy'}\n`;
  report += `Queue Utilization: ${summary.queueUtilization.toFixed(1)}%\n`;
  report += `Session Duration: ${formatDuration(summary.sessionDuration)}\n`;
  report += `Recent Alerts: ${summary.alertCount}\n\n`;

  if (alerts.length > 0) {
    report += '🚨 RECENT ALERTS:\n';
    alerts.forEach((alert, index) => {
      const icon = alert.type === 'error' ? '❌' : alert.type === 'warning' ? '⚠️' : 'ℹ️';
      report += `${icon} [${alert.category.toUpperCase()}] ${alert.message}\n`;
    });
    report += '\n';
  }

  report += '💡 RECOMMENDATIONS:\n';
  if (summary.memoryUsage > 50 * 1024 * 1024) {
    report += `• High memory usage detected (${formatBytes(summary.memoryUsage)})\n`;
  }
  if (summary.averageFPS < 45) {
    report += `• Low FPS detected (${summary.averageFPS.toFixed(1)})\n`;
  }
  if (!summary.webSocketHealth) {
    report += '• WebSocket connection issues detected\n';
  }
  if (summary.queueUtilization > 70) {
    report += `• High queue utilization (${summary.queueUtilization.toFixed(1)}%)\n`;
  }
  if (alerts.filter(a => a.type === 'error').length > 0) {
    report += '• Critical errors require immediate attention\n';
  }

  console.log(report);
  return report;
};

/**
 * Quick performance check for debugging
 */
export const quickPerformanceCheck = () => {
  const current = performanceMonitor.getCurrentMetrics();
  if (!current) {
    console.log('⚠️ Performance monitoring not active');
    return null;
  }

  console.log('⚡ Quick Performance Check:');
  console.log(`Memory: ${(current.memoryUsage.jsHeapSizeUsed || 0 / 1024 / 1024).toFixed(1)}MB`);
  console.log(`FPS: ${current.renderMetrics.averageFPS.toFixed(1)}`);
  console.log(`WebSocket: ${current.networkMetrics.webSocketHealth ? '✅' : '❌'}`);
  console.log(`Queue: ${current.networkMetrics.queueUtilization.toFixed(1)}%`);

  return current;
};

// Make functions available globally in debug builds
if (__DEV__) {
  (global as any).exportPerformanceData = exportPerformanceData;
  (global as any).generatePerformanceReport = generatePerformanceReport;
  (global as any).quickPerformanceCheck = quickPerformanceCheck;
}
