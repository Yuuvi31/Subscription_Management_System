import React, { useState } from 'react';
import { PercentCircle, Plus, ShieldCheck, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MOCK_TAX_RULES } from '../../services/mockData';
import { TaxRule } from '../../types';

export const TaxesPage: React.FC = () => {
  const [taxes, setTaxes] = useState<TaxRule[]>(MOCK_TAX_RULES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    percentage: 10,
    description: '',
    isDefault: false,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newTax: TaxRule = {
      id: `tax-${Date.now()}`,
      name: formData.name,
      percentage: Number(formData.percentage),
      description: formData.description,
      isDefault: formData.isDefault,
      active: true,
    };

    setTaxes([...taxes, newTax]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Tax Schedules & Fiscal Rules
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Admin-only tax definitions applied automatically during quotation and automated recurring invoice generation
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Tax Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {taxes.map((tax) => (
          <Card key={tax.id} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold font-mono text-primary">
                  {tax.percentage}%
                </span>
                <Badge variant={tax.active ? 'active' : 'inactive'}>
                  {tax.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-text-primary mt-1">{tax.name}</h3>
              <p className="text-xs text-text-secondary mt-1">{tax.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
              {tax.isDefault ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Default Rate
                </span>
              ) : (
                <span className="text-text-muted text-[11px]">Selective Application</span>
              )}
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Tax Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Tax Rate Rule"
        subtitle="Specify percentage and automatic billing rules"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <Input
            label="Tax Rule Name"
            placeholder="e.g. State Digital Telecommunications VAT"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Tax Percentage (%)"
            type="number"
            step="0.01"
            value={formData.percentage}
            onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">
              Description & Statutory Basis
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Regional compliance code or statutory exemption reference..."
              className="w-full rounded-md border border-border text-xs text-text-primary p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-text-primary font-medium">Apply as default tax to all newly issued subscriptions</span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Tax Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
