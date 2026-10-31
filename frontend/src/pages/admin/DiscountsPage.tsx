import React, { useState } from 'react';
import { Percent, Plus, ShieldCheck, Tag, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MOCK_DISCOUNT_RULES, MOCK_PRODUCTS } from '../../services/mockData';
import { DiscountRule, DiscountType } from '../../types';

export const DiscountsPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountRule[]>(MOCK_DISCOUNT_RULES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'PERCENTAGE' as DiscountType,
    value: 10,
    minPurchase: 0,
    minQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    maxUses: 100,
    subscriptionWide: true,
    productId: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.value <= 0) return;

    const prod = MOCK_PRODUCTS.find((p) => p.id === formData.productId);

    const newDisc: DiscountRule = {
      id: `disc-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      value: Number(formData.value),
      minPurchase: Number(formData.minPurchase) || 0,
      minQuantity: Number(formData.minQuantity) || 1,
      startDate: formData.startDate,
      endDate: formData.endDate,
      maxUses: Number(formData.maxUses) || 50,
      currentUses: 0,
      subscriptionWide: formData.subscriptionWide,
      productId: formData.productId || undefined,
      productName: prod?.name,
      active: true,
    };

    setDiscounts([newDisc, ...discounts]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Commercial Discount Rules
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Admin-only rule engine: fixed vs percentage credits, seat quantity hurdles, and expiry quotas
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Create Discount Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {discounts.map((disc) => {
          const remainingUses = Math.max(0, disc.maxUses - disc.currentUses);
          return (
            <Card key={disc.id} className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-success rounded-lg font-bold">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{disc.name}</h3>
                    <span className="text-[11px] text-text-secondary font-mono">
                      {disc.type === 'PERCENTAGE' ? `${disc.value}% OFF` : `-$${disc.value.toFixed(2)} Credit`}
                    </span>
                  </div>
                </div>

                <Badge variant={disc.active ? 'active' : 'inactive'}>
                  {disc.active ? 'Active Rule' : 'Expired'}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-text-muted text-[10px] uppercase block">Applicability</span>
                  <p className="font-medium text-text-primary mt-0.5">
                    {disc.subscriptionWide ? 'Subscription-Wide' : disc.productName || 'Specific Item'}
                  </p>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] uppercase block">Usage & Quota</span>
                  <p className="font-medium text-text-primary mt-0.5">
                    {disc.currentUses} uses ({remainingUses} remaining)
                  </p>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] uppercase block">Eligibility Hurdle</span>
                  <p className="text-text-secondary mt-0.5">
                    Min ${disc.minPurchase} / {disc.minQuantity} seat(s)
                  </p>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] uppercase block">Valid Term</span>
                  <p className="text-text-secondary mt-0.5 font-mono text-[11px]">
                    {disc.startDate} to {disc.endDate}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Discount Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Discount Rule"
        subtitle="Only admins can establish commercial incentive policies"
        maxWidth="xl"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <Input
            label="Rule Name"
            placeholder="e.g. Enterprise 10-Seat Tier Incentive"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">Discount Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountType })}
                className="w-full text-xs border border-border rounded-md p-2 bg-white"
              >
                <option value="PERCENTAGE">PERCENTAGE (%)</option>
                <option value="FIXED">FIXED AMOUNT ($)</option>
              </select>
            </div>
            <Input
              label={formData.type === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Amount ($)'}
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Purchase ($)"
              type="number"
              value={formData.minPurchase}
              onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Minimum Quantity / Seats"
              type="number"
              value={formData.minQuantity}
              onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value, 10) || 1 })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valid From"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="Valid Until"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <Input
            label="Maximum Uses Cap"
            type="number"
            value={formData.maxUses}
            onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value, 10) || 50 })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Discount Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
