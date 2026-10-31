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
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useData } from '../../context/DataContext';
import { Invoice, PaymentMethod } from '../../types';
import { formatINR } from '../../utils/formatters';

export const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') === 'overdue' ? 'OVERDUE' : 'ALL';

  const { invoices, addPayment } = useData();
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

    addPayment(paymentModalInvoice.id, Number(paymentAmount), paymentMethod, paymentNote);

    setPaymentSuccessMsg(`Payment of ${formatINR(Number(paymentAmount))} recorded against ${paymentModalInvoice.invoiceNumber}`);
    setPaymentModalInvoice(null);
    setTimeout(() => setPaymentSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoice Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tax-compliant billing statements, overdue accounts receivable, and payment reconciliation
          </p>
        </div>
      </div>

      {paymentSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
          {paymentSuccessMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice #, customer name, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="ALL">All Invoices ({invoices.length})</option>
            <option value="CONFIRMED">Open / Confirmed</option>
            <option value="PAID">Paid in Full</option>
            <option value="OVERDUE">Overdue Receivables</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer & Account</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Invoice Total</th>
                <th className="py-3 px-4 text-right">Settled Amount</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No invoices matching current filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isOverdue =
                    inv.status === 'CONFIRMED' && new Date(inv.dueDate) < new Date();
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{inv.customerName}</div>
                        <div className="text-[11px] text-slate-500">{inv.customerCompany}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{inv.issueDate}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                            {inv.dueDate}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold border border-rose-200">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        {formatINR(inv.total)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-mono">
                        {formatINR(inv.paidAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        <span className={inv.outstandingBalance > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                          {formatINR(inv.outstandingBalance)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={inv.status}>{inv.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => navigate(`/admin/invoices/${inv.id}`)}
                        >
                          View
                        </Button>

                        {inv.status !== 'PAID' && inv.outstandingBalance > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<CreditCard className="w-3.5 h-3.5 text-emerald-600" />}
                            onClick={() => handleOpenPayment(inv)}
                          >
                            Record Pay
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <Modal
          isOpen={!!paymentModalInvoice}
          onClose={() => setPaymentModalInvoice(null)}
          title={`Record Manual Payment: ${paymentModalInvoice.invoiceNumber}`}
          subtitle={`Client: ${paymentModalInvoice.customerName} (${paymentModalInvoice.customerCompany})`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Invoice Amount:</span>
                <span className="font-mono font-medium">{formatINR(paymentModalInvoice.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Previously Settled:</span>
                <span className="font-mono text-emerald-700">{formatINR(paymentModalInvoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1">
                <span className="text-slate-900">Current Outstanding:</span>
                <span className="font-mono text-rose-600">{formatINR(paymentModalInvoice.outstandingBalance)}</span>
              </div>
            </div>

            <Input
              label="Payment Amount (INR ₹)"
              type="number"
              step="any"
              min="1"
              max={paymentModalInvoice.outstandingBalance}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              required
            />

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Payment Channel / Instrument
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS / IMPS)</option>
                <option value="CHEQUE">Corporate Cheque</option>
                <option value="CREDIT_CARD">Corporate Credit Card</option>
                <option value="CASH">Cash Deposit</option>
              </select>
            </div>

            <Input
              label="Internal Verification Reference / UTR #"
              placeholder="e.g. UTR / NEFT reference number from bank statement"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm Settlement
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
