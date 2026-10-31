import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  CreditCard,
  Building2,
  CheckCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useData } from '../../context/DataContext';
import { PaymentMethod } from '../../types';
import { formatINR } from '../../utils/formatters';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, addPayment } = useData();

  const invoice = invoices.find((i) => i.id === id) || invoices[0];
  const [feedback, setFeedback] = useState<string | null>(null);

  // Payment Recording State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [amountToPay, setAmountToPay] = useState(invoice?.outstandingBalance || 0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [payNote, setPayNote] = useState('');

  if (!invoice) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-600 text-sm">Invoice not found.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/admin/invoices')}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  const isOverdue = invoice.status === 'CONFIRMED' && new Date(invoice.dueDate) < new Date();

  const handlePrint = () => {
    // Set document title so saved PDF file is named neatly
    const originalTitle = document.title;
    document.title = `Tax-Invoice-${invoice.invoiceNumber}-Brightloop`;
    window.print();
    document.title = originalTitle;
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountToPay <= 0) return;

    const result = addPayment(invoice.id, amountToPay, payMethod, payNote);
    if (result) {
      setIsPaymentOpen(false);
      setFeedback(`Payment of ${formatINR(amountToPay)} logged successfully.`);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Toolbar - Hidden on Print */}
      <div className="no-print">
        <button
          onClick={() => navigate('/admin/invoices')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Invoices
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
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
              Print / Save as PDF
            </Button>

            {invoice.outstandingBalance > 0 && invoice.status !== 'CANCELLED' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                onClick={() => {
                  setAmountToPay(invoice.outstandingBalance);
                  setIsPaymentOpen(true);
                }}
              >
                Record Payment
              </Button>
            )}
          </div>
        </div>
      </div>

      {feedback && (
        <div className="no-print p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* =========================================================
          PRINTABLE A4 TAX INVOICE DOCUMENT
          Pure standard proportion, razor-sharp typography, vector layout
          ========================================================= */}
      <div className="printable-document bg-white rounded-xl border border-slate-200 p-8 sm:p-10 shadow-sm print:shadow-none print:border-none print:p-0">
        {/* Top Header & Company Credentials */}
        <div className="flex justify-between items-start pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-sm tracking-tight print:bg-slate-900">
                LB
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Brightloop Software Private Limited</h2>
                <span className="text-[11px] font-mono text-slate-500">GSTIN: 07AABCB1234F1Z8 | CIN: U72200DL2024PTC123456</span>
              </div>
            </div>
            <div className="text-xs text-slate-600 mt-3 space-y-0.5">
              <p>DLF Cyber City, Tower B, 11th Floor, Sector 24</p>
              <p>Gurugram, Haryana 122002, India</p>
              <p>billing@brightloop.io | +91 124 456 7890</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">TAX INVOICE</span>
            <h3 className="text-xl font-bold font-mono text-slate-900 mt-0.5">{invoice.invoiceNumber}</h3>
            <div className="text-xs text-slate-600 mt-2 space-y-0.5">
              <p>Invoice Date: <strong className="text-slate-900 font-mono">{invoice.issueDate}</strong></p>
              <p>Payment Due: <strong className={`font-mono ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-900'}`}>{invoice.dueDate}</strong></p>
              {invoice.subscriptionNumber && (
                <p>Contract Ref: <span className="font-mono text-indigo-600 font-semibold">{invoice.subscriptionNumber}</span></p>
              )}
            </div>
          </div>
        </div>

        {/* Billed To / Consignee */}
        <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Billed To (Customer Details)
            </span>
            <p className="font-bold text-slate-900 text-sm">{invoice.customerName}</p>
            <p className="text-slate-600 font-medium">{invoice.customerCompany}</p>
            <p className="text-slate-500">{invoice.customerEmail}</p>
            <p className="text-slate-500 mt-1 max-w-xs">{invoice.customerAddress}</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Billing Term & State
            </span>
            {invoice.billingPeriodStart && (
              <p className="text-slate-600">
                Period: <strong className="text-slate-900 font-mono">{invoice.billingPeriodStart}</strong> to <strong className="text-slate-900 font-mono">{invoice.billingPeriodEnd || invoice.dueDate}</strong>
              </p>
            )}
            <p className="text-slate-600 mt-1">Place of Supply: <strong>07-Delhi / NCR</strong></p>
            <p className="text-slate-500">Reverse Charge Applicable: <strong>No</strong></p>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3.5">#</th>
                <th className="py-3 px-3.5">Service Description & HSN/SAC</th>
                <th className="py-3 px-3.5 text-center">Qty</th>
                <th className="py-3 px-3.5 text-right">Rate</th>
                <th className="py-3 px-3.5 text-right">Tax (18%)</th>
                <th className="py-3 px-3.5 text-right">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.lines.map((l, idx) => (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3.5 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-3.5">
                    <span className="font-semibold text-slate-900 block">{l.description}</span>
                    <span className="text-[10px] text-slate-500 font-mono">SAC Code: 998313 (IT Software Hosting & SaaS)</span>
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono">{l.quantity}</td>
                  <td className="py-3 px-3.5 text-right font-mono">{formatINR(l.unitPrice)}</td>
                  <td className="py-3 px-3.5 text-right font-mono text-slate-500">{formatINR(l.taxAmount)}</td>
                  <td className="py-3 px-3.5 text-right font-bold font-mono text-slate-900">{formatINR(l.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation Breakdown */}
        <div className="flex justify-end pt-2 print-avoid-break">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Subtotal:</span>
              <span className="font-mono font-medium">{formatINR(invoice.subtotal)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount Applied:</span>
                <span className="font-mono font-medium">-{formatINR(invoice.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Integrated GST (IGST 18%):</span>
              <span className="font-mono font-medium">+{formatINR(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Invoice Amount:</span>
              <span className="font-mono text-base">{formatINR(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Total Amount Settled:</span>
              <span className="font-mono">{formatINR(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-red-600 pt-2 border-t border-slate-200">
              <span>Balance Due:</span>
              <span className="font-mono text-base">{formatINR(invoice.outstandingBalance)}</span>
            </div>
          </div>
        </div>

        {/* Banking and Remittance Details (Indian Banking System) */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-[11px] text-slate-600 print-avoid-break flex justify-between items-end gap-6">
          <div className="space-y-1">
            <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Bank Remittance Details</p>
            <p>Beneficiary: <strong>Brightloop Software Private Limited</strong></p>
            <p>Bank: <strong>HDFC Bank Ltd</strong> (Cyber City Branch, Gurugram)</p>
            <p>A/C Number: <strong className="font-mono">50200088921045</strong> | IFSC: <strong className="font-mono">HDFC0001234</strong></p>
            <p className="text-[10px] text-slate-400 mt-1">UPI ID: <span className="font-mono text-slate-700">brightloop@hdfcbank</span></p>
          </div>

          <div className="text-right shrink-0">
            <div className="h-12 border-b border-slate-300 w-44 ml-auto mb-1 flex items-end justify-center pb-1 font-mono text-[10px] text-slate-400">
              [Authorized Signatory]
            </div>
            <span className="text-[10px] font-bold text-slate-700 block">For Brightloop Software Pvt Ltd</span>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPaymentOpen && (
        <Modal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          title={`Record Settlement for ${invoice.invoiceNumber}`}
          subtitle={`Current Balance Due: ${formatINR(invoice.outstandingBalance)}`}
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <Input
              label="Settlement Amount (INR)"
              type="number"
              step="0.01"
              max={invoice.outstandingBalance}
              value={amountToPay}
              onChange={(e) => setAmountToPay(parseFloat(e.target.value) || 0)}
              required
            />

            <div>
              <label className="block text-xs font-medium text-slate-800 mb-1.5">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs border border-slate-200 rounded-md p-2 bg-white"
              >
                <option value="BANK_TRANSFER">NEFT / RTGS / IMPS Bank Transfer</option>
                <option value="CREDIT_CARD">Corporate Credit / Debit Card</option>
                <option value="CHEQUE">Crossed Cheque</option>
                <option value="CASH">Direct Cash Receipt</option>
              </select>
            </div>

            <Input
              label="UTR / Transaction Reference"
              placeholder="e.g. UTR #HDFC00891234 or Cheque clearance ref"
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Commit Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
