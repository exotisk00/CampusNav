import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import ChatDrawer from '../chat/ChatDrawer';
import { MessageCircle, Sparkles } from 'lucide-react';
import './AppLayout.css';

export default function AppLayout({ children }) {
  const [chatOpen, setChatOpen] = useState(false);
  const location = useLocation();

  const isPublicPage = ['/', '/login', '/signup'].includes(location.pathname);
  const isAssistantPage = location.pathname === '/assistant';

  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">{children}</main>
      <MobileNav />

      {/* Floating AI Assistant Trigger for authenticated pages */}
      {!isPublicPage && !isAssistantPage && (
        <button
          className="floating-ai-btn"
          onClick={() => setChatOpen(true)}
          aria-label="Open CampusNav AI Assistant"
        >
          <div className="ai-btn-icon-wrap">
            <MessageCircle size={22} />
            <Sparkles size={11} className="ai-sparkle-badge" />
          </div>
          <span className="ai-btn-tooltip">AI Assistant</span>
        </button>
      )}

      <ChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
