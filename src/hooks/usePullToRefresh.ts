import { useEffect, useState, useRef } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
  disabled?: boolean;
}

interface PullState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  maxPull = 120,
  disabled = false,
}: UsePullToRefreshOptions) => {
  const [pullState, setPullState] = useState<PullState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
  });

  const touchStartRef = useRef<{ y: number; x: number; scrollY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled || !containerRef.current) return;

    const container = containerRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      // Only activate if at the very top of the page
      const scrollY = container.scrollTop;
      if (scrollY > 5) return;

      const touch = e.touches[0];
      touchStartRef.current = {
        y: touch.clientY,
        x: touch.clientX,
        scrollY,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || disabled) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaX = touch.clientX - touchStartRef.current.x;

      // Only activate for downward pulls, not sideways swipes
      if (deltaY < 0 || Math.abs(deltaX) > Math.abs(deltaY)) return;

      // Check if still at top of page
      const scrollY = container.scrollTop;
      if (scrollY > 5) return;

      const pullDistance = Math.min(deltaY, maxPull);
      
      // Only prevent default if we've pulled a significant distance
      // This allows normal scrolling and clicks for small movements
      if (pullDistance > 10) { // Small threshold to allow clicks
        e.preventDefault();
      }

      setPullState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance,
      }));
    };

    const handleTouchEnd = async () => {
      if (!touchStartRef.current || disabled) return;

      const { pullDistance, isRefreshing } = pullState;

      if (isRefreshing) {
        touchStartRef.current = null;
        return;
      }

      // If pulled beyond threshold, trigger refresh
      if (pullDistance >= threshold) {
        setPullState(prev => ({ ...prev, isRefreshing: true }));

        try {
          await onRefresh();
        } catch (error) {
          console.error('Pull-to-refresh failed:', error);
        } finally {
          // Reset state after refresh
          setTimeout(() => {
            setPullState({
              isPulling: false,
              pullDistance: 0,
              isRefreshing: false,
            });
          }, 300);
        }
      } else {
        // Reset if not pulled enough
        setPullState({
          isPulling: false,
          pullDistance: 0,
          isRefreshing: false,
        });
      }

      touchStartRef.current = null;
    };

    // Add passive: false to allow preventDefault
    const options = { passive: false } as AddEventListenerOptions;

    container.addEventListener('touchstart', handleTouchStart, options);
    container.addEventListener('touchmove', handleTouchMove, options);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart, options);
      container.removeEventListener('touchmove', handleTouchMove, options);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold, maxPull, disabled, pullState.isRefreshing]);

  const getPullStyles = () => {
    const { isPulling, pullDistance, isRefreshing } = pullState;

    if (!isPulling && !isRefreshing) return {};

    const opacity = Math.min(pullDistance / threshold, 1);
    const scale = 1 + (pullDistance / threshold) * 0.1;

    return {
      transform: `translateY(${pullDistance}px) scale(${scale})`,
      transition: isRefreshing ? 'transform 0.3s ease-out' : 'none',
      opacity: isRefreshing ? 0.8 : opacity,
    };
  };

  const getRefreshIndicatorProps = () => {
    const { pullDistance, isRefreshing } = pullState;
    const progress = Math.min(pullDistance / threshold, 1);

    return {
      opacity: pullDistance > 20 ? 1 : 0,
      rotation: isRefreshing ? 360 : progress * 180,
      scale: isRefreshing ? 1.2 : 1 + progress * 0.2,
    };
  };

  return {
    pullState,
    getPullStyles,
    getRefreshIndicatorProps,
    containerRef,
  };
};