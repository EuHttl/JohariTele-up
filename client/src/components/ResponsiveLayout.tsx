import React from 'react';
import { useResponsive, useDevice } from '../hooks/useResponsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  mobileLayout?: 'stack' | 'grid' | 'flex';
  tabletLayout?: 'stack' | 'grid' | 'flex';
  desktopLayout?: 'stack' | 'grid' | 'flex';
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  spacing?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  padding?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = '',
  mobileLayout = 'stack',
  tabletLayout = 'grid',
  desktopLayout = 'grid',
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  spacing = { mobile: '1rem', tablet: '1.5rem', desktop: '2rem' },
  padding = { mobile: '1rem', tablet: '1.5rem', desktop: '2rem' },
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { isTouch } = useDevice();

  const getLayoutClass = () => {
    if (isMobile) return mobileLayout;
    if (isTablet) return tabletLayout;
    return desktopLayout;
  };

  const getColumns = () => {
    if (isMobile) return columns.mobile || 1;
    if (isTablet) return columns.tablet || 2;
    return columns.desktop || 3;
  };

  const getSpacing = () => {
    if (isMobile) return spacing.mobile || '1rem';
    if (isTablet) return spacing.tablet || '1.5rem';
    return spacing.desktop || '2rem';
  };

  const getPadding = () => {
    if (isMobile) return padding.mobile || '1rem';
    if (isTablet) return padding.tablet || '1.5rem';
    return padding.desktop || '2rem';
  };

  const layoutClass = getLayoutClass();
  const cols = getColumns();
  const gap = getSpacing();
  const pad = getPadding();

  const getLayoutStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      padding: pad,
      gap: gap,
    };

    switch (layoutClass) {
      case 'stack':
        return {
          ...baseStyles,
          display: 'flex',
          flexDirection: 'column' as const,
        };
      case 'grid':
        return {
          ...baseStyles,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        };
      case 'flex':
        return {
          ...baseStyles,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div 
      className={`responsive-layout ${className}`}
      style={getLayoutStyles()}
      data-layout={layoutClass}
      data-columns={cols}
      data-touch={isTouch}
    >
      {children}
    </div>
  );
};

// Responsive Container Component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  padding?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = { mobile: '100%', tablet: '720px', desktop: '1200px' },
  padding = { mobile: '1rem', tablet: '1.5rem', desktop: '2rem' },
  className = '',
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getMaxWidth = () => {
    if (isMobile) return maxWidth.mobile || '100%';
    if (isTablet) return maxWidth.tablet || '720px';
    return maxWidth.desktop || '1200px';
  };

  const getPadding = () => {
    if (isMobile) return padding.mobile || '1rem';
    if (isTablet) return padding.tablet || '1.5rem';
    return padding.desktop || '2rem';
  };

  return (
    <div
      className={`responsive-container ${className}`}
      style={{
        maxWidth: getMaxWidth(),
        padding: getPadding(),
        margin: '0 auto',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: '1rem', tablet: '1.5rem', desktop: '2rem' },
  className = '',
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getColumns = () => {
    if (isMobile) return columns.mobile || 1;
    if (isTablet) return columns.tablet || 2;
    return columns.desktop || 3;
  };

  const getGap = () => {
    if (isMobile) return gap.mobile || '1rem';
    if (isTablet) return gap.tablet || '1.5rem';
    return gap.desktop || '2rem';
  };

  return (
    <div
      className={`responsive-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
        gap: getGap(),
      }}
    >
      {children}
    </div>
  );
};

// Responsive Text Component
interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  weight?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = { mobile: '0.875rem', tablet: '1rem', desktop: '1.125rem' },
  weight = { mobile: '400', tablet: '500', desktop: '600' },
  className = '',
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getSize = () => {
    if (isMobile) return size.mobile || '0.875rem';
    if (isTablet) return size.tablet || '1rem';
    return size.desktop || '1.125rem';
  };

  const getWeight = () => {
    if (isMobile) return weight.mobile || '400';
    if (isTablet) return weight.tablet || '500';
    return weight.desktop || '600';
  };

  return (
    <span
      className={`responsive-text ${className}`}
      style={{
        fontSize: getSize(),
        fontWeight: getWeight(),
      }}
    >
      {children}
    </span>
  );
};

// Responsive Image Component
interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  height?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  className?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width = { mobile: '100%', tablet: 'auto', desktop: 'auto' },
  height = { mobile: 'auto', tablet: 'auto', desktop: 'auto' },
  className = '',
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getWidth = () => {
    if (isMobile) return width.mobile || '100%';
    if (isTablet) return width.tablet || 'auto';
    return width.desktop || 'auto';
  };

  const getHeight = () => {
    if (isMobile) return height.mobile || 'auto';
    if (isTablet) return height.tablet || 'auto';
    return height.desktop || 'auto';
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`responsive-image ${className}`}
      style={{
        width: getWidth(),
        height: getHeight(),
        maxWidth: '100%',
      }}
    />
  );
};

export default ResponsiveLayout;
