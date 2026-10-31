import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SupportTicket, TicketStatus } from '../../types';
import { LifeBuoy, Send, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';

export const SupportTicketsPage: React.FC = () => {
  const { user, role } = useAuth();
  const { tickets, replyTicket, updateTicketStatus } = useData();
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const senderName = user?.name || (role === 'ADMIN' ? 'Admin (Brightloop)' : 'Staff Support (x182)');
    replyTicket(selectedTicket.id, replyText.trim(), senderName, role);
    setReplyText('');
  };

  const handleUpdateStatus = (newStatus: TicketStatus) => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customer Support Tickets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Resolve customer inquiries, coordinate add-on upgrades, and answer billing queries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            All Tickets ({tickets.length})
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {tickets.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-400 bg-white rounded-lg border border-slate-200">
                No support tickets found.
              </p>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedTicket?.id === t.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] font-bold text-indigo-700">{t.ticketNumber}</span>
                    <Badge variant={t.status === 'RESOLVED' ? 'PAID' : t.status === 'IN_PROGRESS' ? 'ACTIVE' : 'DRAFT'}>
                      {t.status}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t.customerName} ({t.customerCompany})
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="capitalize">{t.category.toLowerCase()} • {t.priority.toLowerCase()}</span>
                    <span>{t.updatedAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="h-full flex flex-col justify-between p-0 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700">{selectedTicket.ticketNumber}</span>
                    <Badge variant={selectedTicket.status === 'RESOLVED' ? 'PAID' : 'ACTIVE'}>
                      {selectedTicket.status}
                    </Badge>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs text-slate-600 font-medium">Category: {selectedTicket.category}</span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 mt-1">{selectedTicket.subject}</h2>
                  <p className="text-xs text-slate-500">
                    Raised by <strong>{selectedTicket.customerName}</strong> ({selectedTicket.customerCompany})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedTicket.status !== 'RESOLVED' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      onClick={() => handleUpdateStatus('RESOLVED')}
                    >
                      Mark Resolved
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    >
                      Reopen Ticket
                    </Button>
                  )}
                </div>
              </div>

              {/* Message History */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[420px] bg-slate-50/30 flex-1">
                {selectedTicket.messages.map((m) => {
                  const isStaffOrAdmin = m.senderRole === 'ADMIN' || m.senderRole === 'STAFF';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isStaffOrAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-900">{m.senderName}</span>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                          {m.senderRole}
                        </span>
                        <span>• {m.timestamp}</span>
                      </div>
                      <div
                        className={`p-3 rounded-lg max-w-lg text-xs leading-relaxed ${
                          isStaffOrAdmin
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Type an official response or instructions for customer..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-md px-3 py-2 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                />
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                  disabled={!replyText.trim()}
                >
                  Reply
                </Button>
              </form>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-12 text-center text-xs text-slate-400 bg-white rounded-lg border border-slate-200">
              Select a ticket to review conversation thread.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
