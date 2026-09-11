import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Send,
  Bot,
  Sparkles,
  Navigation,
  Calendar,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  getAiAssistantResponse,
  getAiStatus,
  quickActions,
  suggestedPrompts,
} from '../../services/ai/aiAssistantService';
import { useCampusData } from '../../context/CampusDataContext';
import './ChatDrawer.css';

export default function ChatDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { events, lostFoundItems } = useCampusData();
  const aiStatus = getAiStatus();

  const [messages, setMessages] = useState([
    {
      id: 'welcome_drawer',
      sender: 'assistant',
      text: "Hello! 👋 I'm your CampusNav Assistant for LPU. How can I help you navigate the campus or find events today?",
      time: 'Just now',
      action: {
        type: 'NAVIGATE',
        label: 'Open Campus Map',
        url: '/map',
      },
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (textToSend = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isTyping) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getAiAssistantResponse(trimmed, {
        events: events || [],
        lostFoundItems: lostFoundItems || [],
      });

      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        action: response.action,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Error in ChatDrawer AI response:', err);
      const errorMsg = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: "I encountered a problem retrieving that. Feel free to open the interactive map or check events directly!",
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

  const handleActionClick = (action) => {
    if (!action?.url) return;
    onClose();
    navigate(action.url);
  };

  const renderActionIcon = (type) => {
    switch (type) {
      case 'NAVIGATE':
        return <Navigation size={13} />;
      case 'VIEW_EVENTS':
        return <Calendar size={13} />;
      case 'VIEW_LOST_FOUND':
        return <Search size={13} />;
      default:
        return <ExternalLink size={13} />;
    }
  };

  return (
    <div className="chat-drawer-backdrop" onClick={onClose}>
      <div className="chat-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chat-drawer-header">
          <div className="chat-drawer-header-info">
            <div className="chat-bot-avatar">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-title-md">CampusNav Assistant</h3>
              <span className="chat-status-indicator">
                <span className="chat-status-dot" /> {aiStatus.statusText}
              </span>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-drawer-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${msg.sender === 'user' ? 'chat-message-user' : 'chat-message-bot'}`}
            >
              <div className="chat-message-bubble">
                <p className="chat-message-text">{msg.text}</p>
                {msg.action && (
                  <button
                    className="chat-action-btn"
                    onClick={() => handleActionClick(msg.action)}
                  >
                    {renderActionIcon(msg.action.type)}
                    <span>{msg.action.label}</span>
                  </button>
                )}
                <span className="chat-message-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-message chat-message-bot">
              <div className="chat-typing-indicator">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions & Suggested Prompts */}
        <div className="chat-drawer-prompts">
          <div className="chat-prompts-label">
            <Sparkles size={13} />
            <span>Quick actions:</span>
          </div>
          <div className="chat-prompts-list">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="chat-prompt-pill"
                onClick={() => handleSend(action.query)}
                disabled={isTyping}
              >
                {action.label}
              </button>
            ))}
            {suggestedPrompts.slice(0, 2).map((prompt, idx) => (
              <button
                key={`sugg_${idx}`}
                className="chat-prompt-pill"
                onClick={() => handleSend(prompt)}
                disabled={isTyping}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="chat-drawer-input-container">
          <input
            type="text"
            className="chat-drawer-input"
            placeholder="Ask about buildings, events, facilities..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
          />
          <button
            className="chat-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
