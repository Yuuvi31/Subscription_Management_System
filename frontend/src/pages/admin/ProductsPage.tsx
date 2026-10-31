import React, { useState } from 'react';
import { Package, Plus, Layers, DollarSign } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { Product, ProductType } from '../../types';
import { formatINR } from '../../utils/formatters';

export const ProductsPage: React.FC = () => {
  const { products, addProduct } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'SOFTWARE' as ProductType,
    salesPrice: 0,
    costPrice: 0,
    notes: '',
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.salesPrice <= 0) return;

    addProduct({
      name: formData.name,
      type: formData.type,
      salesPrice: Number(formData.salesPrice),
      costPrice: Number(formData.costPrice),
      notes: formData.notes,
      status: 'ACTIVE',
      variants: [],
    });

    setIsModalOpen(false);
    setFormData({ name: '', type: 'SOFTWARE', salesPrice: 0, costPrice: 0, notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Products & Service Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Software licenses, add-ons, SLAs, and recurring billable deliverables.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No products configured yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add your software licenses, add-on modules, or support tiers to use them in plans and quotations.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            Add Your First Product
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((prod) => (
            <Card key={prod.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded uppercase">
                    {prod.type}
                  </span>
                  <Badge variant={prod.status}>{prod.status}</Badge>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1">{prod.name}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{prod.notes || 'No notes provided'}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Sales Price</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">{formatINR(prod.salesPrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Cost Price</span>
                    <span className="text-xs font-mono text-slate-500">{formatINR(prod.costPrice)}</span>
                  </div>
                </div>

                {prod.variants && prod.variants.length > 0 && (
                  <div className="mt-3 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Configured Variants ({prod.variants.length})
                    </span>
                    <div className="space-y-1">
                      {prod.variants.map((v) => (
                        <div key={v.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-800 font-medium">{v.name}</span>
                          <span className="font-mono text-indigo-600 font-semibold">+{formatINR(v.additionalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{prod.id}</span>
                <span className="text-[11px] text-emerald-600 font-medium">Ready for Invoicing</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Product"
        subtitle="Configure a billable recurring service or software item"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          <Input
            label="Product Name"
            placeholder="e.g. Brightloop ERP Core License"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-800 mb-1.5">
              Classification
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ProductType })}
              className="w-full rounded-md border border-slate-200 text-xs text-slate-900 bg-white py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="SOFTWARE">SOFTWARE (Base license)</option>
              <option value="SERVICE">SERVICE (SLA / Consulting)</option>
              <option value="ADDON">ADDON (Modular feature)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sales Price (INR)"
              type="number"
              step="0.01"
              value={formData.salesPrice}
              onChange={(e) => setFormData({ ...formData, salesPrice: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Internal Cost Price (INR)"
              type="number"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-800 mb-1.5">
              Notes & Technical Scope
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Scope description, tenant limits, and SLA specifications..."
              className="w-full rounded-md border border-slate-200 text-xs text-slate-900 p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
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
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
