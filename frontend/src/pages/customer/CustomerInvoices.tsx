import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Invoice } from '../../types';
import { formatINR } from '../../utils/formatters';
import { Printer, Eye, Download, ShieldCheck } from 'lucide-react';

export const CustomerInvoices: React.FC = () => {
  const { user } = useAuth();
  const { invoices } = useData();

  const myInvoices = invoices.filter(
    (i) => i.customerName.toLowerCase().includes(user?.name.toLowerCase() || 'yuvraj') || i.customerId === 'cust-01'
  );

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Invoices & Statements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Download GST-compliant tax invoices, inspect billing breakdowns, and verify receipts
          </p>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
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
              {myInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No invoices generated for your account.
                  </td>
                </tr>
              ) : (
                myInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{inv.issueDate}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.dueDate}</td>
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
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        View & Print
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invoice Viewer Modal with Clean Vector A4 Printable Document */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Tax Invoice: ${selectedInvoice.invoiceNumber}`}
          subtitle={`Issued on ${selectedInvoice.issueDate} • Due on ${selectedInvoice.dueDate}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs printable-document">
            {/* Header / Brand */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded flex items-center justify-center font-bold text-sm tracking-wider">
                    LB
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900">Brightloop Software Technologies Pvt Ltd</h2>
                    <p className="text-[10px] text-slate-500">GSTIN: 07AAAAA0000A1Z5 | CIN: U72200DL2024PTC123456</p>
                  </div>
                </div>
                <p className="text-slate-500 mt-2 text-[11px]">
                  DLF Cyber City, Cyber Hub Tower 10-A, 12th Floor, Gurugram, Haryana - 122002
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Original For Recipient</span>
                <p className="text-base font-bold font-mono text-slate-900 mt-1">{selectedInvoice.invoiceNumber}</p>
                <Badge variant={selectedInvoice.status}>{selectedInvoice.status}</Badge>
              </div>
            </div>

            {/* Bill To & Billing Period */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Billed To (Client):</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedInvoice.customerName}</p>
                <p className="text-slate-600">{selectedInvoice.customerCompany}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{selectedInvoice.customerAddress}</p>
                <p className="text-slate-500 text-[11px]">Email: {selectedInvoice.customerEmail}</p>
              </div>

              <div className="text-right space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Statement Info:</span>
                <p className="text-slate-700"><strong>Issue Date:</strong> {selectedInvoice.issueDate}</p>
                <p className="text-slate-700"><strong>Payment Due:</strong> {selectedInvoice.dueDate}</p>
                {selectedInvoice.subscriptionNumber && (
                  <p className="text-slate-700"><strong>Subscription ID:</strong> <span className="font-mono">{selectedInvoice.subscriptionNumber}</span></p>
                )}
                {selectedInvoice.billingPeriodStart && (
                  <p className="text-slate-500 text-[11px]">
                    Period: {selectedInvoice.billingPeriodStart} to {selectedInvoice.billingPeriodEnd}
                  </p>
                )}
              </div>
            </div>

            {/* Itemized Lines */}
            <div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">SAC Code</th>
                    <th className="py-2.5 px-3">Service & License Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Taxable Unit Price</th>
                    <th className="py-2.5 px-3 text-right">GST (18%)</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">998313</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{l.description}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{l.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatINR(l.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatINR(l.taxAmount)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatINR(l.total + l.taxAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] space-y-1">
                <p className="font-bold text-slate-700">NEFT / RTGS Bank Remittance Details:</p>
                <p className="text-slate-600">Bank Name: HDFC Bank Ltd • Current A/C: 50200084920192</p>
                <p className="text-slate-600">IFSC Code: HDFC0001234 • Branch: Cyber City DLF Phase II</p>
                <p className="text-slate-500 mt-1">Please quote invoice number on the payment transfer note.</p>
              </div>

              <div className="space-y-1.5 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatINR(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST (9%) + SGST (9%):</span>
                  <span className="font-mono text-slate-900">+{formatINR(selectedInvoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1 text-sm">
                  <span>Grand Total (INR):</span>
                  <span className="font-mono text-indigo-600">{formatINR(selectedInvoice.total)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 text-xs pt-1">
                  <span>Amount Settled:</span>
                  <span className="font-mono font-bold">-{formatINR(selectedInvoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-sm">
                  <span>Outstanding Due:</span>
                  <span className={`font-mono ${selectedInvoice.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {formatINR(selectedInvoice.outstandingBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex justify-between pt-4 border-t border-slate-200 no-print">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={handlePrint}
              >
                Print / Save A4 PDF
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedInvoice(null)}
              >
                Close Viewer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
