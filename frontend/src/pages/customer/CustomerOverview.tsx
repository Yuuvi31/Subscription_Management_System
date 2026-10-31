import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, Receipt, CreditCard, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MOCK_SUBSCRIPTIONS, MOCK_INVOICES, MOCK_PAYMENTS } from '../../services/mockData';
import { formatINR } from '../../utils/formatters';

export const CustomerOverview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter records specifically for the customer's company
  const mySubscriptions = MOCK_SUBSCRIPTIONS.filter(s => s.customerId === 'cust-01');
  const myInvoices = MOCK_INVOICES.filter(i => i.customerId === 'cust-01');
  const myPayments = MOCK_PAYMENTS.filter(p => p.customerId === 'cust-01');

  const activeSub = mySubscriptions[0];

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text-primary">
              Welcome, {user?.name || 'Customer'}
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3" /> Verified Client
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Manage your Brightloop software subscriptions, review invoices, and verify payment receipts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/customer/invoices')}
          >
            View Invoices
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/customer/subscriptions')}
          >
            My Subscriptions
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={mySubscriptions.filter(s => s.status === 'ACTIVE').length}
          subtitle="Enterprise plans active"
          icon={<Repeat className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Outstanding Balance"
          value={formatINR(myInvoices.reduce((acc, i) => acc + i.outstandingBalance, 0))}
          subtitle="pending payment"
          icon={<Receipt className="w-5 h-5 text-danger" />}
        />
        <StatCard
          title="Total Paid"
          value={formatINR(myPayments.reduce((acc, p) => acc + p.amount, 0))}
          subtitle="settled to date"
          icon={<CreditCard className="w-5 h-5 text-success" />}
        />
      </div>

      {/* Primary Subscription Card */}
      {activeSub && (
        <Card
          title="Current Primary Subscription"
          subtitle={`Subscription ID: ${activeSub.subscriptionNumber}`}
          action={
            <Badge variant={activeSub.status}>{activeSub.status}</Badge>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2 border-b border-border">
            <div>
              <span className="text-xs text-text-muted block">Plan Name</span>
              <span className="text-sm font-semibold text-text-primary">{activeSub.planName}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted block">Billing Cadence</span>
              <span className="text-sm font-semibold text-text-primary capitalize">{activeSub.billingFrequency.toLowerCase()}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted block">Next Billing Date</span>
              <span className="text-sm font-semibold text-text-primary">{activeSub.nextBillingDate}</span>
            </div>
            <div>
              <span className="text-xs text-text-muted block">Recurring Amount</span>
              <span className="text-sm font-bold text-text-primary font-mono">{formatINR(activeSub.amount)}</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <span className="text-xs text-text-secondary flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" /> Auto-renewal configured for {activeSub.expiryDate}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/customer/subscriptions')}
            >
              Manage Subscriptions & Add-ons
            </Button>
          </div>
        </Card>
      )}

      {/* Recent Invoices & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Recent Invoices"
          subtitle="Billing statements issued for your account"
          action={
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/customer/invoices')}
            >
              All Invoices
            </Button>
          }
        >
          <div className="divide-y divide-border -mx-5 -mb-5">
            {myInvoices.map((inv) => (
              <div key={inv.id} className="p-4 px-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary font-mono">{inv.invoiceNumber}</span>
                    <Badge variant={inv.status}>{inv.status}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">Due: {inv.dueDate}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-text-primary block font-mono">{formatINR(inv.total)}</span>
                  <button
                    onClick={() => navigate(`/customer/invoices`)}
                    className="text-xs text-primary font-medium hover:underline mt-0.5"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Payment Receipts"
          subtitle="Logged transactions and settlement notes"
          action={
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/customer/payments')}
            >
              History
            </Button>
          }
        >
          <div className="divide-y divide-border -mx-5 -mb-5">
            {myPayments.length > 0 ? (
              myPayments.map((p) => (
                <div key={p.id} className="p-4 px-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-text-primary font-mono">{p.invoiceNumber}</span>
                    <p className="text-xs text-text-secondary mt-0.5">{p.paymentDate} • {p.method.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-success block font-mono">+{formatINR(p.amount)}</span>
                    <Badge variant="paid">Settled</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-xs text-text-secondary">No recorded payments to display.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
