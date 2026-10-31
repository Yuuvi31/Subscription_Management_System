import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MOCK_TICKETS } from '../../services/mockData';
import { SupportTicket, TicketMessage, TicketStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LifeBuoy, Send, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';

export const SupportTicketsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(tickets[0]);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      senderName: user?.name || (role === 'ADMIN' ? 'Admin' : 'Staff Member'),
      senderRole: role,
      message: replyText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = {
      ...selectedTicket,
      status: 'IN_PROGRESS' as TicketStatus,
      messages: [...selectedTicket.messages, newMsg],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updated : t)));
    setSelectedTicket(updated);
    setReplyText('');
  };

  const handleUpdateStatus = (newStatus: TicketStatus) => {
    if (!selectedTicket) return;
    const updated = {
      ...selectedTicket,
      status: newStatus,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updated : t)));
    setSelectedTicket(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Customer Support Tickets
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Resolve customer inquiries, coordinate add-on upgrades, and answer billing queries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
            Customer Inquiries Queue ({tickets.length})
          </span>

          {tickets.map((ticket) => {
            const isSelected = selectedTicket?.id === ticket.id;
            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary-light/30 shadow-subtle ring-1 ring-primary'
                    : 'border-border bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-text-primary">
                    {ticket.ticketNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-text-secondary">
                      {ticket.category}
                    </span>
                    <Badge variant={ticket.status === 'RESOLVED' ? 'paid' : ticket.status === 'IN_PROGRESS' ? 'confirmed' : 'draft'}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="mt-1">
                  <span className="text-xs font-semibold text-primary">{ticket.customerName}</span>
                  <h4 className="text-xs font-bold text-text-primary mt-0.5 line-clamp-1">{ticket.subject}</h4>
                </div>

                <p className="text-[11px] text-text-secondary mt-1 line-clamp-2">
                  {ticket.messages[ticket.messages.length - 1]?.message}
                </p>

                <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {ticket.updatedAt}
                  </span>
                  <span className="font-semibold text-danger">Priority: {ticket.priority}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversation Thread */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <Card className="flex flex-col h-[600px] p-0 overflow-hidden">
              <div className="p-4 border-b border-border bg-[#FBFBFC] flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="text-xs font-semibold text-text-primary">
                      Customer: {selectedTicket.customerName}
                    </span>
                    <Badge variant={selectedTicket.status === 'RESOLVED' ? 'paid' : 'confirmed'}>
                      {selectedTicket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary mt-1">{selectedTicket.subject}</h3>
                </div>

                {/* Status Update Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value as TicketStatus)}
                    className="text-xs border border-border rounded px-2.5 py-1 bg-white font-medium"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4 bg-background/50">
                {selectedTicket.messages.map((m) => {
                  const isStaffOrAdmin = m.senderRole === 'ADMIN' || m.senderRole === 'STAFF';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isStaffOrAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px]">
                        <span className="font-semibold text-text-primary">{m.senderName}</span>
                        <span className="text-[10px] font-bold text-primary bg-primary-light px-1.5 py-0.2 rounded font-mono">
                          {m.senderRole}
                        </span>
                        <span className="text-text-muted text-[10px]">{m.timestamp}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-xl text-xs max-w-md shadow-subtle ${
                          isStaffOrAdmin
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white border border-border text-text-primary rounded-bl-none'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-border bg-white flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  placeholder={`Reply as ${role}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 text-xs border border-border rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <Button type="submit" variant="primary" size="md" leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Reply to Customer
                </Button>
              </form>
            </Card>
          ) : (
            <div className="h-64 flex items-center justify-center border border-border border-dashed rounded-lg text-text-muted text-xs">
              Select a customer ticket to respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
