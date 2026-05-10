import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  enableLazyLoading?: boolean;
  enablePrefetch?: boolean;
}

export function LoadingState({ isLoading, message = '加载中...', progress }: LoadingState) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-finance-bg/80 backdrop-blur-sm"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-12 h-12 text-finance-blue mx-auto" />
            </motion.div>
            <p className="mt-4 text-gray-400">{message}</p>
            {progress !== undefined && (
              <div className="mt-2 w-48 h-1 bg-finance-bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-finance-blue"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function usePerformanceOptimizer() {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(m => ({ ...m, fcp: entry.startTime }));
          }
        }
        if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(m => ({ ...m, lcp: entry.startTime }));
        }
        if (entry.entryType === 'first-input') {
          setMetrics(m => ({ ...m, fid: entry.duration }));
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] });
    } catch (e) {
      console.warn('Performance observer not supported');
    }

    return () => observer.disconnect();
  }, []);

  const getPerformanceRating = () => {
    const score = Math.max(0, 100 - (metrics.fcp / 10 + metrics.lcp / 20 + metrics.fid / 5));
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  };

  return {
    metrics,
    rating: getPerformanceRating(),
    score: Math.round(Math.max(0, 100 - (metrics.fcp / 10 + metrics.lcp / 20 + metrics.fid / 5))),
  };
}

export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  loadingDelay = 200
) {
  return function LazyComponent(props: P) {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, loadingDelay);

      return () => clearTimeout(timer);
    }, [loadingDelay]);

    if (!shouldLoad) {
      return (
        <div className="animate-pulse">
          <div className="h-32 bg-finance-card rounded-xl mb-4" />
          <div className="h-48 bg-finance-card rounded-xl" />
        </div>
      );
    }

    return <Component {...props} />;
  };
}

export function useImageOptimization() {
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const updateConnectionStatus = () => {
        setIsLowBandwidth(connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g');
      };

      updateConnectionStatus();
      connection.addEventListener('change', updateConnectionStatus);

      return () => connection.removeEventListener('change', updateConnectionStatus);
    }
  }, []);

  const getImageQuality = () => {
    if (isLowBandwidth) return 'low';
    if (window.innerWidth < 768) return 'medium';
    return 'high';
  };

  return {
    isLowBandwidth,
    imageQuality: getImageQuality(),
  };
}
