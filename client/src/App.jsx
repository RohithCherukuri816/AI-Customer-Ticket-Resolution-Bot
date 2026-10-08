import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import API from './services/api';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { TicketWorkspaceView } from './views/TicketWorkspaceView';
import { AnalyticsView } from './views/AnalyticsView';
import { KnowledgeBaseView } from './views/KnowledgeBaseView';
import { AiPlaygroundView } from './views/AiPlaygroundView';
import { TicketDetailModal } from './components/modals/TicketDetailModal';
import { NewTicketModal } from './components/modals/NewTicketModal';
import { AnimatedBackground } from './components/layout/AnimatedBackground';
import { Sparkles } from 'lucide-react';

const DashboardContent = () => {
  const { user, socket } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [toastNotification, setToastNotification] = useState(null);

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (tierFilter !== 'all') params.tier = tierFilter;
      if (searchTerm) params.search = searchTerm;

      const { data } = await API.get('/tickets', { params });
      if (data.success) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user, statusFilter, categoryFilter, tierFilter, searchTerm]);

  // Socket.io Real-time event subscription
  useEffect(() => {
    if (!socket) return;

    const handleNewTicket = (ticket) => {
      setTickets((prev) => [ticket, ...prev]);
      showToast(`⚡ New Ticket #${ticket.ticketNumber} triaged by AI!`);
    };

    const handleTicketUpdated = (updated) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );
    };

    socket.on('new_ticket', handleNewTicket);
    socket.on('ticket_updated', handleTicketUpdated);

    return () => {
      socket.off('new_ticket', handleNewTicket);
      socket.off('ticket_updated', handleTicketUpdated);
    };
  }, [socket]);

  const showToast = (message) => {
    setToastNotification(message);
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  const handleTicketCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicketId(newTicket._id);
    showToast(`Ticket #${newTicket.ticketNumber} created successfully!`);
  };

  const handleTicketUpdated = (updated) => {
    setTickets((prev) =>
      prev.map((t) => (t._id === updated._id ? updated : t))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans relative">
      {/* Floating Ambient Background with Pastel Glow and Dots */}
      <AnimatedBackground />

      {/* Toast Notification popup */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce flex items-center gap-2.5 px-4 py-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xl border border-indigo-500">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar onOpenNewTicket={() => setIsNewTicketOpen(true)} />

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          ticketCount={tickets.length}
        />

        {/* Center Content View */}
        <main className="flex-1 p-6 overflow-y-auto min-h-[calc(100vh-65px)]">
          {activeTab === 'tickets' && (
            <TicketWorkspaceView
              tickets={tickets}
              loading={loading}
              onSelectTicket={(id) => setSelectedTicketId(id)}
              onOpenNewTicket={() => setIsNewTicketOpen(true)}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              tierFilter={tierFilter}
              setTierFilter={setTierFilter}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'knowledge' && <KnowledgeBaseView />}

          {activeTab === 'playground' && <AiPlaygroundView />}
        </main>
      </div>

      {/* Ticket Details & Chat Modal */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onTicketUpdated={handleTicketUpdated}
        />
      )}

      {/* Create New Ticket Modal with Live AI Preview */}
      {isNewTicketOpen && (
        <NewTicketModal
          isOpen={isNewTicketOpen}
          onClose={() => setIsNewTicketOpen(false)}
          onTicketCreated={handleTicketCreated}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
