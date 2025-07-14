'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

// Interface for performance metrics
interface PerformanceMetrics {
  pageLoadTime: number;
  domInteractive: number;
  networkRequests: number;
  memoryUsage: number | null; // in MB
  cpuUsage?: number;
  fps?: number;
}

/**
 * Custom hook for tracking performance metrics in the application
 * @returns Performance metrics for the current page
 */
export function usePerformance(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    domInteractive: 0,
    networkRequests: 0,
    memoryUsage: null,
    fps: 0,
  });

  useEffect(() => {
    // Function to measure initial page performance
    const measureInitialPerformance = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        
        if (perfEntries.length > 0) {
          const navEntry = perfEntries[0];
          
          setMetrics(prev => ({
            ...prev,
            pageLoadTime: Math.round(navEntry.loadEventEnd - navEntry.startTime),
            domInteractive: Math.round(navEntry.domInteractive - navEntry.startTime),
          }));
        }
      }
    };

    // Function to count network requests
    const countNetworkRequests = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const resources = performance.getEntriesByType('resource');
        setMetrics(prev => ({
          ...prev,
          networkRequests: resources.length,
        }));
      }
    };

    // Function to measure memory usage
    const measureMemory = async () => {
      try {
        if (typeof window !== 'undefined' && 'memory' in window.performance) {
          const memory = (performance as any).memory;
          
          if (memory) {
            // Convert bytes to MB
            const usedJSHeapSizeMB = Math.round(memory.usedJSHeapSize / (1024 * 1024));
            
            setMetrics(prev => ({
              ...prev,
              memoryUsage: usedJSHeapSizeMB,
            }));
          }
        }
      } catch (error) {
        logger.error('Error measuring memory:', error, 'Performance');
      }
    };

    // Function to measure FPS
    let frameCount = 0;
    let lastTimestamp = performance.now();
    let frameId: number | null = null;

    const measureFPS = (timestamp: number) => {
      frameCount++;
      const elapsed = timestamp - lastTimestamp;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        setMetrics(prev => ({
          ...prev,
          fps,
        }));

        frameCount = 0;
        lastTimestamp = timestamp;
      }

      frameId = requestAnimationFrame(measureFPS);
    };

    // Initialize all measurements
    measureInitialPerformance();
    countNetworkRequests();
    measureMemory();
    frameId = requestAnimationFrame(measureFPS);

    // Set up interval for periodic measurements
    const intervalId = setInterval(() => {
      countNetworkRequests();
      measureMemory();
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return metrics;
}
