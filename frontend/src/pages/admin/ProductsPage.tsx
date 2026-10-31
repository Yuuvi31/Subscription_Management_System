import React, { useState } from 'react';
import { Package, Plus, Layers, Edit2, Archive, DollarSign } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MOCK_PRODUCTS } from '../../services/mockData';
import { Product, ProductType } from '../../types';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
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

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      salesPrice: Number(formData.salesPrice),
      costPrice: Number(formData.costPrice),
      notes: formData.notes,
      status: 'ACTIVE',
      variants: [],
    };

    setProducts([newProd, ...products]);
    setIsModalOpen(false);
    setFormData({ name: '', type: 'SOFTWARE', salesPrice: 0, costPrice: 0, notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Product Catalog
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Core software licenses, recurring add-ons, SLAs and integrated service definitions
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((prod) => (
          <Card key={prod.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] bg-gray-100 text-text-secondary px-2 py-0.5 rounded uppercase">
                  {prod.type}
                </span>
                <Badge variant={prod.status}>{prod.status}</Badge>
              </div>

              <h3 className="text-sm font-bold text-text-primary mt-1">{prod.name}</h3>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">{prod.notes}</p>

              <div className="mt-4 pt-4 border-t border-border flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Sales Price</span>
                  <span className="text-lg font-bold text-text-primary">${prod.salesPrice.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-text-muted uppercase block">Cost Price</span>
                  <span className="text-xs font-mono text-text-secondary">${prod.costPrice.toFixed(2)}</span>
                </div>
              </div>

              {prod.variants && prod.variants.length > 0 && (
                <div className="mt-3 bg-gray-50 p-2.5 rounded-md border border-border/70">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                    Configured Variants ({prod.variants.length})
                  </span>
                  <div className="space-y-1">
                    {prod.variants.map((v) => (
                      <div key={v.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-text-primary font-medium">{v.name}</span>
                        <span className="font-mono text-primary font-semibold">+${v.additionalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-[11px] text-text-muted font-mono">{prod.id}</span>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Product"
        subtitle="Configure a recurring service, core software item, or standalone add-on"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          <Input
            label="Product Name"
            placeholder="e.g. Brightloop Analytics Engine"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">
              Product Classification
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ProductType })}
              className="w-full rounded-md border border-border text-xs text-text-primary bg-white py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="SOFTWARE">SOFTWARE (Base license)</option>
              <option value="SERVICE">SERVICE (SLA / Consulting)</option>
              <option value="ADDON">ADDON (Feature modular flag)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sales Price ($)"
              type="number"
              step="0.01"
              value={formData.salesPrice}
              onChange={(e) => setFormData({ ...formData, salesPrice: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Cost Price ($)"
              type="number"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">
              Product Description & Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal notes, SLA boundaries, and target customer profile..."
              className="w-full rounded-md border border-border text-xs text-text-primary p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
            />
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
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
