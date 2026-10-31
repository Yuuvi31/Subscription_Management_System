import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Repeat,
  DollarSign,
  Clock,
  AlertTriangle,
  PlayCircle,
  ArrowUpRight,
  Plus,
  Users,
  Package,
  Receipt,
  FileText,
  Sparkles,
  Trash2,
  Database,
  CheckCircle2,
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
} from 'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useData } from '../../context/DataContext';
import { formatINR, formatINRAxis } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    customers,
    products,
    plans,
    subscriptions,
    invoices,
    payments,
    runBillingEngine,
    resetToCleanState,
    loadStarterData,
  } = useData();

  const [isBillingRunning, setIsBillingRunning] = useState(false);
  const [billingResult, setBillingResult] = useState<string | null>(null);

  // Dynamic Metrics computed directly from real state
  const activeSubs = useMemo(() => subscriptions.filter((s) => s.status === 'ACTIVE'), [subscriptions]);
  const revenueCollected = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);
  const outstandingBalance = useMemo(
    () =>
      invoices.reduce(
        (acc, i) => acc + (i.status !== 'PAID' && i.status !== 'CANCELLED' ? i.outstandingBalance : 0),
        0
      ),
    [invoices]
  );
  const overdueInvoices = useMemo(
    () => invoices.filter((i) => i.status === 'CONFIRMED' && new Date(i.dueDate) < new Date()),
    [invoices]
  );

  // Dynamic Status Distribution
  const statusDistribution = useMemo(() => {
    const counts: Record<string, { count: number; color: string }> = {
      Active: { count: subscriptions.filter((s) => s.status === 'ACTIVE').length, color: '#059669' },
      Confirmed: { count: subscriptions.filter((s) => s.status === 'CONFIRMED').length, color: '#4F46E5' },
      Paused: { count: subscriptions.filter((s) => s.status === 'PAUSED').length, color: '#64748B' },
      Closed: { count: subscriptions.filter((s) => s.status === 'CLOSED').length, color: '#DC2626' },
    };

    return Object.entries(counts).map(([status, item]) => ({
      status,
      count: item.count,
      color: item.color,
    }));
  }, [subscriptions]);

  // Dynamic Monthly Trend from actual invoices
  const revenueTrend = useMemo(() => {
    if (invoices.length === 0) {
      return [
        { date: 'Current', revenue: 0, count: 0 },
      ];
    }

    const monthlyMap: Record<string, number> = {};
    invoices.forEach((inv) => {
      const monthKey = inv.issueDate ? inv.issueDate.substring(0, 7) : 'Recent';
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + inv.total;
    });

    const entries = Object.entries(monthlyMap);
    if (entries.length === 0) {
      return [{ date: 'Current', revenue: 0, count: 0 }];
    }

    return entries.map(([date, revenue]) => ({
      date,
      revenue,
      count: 1,
    }));
  }, [invoices]);

  const handleRunBilling = () => {
    setIsBillingRunning(true);
    setBillingResult(null);
    setTimeout(() => {
      const res = runBillingEngine();
      setIsBillingRunning(false);
      setBillingResult(res.message);
    }, 700);
  };

  const hasNoData = customers.length === 0 && products.length === 0 && subscriptions.length === 0;

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Billing & Revenue Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time subscriber metrics, collections, and recurring billing cycles for Brightloop.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Users className="w-3.5 h-3.5" />}
            onClick={() => navigate('/admin/customers')}
          >
            Add Customer
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Package className="w-3.5 h-3.5" />}
            onClick={() => navigate('/admin/products')}
          >
            Add Product
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileText className="w-3.5 h-3.5" />}
            onClick={() => navigate('/admin/quotations/new')}
          >
            New Quotation
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
            onClick={handleRunBilling}
            isLoading={isBillingRunning}
          >
            Run Billing Cycle
          </Button>
        </div>
      </div>

      {billingResult && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{billingResult}</span>
          </div>
          <button
            onClick={() => setBillingResult(null)}
            className="text-xs font-semibold text-emerald-900 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Clean Slate Onboarding Card when user starts empty */}
      {hasNoData && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-3 shadow-sm">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-600">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Clean Database — Ready for Your Data</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All fake stats have been removed. You can now build your genuine business records directly: create your own customers, configure software products and plans, and issue invoices.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/customers')}>
              Create Your First Customer
            </Button>
            <Button variant="outline" size="sm" onClick={loadStarterData}>
              Load Single Example Customer (Optional)
            </Button>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics (Strictly Real) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={activeSubs.length}
          subtitle={`Across ${plans.length} configured plans`}
          icon={<Repeat className="w-5 h-5 text-indigo-600" />}
          onClick={() => navigate('/admin/subscriptions')}
        />
        <StatCard
          title="Revenue Collected"
          value={formatINR(revenueCollected)}
          subtitle={`${payments.length} verified payment receipt(s)`}
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          onClick={() => navigate('/admin/payments')}
        />
        <StatCard
          title="Outstanding Balance"
          value={formatINR(outstandingBalance)}
          subtitle={`${invoices.filter((i) => i.status !== 'PAID').length} unpaid invoice(s)`}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          onClick={() => navigate('/admin/invoices')}
        />
        <StatCard
          title="Overdue Invoices"
          value={overdueInvoices.length}
          subtitle={overdueInvoices.length > 0 ? 'Requires collection follow-up' : 'All accounts in good standing'}
          trend={overdueInvoices.length > 0 ? { value: 'Attention', isPositive: false } : undefined}
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          onClick={() => navigate('/admin/invoices?filter=overdue')}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <Card
          className="lg:col-span-2"
          title="Monthly Recurring Revenue"
          subtitle="Real-time invoiced revenue aggregated from billing cycles"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => formatINRAxis(val)} />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val || 0)), 'Invoiced']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Subscription Status Distribution */}
        <Card
          title="Contract Distribution"
          subtitle="Breakdown of customer subscriptions by lifecycle state"
        >
          <div className="h-72 w-full flex flex-col items-center justify-center">
            {subscriptions.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} contracts`, name]}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2 w-full">
                  {statusDistribution.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600">{item.status}</span>
                      </div>
                      <span className="font-semibold text-slate-900 font-mono">{item.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 text-xs py-8">
                No active subscriptions yet. Create a quotation to establish subscriptions.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Two Column Section: Recent Invoices & Upcoming Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card
          title="Recent Invoices"
          subtitle="Latest billing statements issued across accounts"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/invoices')}
            >
              All Invoices
            </Button>
          }
        >
          <div className="divide-y divide-slate-100 -mx-5 -mb-5">
            {invoices.length === 0 ? (
              <p className="p-5 text-xs text-slate-400 text-center">No invoices generated yet.</p>
            ) : (
              invoices.slice(0, 4).map((inv) => (
                <div key={inv.id} className="p-4 px-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 font-mono">
                        {inv.invoiceNumber}
                      </span>
                      <Badge variant={inv.status}>{inv.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {inv.customerName} ({inv.customerCompany})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Issued: {inv.issueDate} • Due: {inv.dueDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 font-mono block">
                      {formatINR(inv.total)}
                    </span>
                    <button
                      onClick={() => navigate(`/admin/invoices/${inv.id}`)}
                      className="text-xs text-indigo-600 font-medium hover:underline mt-1"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Renewals */}
        <Card
          title="Active Subscriptions & Renewals"
          subtitle="Scheduled renewals and recurring cycles"
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
          <div className="divide-y divide-slate-100 -mx-5 -mb-5">
            {subscriptions.length === 0 ? (
              <p className="p-5 text-xs text-slate-400 text-center">No subscriptions on file.</p>
            ) : (
              subscriptions.slice(0, 4).map((sub) => (
                <div key={sub.id} className="p-4 px-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 font-mono">
                        {sub.subscriptionNumber}
                      </span>
                      <Badge variant={sub.status}>{sub.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 truncate">
                      {sub.customerName} • {sub.planName}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Next Billing: {sub.nextBillingDate} ({sub.billingFrequency})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 font-mono block">
                      {formatINR(sub.amount)}
                    </span>
                    <button
                      onClick={() => navigate(`/admin/subscriptions/${sub.id}`)}
                      className="text-xs text-indigo-600 font-medium hover:underline mt-1"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Database Controls Footer */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200">
        <span>Persistent storage enabled (localStorage)</span>
        <button
          onClick={resetToCleanState}
          className="text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
          title="Wipe data back to empty"
        >
          <Trash2 className="w-3.5 h-3.5" /> Reset Database to Empty
        </button>
      </div>
    </div>
  );
};
