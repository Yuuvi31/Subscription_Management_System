import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, Download, Calendar, TrendingUp, AlertTriangle, IndianRupee, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { useData } from '../../context/DataContext';
import { formatINR, formatINRAxis } from '../../utils/formatters';

const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const ReportsPage: React.FC = () => {
  const { subscriptions, invoices, payments, customers } = useData();
  const [dateFilter, setDateFilter] = useState('30D');

  // Compute genuine business metrics from state
  const activeSubs = useMemo(() => subscriptions.filter((s) => s.status === 'ACTIVE'), [subscriptions]);
  const closedSubs = useMemo(() => subscriptions.filter((s) => s.status === 'CLOSED'), [subscriptions]);

  const totalARR = useMemo(() => {
    return activeSubs.reduce((acc, s) => {
      const annualMultiplier = s.billingFrequency === 'MONTHLY' ? 12 : s.billingFrequency === 'QUARTERLY' ? 4 : 1;
      return acc + s.amount * annualMultiplier;
    }, 0);
  }, [activeSubs]);

  const totalMRR = totalARR / 12;

  const totalPaidRevenue = useMemo(() => {
    return payments.reduce((acc, p) => acc + p.amount, 0);
  }, [payments]);

  const totalOutstanding = useMemo(() => {
    return invoices.reduce((acc, i) => acc + (i.status !== 'PAID' ? i.outstandingBalance : 0), 0);
  }, [invoices]);

  // Payment methods breakdown
  const paymentMethodData = useMemo(() => {
    const map: Record<string, number> = {};
    payments.forEach((p) => {
      const method = p.method.replace('_', ' ');
      map[method] = (map[method] || 0) + p.amount;
    });

    const total = Object.values(map).reduce((a, b) => a + b, 0);
    if (total === 0) {
      return [
        { method: 'Bank Transfer (NEFT/RTGS)', amount: 0, percentage: 100, color: '#4F46E5' },
      ];
    }

    return Object.entries(map).map(([method, amount], idx) => ({
      method,
      amount,
      percentage: Math.round((amount / total) * 100),
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));
  }, [payments]);

  // Plan distribution data
  const planDistributionData = useMemo(() => {
    const map: Record<string, number> = {};
    subscriptions.forEach((s) => {
      map[s.planName] = (map[s.planName] || 0) + 1;
    });

    return Object.entries(map).map(([name, count], idx) => ({
      name,
      count,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));
  }, [subscriptions]);

  return (
    <div className="space-y-6 printable-document">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Financial & Subscription Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time ARR run rate, collections ledger, receivables aging, and customer cohort insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-md p-0.5 text-xs">
            {['7D', '30D', '90D', 'YTD'].map((t) => (
              <button
                key={t}
                onClick={() => setDateFilter(t)}
                className={`px-3 py-1 rounded font-medium ${
                  dateFilter === t ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => window.print()}
          >
            Export Report (A4 PDF)
          </Button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Contracted ARR"
          value={formatINR(totalARR)}
          subtitle={`MRR: ${formatINR(totalMRR)}`}
          icon={<IndianRupee className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Settled Collections"
          value={formatINR(totalPaidRevenue)}
          subtitle={`${payments.length} verified transactions`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Active Subscriptions"
          value={activeSubs.length}
          subtitle={`${closedSubs.length} churned / closed`}
          icon={<BarChart3 className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Outstanding Receivables"
          value={formatINR(totalOutstanding)}
          subtitle="pending customer clearance"
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Channels Breakdown */}
        <Card title="Collections by Payment Instrument" subtitle="Settlement volume breakdown across banking channels">
          <div className="h-64 flex flex-col justify-center">
            {payments.length === 0 ? (
              <p className="text-center text-xs text-slate-400">No payment transactions recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {paymentMethodData.map((item) => (
                  <div key={item.method} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-700 capitalize">{item.method}</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {formatINR(item.amount)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Plan Distribution */}
        <Card title="Subscription Plan Distribution" subtitle="Active client commitments by plan type">
          <div className="h-64">
            {subscriptions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No subscription contracts configured yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planDistributionData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} subscriptions`, 'Count']}
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Receivables Aging Table */}
      <Card title="Accounts Receivable Aging & Reconciliation" subtitle="Open invoices requiring customer collection">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Invoice Total</th>
                <th className="py-2.5 px-3 text-right">Settled Amount</th>
                <th className="py-2.5 px-3 text-right">Outstanding Due</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No invoices recorded in system.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{inv.customerName} ({inv.customerCompany})</td>
                    <td className="py-2.5 px-3 text-slate-600">{inv.dueDate}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900 font-semibold">{formatINR(inv.total)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700">{formatINR(inv.paidAmount)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600 font-bold">
                      {inv.outstandingBalance > 0 ? formatINR(inv.outstandingBalance) : '₹0'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {inv.status}
                      </span>
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
