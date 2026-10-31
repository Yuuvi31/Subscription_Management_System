import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MOCK_SUBSCRIPTIONS } from '../../services/mockData';
import { Calendar, Repeat, ShieldCheck, ArrowRight } from 'lucide-react';

export const CustomerSubscriptions: React.FC = () => {
  const subscriptions = MOCK_SUBSCRIPTIONS.filter(s => s.customerId === 'cust-01');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          My Subscriptions
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Review active software packages, billing cadences, and renewal schedules
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {subscriptions.map((sub) => (
          <Card key={sub.id} className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-text-primary">
                    {sub.subscriptionNumber}
                  </span>
                  <Badge variant={sub.status}>{sub.status}</Badge>
                </div>
                <h3 className="text-base font-bold text-text-primary mt-1">{sub.planName}</h3>
                <p className="text-xs text-text-secondary">Contract cycle: {sub.startDate} to {sub.expiryDate}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xl font-bold text-text-primary">${sub.amount.toFixed(2)}</span>
                <span className="text-xs text-text-muted block">Billed {sub.billingFrequency.toLowerCase()}</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Included Products & Variants
              </h4>
              <div className="space-y-2">
                {sub.lines.map((line) => (
                  <div key={line.id} className="flex items-center justify-between text-xs p-2.5 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium text-text-primary">{line.productName}</span>
                      {line.variantName && (
                        <span className="text-primary text-[11px] ml-2 font-mono">({line.variantName})</span>
                      )}
                    </div>
                    <span className="font-mono text-text-secondary">Qty: {line.quantity} × ${line.unitPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-text-secondary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-muted" /> Next scheduled bill date: <strong className="text-text-primary">{sub.nextBillingDate}</strong>
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Request Upgrade
                </Button>
                {sub.allowPause && (
                  <Button variant="secondary" size="sm">
                    Request Pause
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
