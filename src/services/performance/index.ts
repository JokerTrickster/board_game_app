// Performance monitoring exports
export { performanceMonitor } from '../PerformanceMonitor';
export { usePerformanceDashboard } from '../../hooks/usePerformanceDashboard';
export {
  exportPerformanceData,
  generatePerformanceReport,
  quickPerformanceCheck,
} from '../../utils/performanceUtils';
export { default as PerformanceDashboard } from '../../components/PerformanceDashboard';

// Re-export types
export type { PerformanceDashboardControls } from '../../hooks/usePerformanceDashboard';
