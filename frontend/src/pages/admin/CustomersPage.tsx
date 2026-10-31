import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Users, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../utils/formatters';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { customers, addCustomer, deleteCustomer } = useData();

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
    status: 'ACTIVE' as const,
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

    addCustomer({
      name: newCustomer.name,
      email: newCustomer.email,
      company: newCustomer.company,
      phone: newCustomer.phone || '+91 98765 00000',
      address: newCustomer.address || 'Corporate Headquarters',
      status: 'ACTIVE',
    });

    setIsAddModalOpen(false);
    setNewCustomer({ name: '', email: '', company: '', phone: '', address: '', status: 'ACTIVE' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customer Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of client organizations, billing profiles, and contract commitments.
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, company, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Accounts</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customers Data Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Company Legal Entity</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Subscriptions</th>
                <th className="py-3 px-4 text-right">Outstanding Dues</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-medium text-slate-700">No customer records found.</p>
                    <p className="text-[11px] text-slate-400">Click "Add Customer" to create your genuine business client.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {c.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{c.company}</td>
                    <td className="py-3.5 px-4 text-slate-500">{c.email}</td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="font-semibold text-slate-900">{c.activeSubscriptions}</span>
                      <span className="text-slate-400"> / {c.totalSubscriptions}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span
                        className={
                          c.outstandingAmount > 0
                            ? 'font-bold text-red-600'
                            : 'text-slate-600'
                        }
                      >
                        {formatINR(c.outstandingAmount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={c.status}>{c.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{c.createdAt}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => navigate(`/admin/customers/${c.id}`)}
                        >
                          Details
                        </Button>
                        <button
                          onClick={() => deleteCustomer(c.id)}
                          title="Delete customer"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
        title="Create Customer Account"
        subtitle="Record legal billing profile for quotations and invoices"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <Input
            label="Primary Contact Name"
            placeholder="e.g. Yuvraj Dutt"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            required
          />
          <Input
            label="Company Legal Entity"
            placeholder="e.g. Apex Technologies Private Limited"
            value={newCustomer.company}
            onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
            required
          />
          <Input
            label="Billing Email Address"
            type="email"
            placeholder="e.g. yuvraj.dutt@enterprise.in"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            required
          />
          <Input
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
          />
          <Input
            label="Registered Office Address"
            placeholder="Tower B, Sector 24, Cyber City, Gurugram, India"
            value={newCustomer.address}
            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
