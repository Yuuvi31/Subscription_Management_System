import React, { useState } from 'react';
import { Layers, Plus, Package } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { ProductVariant } from '../../types';
import { formatINR } from '../../utils/formatters';

export const ProductVariantsPage: React.FC = () => {
  const { products, updateProduct } = useData();

  // Aggregate all variants across actual products
  const variantsList: (ProductVariant & { productName: string; basePrice: number })[] = [];
  products.forEach((p) => {
    p.variants?.forEach((v) => {
      variantsList.push({
        ...v,
        productName: p.name,
        basePrice: p.salesPrice,
      });
    });
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: products[0]?.id || '',
    name: '',
    additionalPrice: 560,
  });

  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.productId) return;

    const parentProduct = products.find((p) => p.id === formData.productId);
    if (!parentProduct) return;

    const newVariant: ProductVariant = {
      id: `var-${Date.now()}`,
      productId: parentProduct.id,
      name: formData.name,
      additionalPrice: Number(formData.additionalPrice),
      status: 'ACTIVE',
    };

    const existingVariants = parentProduct.variants || [];
    updateProduct(parentProduct.id, {
      variants: [...existingVariants, newVariant],
    });

    setIsModalOpen(false);
    setFormData({ productId: products[0]?.id || '', name: '', additionalPrice: 560 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Product Variants
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Brand extensions and custom add-ons (e.g. Odoo brand variant +₹560) attached to base products.
          </p>
        </div>

        {products.length > 0 && (
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Variant
          </Button>
        )}
      </div>

      {products.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <p className="text-xs text-slate-500">Please create at least one product first before configuring variants.</p>
        </Card>
      ) : variantsList.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No product variants configured</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Variants let you offer brand additions (like Odoo or SAP connector editions) with additional incremental pricing.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            Add First Variant
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Variant Name</th>
                <th className="py-3 px-4">Base Product</th>
                <th className="py-3 px-4 text-right">Base Product Price</th>
                <th className="py-3 px-4 text-right">Incremental Addition</th>
                <th className="py-3 px-4 text-right">Effective Final Price</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variantsList.map((v) => {
                const effectiveTotal = v.basePrice + v.additionalPrice;
                return (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {v.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{v.productName}</td>
                    <td className="py-3.5 px-4 text-right font-mono">{formatINR(v.basePrice)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-indigo-600">
                      +{formatINR(v.additionalPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatINR(effectiveTotal)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={v.status}>{v.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Add Variant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Product Variant"
        subtitle="Attach brand variations or technical editions to a base software item"
      >
        <form onSubmit={handleAddVariant} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-800 mb-1.5">
              Select Base Product
            </label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full rounded-md border border-slate-200 text-xs text-slate-900 bg-white py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Base: {formatINR(p.salesPrice)})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Variant Name"
            placeholder="e.g. Odoo Brand Integration Connector"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Additional Incremental Price (INR)"
            type="number"
            step="0.01"
            placeholder="e.g. 560"
            value={formData.additionalPrice}
            onChange={(e) => setFormData({ ...formData, additionalPrice: parseFloat(e.target.value) || 0 })}
            required
          />

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
              Save Variant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
