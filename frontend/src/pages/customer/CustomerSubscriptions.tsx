import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { MOCK_SUBSCRIPTIONS, MOCK_PRODUCTS, MOCK_PLANS } from '../../services/mockData';
import { Subscription, SubscriptionLine } from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  Calendar,
  Layers,
  Plus,
  CheckCircle2,
  PackagePlus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CustomerSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    MOCK_SUBSCRIPTIONS.filter((s) => s.customerId === 'cust-01')
  );

  // Add-ons Modal State
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [selectedSubForAddon, setSelectedSubForAddon] = useState<Subscription | null>(null);
  const [activeTab, setActiveTab] = useState<'addons' | 'new_plan'>('addons');
  const [notification, setNotification] = useState<string | null>(null);

  // New Subscription Plan Selection State
  const [selectedNewPlanId, setSelectedNewPlanId] = useState<string>(MOCK_PLANS[0].id);

  const handleOpenAddons = (sub?: Subscription) => {
    setSelectedSubForAddon(sub || subscriptions[0]);
    setIsAddonModalOpen(true);
  };

  const handleAttachAddon = (productName: string, price: number, variantName?: string) => {
    if (!selectedSubForAddon) return;

    const newLine: SubscriptionLine = {
      id: `sl-${Date.now()}`,
      productId: `prod-${Date.now()}`,
      productName,
      variantName,
      quantity: 1,
      unitPrice: price,
      taxRate: 18,
      amount: price,
    };

    const updatedSub: Subscription = {
      ...selectedSubForAddon,
      amount: selectedSubForAddon.amount + price,
      lines: [...selectedSubForAddon.lines, newLine],
    };

    setSubscriptions(
      subscriptions.map((s) => (s.id === selectedSubForAddon.id ? updatedSub : s))
    );
    setSelectedSubForAddon(updatedSub);

    setNotification(`Successfully added ${productName} (${formatINR(price)}) to subscription ${selectedSubForAddon.subscriptionNumber}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateNewSubscription = () => {
    const chosenPlan = MOCK_PLANS.find((p) => p.id === selectedNewPlanId) || MOCK_PLANS[0];
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      subscriptionNumber: `SUB-2026-0${subscriptions.length + 105}`,
      customerId: 'cust-01',
      customerName: 'Yuvraj Dutt',
      customerCompany: 'Apex Technologies Pvt Ltd',
      planId: chosenPlan.id,
      planName: chosenPlan.name,
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: '2027-10-31',
      nextBillingDate: '2026-11-30',
      billingFrequency: chosenPlan.billingFrequency,
      amount: chosenPlan.price,
      status: 'ACTIVE',
      lines: [
        {
          id: `sl-init-${Date.now()}`,
          productId: 'prod-01',
          productName: `${chosenPlan.name} Core Provision`,
          quantity: 1,
          unitPrice: chosenPlan.price,
          taxRate: 18,
          amount: chosenPlan.price,
        },
      ],
      autoClosure: chosenPlan.autoClosure,
      allowEarlyClosure: chosenPlan.allowEarlyClosure,
      allowPause: chosenPlan.allowPause,
      allowRenewal: chosenPlan.allowRenewal,
      paymentTerms: 'NET_30',
    };

    setSubscriptions([newSub, ...subscriptions]);
    setIsAddonModalOpen(false);
    setNotification(`New subscription ${newSub.subscriptionNumber} (${chosenPlan.name}) added and activated successfully!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const availableAddons = [
    {
      name: 'Dedicated API Pipeline Add-on',
      price: 250,
      description: 'High throughput dedicated webhook and REST pipe for automated ERP sync',
    },
    {
      name: 'Priority SLA 24/7 Support',
      price: 400,
      description: '15-minute response time guarantee with assigned Indian customer success engineer',
    },
    {
      name: 'Multi-Region Data Residency (India Cloud)',
      price: 320,
      description: 'Mumbai & Hyderabad dual database mirroring and RBI / MeitY compliant backup',
    },
    {
      name: 'Odoo Ecosystem Connector Variant',
      price: 560,
      description: 'Direct bi-directional synchronizer for Odoo ERP invoicing & stock ledger',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Manage Subscriptions
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Review active contract packages in Indian Rupees (₹), configure add-ons, and scale license seats
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Add-ons Button requested by user */}
          <Button
            variant="primary"
            size="md"
            leftIcon={<PackagePlus className="w-4 h-4" />}
            onClick={() => handleOpenAddons()}
          >
            Manage Add-ons & New Subscriptions
          </Button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>{notification}</span>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="grid grid-cols-1 gap-5">
        {subscriptions.map((sub) => (
          <Card key={sub.id} className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-text-primary">
                    {sub.subscriptionNumber}
                  </span>
                  <Badge variant={sub.status}>{sub.status}</Badge>
                </div>
                <h3 className="text-base font-bold text-text-primary mt-1">{sub.planName}</h3>
                <p className="text-xs text-text-secondary">Contract cycle: {sub.startDate} to {sub.expiryDate}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xl font-bold text-text-primary font-mono">
                  {formatINR(sub.amount)}
                </span>
                <span className="text-xs text-text-muted block">Billed {sub.billingFrequency.toLowerCase()}</span>
              </div>
            </div>

            {/* Active Add-ons & Lines */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Active Products & Add-ons ({sub.lines.length})
                </h4>
                <button
                  onClick={() => handleOpenAddons(sub)}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Feature / Add-on
                </button>
              </div>

              <div className="space-y-2">
                {sub.lines.map((line) => (
                  <div key={line.id} className="flex items-center justify-between text-xs p-2.5 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-semibold text-text-primary">{line.productName}</span>
                      {line.variantName && (
                        <span className="text-primary text-[11px] ml-2 font-mono font-medium">({line.variantName})</span>
                      )}
                    </div>
                    <span className="font-mono text-text-primary font-semibold">
                      Qty: {line.quantity} × {formatINR(line.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-text-secondary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-muted" /> Next scheduled bill date: <strong className="text-text-primary">{sub.nextBillingDate}</strong>
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenAddons(sub)}>
                  Configure Add-ons
                </Button>
                {sub.allowPause && (
                  <Button variant="secondary" size="sm">
                    Pause
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add-ons & New Subscription Modal */}
      {isAddonModalOpen && (
        <Modal
          isOpen={isAddonModalOpen}
          onClose={() => setIsAddonModalOpen(false)}
          title="Add-ons & Subscription Expansion"
          subtitle="Add high-performance modules or provision a new recurring subscription"
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Tabs for Addon vs New Plan */}
            <div className="flex border-b border-border gap-6 font-semibold">
              <button
                onClick={() => setActiveTab('addons')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'addons'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                1. Add Module / Add-on to Existing Subscription
              </button>
              <button
                onClick={() => setActiveTab('new_plan')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'new_plan'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                2. Add New Subscription Plan
              </button>
            </div>

            {/* TAB 1: Addons */}
            {activeTab === 'addons' && (
              <div className="space-y-4">
                <div className="p-3 bg-primary-light/40 rounded-lg border border-primary/20 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-text-muted uppercase font-bold block">Target Subscription</span>
                    <span className="text-xs font-bold text-text-primary">
                      {selectedSubForAddon?.subscriptionNumber} — {selectedSubForAddon?.planName}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary">
                    Current: {formatINR(selectedSubForAddon?.amount || 0)}
                  </span>
                </div>

                <div className="space-y-3">
                  {availableAddons.map((addon) => {
                    const alreadyHas = selectedSubForAddon?.lines.some((l) => l.productName === addon.name);
                    return (
                      <div
                        key={addon.name}
                        className="p-3.5 rounded-lg border border-border bg-white flex items-center justify-between gap-4 hover:border-gray-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-text-primary">{addon.name}</h4>
                            <span className="font-mono text-xs font-bold text-primary">{formatINR(addon.price)}/mo</span>
                          </div>
                          <p className="text-[11px] text-text-secondary mt-0.5">{addon.description}</p>
                        </div>

                        <div>
                          {alreadyHas ? (
                            <span className="text-[11px] font-semibold text-success bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<Plus className="w-3 h-3" />}
                              onClick={() => handleAttachAddon(addon.name, addon.price)}
                            >
                              Add Add-on
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: New Subscription */}
            {activeTab === 'new_plan' && (
              <div className="space-y-4">
                <p className="text-text-secondary">
                  Choose a subscription plan to add to your company account:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MOCK_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedNewPlanId(plan.id)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        selectedNewPlanId === plan.id
                          ? 'border-primary bg-primary-light/30 ring-1 ring-primary'
                          : 'border-border bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-text-primary">{plan.name}</span>
                        <span className="font-mono text-primary font-bold">{formatINR(plan.price)}</span>
                      </div>
                      <p className="text-[11px] text-text-secondary mt-1">{plan.description}</p>
                      <span className="text-[10px] text-text-muted block mt-2 font-mono">
                        Cadence: {plan.billingFrequency} • Min Seats: {plan.minQuantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={handleCreateNewSubscription}
                  >
                    Activate New Subscription
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
