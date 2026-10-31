import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Building,
  Calendar,
  CreditCard,
  FileText,
  FileCheck,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  MOCK_CUSTOMERS,
  MOCK_PLANS,
  MOCK_PRODUCTS,
  MOCK_TEMPLATES,
  MOCK_TAX_RULES,
} from '../../services/mockData';
import { QuotationLine } from '../../types';

export const QuotationWizardPage: React.FC = () => {
  const navigate = useNavigate();

  // Step indicator
  const [step, setStep] = useState<number>(1);

  // Wizard state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(MOCK_CUSTOMERS[0].id);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(MOCK_PLANS[0].id);
  const [validityDays, setValidityDays] = useState<number>(14);
  const [paymentTerms, setPaymentTerms] = useState<string>('NET_30');

  // Selected Lines
  const [lines, setLines] = useState<QuotationLine[]>([
    {
      id: 'ql-1',
      productId: MOCK_PRODUCTS[0].id,
      productName: MOCK_PRODUCTS[0].name,
      variantId: MOCK_PRODUCTS[0].variants?.[0]?.id,
      variantName: MOCK_PRODUCTS[0].variants?.[0]?.name,
      quantity: 1,
      unitPrice: MOCK_PRODUCTS[0].salesPrice + (MOCK_PRODUCTS[0].variants?.[0]?.additionalPrice || 0),
      taxRate: 10,
      total: MOCK_PRODUCTS[0].salesPrice + (MOCK_PRODUCTS[0].variants?.[0]?.additionalPrice || 0),
    },
  ]);

  const selectedCustomer = MOCK_CUSTOMERS.find((c) => c.id === selectedCustomerId) || MOCK_CUSTOMERS[0];
  const selectedPlan = MOCK_PLANS.find((p) => p.id === selectedPlanId) || MOCK_PLANS[0];

  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const tpl = MOCK_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    setSelectedPlanId(tpl.planId);
    setValidityDays(tpl.validityDays);

    const generatedLines: QuotationLine[] = tpl.defaultLines.map((dl, idx) => {
      const prod = MOCK_PRODUCTS.find((p) => p.id === dl.productId) || MOCK_PRODUCTS[0];
      const variant = prod.variants?.find((v) => v.id === dl.variantId);
      const unitPrice = prod.salesPrice + (variant?.additionalPrice || 0);
      return {
        id: `ql-${Date.now()}-${idx}`,
        productId: prod.id,
        productName: prod.name,
        variantId: variant?.id,
        variantName: variant?.name,
        quantity: dl.quantity,
        unitPrice,
        taxRate: 10,
        total: unitPrice * dl.quantity,
      };
    });

    setLines(generatedLines);
  };

  const handleAddLine = () => {
    const defaultProduct = MOCK_PRODUCTS[0];
    const newLine: QuotationLine = {
      id: `ql-${Date.now()}`,
      productId: defaultProduct.id,
      productName: defaultProduct.name,
      quantity: 1,
      unitPrice: defaultProduct.salesPrice,
      taxRate: 10,
      total: defaultProduct.salesPrice,
    };
    setLines([...lines, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    setLines(lines.filter((l) => l.id !== id));
  };

  const handleLineProductChange = (index: number, productId: string) => {
    const prod = MOCK_PRODUCTS.find((p) => p.id === productId) || MOCK_PRODUCTS[0];
    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      productName: prod.name,
      variantId: undefined,
      variantName: undefined,
      unitPrice: prod.salesPrice,
      total: prod.salesPrice * updated[index].quantity,
    };
    setLines(updated);
  };

  const handleLineVariantChange = (index: number, variantId: string) => {
    const updated = [...lines];
    const prod = MOCK_PRODUCTS.find((p) => p.id === updated[index].productId) || MOCK_PRODUCTS[0];
    const variant = prod.variants?.find((v) => v.id === variantId);
    const unitPrice = prod.salesPrice + (variant?.additionalPrice || 0);

    updated[index] = {
      ...updated[index],
      variantId: variant?.id,
      variantName: variant?.name,
      unitPrice,
      total: unitPrice * updated[index].quantity,
    };
    setLines(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...lines];
    const sanitizedQty = Math.max(1, qty);
    updated[index] = {
      ...updated[index],
      quantity: sanitizedQty,
      total: updated[index].unitPrice * sanitizedQty,
    };
    setLines(updated);
  };

  // Financial calculations
  const subtotal = lines.reduce((acc, l) => acc + l.total, 0);
  const taxAmount = (subtotal * 10) / 100;
  const total = subtotal + taxAmount;

  const handleSaveQuotation = () => {
    // Navigate back to quotations listing with fresh item
    navigate('/admin/quotations');
  };

  const stepsList = [
    '1. Select Customer',
    '2. Template & Plan',
    '3. Products & Terms',
    '4. Review & Finalize',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Wizard Header */}
      <div>
        <button
          onClick={() => navigate('/admin/quotations')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Quotations
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Quotation Creation Wizard
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Structured 8-part multi-step process for generating valid commercial subscription proposals
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-border rounded-lg p-3 shadow-subtle">
        <div className="grid grid-cols-4 gap-2">
          {stepsList.map((s, idx) => {
            const stepNum = idx + 1;
            const isPassed = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div
                key={s}
                className={`flex items-center gap-2 text-xs p-2 rounded-md ${
                  isCurrent
                    ? 'bg-primary-light text-primary font-semibold'
                    : isPassed
                    ? 'text-success font-medium'
                    : 'text-text-muted'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-primary text-white'
                      : isPassed
                      ? 'bg-success text-white'
                      : 'bg-gray-200 text-text-secondary'
                  }`}
                >
                  {isPassed ? <Check className="w-3 h-3" /> : stepNum}
                </div>
                <span className="truncate hidden sm:inline">{s}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Select Customer */}
      {step === 1 && (
        <Card title="Step 1: Select Customer & Account" subtitle="Choose client company to address the proposal to">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_CUSTOMERS.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedCustomerId === cust.id
                      ? 'border-primary bg-primary-light/30 shadow-subtle ring-1 ring-primary'
                      : 'border-border hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">{cust.name}</span>
                    <Badge variant={cust.status}>{cust.status}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{cust.company}</p>
                  <p className="text-[11px] text-text-muted mt-1">{cust.email}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setStep(2)}
              >
                Next: Plan & Template
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Select Template & Plan */}
      {step === 2 && (
        <Card title="Step 2: Quotation Template & Subscription Plan" subtitle="Select pre-configured bundles or choose plan">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">
                Quotation Template (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => handleApplyTemplate('')}
                  className={`p-3 rounded-lg border cursor-pointer text-xs ${
                    selectedTemplateId === '' ? 'border-primary bg-primary-light/20' : 'border-border'
                  }`}
                >
                  <span className="font-semibold text-text-primary block">Custom / Blank Offer</span>
                  <span className="text-text-secondary text-[11px]">Build product lines and terms from scratch</span>
                </div>
                {MOCK_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl.id)}
                    className={`p-3 rounded-lg border cursor-pointer text-xs ${
                      selectedTemplateId === tpl.id ? 'border-primary bg-primary-light/20' : 'border-border'
                    }`}
                  >
                    <span className="font-semibold text-text-primary block">{tpl.name}</span>
                    <span className="text-text-secondary text-[11px]">{tpl.planName} • {tpl.validityDays} days validity</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1.5">
                Target Subscription Plan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOCK_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer text-xs ${
                      selectedPlanId === plan.id
                        ? 'border-primary bg-primary-light/30 ring-1 ring-primary'
                        : 'border-border bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-text-primary">{plan.name}</span>
                      <span className="font-mono text-primary font-bold">${plan.price.toFixed(2)}</span>
                    </div>
                    <span className="text-[11px] text-text-muted block mt-1">
                      Billing frequency: {plan.billingFrequency} • Min qty: {plan.minQuantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setStep(3)}
              >
                Next: Products & Terms
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Products, Variants, Quantities, Terms */}
      {step === 3 && (
        <Card title="Step 3: Products, Variants & Commercial Terms" subtitle="Add items and specify payment conditions">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-primary">Quotation Line Items</span>
                <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={handleAddLine}>
                  Add Line
                </Button>
              </div>

              <div className="space-y-3">
                {lines.map((line, idx) => {
                  const prod = MOCK_PRODUCTS.find((p) => p.id === line.productId) || MOCK_PRODUCTS[0];
                  return (
                    <div key={line.id} className="p-3 bg-gray-50 rounded-lg border border-border grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      {/* Product Selector */}
                      <div className="sm:col-span-4">
                        <label className="text-[11px] font-medium text-text-secondary block mb-1">Product</label>
                        <select
                          value={line.productId}
                          onChange={(e) => handleLineProductChange(idx, e.target.value)}
                          className="w-full text-xs border border-border rounded p-1.5 bg-white"
                        >
                          {MOCK_PRODUCTS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${p.salesPrice})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Variant Selector */}
                      <div className="sm:col-span-3">
                        <label className="text-[11px] font-medium text-text-secondary block mb-1">Variant (e.g. Odoo)</label>
                        <select
                          value={line.variantId || ''}
                          onChange={(e) => handleLineVariantChange(idx, e.target.value)}
                          className="w-full text-xs border border-border rounded p-1.5 bg-white"
                        >
                          <option value="">No Variant</option>
                          {prod.variants?.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name} (+${v.additionalPrice})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-medium text-text-secondary block mb-1">Quantity</label>
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10) || 1)}
                          className="w-full text-xs border border-border rounded p-1.5 bg-white font-mono"
                        />
                      </div>

                      {/* Calculated Total */}
                      <div className="sm:col-span-2 text-right">
                        <span className="text-[11px] text-text-muted block">Line Total</span>
                        <span className="text-xs font-bold font-mono text-text-primary block mt-1">
                          ${line.total.toFixed(2)}
                        </span>
                      </div>

                      {/* Remove */}
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          disabled={lines.length === 1}
                          className="p-1.5 text-text-muted hover:text-danger disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terms and Validity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1.5">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full text-xs border border-border rounded-md p-2 bg-white"
                >
                  <option value="NET_15">Net 15 Days</option>
                  <option value="NET_30">Net 30 Days</option>
                  <option value="NET_60">Net 60 Days</option>
                  <option value="DUE_ON_RECEIPT">Due on Receipt</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1.5">Validity Duration (Days)</label>
                <input
                  type="number"
                  min={1}
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value, 10) || 14)}
                  className="w-full text-xs border border-border rounded-md p-2 bg-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setStep(4)}
              >
                Next: Review Price
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: Review Price & Save */}
      {step === 4 && (
        <Card title="Step 4: Review Proposal & Issue Quotation" subtitle="Verify final calculation before committing to database">
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
              <div>
                <span className="text-text-muted text-[11px] block uppercase font-semibold">Client Company</span>
                <p className="text-sm font-bold text-text-primary mt-1">{selectedCustomer.name}</p>
                <p className="text-text-secondary">{selectedCustomer.company} • {selectedCustomer.email}</p>
              </div>

              <div className="text-right">
                <span className="text-text-muted text-[11px] block uppercase font-semibold">Terms & Cadence</span>
                <p className="text-sm font-bold text-text-primary mt-1">{selectedPlan.name}</p>
                <p className="text-text-secondary">Cadence: {selectedPlan.billingFrequency} | Terms: {paymentTerms}</p>
              </div>
            </div>

            {/* Line items summary */}
            <div>
              <table className="w-full text-left">
                <thead className="bg-[#F7F8FA] border-y border-border text-text-secondary">
                  <tr>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2 px-3 font-medium text-text-primary">
                        {l.productName}
                        {l.variantName && <span className="text-primary ml-1 font-mono text-[11px]">({l.variantName})</span>}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{l.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono">${l.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-bold font-mono">${l.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Final Math Box */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-2 text-right">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Standard VAT / Tax (10%):</span>
                  <span className="font-mono font-medium">+${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-text-primary pt-2 border-t border-border">
                  <span>Proposal Total:</span>
                  <span className="font-mono">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                leftIcon={<FileCheck className="w-4 h-4" />}
                onClick={handleSaveQuotation}
              >
                Save & Issue Quotation
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
