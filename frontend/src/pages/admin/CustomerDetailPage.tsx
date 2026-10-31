import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Repeat,
  Receipt,
  CreditCard,
  Plus,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { MOCK_CUSTOMERS, MOCK_SUBSCRIPTIONS, MOCK_INVOICES, MOCK_PAYMENTS } from '../../services/mockData';
import { formatINR } from '../../utils/formatters';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices' | 'payments' | 'activity'>('subscriptions');

  const customer = MOCK_CUSTOMERS.find((c) => c.id === id) || MOCK_CUSTOMERS[0];
  const subscriptions = MOCK_SUBSCRIPTIONS.filter((s) => s.customerId === customer.id);
  const invoices = MOCK_INVOICES.filter((i) => i.customerId === customer.id);
  const payments = MOCK_PAYMENTS.filter((p) => p.customerId === customer.id);

  return (
    <div className="space-y-6">
      {/* Back button & Page Title */}
      <div>
        <button
          onClick={() => navigate('/admin/customers')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                {customer.name}
              </h1>
              <Badge variant={customer.status}>{customer.status}</Badge>
            </div>
            <p className="text-xs text-text-secondary mt-1 flex items-center gap-2">
              <Building className="w-3.5 h-3.5" /> {customer.company} • Registered {customer.createdAt}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Receipt className="w-3.5 h-3.5" />}
              onClick={() => navigate('/admin/invoices')}
            >
              Issue Invoice
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => navigate('/admin/quotations/new')}
            >
              New Quotation
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={customer.activeSubscriptions}
          subtitle={`Total: ${customer.totalSubscriptions}`}
          icon={<Repeat className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Outstanding Dues"
          value={formatINR(customer.outstandingAmount)}
          subtitle="pending invoices"
          icon={<Receipt className="w-5 h-5 text-danger" />}
        />
        <StatCard
          title="Total Paid"
          value={formatINR(payments.reduce((acc, p) => acc + p.amount, 0))}
          subtitle="lifetime collections"
          icon={<CreditCard className="w-5 h-5 text-success" />}
        />
        <div className="bg-card rounded-lg border border-border p-5 shadow-subtle text-xs space-y-1.5">
          <span className="font-semibold text-text-muted uppercase tracking-wider text-[10px] block">Contact Details</span>
          <p className="text-text-primary font-medium flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-text-muted" /> {customer.email}
          </p>
          <p className="text-text-secondary flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-text-muted" /> {customer.phone}
          </p>
          <p className="text-text-secondary flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-text-muted" /> {customer.address}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border flex gap-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'subscriptions'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Subscriptions ({subscriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'invoices'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'payments'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Payments ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'activity'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Activity Log
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'subscriptions' && (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Subscription #</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Billing Frequency</th>
                <th className="py-3 px-4">Next Billing Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-text-primary">{sub.subscriptionNumber}</td>
                  <td className="py-3 px-4 font-semibold text-text-primary">{sub.planName}</td>
                  <td className="py-3 px-4 capitalize">{sub.billingFrequency.toLowerCase()}</td>
                  <td className="py-3 px-4">{sub.nextBillingDate}</td>
                  <td className="py-3 px-4 text-right font-bold text-text-primary font-mono">{formatINR(sub.amount)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={sub.status}>{sub.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/subscriptions/${sub.id}`)}>
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'invoices' && (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary uppercase font-semibold">
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
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-text-primary">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4">{inv.issueDate}</td>
                  <td className="py-3 px-4">{inv.dueDate}</td>
                  <td className="py-3 px-4 text-right font-bold font-mono">{formatINR(inv.total)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-danger font-mono">{formatINR(inv.outstandingBalance)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={inv.status}>{inv.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/invoices/${inv.id}`)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary uppercase font-semibold">
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
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 px-4 font-mono">{p.id}</td>
                  <td className="py-3 px-4 font-mono font-medium text-primary">{p.invoiceNumber}</td>
                  <td className="py-3 px-4">{p.paymentDate}</td>
                  <td className="py-3 px-4 capitalize">{p.method.replace('_', ' ').toLowerCase()}</td>
                  <td className="py-3 px-4 text-right font-bold text-success font-mono">+{formatINR(p.amount)}</td>
                  <td className="py-3 px-4 text-text-muted">{p.note}</td>
                  <td className="py-3 px-4">
                    <Badge variant="paid">{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card title="Audit & Lifecycle Events">
          <div className="space-y-4 text-xs">
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
              <div>
                <p className="font-semibold text-text-primary">Invoice INV-2026-1001 generated by recurring billing cycle</p>
                <p className="text-text-muted text-[11px]">2026-10-01 00:00:00 UTC</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-success shrink-0" />
              <div>
                <p className="font-semibold text-text-primary">Payment of $1,450.00 logged against invoice INV-2026-0801</p>
                <p className="text-text-muted text-[11px]">2026-08-20 14:32:15 UTC</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0" />
              <div>
                <p className="font-semibold text-text-primary">Subscription SUB-2026-0101 activated from accepted Quotation QT-2026-0042</p>
                <p className="text-text-muted text-[11px]">2026-02-01 10:15:00 UTC</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
