import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, Receipt, CreditCard, ArrowRight, CheckCircle2, ShieldCheck, LifeBuoy, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatINR } from '../../utils/formatters';

export const CustomerOverview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscriptions, invoices, payments } = useData();

  // Filter records specifically for current client
  const mySubscriptions = subscriptions.filter(
    (s) => s.customerName.toLowerCase().includes(user?.name.toLowerCase() || 'yuvraj') || s.customerId === 'cust-01'
  );
  const myInvoices = invoices.filter(
    (i) => i.customerName.toLowerCase().includes(user?.name.toLowerCase() || 'yuvraj') || i.customerId === 'cust-01'
  );
  const myPayments = payments.filter(
    (p) => p.customerName.toLowerCase().includes(user?.name.toLowerCase() || 'yuvraj') || p.customerId === 'cust-01'
  );

  const activeSub = mySubscriptions.find((s) => s.status === 'ACTIVE') || mySubscriptions[0];

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Welcome back, {user?.name || 'Customer'}
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3" /> Verified Enterprise Account
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Brightloop Software Client Portal • Manage active subscriptions, add-ons, tax invoices, and support desk
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LifeBuoy className="w-3.5 h-3.5 text-indigo-600" />}
            onClick={() => navigate('/customer/tickets')}
          >
            Raise Support Ticket
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/customer/subscriptions')}
          >
            Manage Subscriptions
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={mySubscriptions.filter((s) => s.status === 'ACTIVE').length}
          subtitle="Enterprise software licenses"
          icon={<Repeat className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Outstanding Balance"
          value={formatINR(myInvoices.reduce((acc, i) => acc + (i.status !== 'PAID' ? i.outstandingBalance : 0), 0))}
          subtitle="pending payment settlement"
          icon={<Receipt className="w-5 h-5 text-rose-500" />}
        />
        <StatCard
          title="Total Paid to Date"
          value={formatINR(myPayments.reduce((acc, p) => acc + p.amount, 0))}
          subtitle="verified bank receipts"
          icon={<CreditCard className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Primary Subscription Card */}
      {activeSub ? (
        <Card
          title="Current Primary Subscription"
          subtitle={`Subscription ID: ${activeSub.subscriptionNumber}`}
          action={<Badge variant={activeSub.status}>{activeSub.status}</Badge>}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 block">Plan Name</span>
              <span className="text-sm font-semibold text-slate-900">{activeSub.planName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Billing Cadence</span>
              <span className="text-sm font-semibold text-slate-900 capitalize">{activeSub.billingFrequency.toLowerCase()}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Next Renewal / Invoicing</span>
              <span className="text-sm font-semibold text-slate-900 font-mono">{activeSub.nextBillingDate}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Recurring Fee</span>
              <span className="text-sm font-bold text-indigo-600 font-mono">{formatINR(activeSub.amount)}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Contract active from {activeSub.startDate} to {activeSub.expiryDate}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/customer/subscriptions')}
              >
                Configure Add-ons & Licenses
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="py-8 text-center text-xs text-slate-500">
            <p className="mb-2">No active subscriptions registered for this customer account.</p>
            <Button size="sm" onClick={() => navigate('/customer/subscriptions')}>
              Explore Available Subscriptions
            </Button>
          </div>
        </Card>
      )}

      {/* Recent Invoices Table */}
      <Card
        title="Recent Invoices"
        subtitle="Download tax invoices or check payment statuses"
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Billing Period</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                myInvoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-3 text-slate-600">{inv.billingPeriodStart} → {inv.billingPeriodEnd}</td>
                    <td className="py-2.5 px-3 text-slate-600">{inv.dueDate}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatINR(inv.total)}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={inv.status}>{inv.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
