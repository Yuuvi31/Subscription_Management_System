import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Building, Mail, Phone, Eye, Filter, ArrowUpDown } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MOCK_CUSTOMERS } from '../../services/mockData';
import { Customer } from '../../types';
import { formatINR } from '../../utils/formatters';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.email || !newCustomer.company) return;

    const created: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustomer.name,
      email: newCustomer.email,
      company: newCustomer.company,
      phone: newCustomer.phone || '+1 (555) 000-0000',
      address: newCustomer.address || 'Enterprise HQ',
      status: 'ACTIVE',
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      outstandingAmount: 0.00,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCustomers([created, ...customers]);
    setIsAddModalOpen(false);
    setNewCustomer({ name: '', email: '', company: '', phone: '', address: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Customer Directory
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Accounts, corporate billing profiles, active subscriptions and outstanding balances
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Customer
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, company, email..."
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
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customers Data Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Subscriptions</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-muted">
                    No customers match the current search or filter.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-text-primary">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{c.company}</td>
                    <td className="py-3 px-4 text-text-secondary">{c.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-text-primary">{c.activeSubscriptions}</span>
                      <span className="text-text-muted"> / {c.totalSubscriptions}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={
                          c.outstandingAmount > 0
                            ? 'font-bold text-danger font-mono'
                            : 'text-text-secondary font-mono'
                        }
                      >
                        {formatINR(c.outstandingAmount)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={c.status}>{c.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-text-muted font-mono">{c.createdAt}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/admin/customers/${c.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
        subtitle="Create a new client profile for subscriptions and invoices"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <Input
            label="Contact Full Name"
            placeholder="e.g. Marcus Vance"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            required
          />
          <Input
            label="Company Name"
            placeholder="e.g. Apex Logistics Inc."
            value={newCustomer.company}
            onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. billing@apexlogistics.com"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            required
          />
          <Input
            label="Phone Number"
            placeholder="+1 (555) 234-8901"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
          />
          <Input
            label="Office / Billing Address"
            placeholder="100 Industrial Parkway, Chicago, IL"
            value={newCustomer.address}
            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
