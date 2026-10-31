import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Repeat, Receipt, Plus, ArrowRight } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MOCK_CUSTOMERS, MOCK_SUBSCRIPTIONS, MOCK_INVOICES } from '../../services/mockData';
import { formatINR } from '../../utils/formatters';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Staff Operations Dashboard
          </h1>
          <p className="text-xs text-text-secondary mt-1">
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
          value={MOCK_CUSTOMERS.length}
          subtitle="verified client records"
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Active Subscriptions"
          value={MOCK_SUBSCRIPTIONS.filter(s => s.status === 'ACTIVE').length}
          subtitle="live recurring contracts"
          icon={<Repeat className="w-5 h-5 text-success" />}
        />
        <StatCard
          title="Open Quotations"
          value="2"
          subtitle="pending customer sign-off"
          icon={<FileText className="w-5 h-5 text-warning" />}
        />
        <StatCard
          title="Pending Invoices"
          value={MOCK_INVOICES.filter(i => i.status !== 'PAID').length}
          subtitle="ready for payment recording"
          icon={<Receipt className="w-5 h-5 text-danger" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Recent Customer Accounts"
          subtitle="Active directory of managed client tenants"
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
          <div className="divide-y divide-border -mx-5 -mb-5">
            {MOCK_CUSTOMERS.slice(0, 3).map((cust) => (
              <div key={cust.id} className="p-4 px-5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-text-primary">{cust.name}</h4>
                  <p className="text-xs text-text-secondary">{cust.company} • {cust.email}</p>
                </div>
                <div className="text-right">
                  <Badge variant={cust.status}>{cust.status}</Badge>
                  <p className="text-[11px] text-text-muted mt-1">{cust.activeSubscriptions} active subs</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Active Invoices"
          subtitle="Invoices pending payment registration"
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
          <div className="divide-y divide-border -mx-5 -mb-5">
            {MOCK_INVOICES.map((inv) => (
              <div key={inv.id} className="p-4 px-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary font-mono">{inv.invoiceNumber}</span>
                    <Badge variant={inv.status}>{inv.status}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{inv.customerCompany}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-text-primary block font-mono">{formatINR(inv.total)}</span>
                  <span className="text-[11px] text-text-muted">Due {inv.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
