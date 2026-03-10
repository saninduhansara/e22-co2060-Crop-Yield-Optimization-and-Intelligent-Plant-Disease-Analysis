import { useEffect, useState, useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface GlassStatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  subtitle: string;
  percentage?: number;
  loading?: boolean;
  variant?: 'default' | 'danger';
  isActive?: boolean;
}

export function GlassStatCard({
  title,
  value,
  unit,
  icon: Icon,
  subtitle,
  percentage,
  loading = false,
  variant = 'default',
  isActive = false,
}: GlassStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Parse numeric value from formatted string
  const getNumericValue = (val: string | number): number => {
    if (typeof val === 'number') return val;
    // Remove commas and non-numeric characters except dots
    const cleanedValue = val.replace(/[^0-9.]/g, '');
    return parseFloat(cleanedValue) || 0;
  };

  // Count up animation
  useEffect(() => {
    if (loading || hasAnimated) return;

    const targetValue = getNumericValue(value);
    if (targetValue === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepValue = targetValue / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(targetValue);
        setHasAnimated(true);
        clearInterval(timer);
      } else {
        setDisplayValue(stepValue * currentStep);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, loading, hasAnimated]);

  // Format display value to match original formatting
  const formatDisplayValue = (val: number): string => {
    if (typeof value === 'string' && value.includes('K')) {
      return `${(val / 1000).toFixed(1)}K`;
    } else if (typeof value === 'string' && value.includes('M')) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    return val.toFixed(val >= 100 ? 0 : 1);
  };

  const isDanger = variant === 'danger';
  const gradientFrom = isDanger ? 'from-red-500/10' : 'from-green-500/10';
  const gradientTo = isDanger ? 'to-orange-500/10' : 'to-emerald-500/10';
  const borderFrom = isDanger ? 'from-red-500' : 'from-green-500';
  const borderTo = isDanger ? 'to-orange-500' : 'to-emerald-500';
  const iconColor = isDanger ? 'text-red-600' : 'text-green-600';
  const progressBg = isDanger ? 'bg-red-500' : 'bg-green-500';

  return (
    <div
      ref={cardRef}
      className={`
        group relative
        bg-white/70 backdrop-blur-md
        rounded-2xl p-5 sm:p-6
        shadow-lg
        transition-all duration-300 ease-out
        hover:-translate-y-2 hover:shadow-2xl
        border border-transparent
        bg-gradient-to-br ${gradientFrom} ${gradientTo}
        overflow-hidden
      `}
      style={{
        backgroundImage: `
          linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
        `,
      }}
    >
      {/* Gradient Border Effect */}
      <div
        className={`
          absolute inset-0 rounded-2xl p-[2px]
          bg-gradient-to-br ${borderFrom} ${borderTo}
          -z-10
          opacity-50 group-hover:opacity-100
          transition-opacity duration-300
        `}
        style={{
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '2px',
        }}
      />

      <div className="flex flex-col relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            {title}
          </p>
          <div className={`
            ${isActive ? 'animate-pulse' : ''}
            ${loading ? 'animate-spin' : ''}
            transition-all duration-300
            group-hover:scale-110
          `}>
            <Icon className={`w-5 h-5 ${iconColor} opacity-70 group-hover:opacity-100`} />
          </div>
        </div>

        {/* Value */}
        <div className="flex min-w-0 flex-wrap items-baseline gap-1 sm:gap-2 my-2">
          <p className="text-3xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words min-w-0 tabular-nums">
            {loading ? '...' : hasAnimated ? value : formatDisplayValue(displayValue)}
          </p>
          {unit && (
            <span className="text-xs sm:text-sm font-medium text-gray-600 break-words">
              {unit}
            </span>
          )}
        </div>

        {/* Subtitle */}
        <p className={`
          text-xs sm:text-sm mt-2 flex items-center gap-1
          ${isDanger ? 'text-red-700 font-medium' : 'text-gray-600'}
        `}>
          {subtitle}
        </p>

        {/* Progress Bar */}
        {percentage !== undefined && !loading && (
          <div className="mt-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>vs Last Season</span>
              <span className={`font-semibold ${percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {percentage >= 0 ? '+' : ''}{percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`
                  h-full ${progressBg} rounded-full
                  transition-all duration-1000 ease-out
                  ${hasAnimated ? 'animate-pulse-slow' : ''}
                `}
                style={{
                  width: hasAnimated ? `${Math.min(Math.abs(percentage), 100)}%` : '0%',
                  transitionDelay: '500ms',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Glassmorphism shine effect on hover */}
      <div className="
        absolute inset-0 
        bg-gradient-to-br from-white/40 to-transparent
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        pointer-events-none
        rounded-2xl
      " />
    </div>
  );
}
