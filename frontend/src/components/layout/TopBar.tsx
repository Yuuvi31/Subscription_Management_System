import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  HelpCircle,
  ChevronRight,
  Shield,
  IndianRupee,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TopBar: React.FC = () => {
  const { role, user } = useAuth();
  const location = useLocation();

  // Generate readable breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathParts.map((part) => {
    return part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ');
  });

  const getRoleBadge = () => {
    if (role === 'ADMIN') {
      return <span className="text-[10px] font-bold bg-primary-light text-primary px-2 py-0.5 rounded border border-primary/20">ADMINISTRATOR</span>;
    }
    if (role === 'STAFF') {
      return <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">STAFF OPS</span>;
    }
    return <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">CUSTOMER</span>;
  };

  return (
    <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">LoopBill</span>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
            <span
              className={
                index === breadcrumbItems.length - 1
                  ? 'font-medium text-text-primary'
                  : 'hover:text-text-primary cursor-pointer'
              }
            >
              {item}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Currency Tag */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
          <IndianRupee className="w-3 h-3 text-emerald-700" />
          <span>INR (₹) Billing Active</span>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden lg:block w-64">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subscriptions, invoices..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F8FA] border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
          />
        </div>

        {/* Role Badge Indicator */}
        <div className="hidden md:block">
          {getRoleBadge()}
        </div>

        {/* Notifications */}
        <button
          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-md relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Help */}
        <button
          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-md hidden sm:block"
          title="Brightloop Support Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Identity Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-text-primary leading-tight">{user?.name || 'User'}</span>
            <span className="text-[10px] text-text-muted font-mono leading-tight">{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
