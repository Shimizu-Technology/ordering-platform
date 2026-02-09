import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building2,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Send,
  MessageSquare,
  RefreshCw,
  Filter,
  X,
} from 'lucide-react';
import { adminApi } from '../../api/adminClient';
import type { CateringInquiry, CateringStatus } from '../../types/admin';

type TabId = 'active' | 'all';

const STATUS_CONFIG: Record<CateringStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  quoted: { label: 'Quoted', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  accepted: { label: 'Accepted', color: 'text-green-700', bgColor: 'bg-green-100' },
  declined: { label: 'Declined', color: 'text-red-700', bgColor: 'bg-red-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export function CateringInbox() {
  const [inquiries, setInquiries] = useState<CateringInquiry[]>([]);
  const [counts, setCounts] = useState({ pending: 0, quoted: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('active');
  const [statusFilter, setStatusFilter] = useState<CateringStatus | ''>('');
  const [selectedInquiry, setSelectedInquiry] = useState<CateringInquiry | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const params: { status?: string; all?: boolean } = {};
      if (activeTab === 'all') params.all = true;
      if (statusFilter) params.status = statusFilter;
      
      const data = await adminApi.getCateringInquiries(params);
      setInquiries(data.inquiries);
      setCounts(data.counts);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleSelectInquiry = async (inquiry: CateringInquiry) => {
    try {
      setDetailLoading(true);
      const fullInquiry = await adminApi.getCateringInquiry(inquiry.id);
      setSelectedInquiry(fullInquiry);
    } catch (error) {
      console.error('Failed to fetch inquiry details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Inquiry List */}
      <div className="w-96 border-r border-border-default flex flex-col bg-surface-card">
        {/* Header */}
        <div className="p-4 border-b border-border-default">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-text-primary">Catering Inquiries</h1>
            <button
              onClick={fetchInquiries}
              className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-text-secondary ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-amber-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-amber-700">{counts.pending}</p>
              <p className="text-xs text-amber-600">Pending</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-blue-700">{counts.quoted}</p>
              <p className="text-xs text-blue-600">Quoted</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-green-700">{counts.upcoming}</p>
              <p className="text-xs text-green-600">Upcoming</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-brand text-white'
                  : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-brand text-white'
                  : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
              }`}
            >
              All
            </button>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CateringStatus | '')}
              className="w-full pl-9 pr-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-sm appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="quoted">Quoted</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Inquiry List */}
        <div className="flex-1 overflow-y-auto">
          {loading && inquiries.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-text-muted">
              <Users className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No inquiries found</p>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {inquiries.map((inquiry) => (
                <button
                  key={inquiry.id}
                  onClick={() => handleSelectInquiry(inquiry)}
                  className={`w-full p-4 text-left hover:bg-surface-elevated transition-colors ${
                    selectedInquiry?.id === inquiry.id ? 'bg-brand-light' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-text-primary truncate">
                          {inquiry.contact_name}
                        </h3>
                        {inquiry.urgent && (
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      {inquiry.company_name && (
                        <p className="text-xs text-text-muted truncate">{inquiry.company_name}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CONFIG[inquiry.status].bgColor} ${STATUS_CONFIG[inquiry.status].color}`}>
                      {STATUS_CONFIG[inquiry.status].label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-text-secondary mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(inquiry.event_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {inquiry.guest_count}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-surface-elevated px-2 py-0.5 rounded text-text-secondary">
                      {inquiry.event_type}
                    </span>
                    {inquiry.days_until_event <= 7 && inquiry.days_until_event >= 0 && (
                      <span className="text-xs text-amber-600 font-medium">
                        {inquiry.days_until_event === 0 ? 'Today!' : `${inquiry.days_until_event}d away`}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Inquiry Detail */}
      <div className="flex-1 bg-surface overflow-y-auto">
        <AnimatePresence mode="wait">
          {detailLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : selectedInquiry ? (
            <InquiryDetail
              key={selectedInquiry.id}
              inquiry={selectedInquiry}
              onUpdate={(updated) => {
                setSelectedInquiry(updated);
                fetchInquiries();
              }}
              onClose={() => setSelectedInquiry(null)}
            />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-text-muted"
            >
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">Select an inquiry</p>
              <p className="text-sm">Click on an inquiry to view details</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// Inquiry Detail Component
// ============================================================================

interface InquiryDetailProps {
  inquiry: CateringInquiry;
  onUpdate: (inquiry: CateringInquiry) => void;
  onClose: () => void;
}

function InquiryDetail({ inquiry, onUpdate, onClose }: InquiryDetailProps) {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: CateringStatus) => {
    try {
      setUpdating(true);
      const updated = await adminApi.updateCateringInquiry(inquiry.id, { status: newStatus });
      onUpdate(updated);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-border-default bg-surface-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-semibold text-text-primary">{inquiry.contact_name}</h2>
              <span className={`text-sm px-3 py-1 rounded-full ${STATUS_CONFIG[inquiry.status].bgColor} ${STATUS_CONFIG[inquiry.status].color}`}>
                {STATUS_CONFIG[inquiry.status].label}
              </span>
              {inquiry.urgent && (
                <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  Urgent
                </span>
              )}
            </div>
            {inquiry.company_name && (
              <p className="text-text-secondary flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {inquiry.company_name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          {inquiry.status === 'pending' && (
            <button
              onClick={() => setShowQuoteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors"
            >
              <Send className="w-4 h-4" />
              Send Quote
            </button>
          )}
          {inquiry.status === 'quoted' && (
            <>
              <button
                onClick={() => handleStatusChange('accepted')}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Accepted
              </button>
              <button
                onClick={() => handleStatusChange('declined')}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Mark Declined
              </button>
            </>
          )}
          {(inquiry.status === 'pending' || inquiry.status === 'quoted') && (
            <button
              onClick={() => handleStatusChange('cancelled')}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Event Details */}
          <div className="bg-surface-card rounded-xl p-5 border border-border-subtle">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand" />
              Event Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Event Type</p>
                <p className="text-text-primary font-medium">{inquiry.event_type}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Date</p>
                <p className="text-text-primary font-medium">{formatEventDate(inquiry.event_date)}</p>
                {inquiry.days_until_event >= 0 && (
                  <p className="text-xs text-amber-600">
                    {inquiry.days_until_event === 0 ? 'Today!' : `${inquiry.days_until_event} days away`}
                  </p>
                )}
              </div>
              {inquiry.event_time && (
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Time</p>
                  <p className="text-text-primary">{inquiry.event_time}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Guests</p>
                <p className="text-text-primary font-medium">{inquiry.guest_count} people</p>
              </div>
              {inquiry.budget_range && (
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Budget</p>
                  <p className="text-text-primary">{inquiry.budget_range}</p>
                </div>
              )}
              {inquiry.venue_address && (
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Venue</p>
                  <p className="text-text-primary">{inquiry.venue_address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-surface-card rounded-xl p-5 border border-border-subtle">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Name</p>
                <p className="text-text-primary font-medium">{inquiry.contact_name}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Email</p>
                <a href={`mailto:${inquiry.contact_email}`} className="text-brand hover:underline flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {inquiry.contact_email}
                </a>
              </div>
              {inquiry.contact_phone && (
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Phone</p>
                  <a href={`tel:${inquiry.contact_phone}`} className="text-brand hover:underline flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {inquiry.contact_phone}
                  </a>
                </div>
              )}
              {inquiry.company_name && (
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Company</p>
                  <p className="text-text-primary flex items-center gap-1">
                    <Building2 className="w-4 h-4 text-text-muted" />
                    {inquiry.company_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Menu & Requests */}
          {(inquiry.menu_preferences || inquiry.special_requests || inquiry.dietary_restrictions) && (
            <div className="bg-surface-card rounded-xl p-5 border border-border-subtle md:col-span-2">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand" />
                Menu & Special Requests
              </h3>
              <div className="space-y-4">
                {inquiry.menu_preferences && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Menu Preferences</p>
                    <p className="text-text-primary whitespace-pre-wrap">{inquiry.menu_preferences}</p>
                  </div>
                )}
                {inquiry.special_requests && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Special Requests</p>
                    <p className="text-text-primary whitespace-pre-wrap">{inquiry.special_requests}</p>
                  </div>
                )}
                {inquiry.dietary_restrictions && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Dietary Restrictions</p>
                    <p className="text-text-primary whitespace-pre-wrap">{inquiry.dietary_restrictions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quote & Admin Notes */}
          {(inquiry.quoted_amount || inquiry.admin_notes) && (
            <div className="bg-surface-card rounded-xl p-5 border border-border-subtle md:col-span-2">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand" />
                Quote & Notes
              </h3>
              <div className="space-y-4">
                {inquiry.quoted_amount && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Quoted Amount</p>
                    <p className="text-2xl font-bold text-green-600">${inquiry.quoted_amount.toFixed(2)}</p>
                    {inquiry.quoted_at && (
                      <p className="text-xs text-text-muted mt-1">
                        Quoted on {new Date(inquiry.quoted_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
                {inquiry.admin_notes && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Admin Notes</p>
                    <p className="text-text-primary whitespace-pre-wrap">{inquiry.admin_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quote Modal */}
      {showQuoteModal && (
        <QuoteModal
          inquiry={inquiry}
          onClose={() => setShowQuoteModal(false)}
          onSuccess={(updated) => {
            setShowQuoteModal(false);
            onUpdate(updated);
          }}
        />
      )}
    </motion.div>
  );
}

// ============================================================================
// Quote Modal Component
// ============================================================================

interface QuoteModalProps {
  inquiry: CateringInquiry;
  onClose: () => void;
  onSuccess: (inquiry: CateringInquiry) => void;
}

function QuoteModal({ inquiry, onClose, onSuccess }: QuoteModalProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid quote amount');
      return;
    }

    try {
      setSubmitting(true);
      const result = await adminApi.sendCateringQuote(inquiry.id, {
        quoted_amount: numAmount,
        admin_notes: notes || undefined,
      });
      onSuccess(result.inquiry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send quote');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-card rounded-xl shadow-xl w-full max-w-md mx-4"
      >
        <div className="p-6 border-b border-border-default">
          <h3 className="text-lg font-semibold text-text-primary">Send Quote</h3>
          <p className="text-sm text-text-secondary mt-1">
            For {inquiry.contact_name}'s {inquiry.event_type}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Quote Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                required
              />
            </div>
            <p className="text-xs text-text-muted mt-1">
              Budget: {inquiry.budget_range || 'Not specified'} | {inquiry.guest_count} guests
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this quote..."
              rows={3}
              className="w-full px-4 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-border-default rounded-lg text-text-secondary hover:bg-surface-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Quote
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
