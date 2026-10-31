import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { MOCK_INVOICES } from '../../services/mockData';
import { Invoice } from '../../types';
import { Printer, Download, Eye, Receipt, Building2 } from 'lucide-react';

export const CustomerInvoices: React.FC = () => {
  const invoices = MOCK_INVOICES.filter(i => i.customerId === 'cust-01');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            My Invoices
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Download statements, review tax summaries, and track payment receipts
          </p>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Outstanding</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-text-primary">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{inv.issueDate}</td>
                  <td className="py-3 px-4 text-text-secondary">{inv.dueDate}</td>
                  <td className="py-3 px-4 font-bold text-text-primary">${inv.total.toFixed(2)}</td>
                  <td className="py-3 px-4 text-success">${inv.paidAmount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={inv.outstandingBalance > 0 ? 'text-danger font-semibold' : 'text-text-muted'}>
                      ${inv.outstandingBalance.toFixed(2)}
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
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle={`Issued on ${selectedInvoice.issueDate}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Header / Brand */}
            <div className="flex justify-between items-start pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary text-white rounded flex items-center justify-center font-bold text-xs">
                    LB
                  </div>
                  <span className="font-bold text-sm text-text-primary">Brightloop Software Inc.</span>
                </div>
                <p className="text-text-secondary mt-1">100 Enterprise Way, Suite 400</p>
                <p className="text-text-secondary">San Francisco, CA 94105</p>
                <p className="text-text-secondary">billing@brightloop.io</p>
              </div>

              <div className="text-right">
                <Badge variant={selectedInvoice.status}>{selectedInvoice.status}</Badge>
                <p className="text-text-muted mt-2 font-mono text-[11px]">Due Date: {selectedInvoice.dueDate}</p>
                {selectedInvoice.billingPeriodStart && (
                  <p className="text-text-muted text-[11px]">Period: {selectedInvoice.billingPeriodStart} to {selectedInvoice.billingPeriodEnd}</p>
                )}
              </div>
            </div>

            {/* Bill To */}
            <div>
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Billed To:</span>
              <p className="font-semibold text-text-primary mt-1">{selectedInvoice.customerName}</p>
              <p className="text-text-secondary">{selectedInvoice.customerCompany}</p>
              <p className="text-text-secondary">{selectedInvoice.customerAddress}</p>
            </div>

            {/* Line Items */}
            <table className="w-full text-left">
              <thead className="bg-[#F7F8FA] border-y border-border text-text-secondary">
                <tr>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Unit Price</th>
                  <th className="py-2 px-3 text-right">Tax</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {selectedInvoice.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2.5 px-3 font-medium text-text-primary">{l.description}</td>
                    <td className="py-2.5 px-3 text-center">{l.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">${l.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">${l.taxAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">${l.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1.5 text-right">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal:</span>
                  <span className="font-mono">${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount:</span>
                    <span className="font-mono">-${selectedInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-secondary">
                  <span>Estimated Tax:</span>
                  <span className="font-mono">+${selectedInvoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-border">
                  <span>Total Amount:</span>
                  <span className="font-mono">${selectedInvoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-success text-xs">
                  <span>Amount Paid:</span>
                  <span className="font-mono">${selectedInvoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-danger font-semibold text-xs pt-1 border-t border-border">
                  <span>Outstanding Balance:</span>
                  <span className="font-mono">${selectedInvoice.outstandingBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-[11px] text-text-muted">
                Payment method: Manual Bank Wire or Verified Cheque
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />} onClick={handlePrint}>
                  Print
                </Button>
                <Button variant="primary" size="sm" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
