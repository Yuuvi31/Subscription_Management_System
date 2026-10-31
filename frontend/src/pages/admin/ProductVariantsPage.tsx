import React, { useState } from 'react';
import { Layers, Plus, Package } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MOCK_PRODUCTS } from '../../services/mockData';
import { ProductVariant } from '../../types';

export const ProductVariantsPage: React.FC = () => {
  // Extract all variants across products
  const initialVariants: (ProductVariant & { productName: string; basePrice: number })[] = [];
  MOCK_PRODUCTS.forEach((p) => {
    p.variants?.forEach((v) => {
      initialVariants.push({
        ...v,
        productName: p.name,
        basePrice: p.salesPrice,
      });
    });
  });

  const [variantsList, setVariantsList] = useState(initialVariants);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: MOCK_PRODUCTS[0].id,
    name: '',
    additionalPrice: 0,
  });

  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const parentProduct = MOCK_PRODUCTS.find((p) => p.id === formData.productId) || MOCK_PRODUCTS[0];
    const newVariant = {
      id: `var-${Date.now()}`,
      productId: parentProduct.id,
      name: formData.name,
      additionalPrice: Number(formData.additionalPrice),
      status: 'ACTIVE' as const,
      productName: parentProduct.name,
      basePrice: parentProduct.salesPrice,
    };

    setVariantsList([newVariant, ...variantsList]);
    setIsModalOpen(false);
    setFormData({ productId: MOCK_PRODUCTS[0].id, name: '', additionalPrice: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Product Variants
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Brand extensions, integration editions (e.g. Odoo add-on +560), and tiered add-ons
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Variant
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">Variant Name</th>
              <th className="py-3 px-4">Associated Base Product</th>
              <th className="py-3 px-4 text-right">Base Product Price</th>
              <th className="py-3 px-4 text-right">Variant Additional Price</th>
              <th className="py-3 px-4 text-right">Effective Total Price</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {variantsList.map((v) => {
              const effectiveTotal = v.basePrice + v.additionalPrice;
              return (
                <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-text-primary">
                    {v.name}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{v.productName}</td>
                  <td className="py-3 px-4 text-right font-mono">${v.basePrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-primary">
                    +${v.additionalPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-text-primary">
                    ${effectiveTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={v.status}>{v.status}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Add Variant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Product Variant"
        subtitle="Attach brand variations or technical editions to a base software item"
      >
        <form onSubmit={handleAddVariant} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">
              Target Product
            </label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full rounded-md border border-border text-xs text-text-primary bg-white py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {MOCK_PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Base: ${p.salesPrice.toFixed(2)})
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
            label="Additional Price ($)"
            type="number"
            step="0.01"
            placeholder="e.g. 560"
            value={formData.additionalPrice}
            onChange={(e) => setFormData({ ...formData, additionalPrice: parseFloat(e.target.value) || 0 })}
            required
          />

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
              Save Variant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
