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
  Printer,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useData } from '../../context/DataContext';
import { QuotationLine } from '../../types';
import { formatINR } from '../../utils/formatters';

export const QuotationWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { customers, plans, products, templates, addQuotation } = useData();

  // Step indicator
  const [step, setStep] = useState<number>(1);

  // Wizard state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [validityDays, setValidityDays] = useState<number>(14);
  const [paymentTerms, setPaymentTerms] = useState<string>('NET_30');

  // Selected Lines
  const [lines, setLines] = useState<QuotationLine[]>(() => {
    const firstProduct = products[0];
    if (!firstProduct) return [];
    const basePrice = firstProduct.salesPrice + (firstProduct.variants?.[0]?.additionalPrice || 0);
    return [
      {
        id: 'ql-1',
        productId: firstProduct.id,
        productName: firstProduct.name,
        variantId: firstProduct.variants?.[0]?.id,
        variantName: firstProduct.variants?.[0]?.name,
        quantity: 1,
        unitPrice: basePrice,
        taxRate: 18,
        total: basePrice,
      },
    ];
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0] || {
    id: 'cust-temp',
    name: 'Yuvraj Dutt',
    company: 'Apex Technologies Pvt Ltd',
    email: 'yuvraj.dutt@enterprise.in',
    address: 'Gurugram, Haryana',
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0] || {
    id: 'plan-default',
    name: 'Standard Business Monthly',
    billingFrequency: 'MONTHLY',
    price: 1410,
  };

  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;

    setSelectedPlanId(tpl.planId);
    setValidityDays(tpl.validityDays);

    const generatedLines: QuotationLine[] = tpl.defaultLines.map((dl, idx) => {
      const prod = products.find((p) => p.id === dl.productId) || products[0];
      const variant = prod?.variants?.find((v) => v.id === dl.variantId);
      const unitPrice = (prod?.salesPrice || 0) + (variant?.additionalPrice || 0);
      return {
        id: `ql-${Date.now()}-${idx}`,
        productId: prod?.id || '',
        productName: prod?.name || '',
        variantId: variant?.id,
        variantName: variant?.name,
        quantity: dl.quantity,
        unitPrice,
        taxRate: 18,
        total: unitPrice * dl.quantity,
      };
    });

    setLines(generatedLines);
  };

  const handleAddLine = () => {
    const defaultProduct = products[0];
    if (!defaultProduct) return;
    const newLine: QuotationLine = {
      id: `ql-${Date.now()}`,
      productId: defaultProduct.id,
      productName: defaultProduct.name,
      quantity: 1,
      unitPrice: defaultProduct.salesPrice,
      taxRate: 18,
      total: defaultProduct.salesPrice,
    };
    setLines([...lines, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    setLines(lines.filter((l) => l.id !== id));
  };

  const handleLineProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId) || products[0];
    if (!prod) return;
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
    const prod = products.find((p) => p.id === updated[index].productId) || products[0];
    if (!prod) return;
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
  const taxAmount = (subtotal * 18) / 100;
  const total = subtotal + taxAmount;

  const handleSaveQuotation = () => {
    if (!selectedCustomer.id) return;

    addQuotation({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerEmail: selectedCustomer.email || 'billing@client.in',
      customerCompany: selectedCustomer.company,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      validUntil: new Date(Date.now() + validityDays * 86400000).toISOString().split('T')[0],
      lines: lines.map((l) => ({ ...l, taxRate: 18 })),
      subtotal,
      discountAmount: 0,
      taxAmount,
      total,
      paymentTerms,
    });

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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Quotations
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create Commercial Quotation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure client proposal with product variants, billing terms, GST rates, and contract parameters
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
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
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : isPassed
                    ? 'text-emerald-700 font-medium'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
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
            {customers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                <p className="text-xs text-slate-600 mb-3">No customers found. Create a customer first.</p>
                <Button size="sm" onClick={() => navigate('/admin/customers')}>
                  Go to Customers Page
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customers.map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                      selectedCustomerId === cust.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{cust.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">{cust.company}</p>
                      </div>
                      <Badge variant={cust.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT'}>
                        {cust.status}
                      </Badge>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{cust.email}</span>
                      <span className="font-mono">{cust.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/customers')}
              >
                + Add New Customer
              </Button>
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setStep(2)}
                disabled={!selectedCustomerId && customers.length > 0}
              >
                Next: Plan & Template
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Template & Plan */}
      {step === 2 && (
        <Card title="Step 2: Quotation Template & Subscription Plan" subtitle="Select recurring contract cadence">
          <div className="space-y-5">
            {/* Template Selection */}
            {templates.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Apply Standard Template (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div
                    onClick={() => handleApplyTemplate('')}
                    className={`p-3 rounded-lg border cursor-pointer text-xs ${
                      selectedTemplateId === ''
                        ? 'border-indigo-600 bg-indigo-50/50 font-semibold text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    Custom Line Items
                  </div>
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => handleApplyTemplate(tpl.id)}
                      className={`p-3 rounded-lg border cursor-pointer text-xs ${
                        selectedTemplateId === tpl.id
                          ? 'border-indigo-600 bg-indigo-50/50 font-semibold text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <p className="font-bold text-slate-900">{tpl.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{tpl.validityDays} days validity</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plan selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Subscription Plan Cadence
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      selectedPlanId === p.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                      </div>
                      <Badge variant="ACTIVE">{p.billingFrequency}</Badge>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Base Price:</span>
                      <span className="font-bold text-indigo-600 font-mono">{formatINR(p.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Quotation Validity (Days)"
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
              />

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="IMMEDIATE">Immediate Settlement on Invoice</option>
                  <option value="NET_15">Net 15 Days</option>
                  <option value="NET_30">Net 30 Days (Standard Commercial)</option>
                  <option value="NET_60">Net 60 Days</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setStep(3)}
              >
                Next: Products & Pricing
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Products & Terms */}
      {step === 3 && (
        <Card title="Step 3: Line Items & Pricing" subtitle="Add software modules, brand variants, and add-on services">
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Product / Service</th>
                    <th className="py-2.5 px-3">Brand Variant</th>
                    <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                    <th className="py-2.5 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((line, idx) => {
                    const currentProd = products.find((p) => p.id === line.productId);
                    const variants = currentProd?.variants || [];
                    return (
                      <tr key={line.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <select
                            value={line.productId}
                            onChange={(e) => handleLineProductChange(idx, e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          {variants.length > 0 ? (
                            <select
                              value={line.variantId || ''}
                              onChange={(e) => handleLineVariantChange(idx, e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white font-mono"
                            >
                              <option value="">Standard Edition</option>
                              {variants.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.name} (+{formatINR(v.additionalPrice)})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-[11px] text-slate-400">None</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                            className="w-16 text-center text-xs border border-slate-200 rounded px-1.5 py-1 font-mono"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {formatINR(line.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatINR(line.total)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {lines.length > 1 && (
                            <button
                              onClick={() => handleRemoveLine(line.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddLine}
              >
                Add Another Line Item
              </Button>

              <div className="text-right text-xs space-y-1">
                <div className="text-slate-500">
                  Subtotal: <span className="font-mono font-bold text-slate-900">{formatINR(subtotal)}</span>
                </div>
                <div className="text-slate-500">
                  GST (18%): <span className="font-mono font-bold text-slate-900">+{formatINR(taxAmount)}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 border-t border-slate-200 pt-1">
                  Estimated Total: <span className="font-mono text-indigo-600">{formatINR(total)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
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
          <div className="space-y-6 text-xs printable-document">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-slate-400 text-[11px] block uppercase font-semibold">Client Company</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{selectedCustomer.name}</p>
                <p className="text-slate-500">{selectedCustomer.company} • {selectedCustomer.email}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{selectedCustomer.address}</p>
              </div>

              <div className="text-right">
                <span className="text-slate-400 text-[11px] block uppercase font-semibold">Terms & Cadence</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{selectedPlan.name}</p>
                <p className="text-slate-500">Cadence: {selectedPlan.billingFrequency} | Terms: {paymentTerms}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Validity: {validityDays} Calendar Days</p>
              </div>
            </div>

            {/* Line items summary */}
            <div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">GST Rate</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {l.productName}
                        {l.variantName && <span className="text-indigo-600 ml-1 font-mono text-[11px]">({l.variantName})</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">{l.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatINR(l.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">18%</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">{formatINR(l.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Final Math Box */}
            <div className="flex justify-end pt-2">
              <div className="w-72 space-y-2 text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal (Excl. Tax):</span>
                  <span className="font-mono font-medium text-slate-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>CGST (9%) + SGST (9%):</span>
                  <span className="font-mono font-medium text-slate-900">+{formatINR(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Proposal Amount:</span>
                  <span className="font-mono text-indigo-600">{formatINR(total)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200 no-print">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                  onClick={() => window.print()}
                >
                  Print / Export Proposal
                </Button>
              </div>

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
