import React, { useState } from 'react';
import { CreditCard, Search, Plus, Filter, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { PaymentMethod } from '../../types';
import { formatINR } from '../../utils/formatters';

export const PaymentsPage: React.FC = () => {
  const { payments, invoices, addPayment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Payment Form
  const eligibleInvoices = invoices.filter((i) => i.status !== 'PAID' && i.outstandingBalance > 0);
  const [targetInvoiceId, setTargetInvoiceId] = useState(eligibleInvoices[0]?.id || invoices[0]?.id || '');
  const [amount, setAmount] = useState<number>(500);
  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [note, setNote] = useState('');

  const targetInvoice = invoices.find((i) => i.id === targetInvoiceId);

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInvoiceId || amount <= 0) return;

    addPayment(targetInvoiceId, Number(amount), method, note || 'Manual bank payment receipt');
    setIsModalOpen(false);
    setNote('');
  };

  const filteredPayments = payments.filter((p) =>
    p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Payment Transactions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reconciliation register for wire transfers, RTGS/NEFT, cheques, and bank statement settlements
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            if (eligibleInvoices.length > 0) {
              setTargetInvoiceId(eligibleInvoices[0].id);
              setAmount(eligibleInvoices[0].outstandingBalance);
            }
            setIsModalOpen(true);
          }}
        >
          Record Payment
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by payment ref, invoice #, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
          />
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Date Logged</th>
                <th className="py-3 px-4 text-right">Settled Amount</th>
                <th className="py-3 px-4">Verification Note / UTR</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No payment records found. Record a payment against an open invoice to see it here.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{p.id}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{p.invoiceNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.customerName}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="capitalize">{p.method.replace('_', ' ').toLowerCase()}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.paymentDate}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">
                      {formatINR(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{p.note || 'Manual settlement'}</td>
                    <td className="py-3 px-4">
                      <Badge variant="CONFIRMED">COMPLETED</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record Received Payment"
          subtitle="Match bank transaction to an outstanding customer invoice"
          maxWidth="md"
        >
          <form onSubmit={handleRecord} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Target Invoice
              </label>
              <select
                value={targetInvoiceId}
                onChange={(e) => {
                  setTargetInvoiceId(e.target.value);
                  const selectedInv = invoices.find((i) => i.id === e.target.value);
                  if (selectedInv) setAmount(selectedInv.outstandingBalance);
                }}
                className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
              >
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.customerName} ({formatINR(inv.outstandingBalance)} due)
                  </option>
                ))}
              </select>
            </div>

            {targetInvoice && (
              <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 text-xs text-slate-600 space-y-1">
                <div>Client: <strong className="text-slate-900">{targetInvoice.customerName}</strong> ({targetInvoice.customerCompany})</div>
                <div>Outstanding Balance: <strong className="text-rose-600 font-mono">{formatINR(targetInvoice.outstandingBalance)}</strong></div>
              </div>
            )}

            <Input
              label="Settled Amount (INR ₹)"
              type="number"
              step="any"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Payment Channel
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS / IMPS)</option>
                <option value="CHEQUE">Corporate Cheque</option>
                <option value="CREDIT_CARD">Credit / Debit Card</option>
                <option value="CASH">Cash Deposit</option>
              </select>
            </div>

            <Input
              label="Transaction UTR / Bank Reference"
              placeholder="e.g. HDFC-NEFT-928192801"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Save Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
