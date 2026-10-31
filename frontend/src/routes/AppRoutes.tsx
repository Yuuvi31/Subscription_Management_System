import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { CustomersPage } from '../pages/admin/CustomersPage';
import { CustomerDetailPage } from '../pages/admin/CustomerDetailPage';
import { StaffPage } from '../pages/admin/StaffPage';
import { ProductsPage } from '../pages/admin/ProductsPage';
import { ProductVariantsPage } from '../pages/admin/ProductVariantsPage';
import { PlansPage } from '../pages/admin/PlansPage';
import { QuotationsPage } from '../pages/admin/QuotationsPage';
import { QuotationWizardPage } from '../pages/admin/QuotationWizardPage';
import { QuotationTemplatesPage } from '../pages/admin/QuotationTemplatesPage';
import { SubscriptionsPage } from '../pages/admin/SubscriptionsPage';
import { SubscriptionDetailPage } from '../pages/admin/SubscriptionDetailPage';
import { InvoicesPage } from '../pages/admin/InvoicesPage';
import { InvoiceDetailPage } from '../pages/admin/InvoiceDetailPage';
import { PaymentsPage } from '../pages/admin/PaymentsPage';
import { DiscountsPage } from '../pages/admin/DiscountsPage';
import { TaxesPage } from '../pages/admin/TaxesPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { SupportTicketsPage } from '../pages/admin/SupportTicketsPage';

// Staff Pages
import { StaffDashboard } from '../pages/staff/StaffDashboard';

// Customer Portal Pages
import { CustomerOverview } from '../pages/customer/CustomerOverview';
import { CustomerSubscriptions } from '../pages/customer/CustomerSubscriptions';
import { CustomerInvoices } from '../pages/customer/CustomerInvoices';
import { CustomerPayments } from '../pages/customer/CustomerPayments';
import { CustomerProfile } from '../pages/customer/CustomerProfile';
import { CustomerTickets } from '../pages/customer/CustomerTickets';

export const AppRoutes: React.FC = () => {
  const { role } = useAuth();

  const getDefaultRedirect = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'STAFF') return '/staff/dashboard';
    return '/customer/overview';
  };

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={getDefaultRedirect()} replace />} />

      {/* Protected Layout Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* ADMIN ROUTES */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CustomerDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <StaffPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/variants"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProductVariantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PlansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/quotations"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <QuotationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/quotations/new"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <QuotationWizardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/templates"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <QuotationTemplatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SubscriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subscriptions/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SubscriptionDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/invoices"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <InvoicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/invoices/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <InvoiceDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/discounts"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DiscountsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/taxes"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <TaxesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SupportTicketsPage />
            </ProtectedRoute>
          }
        />

        {/* STAFF ROUTES */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/customers"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/customers/:id"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <CustomerDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/quotations"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <QuotationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/quotations/new"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <QuotationWizardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <SubscriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/subscriptions/:id"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <SubscriptionDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/invoices"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <InvoicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/invoices/:id"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <InvoiceDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/payments"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/tickets"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <SupportTicketsPage />
            </ProtectedRoute>
          }
        />

        {/* CUSTOMER PORTAL ROUTES */}
        <Route
          path="/customer/overview"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <CustomerOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <CustomerSubscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/invoices"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <CustomerInvoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/payments"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <CustomerPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/tickets"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <CustomerTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
