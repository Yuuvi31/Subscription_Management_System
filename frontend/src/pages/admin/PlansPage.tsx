import React, { useState } from 'react';
import { CalendarDays, Plus, Check, X, Clock, Settings2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MOCK_PLANS } from '../../services/mockData';
import { Plan, BillingFrequency } from '../../types';

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>(MOCK_PLANS);
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

    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
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
    };

    setPlans([newPlan, ...plans]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Subscription Plans
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Cadence models (Daily, Weekly, Monthly, Yearly), minimum commitments, and lifecycle rules
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] bg-primary-light text-primary font-bold px-2 py-0.5 rounded uppercase">
                  {plan.billingFrequency}
                </span>
                <Badge variant={plan.status}>{plan.status}</Badge>
              </div>

              <h3 className="text-base font-bold text-text-primary mt-1">{plan.name}</h3>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2 min-h-[32px]">{plan.description}</p>

              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-[10px] text-text-muted uppercase block">Plan Recurring Base</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold text-text-primary">${plan.price.toFixed(2)}</span>
                  <span className="text-xs text-text-muted">/{plan.billingFrequency.toLowerCase().replace('ly', '')}</span>
                </div>
                <span className="text-[11px] text-text-secondary block mt-1">
                  Min quantity: <strong className="text-text-primary">{plan.minQuantity} seat(s)</strong>
                </span>
              </div>

              {/* Lifecycle Flags */}
              <div className="mt-4 pt-3 border-t border-border space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Auto-Closure on expiry:</span>
                  {plan.autoClosure ? <Check className="w-3.5 h-3.5 text-success" /> : <X className="w-3.5 h-3.5 text-text-muted" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Early closure allowed:</span>
                  {plan.allowEarlyClosure ? <Check className="w-3.5 h-3.5 text-success" /> : <X className="w-3.5 h-3.5 text-text-muted" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Pause allowed:</span>
                  {plan.allowPause ? <Check className="w-3.5 h-3.5 text-success" /> : <X className="w-3.5 h-3.5 text-text-muted" />}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Renewal allowed:</span>
                  {plan.allowRenewal ? <Check className="w-3.5 h-3.5 text-success" /> : <X className="w-3.5 h-3.5 text-text-muted" />}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-[11px] text-text-muted">From: {plan.availableFrom}</span>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

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
            placeholder="e.g. Enterprise Tier Annual Contract"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">
              Plan Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Commercial terms and bundled allowances..."
              className="w-full rounded-md border border-border text-xs text-text-primary p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
            />
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">
                Billing Frequency
              </label>
              <select
                value={formData.billingFrequency}
                onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value as BillingFrequency })}
                className="w-full rounded-md border border-border text-xs text-text-primary bg-white py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="DAILY">DAILY</option>
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
                <option value="YEARLY">YEARLY</option>
              </select>
            </div>
            <Input
              label="Minimum Quantity"
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
          <div className="bg-gray-50 p-3 rounded-lg border border-border space-y-2">
            <span className="font-semibold text-text-primary block mb-1">
              Lifecycle Permissions & Auto-Rules:
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoClosure}
                onChange={(e) => setFormData({ ...formData, autoClosure: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-text-primary">Auto-close subscription automatically on expiration date</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowEarlyClosure}
                onChange={(e) => setFormData({ ...formData, allowEarlyClosure: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-text-primary">Allow customer or staff early closure</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowPause}
                onChange={(e) => setFormData({ ...formData, allowPause: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-text-primary">Allow pausing subscriptions</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowRenewal}
                onChange={(e) => setFormData({ ...formData, allowRenewal: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-text-primary">Allow contract renewal when term completes</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
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
