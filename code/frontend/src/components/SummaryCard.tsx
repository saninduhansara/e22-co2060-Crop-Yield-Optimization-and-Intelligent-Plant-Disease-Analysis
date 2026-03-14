import React from 'react';

export interface SummaryCardProps {
  /** Main title text shown above the value or inside the card.  */
  title?: string;
  /** The primary value or JSX to display.  */
  value?: React.ReactNode;
  /** Optional unit text that appears next to the value. */
  unit?: React.ReactNode;
  /** A small line of secondary text, usually below the value. */
  subtext?: React.ReactNode;
  /** Icon element to render (typically a lucide-react icon). */
  icon?: React.ReactNode;
  /** Background colour classes for the icon container. */
  iconBgClass?: string;
  /** Additional classes applied to the card wrapper. */
  className?: string;
  /** Inline styles applied to the card wrapper. */
  style?: React.CSSProperties;
  /** Whether the card should show the hover shadow and pointer cursor. */
  hoverable?: boolean;
  /** React children allow full custom layout instead of using props above. */
  children?: React.ReactNode;
}

export function SummaryCard({
  title,
  value,
  unit,
  subtext,
  icon,
  iconBgClass = '',
  className = '',
  style,
  hoverable = false,
  children,
}: SummaryCardProps) {
  const baseClasses =
    'bg-white rounded-2xl p-4 md:p-6 border border-gray-200 transition-all duration-200';
  const hoverClasses = hoverable ? 'hover:shadow-md hover:cursor-pointer group' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`.trim()} style={style}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {children ? (
            children
          ) : (
            <>
              {title && (
                <p className="text-xs md:text-sm text-gray-600 mb-2">{title}</p>
              )}
              {value !== undefined && (
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {value}
                  {unit && <span className="text-xs text-gray-600 ml-1">{unit}</span>}
                </p>
              )}
              {subtext && (
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  {subtext}
                </p>
              )}
            </>
          )}
        </div>
        {icon && (
          <div
            className={`${iconBgClass} rounded-lg p-3 group-hover:bg-opacity-90 transition-colors`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
