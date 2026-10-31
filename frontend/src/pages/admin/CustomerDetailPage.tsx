import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Repeat,
  Receipt,
  CreditCard,
  Plus,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../utils/formatters';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, subscriptions: allSubs, invoices: allInvs, payments: allPays } = useData();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices' | 'payments'>('subscriptions');

  const customer = customers.find((c) => c.id === id);

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-600 text-sm">Customer account not found.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/admin/customers')}>
          Return to Customers
        </Button>
      </div>
    );
  }

  const subscriptions = allSubs.filter((s) => s.customerId === customer.id);
  const invoices = allInvs.filter((i) => i.customerId === customer.id);
  const payments = allPays.filter((p) => p.customerId === customer.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/admin/customers')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {customer.name}
              </h1>
              <Badge variant={customer.status}>{customer.status}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-slate-400" /> {customer.company} • Added {customer.createdAt}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => navigate('/admin/quotations/new')}
            >
              Draft Quotation
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Active Contracts"
          value={customer.activeSubscriptions}
          subtitle={`Total: ${customer.totalSubscriptions} on record`}
          icon={<Repeat className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Outstanding Dues"
          value={formatINR(customer.outstandingAmount)}
          subtitle="Unpaid billing balance"
          icon={<Receipt className="w-5 h-5 text-red-600" />}
        />
        <StatCard
          title="Total Paid"
          value={formatINR(payments.reduce((acc, p) => acc + p.amount, 0))}
          subtitle="Settled receipts"
          icon={<CreditCard className="w-5 h-5 text-emerald-600" />}
        />
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-subtle text-xs space-y-1.5">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">Contact Profile</span>
          <p className="text-slate-900 font-medium flex items-center gap-1.5 truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {customer.email}
          </p>
          <p className="text-slate-600 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {customer.phone}
          </p>
          <p className="text-slate-600 flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {customer.address}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 flex gap-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'subscriptions'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Subscriptions ({subscriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'invoices'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Payments ({payments.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'subscriptions' && (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Subscription #</th>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Billing Frequency</th>
                <th className="py-3 px-4">Next Billing Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active subscriptions on file for this customer.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{sub.subscriptionNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{sub.planName}</td>
                    <td className="py-3 px-4 capitalize">{sub.billingFrequency.toLowerCase()}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{sub.nextBillingDate}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">{formatINR(sub.amount)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={sub.status}>{sub.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/subscriptions/${sub.id}`)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'invoices' && (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No invoices issued for this customer.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{inv.issueDate}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{inv.dueDate}</td>
                    <td className="py-3 px-4 text-right font-bold font-mono">{formatINR(inv.total)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-red-600 font-mono">{formatINR(inv.outstandingBalance)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={inv.status}>{inv.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/invoices/${inv.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Payment Ref</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Note</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No payment records logged yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 font-mono">{p.id}</td>
                    <td className="py-3 px-4 font-mono font-medium text-indigo-600">{p.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{p.paymentDate}</td>
                    <td className="py-3 px-4 capitalize">{p.method.replace('_', ' ').toLowerCase()}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 font-mono">+{formatINR(p.amount)}</td>
                    <td className="py-3 px-4 text-slate-500">{p.note}</td>
                    <td className="py-3 px-4">
                      <Badge variant="paid">{p.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};
