import React from 'react';

type BadgeVariant =
  | 'active'
  | 'confirmed'
  | 'draft'
  | 'paid'
  | 'paused'
  | 'closed'
  | 'cancelled'
  | 'overdue'
  | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const normalizedVariant = String(variant).toLowerCase();

  const getVariantStyles = () => {
    switch (normalizedVariant) {
      case 'active':
      case 'paid':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'confirmed':
      case 'accepted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'draft':
      case 'quotation':
      case 'sent':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'overdue':
      case 'closed':
      case 'cancelled':
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'paused':
      case 'inactive':
      case 'archived':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-text-secondary border-border';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getVariantStyles()} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75" />
      {children}
    </span>
  );
};
