import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { SupportTicket, TicketCategory, TicketPriority } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
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
  const { tickets, addTicket, replyTicket } = useData();

  const myTickets = tickets.filter(
    (t) => t.customerName.toLowerCase().includes(user?.name.toLowerCase() || 'yuvraj') || t.customerId === 'cust-01'
  );

  const [selectedTicketId, setSelectedTicketId] = useState<string>(myTickets[0]?.id || '');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  // New Ticket Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('SUBSCRIPTION');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [initialMessage, setInitialMessage] = useState('');

  // Reply message in chat
  const [replyText, setReplyText] = useState('');

  const selectedTicket = myTickets.find((t) => t.id === selectedTicketId) || myTickets[0] || null;

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !initialMessage) return;

    const newTicket = addTicket(
      subject,
      category,
      priority,
      initialMessage,
      user?.name || 'Yuvraj Dutt'
    );

    setSelectedTicketId(newTicket.id);
    setIsNewTicketOpen(false);
    setSubject('');
    setInitialMessage('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    replyTicket(selectedTicket.id, replyText.trim(), user?.name || 'Yuvraj Dutt', 'CUSTOMER');
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customer Support & Inquiries
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect directly with Brightloop Software operations and finance managers for ticket resolutions
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

      {/* Main Ticket Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Ticket List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Your Inquiries ({myTickets.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {myTickets.length === 0 ? (
              <div className="p-6 bg-white border border-slate-200 rounded-lg text-center">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No support tickets found.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setIsNewTicketOpen(true)}
                >
                  Raise First Ticket
                </Button>
              </div>
            ) : (
              myTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] font-bold text-indigo-700">
                      {ticket.ticketNumber}
                    </span>
                    <Badge variant={ticket.status === 'RESOLVED' ? 'PAID' : ticket.status === 'IN_PROGRESS' ? 'ACTIVE' : 'DRAFT'}>
                      {ticket.status}
                    </Badge>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{ticket.subject}</h4>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="capitalize">{ticket.category.toLowerCase()} • {ticket.priority.toLowerCase()}</span>
                    <span>{ticket.updatedAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Ticket Thread */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="h-full flex flex-col justify-between p-0 overflow-hidden">
              {/* Ticket Header */}
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
                </div>

                <div className="text-right text-xs text-slate-500">
                  <span>Priority: </span>
                  <span className="font-semibold text-slate-700 capitalize">{selectedTicket.priority.toLowerCase()}</span>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[420px] bg-slate-50/30 flex-1">
                {selectedTicket.messages.map((m) => {
                  const isMe = m.senderRole === 'CUSTOMER';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
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
                          isMe
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
                  placeholder="Type a message or question for Brightloop support team..."
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
                  Send
                </Button>
              </form>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-12 text-center text-xs text-slate-400 bg-white rounded-lg border border-slate-200">
              Select an inquiry to view replies or raise a new ticket.
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <Modal
          isOpen={isNewTicketOpen}
          onClose={() => setIsNewTicketOpen(false)}
          title="Raise Support Ticket"
          subtitle="Our engineering and operations team will respond promptly"
          maxWidth="md"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
            <Input
              label="Subject / Topic"
              placeholder="e.g. Assistance with Odoo connector or Invoice breakdown"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="SUBSCRIPTION">Subscription / Add-ons</option>
                  <option value="BILLING">Billing & Invoice Query</option>
                  <option value="TECHNICAL">Technical Integration</option>
                  <option value="GENERAL">General Inquiries</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Urgency / Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High (Urgent)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Detailed Message
              </label>
              <textarea
                rows={4}
                placeholder="Explain what assistance or configuration change you require..."
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-md p-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsNewTicketOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Submit Ticket
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
