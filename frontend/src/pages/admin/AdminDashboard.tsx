import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Repeat,
  DollarSign,
  Clock,
  AlertTriangle,
  PlayCircle,
  ArrowUpRight,
  Receipt,
  Calendar,
  Filter,
  CheckCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MOCK_DASHBOARD } from '../../services/mockData';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [isBillingRunning, setIsBillingRunning] = useState(false);
  const [billingResult, setBillingResult] = useState<string | null>(null);

  const stats = MOCK_DASHBOARD;

  const handleRunBilling = () => {
    setIsBillingRunning(true);
    setBillingResult(null);
    setTimeout(() => {
      setIsBillingRunning(false);
      setBillingResult('Billing run completed successfully: 14 renewals evaluated, 2 invoices generated.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Executive Revenue & Subscription Overview
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Real-time subscriber metrics, recurring ARR/MRR health, and collection pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Filter Tabs */}
          <div className="flex items-center bg-white border border-border rounded-md p-0.5 text-xs">
            <button
              onClick={() => setPeriod('7d')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                period === '7d' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                period === '30d' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setPeriod('90d')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                period === '90d' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              90D
            </button>
          </div>

          {/* Trigger Recurring Billing Engine */}
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlayCircle className="w-4 h-4" />}
            onClick={handleRunBilling}
            isLoading={isBillingRunning}
          >
            Run Billing Engine
          </Button>
        </div>
      </div>

      {billingResult && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>{billingResult}</span>
          </div>
          <button
            onClick={() => setBillingResult(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptionsCount}
          subtitle="across 5 Enterprise tiers"
          trend={{ value: '+14% MoM', isPositive: true }}
          icon={<Repeat className="w-5 h-5 text-primary" />}
          onClick={() => navigate('/admin/subscriptions')}
        />
        <StatCard
          title="Revenue Collected"
          value={`$${stats.revenueCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="verified bank transfers"
          trend={{ value: '+18.2% YTD', isPositive: true }}
          icon={<DollarSign className="w-5 h-5 text-success" />}
          onClick={() => navigate('/admin/payments')}
        />
        <StatCard
          title="Outstanding Balance"
          value={`$${stats.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="unpaid active invoices"
          icon={<Clock className="w-5 h-5 text-warning" />}
          onClick={() => navigate('/admin/invoices')}
        />
        <StatCard
          title="Overdue Invoices"
          value={stats.overdueInvoicesCount}
          subtitle="requiring collections follow-up"
          trend={{ value: 'Action required', isPositive: false }}
          icon={<AlertTriangle className="w-5 h-5 text-danger" />}
          onClick={() => navigate('/admin/invoices?filter=overdue')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Trend */}
        <Card
          className="lg:col-span-2"
          title="Monthly Recurring Revenue Trend"
          subtitle="Aggregated invoicing totals and collection pace"
          action={
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/admin/reports')}
            >
              Detailed Breakdown
            </Button>
          }
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#635BDB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#635BDB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" vertical={false} />
                <XAxis dataKey="date" stroke="#737987" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#737987"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val || 0).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E8EAF0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#635BDB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Subscription Status Distribution */}
        <Card
          title="Subscription Distribution"
          subtitle="Active contract breakdown by lifecycle state"
        >
          <div className="h-72 w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {stats.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} subscriptions`, name]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E8EAF0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mt-2 w-full">
              {stats.statusDistribution.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-text-secondary">{item.status}</span>
                  </div>
                  <span className="font-semibold text-text-primary">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Split Grid: Overdue Invoices & Upcoming Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Invoices List */}
        <Card
          title="Overdue Invoices Requiring Follow-up"
          subtitle="Past invoice due dates awaiting payment reconciliation"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/invoices')}
            >
              View All Invoices
            </Button>
          }
        >
          <div className="divide-y divide-border -mx-5 -mb-5">
            {stats.overdueInvoicesList.map((inv) => (
              <div key={inv.id} className="p-4 px-5 flex items-center justify-between hover:bg-gray-50/70 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary font-mono">
                      {inv.invoiceNumber}
                    </span>
                    <Badge variant="overdue">Overdue</Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {inv.customerName} ({inv.customerCompany})
                  </p>
                  <p className="text-[11px] text-danger mt-0.5">
                    Due date: {inv.dueDate}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-text-primary block">
                    ${inv.outstandingBalance.toFixed(2)}
                  </span>
                  <button
                    onClick={() => navigate(`/admin/invoices/${inv.id}`)}
                    className="text-xs text-primary font-medium hover:underline mt-1"
                  >
                    View Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Renewals */}
        <Card
          title="Upcoming Contract Renewals"
          subtitle="Subscriptions maturing within the next 30 days"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/subscriptions')}
            >
              All Subscriptions
            </Button>
          }
        >
          <div className="divide-y divide-border -mx-5 -mb-5">
            {stats.upcomingRenewals.map((sub) => (
              <div key={sub.id} className="p-4 px-5 flex items-center justify-between hover:bg-gray-50/70 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary font-mono">
                      {sub.subscriptionNumber}
                    </span>
                    <Badge variant={sub.status}>{sub.status}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {sub.customerName} • {sub.planName}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Next Billing: {sub.nextBillingDate} ({sub.billingFrequency})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-text-primary block">
                    ${sub.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => navigate(`/admin/subscriptions/${sub.id}`)}
                    className="text-xs text-primary font-medium hover:underline mt-1"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
