import React, { useState } from 'react';
import { CreditCard, Search, Plus, Filter, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MOCK_PAYMENTS, MOCK_INVOICES } from '../../services/mockData';
import { Payment, PaymentMethod } from '../../types';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Payment Form
  const [targetInvoiceId, setTargetInvoiceId] = useState(MOCK_INVOICES[0].id);
  const [amount, setAmount] = useState<number>(500);
  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [note, setNote] = useState('');

  const targetInvoice = MOCK_INVOICES.find((i) => i.id === targetInvoiceId) || MOCK_INVOICES[0];

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId: targetInvoice.id,
      invoiceNumber: targetInvoice.invoiceNumber,
      customerId: targetInvoice.customerId,
      customerName: targetInvoice.customerName,
      amount: Number(amount),
      method,
      paymentDate: new Date().toISOString().split('T')[0],
      note: note || 'Manual payment entry',
      status: 'COMPLETED',
    };

    setPayments([newPayment, ...payments]);
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
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Payment Transactions
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Reconciliation register for wire transfers, cheques, cards, and manual bank matches
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Record Payment
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by payment ref, invoice #, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F8FA] border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
          />
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Date Logged</th>
                <th className="py-3 px-4 text-right">Settled Amount</th>
                <th className="py-3 px-4">Verification Note</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-text-primary">{p.id}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-primary">{p.invoiceNumber}</td>
                  <td className="py-3 px-4 font-medium text-text-primary">{p.customerName}</td>
                  <td className="py-3 px-4 capitalize">{p.method.replace('_', ' ').toLowerCase()}</td>
                  <td className="py-3 px-4 text-text-secondary">{p.paymentDate}</td>
                  <td className="py-3 px-4 text-right font-bold text-success font-mono">
                    +${p.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-text-muted">{p.note}</td>
                  <td className="py-3 px-4">
                    <Badge variant="paid">{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Received Payment"
        subtitle="Log manual or incoming bank payment against an open invoice"
      >
        <form onSubmit={handleRecord} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">Target Invoice</label>
            <select
              value={targetInvoiceId}
              onChange={(e) => setTargetInvoiceId(e.target.value)}
              className="w-full text-xs border border-border rounded-md p-2 bg-white"
            >
              {MOCK_INVOICES.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.customerName} (Bal: ${inv.outstandingBalance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-border space-y-1 text-xs">
            <div className="flex justify-between text-text-secondary">
              <span>Invoice Total:</span>
              <span className="font-mono">${targetInvoice.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Already Settled:</span>
              <span className="font-mono text-success">${targetInvoice.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-text-primary pt-1 border-t border-border">
              <span>Remaining Balance:</span>
              <span className="font-mono text-danger">${targetInvoice.outstandingBalance.toFixed(2)}</span>
            </div>
          </div>

          <Input
            label="Payment Amount ($)"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            required
          />

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full text-xs border border-border rounded-md p-2 bg-white"
            >
              <option value="BANK_TRANSFER">Bank Wire / Electronic Transfer</option>
              <option value="CREDIT_CARD">Credit / Debit Card</option>
              <option value="CHEQUE">Corporate Cheque</option>
              <option value="CASH">Cash / Direct Deposit</option>
            </select>
          </div>

          <Input
            label="Payment Memo / Wire Reference"
            placeholder="e.g. Scrolled bank statement ref #TRX-99124"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Commit Payment Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
