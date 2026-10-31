import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, CheckCircle, Repeat, Eye } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { Quotation } from '../../types';
import { formatINR } from '../../utils/formatters';

export const QuotationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { quotations, convertQuotationToSubscription, customers, plans } = useData();
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [conversionMessage, setConversionMessage] = useState<string | null>(null);

  const handleConvertToSubscription = (quote: Quotation) => {
    const sub = convertQuotationToSubscription(quote.id);
    if (sub) {
      setConversionMessage(`Quotation ${quote.quotationNumber} successfully converted into active subscription ${sub.subscriptionNumber}! Initial invoice issued.`);
      setSelectedQuote(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quotations & Proposals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Commercial proposals, customized line items, validity periods, and one-click subscription conversion.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/admin/quotations/new')}
        >
          Create Quotation
        </Button>
      </div>

      {conversionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{conversionMessage}</span>
          </div>
          <button
            onClick={() => navigate('/admin/subscriptions')}
            className="text-xs font-semibold text-emerald-900 underline"
          >
            Go to Subscriptions
          </button>
        </div>
      )}

      {quotations.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No quotations drafted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Create tailored commercial proposals for your clients with products, variants, and payment terms.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/admin/quotations/new')}>
            Draft First Quotation
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Customer & Organization</th>
                <th className="py-3 px-4">Target Plan</th>
                <th className="py-3 px-4">Line Items</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4 text-right">Total (INR)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900">{q.quotationNumber}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">{q.customerName}</span>
                    <span className="text-[11px] text-slate-500">{q.customerCompany}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">{q.planName}</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {q.lines.length} item(s): {q.lines.map((l) => l.productName).join(', ')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">{q.validUntil}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">{formatINR(q.total)}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={q.status}>{q.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
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
      )}

      {/* Quotation Details Modal */}
      {selectedQuote && (
        <Modal
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          title={`Quotation ${selectedQuote.quotationNumber}`}
          subtitle={`Commercial proposal prepared for ${selectedQuote.customerName}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Customer Details</span>
                <p className="font-semibold text-slate-900 mt-0.5">{selectedQuote.customerName}</p>
                <p className="text-slate-500">{selectedQuote.customerCompany}</p>
                <p className="text-slate-500">{selectedQuote.customerEmail}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Terms & Cadence</span>
                <p className="text-slate-900 font-medium mt-0.5">Plan: {selectedQuote.planName}</p>
                <p className="text-slate-500 font-mono text-[11px]">Valid: {selectedQuote.createdAt} to {selectedQuote.validUntil}</p>
                <div className="mt-1">
                  <Badge variant={selectedQuote.status}>{selectedQuote.status}</Badge>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-left border border-slate-200">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Product / Service</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Tax</th>
                    <th className="py-2.5 px-3 text-right">Total (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedQuote.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900 block">{l.productName}</span>
                        {l.variantName && (
                          <span className="text-indigo-600 text-[11px] font-mono">({l.variantName})</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{l.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatINR(l.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">{l.taxRate}%</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">{formatINR(l.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Box */}
            <div className="flex justify-end pt-1">
              <div className="w-64 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatINR(selectedQuote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (18%):</span>
                  <span className="font-mono">+{formatINR(selectedQuote.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Quotation Total:</span>
                  <span className="font-mono text-base">{formatINR(selectedQuote.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setSelectedQuote(null)}>
                Close
              </Button>

              {selectedQuote.status !== 'CONVERTED' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Repeat className="w-3.5 h-3.5" />}
                  onClick={() => handleConvertToSubscription(selectedQuote)}
                >
                  Convert into Active Subscription
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
