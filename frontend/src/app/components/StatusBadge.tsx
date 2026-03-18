import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export type SeverityLevel = 'stable' | 'moderate' | 'critical';

export interface StatusBadgeProps {
  /**
   * Numeric severity value (0-10 scale)
   * 0-3: Stable (Green)
   * 4-7: Moderate (Yellow)
   * 8-10: Critical (Red)
   */
  severity: number;

  /**
   * Optional custom label to override auto-generated label
   */
  label?: string;

  /**
   * Optional size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether to show icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Optional className for custom styling
   */
  className?: string;

  /**
   * Optional callback when badge is clicked
   */
  onClick?: () => void;
}

/**
 * Get severity level from numeric value
 * @param severity Numeric value 0-10
 * @returns Severity level: 'stable' | 'moderate' | 'critical'
 */
export const getSeverityLevel = (severity: number): SeverityLevel => {
  if (severity <= 3) return 'stable';
  if (severity <= 7) return 'moderate';
  return 'critical';
};

/**
 * Get color styling based on severity
 */
const getSeverityColors = (level: SeverityLevel) => {
  switch (level) {
  case 'stable':
    return {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-300',
      border: 'border-green-300 dark:border-green-700',
      dot: 'bg-green-500',
      label: 'Stable',
    };
  case 'moderate':
    return {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-300',
      border: 'border-yellow-300 dark:border-yellow-700',
      dot: 'bg-yellow-500',
      label: 'Moderate',
    };
  case 'critical':
    return {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-300',
      border: 'border-red-300 dark:border-red-700',
      dot: 'bg-red-500',
      label: 'Critical',
    };
  default:
    return {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-300',
      border: 'border-gray-300 dark:border-gray-600',
      dot: 'bg-gray-500',
      label: 'Unknown',
    };
  }
};

/**
 * Get icon based on severity
 */
const getSeverityIcon = (level: SeverityLevel) => {
  switch (level) {
  case 'stable':
    return <CheckCircle className="w-full h-full" />;
  case 'moderate':
    return <AlertTriangle className="w-full h-full" />;
  case 'critical':
    return <AlertCircle className="w-full h-full" />;
  default:
    return null;
  }
};

/**
 * Get size classes
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
  case 'sm':
    return {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
    };
  case 'md':
    return {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
    };
  case 'lg':
    return {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
    };
  default:
    return {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
    };
  }
};

/**
 * StatusBadge Component
 *
 * A reusable status indicator that displays health status based on severity
 *
 * @example
 * // Basic usage with numeric severity
 * <StatusBadge severity={8} />  // Shows "Critical" in red
 *
 * @example
 * // With custom label
 * <StatusBadge severity={5} label="Needs Monitoring" />
 *
 * @example
 * // Different sizes
 * <StatusBadge severity={2} size="sm" />   // Small
 * <StatusBadge severity={5} size="md" />   // Medium (default)
 * <StatusBadge severity={9} size="lg" />   // Large
 *
 * @example
 * // Without icon
 * <StatusBadge severity={3} showIcon={false} />
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  severity,
  label: customLabel,
  size = 'md',
  showIcon = true,
  className = '',
  onClick,
}) => {
  // Clamp severity between 0 and 10
  const clampedSeverity = Math.max(0, Math.min(10, severity));
  const level = getSeverityLevel(clampedSeverity);
  const colors = getSeverityColors(level);
  const sizeClasses = getSizeClasses(size);
  const label = customLabel || colors.label;
  const icon = getSeverityIcon(level);

  const baseStyles = `
    inline-flex items-center gap-2 font-semibold rounded-full
    border transition-all duration-200
    ${colors.bg} ${colors.text} ${colors.border}
    ${sizeClasses.container}
    ${onClick ? 'cursor-pointer hover:shadow-md active:scale-95' : ''}
    ${className}
  `.trim();

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={baseStyles}
      title={`Severity: ${clampedSeverity}/10 - ${level}`}
    >
      {showIcon && (
        <div className={`flex-shrink-0 ${sizeClasses.icon} text-current`}>
          {icon}
        </div>
      )}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
};

/**
 * StatusIndicator - A compact dot indicator without label
 */
export interface StatusIndicatorProps {
  severity: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  severity,
  size = 'md',
  animated = false,
}) => {
  const clampedSeverity = Math.max(0, Math.min(10, severity));
  const level = getSeverityLevel(clampedSeverity);
  const colors = getSeverityColors(level);

  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const animationClass = animated && level === 'critical' ? 'animate-pulse' : '';

  return (
    <div
      className={`${sizeMap[size]} rounded-full ${colors.dot} ${animationClass}`}
      title={`Status: ${level}`}
    />
  );
};

/**
 * StatusRow - Combined indicator and badge
 */
export interface StatusRowProps {
  severity: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const StatusRow: React.FC<StatusRowProps> = ({
  severity,
  label: customLabel,
  size = 'md',
  animated = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      <StatusIndicator severity={severity} size={size} animated={animated} />
      <StatusBadge severity={severity} label={customLabel} size={size} showIcon={false} />
    </div>
  );
};

export default StatusBadge;
