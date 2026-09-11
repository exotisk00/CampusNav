import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Bot,
  Sparkles,
  RotateCcw,
  Navigation,
  Calendar,
  Search,
  ExternalLink,
  Compass,
} from 'lucide-react';
import {
  getAiAssistantResponse,
  getAiStatus,
  quickActions,
  suggestedPrompts,
} from '../services/ai/aiAssistantService';
import { useCampusData } from '../context/CampusDataContext';
import Button from '../components/ui/Button';
import './Assistant.css';

export default function Assistant() {
  const navigate = useNavigate();
  const { events, lostFoundItems } = useCampusData();
  const aiStatus = getAiStatus();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! 👋 I'm your CampusNav AI Assistant for Lovely Professional University (LPU).\n\nAsk me about campus buildings, walking directions on the interactive map, today's events, lost & found items, or campus facilities!",
      time: 'Just now',
      action: {
        type: 'NAVIGATE',
        label: 'Open Interactive Campus Map',
        url: '/map',
      },
      provider: aiStatus.providerName,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (query = input) => {
    const trimmed = query.trim();
    if (!trimmed || isTyping) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Pass live Firestore context into AI engine
      const response = await getAiAssistantResponse(trimmed, {
        events: events || [],
        lostFoundItems: lostFoundItems || [],
      });

      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        action: response.action,
        provider: response.provider || aiStatus.providerName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Error in AI Assistant processing:', err);
      const errorMsg = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: "I encountered an error retrieving that information. You can explore the interactive Campus Map or check live events using the quick actions below.",
        action: {
          type: 'NAVIGATE',
          label: 'Open Campus Map',
          url: '/map',
        },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'assistant',
        text: "Chat cleared! How can I assist your campus navigation today?",
        time: 'Just now',
        action: null,
      },
    ]);
  };

  const renderActionIcon = (type) => {
    switch (type) {
      case 'NAVIGATE':
        return <Navigation size={14} />;
      case 'VIEW_EVENTS':
        return <Calendar size={14} />;
      case 'VIEW_LOST_FOUND':
        return <Search size={14} />;
      default:
        return <ExternalLink size={14} />;
    }
  };

  return (
    <div className="page-content assistant-page">
      <div className="container assistant-container">
        {/* Assistant Header */}
        <div className="assistant-header-card">
          <div className="assistant-header-left">
            <div className="assistant-avatar-badge">
              <Bot size={28} />
            </div>
            <div>
              <div className="assistant-title-row">
                <h1 className="text-headline-sm">CampusNav AI Assistant</h1>
                <span className="online-tag">
                  <span className="online-dot" /> {aiStatus.statusText}
                </span>
              </div>
              <p className="text-body-sm text-secondary">
                Grounded in Lovely Professional University (LPU) campus map, live events, and directories.
              </p>
            </div>
          </div>

          <div className="assistant-header-right">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={clearChat}
            >
              Reset Chat
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Compass}
              onClick={() => navigate('/map')}
            >
              Open Campus Map
            </Button>
          </div>
        </div>

        {/* Chat Main Window */}
        <div className="assistant-chat-window">
          <div className="assistant-messages-area">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`assistant-msg-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="bot-avatar-small">
                    <Bot size={18} />
                  </div>
                )}

                <div className="msg-bubble-container">
                  <div className="msg-bubble">
                    <p className="msg-text">{msg.text}</p>
                    {msg.action && (
                      <button
                        className="msg-action-btn"
                        onClick={() => navigate(msg.action.url)}
                      >
                        {renderActionIcon(msg.action.type)}
                        <span>{msg.action.label}</span>
                      </button>
                    )}
                  </div>
                  <div className="msg-timestamp">
                    <span>{msg.time}</span>
                    {msg.provider && (
                      <span style={{ opacity: 0.7 }}>• {msg.provider}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="assistant-msg-row bot-row">
                <div className="bot-avatar-small">
                  <Bot size={18} />
                </div>
                <div className="assistant-typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions & Suggested Prompts Bar */}
          <div className="assistant-prompts-bar">
            <div className="prompts-bar-header">
              <Sparkles size={14} className="text-primary" />
              <span>Quick actions:</span>
            </div>
            <div className="quick-actions-row">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className="quick-action-chip"
                  onClick={() => handleSend(action.query)}
                  disabled={isTyping}
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div className="prompts-chips-wrapper" style={{ marginTop: '4px' }}>
              {suggestedPrompts.slice(0, 4).map((prompt, idx) => (
                <button
                  key={idx}
                  className="prompt-chip-btn"
                  onClick={() => handleSend(prompt)}
                  disabled={isTyping}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="assistant-input-area">
            <input
              type="text"
              className="assistant-text-input"
              placeholder="Ask about LPU buildings, directions, events, or lost & found..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <Button
              variant="primary"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              icon={Send}
            >
              {isTyping ? 'Thinking...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
