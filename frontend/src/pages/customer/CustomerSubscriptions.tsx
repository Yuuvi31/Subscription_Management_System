import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
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
  Pause,
  Play,
} from 'lucide-react';

export const CustomerSubscriptions: React.FC = () => {
  const { user } = useAuth();
  const { subscriptions, plans, products, updateSubscriptionStatus } = useData();

  const mySubscriptions = subscriptions.filter(
    (s) => s.customerName.toLowerCase().includes(user?.name.toLowerCase() || 'yuvraj') || s.customerId === 'cust-01'
  );

  // Add-ons Modal State
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [selectedSubForAddon, setSelectedSubForAddon] = useState<Subscription | null>(null);
  const [activeTab, setActiveTab] = useState<'addons' | 'new_plan'>('addons');
  const [notification, setNotification] = useState<string | null>(null);

  // New Subscription Plan Selection State
  const [selectedNewPlanId, setSelectedNewPlanId] = useState<string>(plans[0]?.id || '');

  const handleOpenAddons = (sub?: Subscription) => {
    setSelectedSubForAddon(sub || mySubscriptions[0]);
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

    // Update locally and notify
    setSelectedSubForAddon(updatedSub);
    setNotification(`Successfully added ${productName} (${formatINR(price)}) to subscription ${selectedSubForAddon.subscriptionNumber}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleTogglePause = (sub: Subscription) => {
    const nextStatus = sub.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    updateSubscriptionStatus(sub.id, nextStatus);
    setNotification(`Subscription ${sub.subscriptionNumber} marked as ${nextStatus}`);
    setTimeout(() => setNotification(null), 3000);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manage Subscriptions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review active contract packages in Indian Rupees (₹), configure add-ons, and scale license seats
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            leftIcon={<PackagePlus className="w-4 h-4" />}
            onClick={() => handleOpenAddons()}
          >
            Add-ons & New Plan
          </Button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Subscriptions Grid */}
      <div className="space-y-4">
        {mySubscriptions.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-xl text-center">
            <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No active subscriptions found for this account.</p>
            <Button size="sm" className="mt-3" onClick={() => handleOpenAddons()}>
              Select a Subscription Plan
            </Button>
          </div>
        ) : (
          mySubscriptions.map((sub) => (
            <Card key={sub.id} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 font-mono">
                      {sub.subscriptionNumber}
                    </h2>
                    <Badge variant={sub.status}>{sub.status}</Badge>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-semibold">{sub.planName}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Billed <span className="font-semibold text-slate-700 capitalize">{sub.billingFrequency.toLowerCase()}</span> • Terms: {sub.paymentTerms}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Recurring Rate</span>
                    <span className="text-xl font-bold font-mono text-indigo-600">
                      {formatINR(sub.amount)}
                    </span>
                    <span className="text-[11px] text-slate-400">/{sub.billingFrequency === 'MONTHLY' ? 'mo' : 'yr'}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<PackagePlus className="w-3.5 h-3.5 text-indigo-600" />}
                    onClick={() => handleOpenAddons(sub)}
                  >
                    Manage Add-ons
                  </Button>

                  {sub.status === 'ACTIVE' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-amber-600 hover:bg-amber-50"
                      leftIcon={<Pause className="w-3.5 h-3.5" />}
                      onClick={() => handleTogglePause(sub)}
                    >
                      Pause
                    </Button>
                  )}

                  {sub.status === 'PAUSED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600 hover:bg-emerald-50"
                      leftIcon={<Play className="w-3.5 h-3.5" />}
                      onClick={() => handleTogglePause(sub)}
                    >
                      Resume
                    </Button>
                  )}
                </div>
              </div>

              {/* Line Items & Addons inside this subscription */}
              <div className="mt-4">
                <span className="text-xs font-semibold text-slate-700 block mb-2">
                  Active Modules & Add-on Packages ({sub.lines.length})
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sub.lines.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-100 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{l.productName}</span>
                        {l.variantName && (
                          <span className="text-indigo-600 ml-1.5 font-mono text-[11px]">
                            ({l.variantName})
                          </span>
                        )}
                        <span className="text-slate-400 ml-2 font-mono text-[10px]">Qty: {l.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-900 font-mono">
                        {formatINR(l.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-4">
                  <span><strong>Start:</strong> {sub.startDate}</span>
                  <span><strong>Expires:</strong> {sub.expiryDate}</span>
                </div>
                <div>
                  <span><strong>Next Invoicing:</strong> <span className="font-mono text-slate-900 font-bold">{sub.nextBillingDate}</span></span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add-ons & Provisioning Modal */}
      {isAddonModalOpen && (
        <Modal
          isOpen={isAddonModalOpen}
          onClose={() => setIsAddonModalOpen(false)}
          title="Scale Subscriptions & Add-ons"
          subtitle="Provision new cloud modules, enterprise support SLAs, or supplementary plans"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('addons')}
                className={`py-2 px-4 font-bold border-b-2 transition-colors ${
                  activeTab === 'addons'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Attach Add-on Modules
              </button>
              <button
                onClick={() => setActiveTab('new_plan')}
                className={`py-2 px-4 font-bold border-b-2 transition-colors ${
                  activeTab === 'new_plan'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Provision New Plan
              </button>
            </div>

            {activeTab === 'addons' ? (
              <div className="space-y-3">
                <p className="text-slate-600">
                  Select an add-on module to attach to subscription{' '}
                  <strong className="text-slate-900 font-mono">
                    {selectedSubForAddon?.subscriptionNumber || 'Active Subscription'}
                  </strong>
                  . The recurring fee will be prorated and added to your next billing run.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {availableAddons.map((addon) => (
                    <div
                      key={addon.name}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900 text-xs">{addon.name}</h4>
                          <span className="font-bold font-mono text-indigo-600 text-xs">
                            +{formatINR(addon.price)}/mo
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{addon.description}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200 flex justify-end">
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Plus className="w-3.5 h-3.5" />}
                          onClick={() => handleAttachAddon(addon.name, addon.price)}
                        >
                          Attach Module
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600">
                  Select a subscription plan to add as an active enterprise contract for your company.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {plans.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedNewPlanId(p.id)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        selectedNewPlanId === p.id
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{p.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                        </div>
                        <Badge variant="ACTIVE">{p.billingFrequency}</Badge>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Plan Rate:</span>
                        <span className="font-bold text-indigo-600 font-mono">{formatINR(p.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => {
                      const chosenPlan = plans.find((p) => p.id === selectedNewPlanId) || plans[0];
                      if (!chosenPlan) return;
                      setNotification(`Plan ${chosenPlan.name} requested for subscription provisioning!`);
                      setIsAddonModalOpen(false);
                      setTimeout(() => setNotification(null), 4000);
                    }}
                  >
                    Confirm & Activate Plan
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
