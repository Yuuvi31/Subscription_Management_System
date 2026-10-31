import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MOCK_TICKETS } from '../../services/mockData';
import { SupportTicket, TicketCategory, TicketPriority, TicketMessage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  LifeBuoy,
  Plus,
  Send,
  MessageSquare,
  Clock,
  Shield,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const CustomerTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(tickets[0]);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  // New Ticket Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('SUBSCRIPTION');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [initialMessage, setInitialMessage] = useState('');

  // Reply message in chat
  const [replyText, setReplyText] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !initialMessage) return;

    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-2026-00${tickets.length + 95}`,
      customerId: 'cust-01',
      customerName: user?.name || 'Yuvraj Dutt',
      subject,
      category,
      priority,
      status: 'OPEN',
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: user?.name || 'Yuvraj Dutt',
          senderRole: 'CUSTOMER',
          message: initialMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setTickets([newTicket, ...tickets]);
    setSelectedTicket(newTicket);
    setIsNewTicketOpen(false);
    setSubject('');
    setInitialMessage('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      senderName: user?.name || 'Yuvraj Dutt',
      senderRole: 'CUSTOMER',
      message: replyText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMsg],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updated : t)));
    setSelectedTicket(updated);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Direct Support & Help Desk
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Talk directly with Brightloop internal staff and system administrators
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsNewTicketOpen(true)}
        >
          Raise New Ticket
        </Button>
      </div>

      {/* Main Split Interface: Tickets list on left, Active conversation thread on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List (Left 5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
            Your Active Support Inquiries ({tickets.length})
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

                <h4 className="text-xs font-bold text-text-primary mt-1.5 line-clamp-1">
                  {ticket.subject}
                </h4>

                <p className="text-[11px] text-text-secondary mt-1 line-clamp-2">
                  {ticket.messages[ticket.messages.length - 1]?.message}
                </p>

                <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {ticket.updatedAt}
                  </span>
                  <span>{ticket.messages.length} message(s)</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversation Thread (Right 7 cols) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <Card className="flex flex-col h-[600px] p-0 overflow-hidden">
              {/* Thread Header */}
              <div className="p-4 border-b border-border bg-[#FBFBFC] flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {selectedTicket.ticketNumber}
                    </span>
                    <Badge variant={selectedTicket.status === 'RESOLVED' ? 'paid' : 'confirmed'}>
                      {selectedTicket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary mt-1">{selectedTicket.subject}</h3>
                </div>

                <div className="text-right text-[11px] text-text-muted">
                  <span className="block font-semibold uppercase text-[10px]">Priority: {selectedTicket.priority}</span>
                  <span>Category: {selectedTicket.category}</span>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4 bg-background/50">
                {selectedTicket.messages.map((m) => {
                  const isMe = m.senderRole === 'CUSTOMER';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px]">
                        <span className="font-semibold text-text-primary">{m.senderName}</span>
                        {!isMe && (
                          <span className="text-[10px] font-bold text-primary bg-primary-light px-1.5 py-0.2 rounded font-mono">
                            {m.senderRole}
                          </span>
                        )}
                        <span className="text-text-muted text-[10px]">{m.timestamp}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-xl text-xs max-w-md shadow-subtle ${
                          isMe
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

              {/* Send Reply Input */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-border bg-white flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Type your message to staff or admin..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 text-xs border border-border rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <Button type="submit" variant="primary" size="md" leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Send
                </Button>
              </form>
            </Card>
          ) : (
            <div className="h-64 flex items-center justify-center border border-border border-dashed rounded-lg text-text-muted text-xs">
              Select a ticket to view the conversation.
            </div>
          )}
        </div>
      </div>

      {/* Raise New Ticket Modal */}
      {isNewTicketOpen && (
        <Modal
          isOpen={isNewTicketOpen}
          onClose={() => setIsNewTicketOpen(false)}
          title="Raise Support Ticket"
          subtitle="Your message will be delivered immediately to Brightloop staff and administrators"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
            <Input
              label="Subject / Topic"
              placeholder="e.g. Request to upgrade Odoo connector or GST invoice inquiry"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full text-xs border border-border rounded-md p-2 bg-white"
                >
                  <option value="SUBSCRIPTION">Subscription / Add-ons</option>
                  <option value="BILLING">Billing & Invoices</option>
                  <option value="TECHNICAL">Technical / API Integration</option>
                  <option value="GENERAL">General Inquiries</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full text-xs border border-border rounded-md p-2 bg-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High (Urgent)</option>
                  <option value="URGENT">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">
                Describe your issue or request
              </label>
              <textarea
                rows={4}
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder="Explain the assistance required. Staff and admin will review and respond directly..."
                className="w-full text-xs border border-border rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewTicketOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Ticket
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
