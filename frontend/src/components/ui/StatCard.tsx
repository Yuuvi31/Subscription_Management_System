import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-lg border border-border p-5 shadow-subtle ${
        onClick ? 'cursor-pointer hover:border-primary/40 transition-colors' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="p-2 bg-[#F7F8FA] rounded-md text-text-secondary border border-border/60">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold tracking-tight text-text-primary">
          {value}
        </span>
      </div>
      {(subtitle || trend) && (
        <div className="mt-2 flex items-center text-xs">
          {trend && (
            <span
              className={`font-medium mr-1.5 ${
                trend.isPositive ? 'text-success' : 'text-danger'
              }`}
            >
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-text-secondary">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
