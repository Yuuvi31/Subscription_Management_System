import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, CheckCircle, Repeat, Send, ArrowRight, Eye } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { MOCK_QUOTATIONS } from '../../services/mockData';
import { Quotation } from '../../types';

export const QuotationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>(MOCK_QUOTATIONS);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [conversionMessage, setConversionMessage] = useState<string | null>(null);

  const handleConvertToSubscription = (quote: Quotation) => {
    // Authoritative lifecycle conversion: Quotation -> Confirmed Subscription
    setQuotations(
      quotations.map((q) =>
        q.id === quote.id ? { ...q, status: 'CONVERTED' } : q
      )
    );
    setConversionMessage(`Quotation ${quote.quotationNumber} successfully converted into Subscription!`);
    setSelectedQuote(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Quotations & Proposals
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Sales quotes, multi-product proposals, validity terms, and subscription conversion
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/admin/templates')}
          >
            Quotation Templates
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/admin/quotations/new')}
          >
            Create Quotation
          </Button>
        </div>
      </div>

      {conversionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>{conversionMessage}</span>
          </div>
          <button
            onClick={() => navigate('/admin/subscriptions')}
            className="text-xs font-semibold text-primary underline"
          >
            Go to Subscriptions
          </button>
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">Quote #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Target Plan</th>
              <th className="py-3 px-4">Products / Line Items</th>
              <th className="py-3 px-4">Valid Until</th>
              <th className="py-3 px-4 text-right">Total Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quotations.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-text-primary">{q.quotationNumber}</td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-text-primary block">{q.customerName}</span>
                  <span className="text-[11px] text-text-secondary">{q.customerCompany}</span>
                </td>
                <td className="py-3 px-4 font-medium text-text-primary">{q.planName}</td>
                <td className="py-3 px-4 text-text-secondary">
                  {q.lines.length} item(s): {q.lines.map(l => l.productName).join(', ')}
                </td>
                <td className="py-3 px-4 text-text-secondary">{q.validUntil}</td>
                <td className="py-3 px-4 text-right font-bold text-text-primary">${q.total.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <Badge variant={q.status}>{q.status}</Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedQuote(q)}
                  >
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Quotation Details / Conversion Modal */}
      {selectedQuote && (
        <Modal
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          title={`Quotation ${selectedQuote.quotationNumber}`}
          subtitle={`Prepared for ${selectedQuote.customerName} (${selectedQuote.customerCompany})`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
              <div>
                <span className="text-text-muted text-[11px] block">Customer Details:</span>
                <p className="font-semibold text-text-primary mt-0.5">{selectedQuote.customerName}</p>
                <p className="text-text-secondary">{selectedQuote.customerEmail}</p>
                <p className="text-text-secondary">{selectedQuote.customerCompany}</p>
              </div>
              <div className="text-right">
                <span className="text-text-muted text-[11px] block">Quotation Terms:</span>
                <p className="text-text-primary font-medium mt-0.5">Payment Terms: {selectedQuote.paymentTerms}</p>
                <p className="text-text-secondary">Validity: {selectedQuote.createdAt} to {selectedQuote.validUntil}</p>
                <div className="mt-1">
                  <Badge variant={selectedQuote.status}>{selectedQuote.status}</Badge>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Quoted Lines</h4>
              <table className="w-full text-left">
                <thead className="bg-[#F7F8FA] border-y border-border text-text-secondary">
                  <tr>
                    <th className="py-2 px-3">Product & Variant</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Tax Rate</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedQuote.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2 px-3">
                        <span className="font-medium text-text-primary block">{l.productName}</span>
                        {l.variantName && (
                          <span className="text-primary text-[11px] font-mono">{l.variantName}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">{l.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono">${l.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right">{l.taxRate}%</td>
                      <td className="py-2 px-3 text-right font-bold font-mono">${l.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-end pt-2">
              <div className="w-56 space-y-1.5 text-right">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal:</span>
                  <span className="font-mono">${selectedQuote.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Taxes (Estimated):</span>
                  <span className="font-mono">+${selectedQuote.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-border">
                  <span>Quotation Total:</span>
                  <span className="font-mono">${selectedQuote.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedQuote(null)}
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                {selectedQuote.status === 'SENT' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuotations(
                        quotations.map((q) =>
                          q.id === selectedQuote.id ? { ...q, status: 'ACCEPTED' } : q
                        )
                      );
                      setSelectedQuote({ ...selectedQuote, status: 'ACCEPTED' });
                    }}
                  >
                    Mark as Accepted
                  </Button>
                )}

                {(selectedQuote.status === 'ACCEPTED' || selectedQuote.status === 'SENT') && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Repeat className="w-3.5 h-3.5" />}
                    onClick={() => handleConvertToSubscription(selectedQuote)}
                  >
                    Convert into Subscription
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
