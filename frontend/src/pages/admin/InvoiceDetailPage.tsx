import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Send,
  CreditCard,
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { MOCK_INVOICES } from '../../services/mockData';
import { Invoice, PaymentMethod } from '../../types';
import { formatINR } from '../../utils/formatters';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const initialInv = MOCK_INVOICES.find((i) => i.id === id) || MOCK_INVOICES[0];
  const [invoice, setInvoice] = useState<Invoice>(initialInv);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Payment Recording State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [amountToPay, setAmountToPay] = useState(invoice.outstandingBalance);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [payNote, setPayNote] = useState('');

  const isOverdue = invoice.status === 'CONFIRMED' && new Date(invoice.dueDate) < new Date();

  const handlePrint = () => {
    window.print();
  };

  const handleSendInvoice = () => {
    // Simulated send
    setFeedback(`Invoice ${invoice.invoiceNumber} queued for dispatch via Supabase SMTP.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleConfirmInvoice = () => {
    setInvoice({ ...invoice, status: 'CONFIRMED' });
    setFeedback(`Invoice status transitioned from Draft to Confirmed.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleCancelInvoice = () => {
    setInvoice({ ...invoice, status: 'CANCELLED' });
    setFeedback(`Invoice has been cancelled.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountToPay <= 0) return;

    const newPaid = invoice.paidAmount + amountToPay;
    const newBal = Math.max(0, invoice.total - newPaid);
    const newStatus = newBal === 0 ? 'PAID' : 'CONFIRMED';

    setInvoice({
      ...invoice,
      paidAmount: newPaid,
      outstandingBalance: newBal,
      status: newStatus,
    });

    setIsPaymentOpen(false);
    setFeedback(`Recorded payment of $${amountToPay.toFixed(2)}. Remaining balance: $${newBal.toFixed(2)}`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation & Action Controls - Hidden on print */}
      <div className="no-print">
        <button
          onClick={() => navigate('/admin/invoices')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Invoices
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary font-mono">
              {invoice.invoiceNumber}
            </h1>
            <Badge variant={isOverdue ? 'overdue' : invoice.status}>
              {isOverdue ? 'Overdue' : invoice.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={handlePrint}
            >
              Print Invoice
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Send className="w-3.5 h-3.5" />}
              onClick={handleSendInvoice}
            >
              Send to Customer
            </Button>

            {invoice.status === 'DRAFT' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                onClick={handleConfirmInvoice}
              >
                Confirm Invoice
              </Button>
            )}

            {invoice.outstandingBalance > 0 && invoice.status !== 'CANCELLED' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                onClick={() => setIsPaymentOpen(true)}
              >
                Record Payment
              </Button>
            )}
          </div>
        </div>
      </div>

      {feedback && (
        <div className="no-print p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-success" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Printable Invoice Document Card */}
      <div className="bg-white rounded-xl border border-border p-8 shadow-card print:border-none print:shadow-none print:p-0">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                LB
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary tracking-tight">Brightloop Software Inc.</h2>
                <span className="text-[10px] text-text-muted font-mono">Tax ID: US-EIN-94819284</span>
              </div>
            </div>
            <div className="text-xs text-text-secondary mt-3 space-y-0.5">
              <p>100 Enterprise Way, Suite 400</p>
              <p>San Francisco, CA 94105</p>
              <p>billing@brightloop.io | +1 (800) 555-LOOP</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <h3 className="text-xl font-bold font-mono text-text-primary">{invoice.invoiceNumber}</h3>
            <div className="text-xs text-text-secondary mt-2 space-y-1">
              <p>Issue Date: <strong className="text-text-primary">{invoice.issueDate}</strong></p>
              <p>Due Date: <strong className={isOverdue ? 'text-danger font-bold' : 'text-text-primary'}>{invoice.dueDate}</strong></p>
              {invoice.subscriptionNumber && (
                <p>Subscription Ref: <span className="font-mono text-primary font-semibold">{invoice.subscriptionNumber}</span></p>
              )}
            </div>
          </div>
        </div>

        {/* Bill To & Billing Period */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-border text-xs">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
              Billed To
            </span>
            <p className="font-bold text-text-primary text-sm">{invoice.customerName}</p>
            <p className="text-text-secondary">{invoice.customerCompany}</p>
            <p className="text-text-secondary">{invoice.customerEmail}</p>
            <p className="text-text-secondary">{invoice.customerAddress}</p>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
              Billing Period & Terms
            </span>
            {invoice.billingPeriodStart && (
              <p className="text-text-secondary">
                Period: <strong className="text-text-primary">{invoice.billingPeriodStart}</strong> to <strong className="text-text-primary">{invoice.billingPeriodEnd}</strong>
              </p>
            )}
            <p className="text-text-secondary mt-1">Payment Method: Bank Wire / Cheque</p>
            <div className="mt-2 inline-block">
              <Badge variant={isOverdue ? 'overdue' : invoice.status}>
                {isOverdue ? 'Overdue Payment' : invoice.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Product Line Items */}
        <div className="py-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-y border-border text-text-secondary font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Tax</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoice.lines.map((l) => (
                <tr key={l.id}>
                  <td className="py-3 px-4 font-semibold text-text-primary">{l.description}</td>
                  <td className="py-3 px-4 text-center font-mono">{l.quantity}</td>
                  <td className="py-3 px-4 text-right font-mono">{formatINR(l.unitPrice)}</td>
                  <td className="py-3 px-4 text-right font-mono text-text-muted">{formatINR(l.taxAmount)}</td>
                  <td className="py-3 px-4 text-right font-bold font-mono text-text-primary">{formatINR(l.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation Box */}
        <div className="flex justify-end pt-4 border-t border-border">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">{formatINR(invoice.subtotal)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-success">
                <span>Applied Discount:</span>
                <span className="font-mono font-medium">-{formatINR(invoice.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-text-secondary">
              <span>Tax (GST 18%):</span>
              <span className="font-mono font-medium">+{formatINR(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-border">
              <span>Total Invoice Amount:</span>
              <span className="font-mono">{formatINR(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-success font-medium">
              <span>Amount Paid:</span>
              <span className="font-mono">{formatINR(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-danger pt-2 border-t border-border">
              <span>Outstanding Balance:</span>
              <span className="font-mono">{formatINR(invoice.outstandingBalance)}</span>
            </div>
          </div>
        </div>

        {/* Banking wire footer instructions */}
        <div className="mt-8 pt-6 border-t border-border text-[11px] text-text-muted">
          <p className="font-bold text-text-secondary uppercase tracking-wider mb-1">Payment Instructions</p>
          <p>Please remit payment via ACH/Wire to: <strong>Silicon Valley Financial Bank</strong> | Account: <strong>889201928</strong> | Routing: <strong>121000358</strong></p>
          <p className="mt-0.5">Please include invoice reference <strong>{invoice.invoiceNumber}</strong> in the transfer remarks.</p>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPaymentOpen && (
        <Modal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          title={`Record Payment for ${invoice.invoiceNumber}`}
          subtitle={`Current Balance Due: $${invoice.outstandingBalance.toFixed(2)}`}
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <Input
              label="Payment Amount ($)"
              type="number"
              step="0.01"
              max={invoice.outstandingBalance}
              value={amountToPay}
              onChange={(e) => setAmountToPay(parseFloat(e.target.value) || 0)}
              required
            />

            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs border border-border rounded-md p-2 bg-white"
              >
                <option value="BANK_TRANSFER">Bank Wire / Electronic Transfer</option>
                <option value="CREDIT_CARD">Credit / Debit Card</option>
                <option value="CHEQUE">Corporate Cheque</option>
                <option value="CASH">Cash / Direct Deposit</option>
              </select>
            </div>

            <Input
              label="Payment Notes"
              placeholder="e.g. Bank wire reference ID #W-88192"
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm & Settle Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
