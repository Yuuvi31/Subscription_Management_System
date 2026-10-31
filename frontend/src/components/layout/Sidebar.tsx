import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Package,
  Layers,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  Repeat,
  Receipt,
  CreditCard,
  Percent,
  PercentCircle,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  name: string;
  to: string;
  icon: React.ReactNode;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { role, user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const getNavigationGroups = (): NavSection[] => {
    if (role === 'ADMIN') {
      return [
        {
          group: 'Overview',
          items: [
            { name: 'Dashboard', to: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          ],
        },
        {
          group: 'Business',
          items: [
            { name: 'Customers', to: '/admin/customers', icon: <Users className="w-4 h-4" /> },
            { name: 'Staff', to: '/admin/staff', icon: <ShieldAlert className="w-4 h-4" /> },
            { name: 'Products', to: '/admin/products', icon: <Package className="w-4 h-4" /> },
            { name: 'Variants', to: '/admin/variants', icon: <Layers className="w-4 h-4" /> },
            { name: 'Plans', to: '/admin/plans', icon: <CalendarDays className="w-4 h-4" /> },
          ],
        },
        {
          group: 'Sales',
          items: [
            { name: 'Quotations', to: '/admin/quotations', icon: <FileText className="w-4 h-4" /> },
            { name: 'Templates', to: '/admin/templates', icon: <FileSpreadsheet className="w-4 h-4" /> },
            { name: 'Subscriptions', to: '/admin/subscriptions', icon: <Repeat className="w-4 h-4" /> },
          ],
        },
        {
          group: 'Finance',
          items: [
            { name: 'Invoices', to: '/admin/invoices', icon: <Receipt className="w-4 h-4" /> },
            { name: 'Payments', to: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
            { name: 'Discounts', to: '/admin/discounts', icon: <Percent className="w-4 h-4" /> },
            { name: 'Taxes', to: '/admin/taxes', icon: <PercentCircle className="w-4 h-4" /> },
          ],
        },
        {
          group: 'System',
          items: [
            { name: 'Reports', to: '/admin/reports', icon: <BarChart3 className="w-4 h-4" /> },
            { name: 'Settings', to: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
          ],
        },
      ];
    }

    if (role === 'STAFF') {
      return [
        {
          group: 'Overview',
          items: [
            { name: 'Dashboard', to: '/staff/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          ],
        },
        {
          group: 'Operations',
          items: [
            { name: 'Customers', to: '/staff/customers', icon: <Users className="w-4 h-4" /> },
            { name: 'Quotations', to: '/staff/quotations', icon: <FileText className="w-4 h-4" /> },
            { name: 'Subscriptions', to: '/staff/subscriptions', icon: <Repeat className="w-4 h-4" /> },
            { name: 'Invoices', to: '/staff/invoices', icon: <Receipt className="w-4 h-4" /> },
            { name: 'Payments', to: '/staff/payments', icon: <CreditCard className="w-4 h-4" /> },
          ],
        },
      ];
    }

    // CUSTOMER PORTAL
    return [
      {
        group: 'Overview',
        items: [
          { name: 'Overview', to: '/customer/overview', icon: <LayoutDashboard className="w-4 h-4" /> },
        ],
      },
      {
        group: 'Self Service',
        items: [
          { name: 'My Subscriptions', to: '/customer/subscriptions', icon: <Repeat className="w-4 h-4" /> },
          { name: 'My Invoices', to: '/customer/invoices', icon: <Receipt className="w-4 h-4" /> },
          { name: 'Payment History', to: '/customer/payments', icon: <CreditCard className="w-4 h-4" /> },
          { name: 'Profile', to: '/customer/profile', icon: <Users className="w-4 h-4" /> },
        ],
      },
    ];
  };

  const sections = getNavigationGroups();

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 bg-sidebar border-r border-border transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand & Workspace Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-border">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow-sm font-bold text-sm tracking-tight">
                LB
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-text-primary tracking-tight truncate">
                  LOOPBILL
                </span>
                <span className="text-[10px] text-text-muted truncate font-medium flex items-center gap-1">
                  <Building2 className="w-2.5 h-2.5" /> Brightloop Software
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
              LB
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-gray-100 hidden md:flex items-center justify-center"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-8.5rem)]">
          {sections.map((section) => (
            <div key={section.group}>
              {!collapsed && (
                <h4 className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-text-muted uppercase">
                  {section.group}
                </h4>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-light text-primary font-semibold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                      } ${collapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User profile & Session Footer */}
      <div className="p-3 border-t border-border bg-[#FBFBFC]">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-text-primary truncate">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] text-text-muted truncate font-mono">
                  {role}
                </span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign out"
              className="p-1.5 rounded text-text-muted hover:text-danger hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => logout()}
            title="Sign out"
            className="w-full flex items-center justify-center p-2 rounded text-text-muted hover:text-danger hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
