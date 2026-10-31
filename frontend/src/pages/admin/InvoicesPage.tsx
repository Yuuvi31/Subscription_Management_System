import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  CreditCard,
  Printer,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { MOCK_INVOICES, MOCK_PAYMENTS } from '../../services/mockData';
import { Invoice, PaymentMethod } from '../../types';

export const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') === 'overdue' ? 'OVERDUE' : 'ALL';

  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);

  // Payment Recording Modal State
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerCompany.toLowerCase().includes(searchTerm.toLowerCase());

      const isOverdue = inv.status === 'CONFIRMED' && new Date(inv.dueDate) < new Date();
      if (statusFilter === 'OVERDUE') return matchesSearch && isOverdue;
      if (statusFilter !== 'ALL') return matchesSearch && inv.status === statusFilter;
      return matchesSearch;
    });
  }, [invoices, searchTerm, statusFilter]);

  const handleOpenPayment = (inv: Invoice) => {
    setPaymentModalInvoice(inv);
    setPaymentAmount(inv.outstandingBalance);
    setPaymentNote(`Settlement for invoice ${inv.invoiceNumber}`);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice || paymentAmount <= 0) return;

    const newPaidAmount = paymentModalInvoice.paidAmount + paymentAmount;
    const newOutstanding = Math.max(0, paymentModalInvoice.total - newPaidAmount);
    const newStatus = newOutstanding === 0 ? 'PAID' : 'CONFIRMED';

    // Update invoices list
    setInvoices(
      invoices.map((inv) =>
        inv.id === paymentModalInvoice.id
          ? {
              ...inv,
              paidAmount: newPaidAmount,
              outstandingBalance: newOutstanding,
              status: newStatus,
            }
          : inv
      )
    );

    setPaymentSuccessMsg(`Payment of $${paymentAmount.toFixed(2)} recorded against ${paymentModalInvoice.invoiceNumber}`);
    setPaymentModalInvoice(null);
    setTimeout(() => setPaymentSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Invoice Ledger
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Tax-compliant billing statements, overdue accounts receivable, and payment reconciliation
          </p>
        </div>
      </div>

      {paymentSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
          {paymentSuccessMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F8FA] border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-text-muted hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-border rounded-md px-2.5 py-1.5 bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Invoices</option>
            <option value="OVERDUE">Overdue Only</option>
            <option value="CONFIRMED">Confirmed / Unpaid</option>
            <option value="PAID">Fully Paid</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer & Company</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.map((inv) => {
                const isOverdue = inv.status === 'CONFIRMED' && new Date(inv.dueDate) < new Date();
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-text-primary">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-text-primary block">{inv.customerName}</span>
                      <span className="text-[11px] text-text-secondary">{inv.customerCompany}</span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{inv.issueDate}</td>
                    <td className="py-3 px-4">
                      <span className={isOverdue ? 'text-danger font-semibold flex items-center gap-1' : 'text-text-secondary'}>
                        {isOverdue && <AlertTriangle className="w-3 h-3 text-danger" />}
                        {inv.dueDate}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-text-primary">${inv.total.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-success font-medium">${inv.paidAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={inv.outstandingBalance > 0 ? 'font-bold text-danger' : 'text-text-muted'}>
                        ${inv.outstandingBalance.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={isOverdue ? 'overdue' : inv.status}>
                        {isOverdue ? 'Overdue' : inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.outstandingBalance > 0 && (
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<CreditCard className="w-3 h-3 text-success" />}
                            onClick={() => handleOpenPayment(inv)}
                          >
                            Pay
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="w-3 h-3" />}
                          onClick={() => navigate(`/admin/invoices/${inv.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <Modal
          isOpen={!!paymentModalInvoice}
          onClose={() => setPaymentModalInvoice(null)}
          title={`Record Payment — ${paymentModalInvoice.invoiceNumber}`}
          subtitle={`Customer: ${paymentModalInvoice.customerName} (${paymentModalInvoice.customerCompany})`}
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="bg-[#F7F8FA] p-3 rounded-lg border border-border flex justify-between items-center">
              <div>
                <span className="text-[11px] text-text-muted block">Invoice Total:</span>
                <span className="text-xs font-bold text-text-primary">${paymentModalInvoice.total.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[11px] text-text-muted block">Already Paid:</span>
                <span className="text-xs font-medium text-success">${paymentModalInvoice.paidAmount.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-text-muted block">Current Outstanding:</span>
                <span className="text-sm font-bold text-danger">${paymentModalInvoice.outstandingBalance.toFixed(2)}</span>
              </div>
            </div>

            <Input
              label="Payment Amount ($)"
              type="number"
              step="0.01"
              max={paymentModalInvoice.outstandingBalance}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              helperText={`Maximum payment allowed: $${paymentModalInvoice.outstandingBalance.toFixed(2)}`}
              required
            />

            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs border border-border rounded-md p-2 bg-white"
              >
                <option value="BANK_TRANSFER">Bank Wire / Electronic Transfer</option>
                <option value="CREDIT_CARD">Credit / Debit Card</option>
                <option value="CHEQUE">Corporate Cheque</option>
                <option value="CASH">Cash / Direct Deposit</option>
              </select>
            </div>

            <Input
              label="Payment Note / Reference"
              placeholder="e.g. Wire transfer ref #US-981244 or Cheque clearance ID"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentModalInvoice(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm & Record Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
