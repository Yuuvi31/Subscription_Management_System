import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MOCK_PAYMENTS } from '../../services/mockData';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export const CustomerPayments: React.FC = () => {
  const payments = MOCK_PAYMENTS.filter(p => p.customerId === 'cust-01');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Payment History
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Complete ledger of recorded settlement receipts and matched invoices
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-border text-text-secondary uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Payment Ref</th>
                <th className="py-3 px-4">Matched Invoice</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Note</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-text-primary">{p.id}</td>
                  <td className="py-3 px-4 font-mono text-primary font-semibold">{p.invoiceNumber}</td>
                  <td className="py-3 px-4 text-text-secondary">{p.paymentDate}</td>
                  <td className="py-3 px-4 font-medium capitalize">{p.method.replace('_', ' ').toLowerCase()}</td>
                  <td className="py-3 px-4 font-bold text-success">+${p.amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-text-muted">{p.note}</td>
                  <td className="py-3 px-4">
                    <Badge variant="paid">{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
