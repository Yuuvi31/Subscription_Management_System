import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Plus, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MOCK_TEMPLATES, MOCK_PRODUCTS } from '../../services/mockData';
import { QuotationTemplate } from '../../types';

export const QuotationTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates] = useState<QuotationTemplate[]>(MOCK_TEMPLATES);

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/admin/quotations')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Quotations
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Quotation Templates
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Predefined plan and product bundles to accelerate sales reps drafting proposals
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/admin/quotations/new')}
          >
            Create Quotation with Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <Card key={tpl.id} className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary bg-primary-light px-2 py-0.5 rounded">
                  {tpl.planName}
                </span>
                <h3 className="text-sm font-bold text-text-primary mt-1.5">{tpl.name}</h3>
              </div>
              <span className="text-xs text-text-muted">Validity: {tpl.validityDays} days</span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
                Pre-bundled Line Items ({tpl.defaultLines.length})
              </span>
              <div className="space-y-2">
                {tpl.defaultLines.map((dl, idx) => {
                  const prod = MOCK_PRODUCTS.find((p) => p.id === dl.productId);
                  const variant = prod?.variants?.find((v) => v.id === dl.variantId);
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-gray-50 rounded-md">
                      <div>
                        <span className="font-medium text-text-primary">{prod?.name || 'Item'}</span>
                        {variant && (
                          <span className="text-primary text-[11px] ml-2 font-mono">({variant.name})</span>
                        )}
                      </div>
                      <span className="font-mono text-text-secondary">Default Qty: {dl.quantity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex justify-end">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => navigate('/admin/quotations/new')}
              >
                Use this Template
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
