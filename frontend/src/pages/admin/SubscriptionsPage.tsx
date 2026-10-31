import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, Search, Plus, Filter, PlayCircle, Eye, Pause, Play, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MOCK_SUBSCRIPTIONS } from '../../services/mockData';
import { Subscription, SubscriptionStatus } from '../../types';

export const SubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);
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
    setSubscriptions(
      subscriptions.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    setActionFeedback(`Subscription successfully transitioned to ${actionLabel}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Recurring Subscriptions
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Contract lifecycles (Draft → Quote → Confirmed → Active → Closed) and renewal controls
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/admin/quotations/new')}
        >
          New Subscription
        </Button>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
          {actionFeedback}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by subscription #, customer, plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F8FA] border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-text-muted hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-border rounded-md px-2.5 py-1.5 bg-white text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
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
            <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Subscription #</th>
                <th className="py-3 px-4">Customer & Company</th>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Cadence</th>
                <th className="py-3 px-4">Term Dates</th>
                <th className="py-3 px-4">Next Bill Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-text-primary">{sub.subscriptionNumber}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-text-primary block">{sub.customerName}</span>
                    <span className="text-[11px] text-text-secondary">{sub.customerCompany}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-text-primary">{sub.planName}</td>
                  <td className="py-3 px-4 capitalize">{sub.billingFrequency.toLowerCase()}</td>
                  <td className="py-3 px-4 text-text-secondary font-mono text-[11px]">
                    {sub.startDate} to {sub.expiryDate}
                  </td>
                  <td className="py-3 px-4 font-medium text-text-primary">{sub.nextBillingDate}</td>
                  <td className="py-3 px-4 text-right font-bold text-text-primary">${sub.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={sub.status}>{sub.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {sub.status === 'ACTIVE' && sub.allowPause && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'PAUSED', 'Paused')}
                          title="Pause subscription"
                          className="p-1 text-text-muted hover:text-warning"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {sub.status === 'PAUSED' && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'ACTIVE', 'Active')}
                          title="Resume subscription"
                          className="p-1 text-text-muted hover:text-success"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {sub.status === 'ACTIVE' && sub.allowEarlyClosure && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'CLOSED', 'Closed early')}
                          title="Close early"
                          className="p-1 text-text-muted hover:text-danger"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="w-3 h-3" />}
                        onClick={() => navigate(`/admin/subscriptions/${sub.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
