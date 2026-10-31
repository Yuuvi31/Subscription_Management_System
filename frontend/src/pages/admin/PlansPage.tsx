import React, { useState } from 'react';
import { CalendarDays, Plus, Check, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { Plan, BillingFrequency } from '../../types';
import { formatINR } from '../../utils/formatters';

export const PlansPage: React.FC = () => {
  const { plans, addPlan } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    billingFrequency: 'MONTHLY' as BillingFrequency,
    minQuantity: 1,
    availableFrom: '2026-01-01',
    availableUntil: '',
    autoClosure: false,
    allowEarlyClosure: true,
    allowPause: true,
    allowRenewal: true,
  });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0) return;

    addPlan({
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      billingFrequency: formData.billingFrequency,
      minQuantity: Number(formData.minQuantity) || 1,
      availableFrom: formData.availableFrom,
      availableUntil: formData.availableUntil || null,
      autoClosure: formData.autoClosure,
      allowEarlyClosure: formData.allowEarlyClosure,
      allowPause: formData.allowPause,
      allowRenewal: formData.allowRenewal,
      status: 'ACTIVE',
    });

    setIsModalOpen(false);
    setFormData({
      name: '',
      description: '',
      price: 0,
      billingFrequency: 'MONTHLY',
      minQuantity: 1,
      availableFrom: '2026-01-01',
      availableUntil: '',
      autoClosure: false,
      allowEarlyClosure: true,
      allowPause: true,
      allowRenewal: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscription Plans
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Billing cycles (Daily, Weekly, Monthly, Yearly), minimum seat quantities, and lifecycle rules.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Create Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No subscription plans created yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Configure your commercial plans with billing cadences and renewal rules to prepare quotations.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            Create Your First Plan
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase">
                    {plan.billingFrequency}
                  </span>
                  <Badge variant={plan.status}>{plan.status}</Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px] line-clamp-2">{plan.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Plan Base Rate</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-slate-900 font-mono">{formatINR(plan.price)}</span>
                    <span className="text-xs text-slate-500">/{plan.billingFrequency.toLowerCase().replace('ly', '')}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Min quantity: <strong className="text-slate-800 font-mono">{plan.minQuantity} seat(s)</strong>
                  </span>
                </div>

                {/* Lifecycle Rules */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Auto-close on expiration:</span>
                    {plan.autoClosure ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Early closure permitted:</span>
                    {plan.allowEarlyClosure ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pause allowed:</span>
                    {plan.allowPause ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contract renewal permitted:</span>
                    {plan.allowRenewal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Available from: {plan.availableFrom}</span>
                <span className="font-mono text-[11px] text-slate-500">{plan.id}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Subscription Plan"
        subtitle="Define commercial recurring pricing and lifecycle boundaries"
        maxWidth="xl"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
          <Input
            label="Plan Name"
            placeholder="e.g. Standard Business Monthly"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-800 mb-1.5">
              Plan Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Commercial terms, included features, and tenant allowances..."
              className="w-full rounded-md border border-slate-200 text-xs text-slate-900 p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price (INR)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
            />
            <div>
              <label className="block text-xs font-medium text-slate-800 mb-1.5">
                Billing Cadence
              </label>
              <select
                value={formData.billingFrequency}
                onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value as BillingFrequency })}
                className="w-full rounded-md border border-slate-200 text-xs text-slate-900 bg-white py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="DAILY">DAILY</option>
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
                <option value="YEARLY">YEARLY</option>
              </select>
            </div>
            <Input
              label="Minimum Seats / Qty"
              type="number"
              min={1}
              value={formData.minQuantity}
              onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value, 10) || 1 })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Available From"
              type="date"
              value={formData.availableFrom}
              onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
              required
            />
            <Input
              label="Available Until (Optional)"
              type="date"
              value={formData.availableUntil}
              onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
            />
          </div>

          {/* Lifecycle Toggles */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-800 block mb-1">
              Lifecycle Permissions:
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoClosure}
                onChange={(e) => setFormData({ ...formData, autoClosure: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700">Auto-close subscription when expiry date is reached</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowEarlyClosure}
                onChange={(e) => setFormData({ ...formData, allowEarlyClosure: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700">Allow early cancellation</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowPause}
                onChange={(e) => setFormData({ ...formData, allowPause: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700">Allow customers and staff to pause billing</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowRenewal}
                onChange={(e) => setFormData({ ...formData, allowRenewal: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700">Allow contract extension and renewal</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
