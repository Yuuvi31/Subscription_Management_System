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
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { MOCK_SUBSCRIPTIONS, MOCK_INVOICES, MOCK_PAYMENTS } from '../../services/mockData';
import { Subscription, SubscriptionStatus } from '../../types';

export const SubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const initialSub = MOCK_SUBSCRIPTIONS.find((s) => s.id === id) || MOCK_SUBSCRIPTIONS[0];
  const [sub, setSub] = useState<Subscription>(initialSub);
  const [feedback, setFeedback] = useState<string | null>(null);

  const invoices = MOCK_INVOICES.filter((i) => i.subscriptionId === sub.id);
  const payments = MOCK_PAYMENTS.filter((p) =>
    invoices.some((inv) => inv.invoiceNumber === p.invoiceNumber)
  );

  const handleAction = (newStatus: SubscriptionStatus, label: string) => {
    setSub({ ...sub, status: newStatus });
    setFeedback(`Subscription state successfully updated to ${label}`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRenew = () => {
    // Extend expiry by 1 year
    setSub({
      ...sub,
      status: 'ACTIVE',
      expiryDate: '2028-01-31',
    });
    setFeedback('Subscription successfully renewed for another contractual billing period!');
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <button
          onClick={() => navigate('/admin/subscriptions')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Subscriptions
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary font-mono">
                {sub.subscriptionNumber}
              </h1>
              <Badge variant={sub.status}>{sub.status}</Badge>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Customer: <strong className="text-text-primary">{sub.customerName}</strong> ({sub.customerCompany})
            </p>
          </div>

          {/* Lifecycle Action Buttons */}
          <div className="flex items-center gap-2">
            {sub.status === 'ACTIVE' && sub.allowPause && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Pause className="w-3.5 h-3.5" />}
                onClick={() => handleAction('PAUSED', 'Paused')}
              >
                Pause Subscription
              </Button>
            )}

            {sub.status === 'PAUSED' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Play className="w-3.5 h-3.5" />}
                onClick={() => handleAction('ACTIVE', 'Active')}
              >
                Resume Subscription
              </Button>
            )}

            {sub.allowRenewal && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={handleRenew}
              >
                Renew Contract
              </Button>
            )}

            {sub.status !== 'CLOSED' && sub.allowEarlyClosure && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                onClick={() => handleAction('CLOSED', 'Closed')}
              >
                Close Early
              </Button>
            )}
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Recurring Rate"
          value={`$${sub.amount.toFixed(2)}`}
          subtitle={`Billed ${sub.billingFrequency.toLowerCase()}`}
          icon={<Repeat className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Next Billing Date"
          value={sub.nextBillingDate}
          subtitle="Automated invoice run"
          icon={<Calendar className="w-5 h-5 text-success" />}
        />
        <StatCard
          title="Contract Term"
          value={`${sub.startDate}`}
          subtitle={`Expires: ${sub.expiryDate}`}
          icon={<Calendar className="w-5 h-5 text-text-muted" />}
        />
        <div className="bg-card rounded-lg border border-border p-5 shadow-subtle text-xs space-y-1">
          <span className="font-semibold text-text-muted uppercase tracking-wider text-[10px] block">Commercial Rules</span>
          <p className="text-text-primary">Payment terms: <strong>{sub.paymentTerms}</strong></p>
          <p className="text-text-secondary">Auto-close on expiry: <strong>{sub.autoClosure ? 'Yes' : 'No'}</strong></p>
          <p className="text-text-secondary">Early closure: <strong>{sub.allowEarlyClosure ? 'Permitted' : 'Blocked'}</strong></p>
        </div>
      </div>

      {/* Product Lines */}
      <Card title="Contract Product Lines & Associated Variants">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F8FA] border-y border-border text-text-secondary">
            <tr>
              <th className="py-2.5 px-3">Product Description</th>
              <th className="py-2.5 px-3">Configured Variant</th>
              <th className="py-2.5 px-3 text-center">Quantity</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Tax Rate</th>
              <th className="py-2.5 px-3 text-right">Line Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sub.lines.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-text-muted">
                  No line items assigned.
                </td>
              </tr>
            ) : (
              sub.lines.map((l) => (
                <tr key={l.id}>
                  <td className="py-2.5 px-3 font-semibold text-text-primary">{l.productName}</td>
                  <td className="py-2.5 px-3">
                    {l.variantName ? (
                      <span className="font-mono text-primary bg-primary-light px-2 py-0.5 rounded text-[11px]">
                        {l.variantName}
                      </span>
                    ) : (
                      <span className="text-text-muted text-[11px]">Standard Edition</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">{l.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-mono">${l.unitPrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">{l.taxRate}%</td>
                  <td className="py-2.5 px-3 text-right font-bold font-mono text-text-primary">
                    ${l.amount.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Associated Invoices */}
      <Card
        title="Invoices Billed for this Subscription"
        subtitle="Historical and pending automated invoices"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/invoices')}
          >
            All Invoices
          </Button>
        }
      >
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F8FA] border-y border-border text-text-secondary">
            <tr>
              <th className="py-2.5 px-3">Invoice #</th>
              <th className="py-2.5 px-3">Issue Date</th>
              <th className="py-2.5 px-3">Due Date</th>
              <th className="py-2.5 px-3 text-right">Total</th>
              <th className="py-2.5 px-3 text-right">Outstanding</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 text-center text-text-muted">
                  No billing statements generated yet.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-2.5 px-3 font-mono font-medium text-text-primary">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-3">{inv.issueDate}</td>
                  <td className="py-2.5 px-3">{inv.dueDate}</td>
                  <td className="py-2.5 px-3 text-right font-bold">${inv.total.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-danger">${inv.outstandingBalance.toFixed(2)}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={inv.status}>{inv.status}</Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right">
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
    </div>
  );
};
