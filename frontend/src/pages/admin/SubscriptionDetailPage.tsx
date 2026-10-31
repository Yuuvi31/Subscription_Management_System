import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Repeat,
  Calendar,
  Building,
  Pause,
  Play,
  RotateCcw,
  XCircle,
  Receipt,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { useData } from '../../context/DataContext';
import { SubscriptionStatus } from '../../types';
import { formatINR } from '../../utils/formatters';

export const SubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subscriptions, invoices, payments, updateSubscriptionStatus, renewSubscription } = useData();

  const sub = subscriptions.find((s) => s.id === id) || subscriptions[0];
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!sub) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-lg font-bold text-slate-900">Subscription Not Found</h2>
        <p className="text-xs text-slate-500">The requested subscription does not exist or has been removed.</p>
        <Button size="sm" onClick={() => navigate('/admin/subscriptions')}>
          Return to Subscriptions List
        </Button>
      </div>
    );
  }

  const subInvoices = invoices.filter((i) => i.subscriptionId === sub.id);
  const subPayments = payments.filter((p) =>
    subInvoices.some((inv) => inv.id === p.invoiceId || inv.invoiceNumber === p.invoiceNumber)
  );

  const handleAction = (newStatus: SubscriptionStatus, label: string) => {
    updateSubscriptionStatus(sub.id, newStatus);
    setFeedback(`Subscription state successfully updated to ${label}`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRenew = () => {
    renewSubscription(sub.id);
    setFeedback('Subscription successfully renewed for another contractual billing period!');
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <button
          onClick={() => navigate('/admin/subscriptions')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Subscriptions
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {sub.subscriptionNumber}
              </h1>
              <Badge variant={sub.status}>{sub.status}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Customer: <strong className="text-slate-900">{sub.customerName}</strong> ({sub.customerCompany})
            </p>
          </div>

          {/* Lifecycle Action Buttons */}
          <div className="flex items-center gap-2">
            {sub.status === 'ACTIVE' && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Pause className="w-3.5 h-3.5" />}
                onClick={() => handleAction('PAUSED', 'PAUSED')}
              >
                Pause Contract
              </Button>
            )}

            {sub.status === 'PAUSED' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Play className="w-3.5 h-3.5" />}
                onClick={() => handleAction('ACTIVE', 'ACTIVE')}
              >
                Resume Contract
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleRenew}
            >
              Manual Renewal
            </Button>

            {sub.status !== 'CLOSED' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                onClick={() => handleAction('CLOSED', 'CLOSED')}
              >
                Close Contract
              </Button>
            )}
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
          {feedback}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Plan Name"
          value={sub.planName}
          subtitle={`Billed ${sub.billingFrequency.toLowerCase()}`}
          icon={<Repeat className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Recurring Rate"
          value={formatINR(sub.amount)}
          subtitle="per subscription cycle"
          icon={<Receipt className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Next Invoicing Date"
          value={sub.nextBillingDate}
          subtitle="automated generation"
          icon={<Calendar className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Contract Expiration"
          value={sub.expiryDate}
          subtitle={sub.status === 'ACTIVE' ? 'Active term' : 'Term concluded'}
          icon={<CheckCircle2 className="w-5 h-5 text-slate-500" />}
        />
      </div>

      {/* Contract Details and Line Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Contract Line Items" subtitle="Included software licenses, seats, and addons">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Product / Service</th>
                    <th className="py-2.5 px-3">Edition / Variant</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sub.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{l.productName}</td>
                      <td className="py-2.5 px-3 text-indigo-600 font-mono text-[11px]">{l.variantName || 'Base Edition'}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{l.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatINR(l.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">{formatINR(l.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <div className="text-right text-xs">
                <span className="text-slate-500 mr-2">Calculated Total Fee:</span>
                <span className="text-base font-bold text-slate-900 font-mono">{formatINR(sub.amount)}</span>
              </div>
            </div>
          </Card>

          {/* Related Invoices */}
          <Card title="Generated Statements & Invoices" subtitle="Chronological ledger of billing runs for this contract">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Outstanding</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No invoices generated yet for this subscription.
                      </td>
                    </tr>
                  ) : (
                    subInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/admin/invoices/${inv.id}`)}>
                        <td className="py-2.5 px-3 font-mono font-medium text-indigo-600">{inv.invoiceNumber}</td>
                        <td className="py-2.5 px-3 text-slate-600">{inv.issueDate}</td>
                        <td className="py-2.5 px-3 text-slate-600">{inv.dueDate}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatINR(inv.total)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-600">
                          {inv.outstandingBalance > 0 ? formatINR(inv.outstandingBalance) : '₹0'}
                        </td>
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

        {/* Right column: Contract terms and client info */}
        <div className="space-y-6">
          <Card title="Contract Parameters">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Contract Start</span>
                <span className="font-semibold text-slate-900">{sub.startDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Contract End</span>
                <span className="font-semibold text-slate-900">{sub.expiryDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Terms</span>
                <span className="font-semibold text-slate-900">{sub.paymentTerms}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Early Termination</span>
                <span className="font-semibold text-emerald-700">Permitted</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Contract Auto-Renew</span>
                <span className="font-semibold text-indigo-600">Enabled</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Billing Cadence</span>
                <span className="font-semibold text-slate-900">{sub.billingFrequency}</span>
              </div>
            </div>
          </Card>

          <Card title="Account Info">
            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-900 text-sm">{sub.customerName}</p>
              <p className="text-slate-600">{sub.customerCompany}</p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/admin/customers/${sub.customerId}`)}
                >
                  View Customer Profile
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
