import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../utils/formatters';

export const CustomerPayments: React.FC = () => {
  const { user } = useAuth();
  const { payments } = useData();

  const myPayments = payments.filter(
    (p) => p.customerName.toLowerCase().includes(user?.name.toLowerCase() || 'yuvraj') || p.customerId === 'cust-01'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Payment History
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete ledger of recorded settlement receipts, bank UTR references, and matched invoices
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Payment Ref</th>
                <th className="py-3 px-4">Matched Invoice</th>
                <th className="py-3 px-4">Settlement Date</th>
                <th className="py-3 px-4">Method / Channel</th>
                <th className="py-3 px-4 text-right">Settled Amount</th>
                <th className="py-3 px-4">Verification Note / UTR</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No payment transactions recorded for your account yet.
                  </td>
                </tr>
              ) : (
                myPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{p.id}</td>
                    <td className="py-3 px-4 font-mono text-indigo-600 font-bold">{p.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{p.paymentDate}</td>
                    <td className="py-3 px-4 font-medium capitalize text-slate-700">{p.method.replace('_', ' ').toLowerCase()}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">+{formatINR(p.amount)}</td>
                    <td className="py-3 px-4 text-slate-500">{p.note || 'Settled'}</td>
                    <td className="py-3 px-4">
                      <Badge variant="CONFIRMED">COMPLETED</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
