import React, { useState } from 'react';
import { PercentCircle, Plus, ShieldCheck, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';

export const TaxesPage: React.FC = () => {
  const { taxes, addTax } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    percentage: 18,
    description: '',
    isDefault: false,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    addTax({
      name: formData.name,
      percentage: Number(formData.percentage),
      description: formData.description,
      isDefault: formData.isDefault,
      active: true,
    });

    setIsModalOpen(false);
    setFormData({ name: '', percentage: 18, description: '', isDefault: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tax Schedules & Fiscal Rules
          </h1>
          <p className="text-xs text-slate-500 mt-1">
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
                <span className="text-2xl font-bold font-mono text-indigo-600">
                  {tax.percentage}%
                </span>
                <Badge variant={tax.active ? 'ACTIVE' : 'CLOSED'}>
                  {tax.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-1">{tax.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{tax.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {tax.isDefault ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Default Rate
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">Selective Rate</span>
              )}
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
            placeholder="e.g. GST (18%), Export Exempt (0%)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Tax Rate Percentage (%)"
            type="number"
            step="0.01"
            value={formData.percentage}
            onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })}
            required
          />

          <Input
            label="Legal / SAC Description"
            placeholder="e.g. Standard rate for software services and SaaS in India"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600"
            />
            <label htmlFor="isDefault" className="text-slate-700 cursor-pointer">
              Set as standard default for newly generated subscriptions
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Tax Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
