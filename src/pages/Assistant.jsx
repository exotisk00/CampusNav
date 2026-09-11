import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Bot,
  Sparkles,
  RotateCcw,
  Navigation,
} from 'lucide-react';
import { getAssistantResponse, suggestedPrompts } from '../data/chatResponses';
import Button from '../components/ui/Button';
import './Assistant.css';

export default function Assistant() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! 👋 I'm your AI Campus Assistant. Ask me anything about campus locations, timings, parking, food court menus, hostel facilities, or directions!",
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (query = input) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = getAssistantResponse(trimmed);
      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
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
        id: 'welcome',
        sender: 'assistant',
        text: "Chat cleared! How else can I assist you with your campus navigation today?",
        time: 'Just now',
      },
    ]);
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
                  <span className="online-dot" /> Online • Mock AI
                </span>
              </div>
              <p className="text-body-sm text-secondary">
                Instant campus guidance grounded in university directories, maps, and schedules.
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
              icon={Navigation}
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
                  </div>
                  <span className="msg-timestamp">{msg.time}</span>
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

          {/* Quick Prompts Bar */}
          <div className="assistant-prompts-bar">
            <div className="prompts-bar-header">
              <Sparkles size={14} className="text-primary" />
              <span>Suggested questions:</span>
            </div>
            <div className="prompts-chips-wrapper">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  className="prompt-chip-btn"
                  onClick={() => handleSend(prompt)}
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
              placeholder="Type your campus question (e.g. 'Where is the library?' or 'Food court hours')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              variant="primary"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              icon={Send}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
