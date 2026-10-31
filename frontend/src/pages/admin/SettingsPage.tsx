import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Building2, Shield, Bell, Database, Mail } from 'lucide-react';
import { isDemoMode } from '../../services/supabase';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Platform Configuration & Settings
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Company legal identity, Supabase connection details, and recurring scheduler parameters
        </p>
      </div>

      <Card title="Brightloop Enterprise Identity" subtitle="Official company header printed on recurring invoices">
        <form className="space-y-4 text-xs" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Company Legal Name" defaultValue="Brightloop Software Inc." />
            <Input label="Taxpayer ID / EIN" defaultValue="US-EIN-94819284" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Primary Billing Support Email" defaultValue="billing@brightloop.io" />
            <Input label="Phone Number" defaultValue="+1 (800) 555-LOOP" />
          </div>

          <Input label="Corporate Headquarters Address" defaultValue="100 Enterprise Way, Suite 400, San Francisco, CA 94105" />

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm">
              Save Identity Settings
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Supabase & Backend Connection Status" subtitle="Integration diagnostics">
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-border">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-primary" />
              <div>
                <p className="font-semibold text-text-primary">Operational Mode</p>
                <p className="text-text-secondary text-[11px]">
                  {isDemoMode ? 'VITE_DEMO_MODE=true (Standalone Demo Layer)' : 'VITE_DEMO_MODE=false (Live API Connection)'}
                </p>
              </div>
            </div>
            <span className="font-mono text-[11px] font-bold text-success bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              HEALTHY
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-border">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-text-secondary" />
              <div>
                <p className="font-semibold text-text-primary">Transactional Email Gateway</p>
                <p className="text-text-secondary text-[11px]">Supabase Custom SMTP (Resend Provider)</p>
              </div>
            </div>
            <span className="font-mono text-[11px] text-text-secondary bg-gray-200/70 px-2 py-0.5 rounded">
              CONFIGURED
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
