import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Building, Mail, Phone, MapPin, Shield } from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Account Profile & Organization
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Billing contact details and authorized access credentials
        </p>
      </div>

      <Card title="Organization Information" subtitle="Used on official invoices and quotation documentation">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Contact Name"
              defaultValue={user?.name || 'Marcus Vance'}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Company Legal Entity"
              defaultValue="Apex Logistics Inc."
              leftIcon={<Building className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Billing Email"
              type="email"
              defaultValue={user?.email || 'marcus@apexlogistics.com'}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Phone Number"
              defaultValue="+1 (555) 234-8901"
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Corporate Registered Address"
            defaultValue="100 Industrial Parkway, Chicago, IL 60601"
            leftIcon={<MapPin className="w-4 h-4" />}
          />

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Security & Authentication" subtitle="Managed via Supabase Auth credentials">
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-text-primary">Account Password</p>
            <p className="text-text-secondary mt-0.5">Meets requirements (uppercase, lowercase, symbol, &gt;8 chars)</p>
          </div>
          <Button variant="outline" size="sm">
            Change Password
          </Button>
        </div>
      </Card>
    </div>
  );
};
