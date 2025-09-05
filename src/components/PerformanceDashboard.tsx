import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { performanceMonitor } from '../services/PerformanceMonitor';

interface PerformanceDashboardProps {
  visible: boolean;
  onClose: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  visible,
  onClose,
}) => {
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!visible) return;

    const updateData = () => {
      setSummary(performanceMonitor.getPerformanceSummary());
      setAlerts(performanceMonitor.getRecentAlerts(5));
    };

    // Update immediately
    updateData();

    // Update every 2 seconds while visible
    const interval = setInterval(updateData, 2000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible || !summary) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return '#4CAF50';
      case 'good':
        return '#8BC34A';
      case 'fair':
        return '#FF9800';
      case 'poor':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.dashboard}>
        <View style={styles.header}>
          <Text style={styles.title}>Performance Monitor</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Overall Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall Health</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(summary.status) }]}>
              <Text style={styles.statusText}>{summary.status.toUpperCase()}</Text>
            </View>
          </View>

          {/* Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Memory</Text>
                <Text style={styles.metricValue}>{formatBytes(summary.memoryUsage)}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>FPS</Text>
                <Text style={styles.metricValue}>{summary.averageFPS.toFixed(1)}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>WebSocket</Text>
                <Text style={[styles.metricValue, { color: summary.webSocketHealth ? '#4CAF50' : '#F44336' }]}>
                  {summary.webSocketHealth ? 'Healthy' : 'Unhealthy'}
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Queue</Text>
                <Text style={styles.metricValue}>{summary.queueUtilization.toFixed(1)}%</Text>
              </View>
            </View>
          </View>

          {/* Recent Alerts */}
          {alerts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Alerts ({alerts.length})</Text>
              <View style={styles.alertsList}>
                {alerts.slice(0, 3).map((alert, index) => (
                  <View key={index} style={styles.alert}>
                    <View style={[styles.alertIndicator, { backgroundColor: getAlertColor(alert.type) }]} />
                    <Text style={styles.alertText} numberOfLines={2}>
                      {alert.message}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Session Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session</Text>
            <Text style={styles.sessionInfo}>
              Duration: {Math.floor(summary.sessionDuration / 60000)}min {Math.floor((summary.sessionDuration % 60000) / 1000)}s
            </Text>
            <Text style={styles.sessionInfo}>
              Recent Alerts: {summary.alertCount}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
  },
  dashboard: {
    position: 'absolute',
    top: 50,
    right: 10,
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  content: {
    maxHeight: 400,
  },
  section: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metric: {
    width: '48%',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  alertsList: {
    maxHeight: 120,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  alertIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
    marginRight: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 11,
    color: '#666',
    lineHeight: 14,
  },
  sessionInfo: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
});

export default PerformanceDashboard;