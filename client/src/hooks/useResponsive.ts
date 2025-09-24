import { useState, useEffect } from 'react';

// Breakpoint definitions
export const breakpoints = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Hook for responsive design
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      // Determine current breakpoint
      if (width < breakpoints.sm) {
        setCurrentBreakpoint('xs');
      } else if (width < breakpoints.md) {
        setCurrentBreakpoint('sm');
      } else if (width < breakpoints.lg) {
        setCurrentBreakpoint('md');
      } else if (width < breakpoints.xl) {
        setCurrentBreakpoint('lg');
      } else {
        setCurrentBreakpoint('xl');
      }
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper functions
  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  const isTablet = currentBreakpoint === 'md';
  const isDesktop = currentBreakpoint === 'lg' || currentBreakpoint === 'xl';
  
  const isBelow = (breakpoint: Breakpoint) => windowSize.width < breakpoints[breakpoint];
  const isAbove = (breakpoint: Breakpoint) => windowSize.width >= breakpoints[breakpoint];
  
  const isBetween = (min: Breakpoint, max: Breakpoint) => 
    windowSize.width >= breakpoints[min] && windowSize.width < breakpoints[max];

  return {
    windowSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isBelow,
    isAbove,
    isBetween,
    breakpoints,
  };
};

// Hook for device detection
export const useDevice = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouch: false,
    isLandscape: false,
  });

  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDevice({
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        isLandscape: width > height,
      });
    };

    updateDevice();
    window.addEventListener('resize', updateDevice);
    window.addEventListener('orientationchange', updateDevice);

    return () => {
      window.removeEventListener('resize', updateDevice);
      window.removeEventListener('orientationchange', updateDevice);
    };
  }, []);

  return device;
};

// Hook for media queries
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    const updateMatches = () => setMatches(media.matches);
    
    // Initial check
    updateMatches();
    
    // Listen for changes
    media.addEventListener('change', updateMatches);
    
    return () => media.removeEventListener('change', updateMatches);
  }, [query]);

  return matches;
};

// Predefined media query hooks
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsTouch = () => useMediaQuery('(hover: none) and (pointer: coarse)');
export const useIsLandscape = () => useMediaQuery('(orientation: landscape)');
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');

// Hook for responsive values
export const useResponsiveValue = <T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T => {
  const { currentBreakpoint } = useResponsive();
  
  // Find the appropriate value for current breakpoint
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  // Look for the closest smaller breakpoint value
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp] as T;
    }
  }
  
  return defaultValue;
};

// Hook for responsive grid columns
export const useResponsiveColumns = () => {
  const { currentBreakpoint } = useResponsive();
  
  const getColumns = (base: number) => {
    switch (currentBreakpoint) {
      case 'xs':
        return 1;
      case 'sm':
        return Math.min(2, base);
      case 'md':
        return Math.min(3, base);
      case 'lg':
        return Math.min(4, base);
      case 'xl':
        return base;
      default:
        return base;
    }
  };
  
  return { getColumns, currentBreakpoint };
};

// Hook for responsive spacing
export const useResponsiveSpacing = () => {
  const { isMobile, isTablet } = useResponsive();
  
  const getSpacing = (base: number) => {
    if (isMobile) return Math.max(0.5, base * 0.75);
    if (isTablet) return Math.max(0.75, base * 0.875);
    return base;
  };
  
  return { getSpacing, isMobile, isTablet };
};

// Hook for responsive typography
export const useResponsiveTypography = () => {
  const { currentBreakpoint } = useResponsive();
  
  const getFontSize = (base: number) => {
    const scale = {
      xs: 0.75,
      sm: 0.875,
      md: 1,
      lg: 1.125,
      xl: 1.25,
    };
    
    return base * (scale[currentBreakpoint] || 1);
  };
  
  return { getFontSize, currentBreakpoint };
};
