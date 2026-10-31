import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Repeat, Receipt, Plus, ArrowRight, LifeBuoy } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../utils/formatters';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { customers, subscriptions, quotations, invoices, tickets } = useData();

  const openTickets = tickets.filter((t) => t.status !== 'RESOLVED');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Staff Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Operational workspace for customer account servicing, quotation issuing, and invoice tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            leftIcon={<Users className="w-4 h-4" />}
            onClick={() => navigate('/staff/customers')}
          >
            New Customer
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/staff/quotations/new')}
          >
            Create Quotation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Accounts"
          value={customers.length}
          subtitle="registered client entities"
          icon={<Users className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Active Subscriptions"
          value={subscriptions.filter((s) => s.status === 'ACTIVE').length}
          subtitle="live recurring contracts"
          icon={<Repeat className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Open Quotations"
          value={quotations.filter((q) => q.status === 'DRAFT' || q.status === 'SENT').length}
          subtitle="pending customer sign-off"
          icon={<FileText className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Open Support Tickets"
          value={openTickets.length}
          subtitle="customer inquiries awaiting response"
          icon={<LifeBuoy className="w-5 h-5 text-indigo-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Recent Customer Accounts"
          subtitle="Active directory of managed client accounts"
          action={
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/staff/customers')}
            >
              All Customers
            </Button>
          }
        >
          <div className="divide-y divide-slate-100 -mx-5 -mb-5">
            {customers.length === 0 ? (
              <p className="p-5 text-center text-xs text-slate-400">No customers registered yet.</p>
            ) : (
              customers.slice(0, 4).map((cust) => (
                <div key={cust.id} className="p-4 px-5 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{cust.name}</h4>
                    <p className="text-xs text-slate-500">{cust.company} • {cust.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={cust.status}>{cust.status}</Badge>
                    <p className="text-[11px] text-slate-400 mt-1">{cust.activeSubscriptions} active subs</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card
          title="Actionable Overdue Invoices"
          subtitle="Open bills pending follow-up with accounts team"
          action={
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/staff/invoices')}
            >
              All Invoices
            </Button>
          }
        >
          <div className="divide-y divide-slate-100 -mx-5 -mb-5">
            {invoices.filter((i) => i.status !== 'PAID').length === 0 ? (
              <p className="p-5 text-center text-xs text-slate-400">All invoices are settled.</p>
            ) : (
              invoices
                .filter((i) => i.status !== 'PAID')
                .slice(0, 4)
                .map((inv) => (
                  <div key={inv.id} className="p-4 px-5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{inv.invoiceNumber}</span>
                        <Badge variant={inv.status}>{inv.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{inv.customerCompany} • Due {inv.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-rose-600 block">
                        {formatINR(inv.outstandingBalance)}
                      </span>
                      <span className="text-[10px] text-slate-400">Total {formatINR(inv.total)}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
