import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles } from 'lucide-react';
import { getAssistantResponse, suggestedPrompts } from '../../data/chatResponses';
import './ChatDrawer.css';

export default function ChatDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! 👋 I'm your CampusNav Assistant. How can I help you navigate the campus today?",
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = getAssistantResponse(trimmed);
      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
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
                <span className="chat-status-dot" /> Online • Mock AI
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

        {/* Suggested Prompts */}
        <div className="chat-drawer-prompts">
          <div className="chat-prompts-label">
            <Sparkles size={13} />
            <span>Suggested questions:</span>
          </div>
          <div className="chat-prompts-list">
            {suggestedPrompts.slice(0, 4).map((prompt, idx) => (
              <button
                key={idx}
                className="chat-prompt-pill"
                onClick={() => handleSend(prompt)}
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
          />
          <button
            className="chat-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
