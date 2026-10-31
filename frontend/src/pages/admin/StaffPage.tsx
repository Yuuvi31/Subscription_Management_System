import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Mail, Shield, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'STAFF';
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-01',
    name: 'Alex Rivera',
    email: 'alex.staff@brightloop.io',
    role: 'STAFF',
    department: 'Sales & Customer Success',
    status: 'ACTIVE',
    createdAt: '2026-01-10',
  },
  {
    id: 'staff-02',
    name: 'Jordan Lee',
    email: 'jordan.billing@brightloop.io',
    role: 'STAFF',
    department: 'Billing & AR Operations',
    status: 'ACTIVE',
    createdAt: '2026-02-14',
  },
];

export const StaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Sales & Customer Success',
  });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: 'STAFF',
      department: formData.department,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setStaffList([...staffList, newStaff]);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', department: 'Sales & Customer Success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Internal Staff Accounts
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Admin-only management of operational staff with scoped permissions
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Staff Member
        </Button>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3 text-xs text-text-primary">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-primary">Role-Based Access Control Notice:</span>
          <p className="text-text-secondary mt-0.5">
            Staff members can manage customer records, issue quotations, manage subscriptions, and record payments, but cannot configure global tax brackets, discount rules, or alter internal credentials.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Email Address</th>
              <th className="py-3 px-4">Department / Team</th>
              <th className="py-3 px-4">Role Scope</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Added Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staffList.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-text-primary flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {member.name[0]}
                  </div>
                  <span>{member.name}</span>
                </td>
                <td className="py-3.5 px-4 text-text-secondary">{member.email}</td>
                <td className="py-3.5 px-4 text-text-secondary">{member.department}</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded">
                    <Shield className="w-3 h-3" /> STAFF
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant={member.status}>{member.status}</Badge>
                </td>
                <td className="py-3.5 px-4 text-text-muted font-mono">{member.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision New Staff Account"
        subtitle="Staff will be invited to access operational portals"
      >
        <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
          <Input
            label="Staff Full Name"
            placeholder="e.g. Alex Rivera"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Corporate Email"
            type="email"
            placeholder="e.g. alex.staff@brightloop.io"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">
              Assigned Department
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full rounded-md border border-border text-xs text-text-primary bg-white py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Sales & Customer Success">Sales & Customer Success</option>
              <option value="Billing & AR Operations">Billing & AR Operations</option>
              <option value="Technical Support">Technical Support</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Provision Staff Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
