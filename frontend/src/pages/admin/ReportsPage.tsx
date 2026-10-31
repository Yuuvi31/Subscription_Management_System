import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, Download, Calendar, Filter, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { MOCK_DASHBOARD } from '../../services/mockData';
import { formatINR } from '../../utils/formatters';

const PAYMENT_METHODS_DATA = [
  { method: 'Bank Transfer / Wire', amount: 124500, percentage: 74, color: '#635BDB' },
  { method: 'Corporate Cheque', amount: 28900, percentage: 17, color: '#16845B' },
  { method: 'Credit Card', amount: 15050, percentage: 9, color: '#D69228' },
];

const CHURN_ACQUISITION_DATA = [
  { month: 'Jun', newSubs: 24, closedSubs: 3 },
  { month: 'Jul', newSubs: 31, closedSubs: 4 },
  { month: 'Aug', newSubs: 29, closedSubs: 2 },
  { month: 'Sep', newSubs: 38, closedSubs: 5 },
  { month: 'Oct', newSubs: 45, closedSubs: 4 },
];

export const ReportsPage: React.FC = () => {
  const [dateFilter, setDateFilter] = useState('30D');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Financial & Subscription Analytics
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            ARR/MRR reconciliation, payment methods distribution, churn rates, and aging receivables
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-border rounded-md p-0.5 text-xs">
            {['7D', '30D', '90D', 'YTD'].map((t) => (
              <button
                key={t}
                onClick={() => setDateFilter(t)}
                className={`px-3 py-1 rounded font-medium ${
                  dateFilter === t ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
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
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Lifetime ARR"
          value={formatINR(5874000)}
          subtitle="contracted annual run-rate"
          trend={{ value: '+22.4%', isPositive: true }}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Avg Revenue Per Account"
          value={formatINR(85400)}
          subtitle="monthly recurring blended ARPU"
          trend={{ value: '+8.1%', isPositive: true }}
          icon={<TrendingUp className="w-5 h-5 text-success" />}
        />
        <StatCard
          title="Net Sub Retention Rate"
          value="96.2%"
          subtitle="low voluntary churn"
          icon={<BarChart3 className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Aging Overdue Receivables"
          value={formatINR(148390)}
          subtitle="6 overdue statements"
          trend={{ value: 'Requires audit', isPositive: false }}
          icon={<AlertTriangle className="w-5 h-5 text-danger" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New vs Closed Subscriptions */}
        <Card
          title="Subscriber Growth vs Churn"
          subtitle="Net monthly added subscriptions vs contract expirations"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHURN_ACQUISITION_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" vertical={false} />
                <XAxis dataKey="month" stroke="#737987" fontSize={12} tickLine={false} />
                <YAxis stroke="#737987" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E8EAF0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="newSubs" name="New Subscriptions" fill="#16845B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closedSubs" name="Closed Subscriptions" fill="#D94C4C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Methods Distribution */}
        <Card
          title="Collections by Payment Channel"
          subtitle="Breakdown of settled revenue by clearance route"
        >
          <div className="h-64 w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={PAYMENT_METHODS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="amount"
                  paddingAngle={3}
                >
                  {PAYMENT_METHODS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val || 0)), 'Settled']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E8EAF0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex justify-center gap-6 text-xs mt-2">
              {PAYMENT_METHODS_DATA.map((item) => (
                <div key={item.method} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-text-secondary">{item.method} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
