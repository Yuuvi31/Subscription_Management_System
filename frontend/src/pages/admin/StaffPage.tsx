import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  Search,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────
interface StaffMember {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

const STAFF_STORAGE_KEY = 'loopbill_staff_accounts';
const STAFF_LIST_KEY = 'loopbill_staff_list';

const DEPARTMENTS = [
  'Sales & Customer Success',
  'Billing & AR Operations',
  'Technical Support',
  'Operations',
  'Finance',
];

// ────────────────────────────────────────────────────────────────────
// Persistence helpers
// ────────────────────────────────────────────────────────────────────
function loadStaffList(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STAFF_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStaffList(list: StaffMember[]) {
  localStorage.setItem(STAFF_LIST_KEY, JSON.stringify(list));
  // Also mirror to the auth lookup key
  const authAccounts = list.map((s) => ({
    id: s.id,
    username: s.username,
    password: s.password,
    name: s.name,
    email: s.email,
  }));
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(authAccounts));
}

// ────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────
export const StaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<StaffMember | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    department: DEPARTMENTS[0],
  });

  // Load from localStorage on mount
  useEffect(() => {
    setStaffList(loadStaffList());
  }, []);

  const persist = (updated: StaffMember[]) => {
    setStaffList(updated);
    saveStaffList(updated);
  };

  // ── Filtered list ──────────────────────────────────────────────
  const filtered = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  // ── Validation ─────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!form.name.trim()) { setFormError('Full name is required.'); return false; }
    if (!form.username.trim()) { setFormError('Username is required.'); return false; }
    if (form.username.includes(' ')) { setFormError('Username must not contain spaces.'); return false; }
    if (!form.email.trim() || !form.email.includes('@')) { setFormError('A valid email address is required.'); return false; }
    if (!form.password || form.password.length < 4) { setFormError('Password must be at least 4 characters.'); return false; }

    const conflict = staffList.find(
      (s) => s.username.toLowerCase() === form.username.toLowerCase() || s.email.toLowerCase() === form.email.toLowerCase()
    );
    if (conflict) { setFormError('A staff member with this username or email already exists.'); return false; }

    setFormError('');
    return true;
  };

  // ── Add ─────────────────────────────────────────────────────────
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: form.name.trim(),
      username: form.username.trim().toLowerCase(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      department: form.department,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };

    persist([...staffList, newMember]);
    setIsAddOpen(false);
    setForm({ name: '', username: '', email: '', password: '', department: DEPARTMENTS[0] });
    setFormError('');
    setShowPassword(false);
  };

  // ── Remove ───────────────────────────────────────────────────────
  const handleRemove = () => {
    if (!removeTarget) return;
    persist(staffList.filter((s) => s.id !== removeTarget.id));
    setRemoveTarget(null);
  };

  // ── Toggle status ────────────────────────────────────────────────
  const toggleStatus = (id: string) => {
    const updated = staffList.map((s) =>
      s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' as const : 'ACTIVE' as const } : s
    );
    persist(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Staff Accounts
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage operational staff members and their login credentials
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => { setIsAddOpen(true); setFormError(''); }}
        >
          Add Staff Member
        </Button>
      </div>

      {/* RBAC notice */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3 text-xs text-text-primary">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-primary">Role-Based Access Control:</span>
          <p className="text-text-secondary mt-0.5">
            Staff members can manage customers, issue quotations, handle subscriptions, and record payments.
            They cannot modify global tax or discount rules, or alter admin credentials.
          </p>
        </div>
      </div>

      {/* Search + count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <span className="text-xs text-text-muted">
          {filtered.length} of {staffList.length} staff
        </span>
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <UserX className="w-8 h-8 text-text-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-text-primary">No staff members found</p>
            <p className="text-xs text-text-secondary mt-1">
              {staffList.length === 0
                ? 'Add your first staff member using the button above.'
                : 'Try adjusting your search.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary uppercase font-semibold text-[11px] tracking-wide">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Added</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {member.name[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-text-primary">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-text-secondary">{member.username}</td>
                  <td className="py-3.5 px-4 text-text-secondary">{member.email}</td>
                  <td className="py-3.5 px-4 text-text-secondary">{member.department}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded">
                      <Shield className="w-3 h-3" /> STAFF
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleStatus(member.id)}
                      className="focus:outline-none"
                      title="Click to toggle status"
                    >
                      <Badge variant={member.status}>{member.status}</Badge>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-text-muted font-mono">{member.createdAt}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setRemoveTarget(member)}
                      className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-red-50 transition-colors"
                      title="Remove staff member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* ── Add Staff Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); setFormError(''); setShowPassword(false); }}
        title="Add Staff Member"
        subtitle="Provision a new staff account with login credentials"
      >
        <form onSubmit={handleAdd} className="space-y-4 text-xs">
          {formError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-danger text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="e.g. Priya Sharma"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Username"
              placeholder="e.g. priya182"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="priya@brightloop.io"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Set a login password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">
              Department
            </label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full rounded-md border border-border text-xs text-text-primary bg-white py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setIsAddOpen(false); setFormError(''); setShowPassword(false); }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Add Staff Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Remove Confirm Modal ────────────────────────────────────── */}
      <Modal
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title="Remove Staff Member"
        subtitle="This action cannot be undone"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-text-primary">
                Remove <span className="text-danger">{removeTarget?.name}</span>?
              </p>
              <p className="text-text-secondary mt-1">
                This will permanently delete their staff account and revoke login access.
                Username <span className="font-mono font-semibold">{removeTarget?.username}</span> will no longer be able to sign in.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRemoveTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleRemove}
            >
              Remove Staff Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
