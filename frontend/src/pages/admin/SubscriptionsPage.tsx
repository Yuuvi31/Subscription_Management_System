import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, Search, Plus, Filter, PlayCircle, Eye, Pause, Play, XCircle, Zap } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useData } from '../../context/DataContext';
import { Subscription, SubscriptionStatus } from '../../types';
import { formatINR } from '../../utils/formatters';

export const SubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { subscriptions, updateSubscriptionStatus, runBillingEngine } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchesSearch =
        s.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.planName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchTerm, statusFilter]);

  const handleStatusChange = (id: string, newStatus: SubscriptionStatus, actionLabel: string) => {
    updateSubscriptionStatus(id, newStatus);
    setActionFeedback(`Subscription status updated to ${actionLabel}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleRunBilling = () => {
    const res = runBillingEngine();
    setActionFeedback(res.message);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Recurring Subscriptions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Contract lifecycles, active billing cycles, renewal automation, and state transitions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            leftIcon={<Zap className="w-4 h-4 text-amber-500" />}
            onClick={handleRunBilling}
          >
            Run Billing Engine
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/admin/quotations/new')}
          >
            New Subscription
          </Button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800">
          {actionFeedback}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by subscription #, customer, plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="ALL">All Statuses ({subscriptions.length})</option>
            <option value="ACTIVE">Active</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PAUSED">Paused</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Subscription #</th>
                <th className="py-3 px-4">Customer & Account</th>
                <th className="py-3 px-4">Plan & Cadence</th>
                <th className="py-3 px-4">Contract Period</th>
                <th className="py-3 px-4">Next Billing Date</th>
                <th className="py-3 px-4 text-right">Recurring Fee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No subscriptions found matching your query.
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {sub.subscriptionNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{sub.customerName}</div>
                      <div className="text-[11px] text-slate-500">{sub.customerCompany}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{sub.planName}</div>
                      <div className="text-[11px] text-slate-500 capitalize">{sub.billingFrequency.toLowerCase()}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span>{sub.startDate}</span>
                      <span className="mx-1 text-slate-400">→</span>
                      <span>{sub.expiryDate}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {sub.nextBillingDate}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      {formatINR(sub.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={sub.status}>{sub.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/admin/subscriptions/${sub.id}`)}
                      >
                        Details
                      </Button>

                      {sub.status === 'ACTIVE' && (
                        <button
                          title="Pause Subscription"
                          onClick={() => handleStatusChange(sub.id, 'PAUSED', 'PAUSED')}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {sub.status === 'PAUSED' && (
                        <button
                          title="Resume Subscription"
                          onClick={() => handleStatusChange(sub.id, 'ACTIVE', 'ACTIVE')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {sub.status !== 'CLOSED' && (
                        <button
                          title="Terminate / Close Contract"
                          onClick={() => handleStatusChange(sub.id, 'CLOSED', 'CLOSED')}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
