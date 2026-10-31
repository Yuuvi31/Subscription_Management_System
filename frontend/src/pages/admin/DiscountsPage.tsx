import React, { useState } from 'react';
import { Percent, Plus, Tag, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { DiscountRule, DiscountType } from '../../types';
import { formatINR } from '../../utils/formatters';

export const DiscountsPage: React.FC = () => {
  const { discounts, products, addDiscount } = useData();
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

    const prod = products.find((p) => p.id === formData.productId);

    addDiscount({
      name: formData.name,
      type: formData.type,
      value: Number(formData.value),
      minPurchase: Number(formData.minPurchase) || 0,
      minQuantity: Number(formData.minQuantity) || 1,
      startDate: formData.startDate,
      endDate: formData.endDate,
      maxUses: Number(formData.maxUses) || 50,
      subscriptionWide: formData.subscriptionWide,
      productId: formData.productId || undefined,
      productName: prod?.name,
      active: true,
    });

    setIsModalOpen(false);
    setFormData({
      name: '',
      type: 'PERCENTAGE',
      value: 10,
      minPurchase: 0,
      minQuantity: 1,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      maxUses: 100,
      subscriptionWide: true,
      productId: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Commercial Discount Rules
          </h1>
          <p className="text-xs text-slate-500 mt-1">
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
        {discounts.length === 0 ? (
          <div className="col-span-2 p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
            <Tag className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600">No discount rules created yet. Click "Create Discount Rule" to set up promotional pricing.</p>
          </div>
        ) : (
          discounts.map((disc) => {
            const remainingUses = Math.max(0, disc.maxUses - disc.currentUses);
            return (
              <Card key={disc.id} className="p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{disc.name}</h3>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {disc.type === 'PERCENTAGE' ? `${disc.value}% OFF` : `-${formatINR(disc.value)} Credit`}
                      </span>
                    </div>
                  </div>

                  <Badge variant={disc.active ? 'ACTIVE' : 'CLOSED'}>
                    {disc.active ? 'Active Rule' : 'Expired'}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Scope</span>
                    <span className="font-semibold text-slate-700">
                      {disc.subscriptionWide ? 'Entire Subscription' : disc.productName || 'Specific Item'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Quota Remaining</span>
                    <span className="font-mono font-medium text-slate-700">
                      {remainingUses} of {disc.maxUses} uses left
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Min Contract Value</span>
                    <span className="font-mono text-slate-700">
                      {disc.minPurchase > 0 ? formatINR(disc.minPurchase) : 'No Minimum'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Validity Window</span>
                    <span className="text-slate-700">{disc.startDate} to {disc.endDate}</span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Discount Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Promotional Discount Rule"
        subtitle="Configure criteria, discount percentage or flat amount, and usage caps"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <Input
            label="Rule Name"
            placeholder="e.g. Enterprise Welcome 15%, Annual Prepurchase"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Discount Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountType })}
                className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                <option value="PERCENTAGE">Percentage (%) Off</option>
                <option value="FIXED_AMOUNT">Fixed INR (₹) Credit</option>
              </select>
            </div>

            <Input
              label={formData.type === 'PERCENTAGE' ? 'Discount %' : 'Amount (₹)'}
              type="number"
              min="1"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Minimum Purchase (₹)"
              type="number"
              value={formData.minPurchase}
              onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
            />

            <Input
              label="Maximum Redemptions"
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />

            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Discount Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
