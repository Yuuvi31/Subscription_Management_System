import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const TopBar: React.FC = () => {
  const { role, isDemo, setDemoRole, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Generate readable breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathParts.map((part) => {
    return part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ');
  });

  const handleRoleChange = (newRole: UserRole) => {
    setDemoRole(newRole);
    setShowRoleMenu(false);
    if (newRole === 'ADMIN') navigate('/admin/dashboard');
    else if (newRole === 'STAFF') navigate('/staff/dashboard');
    else navigate('/customer/overview');
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
        {/* Global Search Bar */}
        <div className="relative hidden lg:block w-64">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subscriptions, invoices..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F8FA] border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
          />
        </div>

        {/* DEMO MODE ROLE SWITCHER */}
        {isDemo && (
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
              <span>DEMO MODE</span>
              <span className="text-[10px] font-mono px-1 py-0.2 bg-amber-200/70 rounded ml-1">
                {role}
              </span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-dropdown border border-border py-1.5 z-50">
                <div className="px-3 py-1 border-b border-border text-[10px] uppercase font-bold text-text-muted tracking-wider">
                  Switch Active Role
                </div>
                <button
                  onClick={() => handleRoleChange('ADMIN')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                    role === 'ADMIN'
                      ? 'bg-primary-light text-primary font-semibold'
                      : 'text-text-primary hover:bg-gray-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin (Full Access)</span>
                </button>
                <button
                  onClick={() => handleRoleChange('STAFF')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                    role === 'STAFF'
                      ? 'bg-primary-light text-primary font-semibold'
                      : 'text-text-primary hover:bg-gray-50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Staff (Sales & Invoices)</span>
                </button>
                <button
                  onClick={() => handleRoleChange('CUSTOMER')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                    role === 'CUSTOMER'
                      ? 'bg-primary-light text-primary font-semibold'
                      : 'text-text-primary hover:bg-gray-50'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Customer (Client Portal)</span>
                </button>
              </div>
            )}
          </div>
        )}

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
          title="Brightloop Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name[0] : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
