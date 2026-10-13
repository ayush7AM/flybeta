import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';
import { askOracle } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

const ORACLE_WELCOME = {
  role: 'ai',
  content: "I'm The Oracle — your AI mentor across FlyBeta. Ask me anything about Data Science, AI, or Cloud Computing. 🔮",
};

export default function OracleWidget() {
  const { themeKey } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([ORACLE_WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    // Push user message
    const currentMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(currentMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Call live Gemini API
      const reply = await askOracle(trimmed, messages);
      setMessages((prev) => [...prev, { role: 'ai', content: reply }]);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "The Oracle is meditating. Please try again.";
      setMessages((prev) => [...prev, { role: 'ai', content: errorMsg }]);
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

  return (
    <>
      {/* ── Backdrop (mobile) ──────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Slide-out Chat Panel ───────────────────────────────────────── */}
      <div
        className={`oracle-panel ${isOpen ? 'oracle-panel-open' : ''}`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-ink bg-primary"
             style={{ boxShadow: 'inset 0 -2px 0 0 var(--color-ink)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-ink bg-surface flex items-center justify-center"
                 style={{ boxShadow: '2px 2px 0px 0px var(--color-ink)' }}>
              <Bot size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="label-mono text-white tracking-wider" style={{ fontSize: '14px' }}>
                THE ORACLE
              </h3>
              <span className="text-white/70" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                AI MENTOR • ONLINE
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 border-2 border-ink bg-surface flex items-center justify-center cursor-pointer hover:bg-canvas transition-colors"
            style={{ boxShadow: '2px 2px 0px 0px var(--color-ink)' }}
          >
            <X size={16} className="text-ink" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
             style={{ background: 'var(--color-canvas)' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`oracle-msg ${
                  msg.role === 'user' ? 'oracle-msg-user' : 'oracle-msg-ai'
                }`}
                style={{
                  color: msg.role === 'user' && themeKey === 'shinchan' ? 'var(--color-ink)' : undefined
                }}
              >
                {msg.role === 'ai' && (
                  <span className="oracle-msg-icon">🔮</span>
                )}
                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6 }}>
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="oracle-msg oracle-msg-ai">
                <span className="oracle-msg-icon">🔮</span>
                <div className="oracle-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t-2 border-ink bg-surface">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask The Oracle..."
              className="flex-1 px-4 py-3 border-2 border-ink bg-canvas text-ink"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="oracle-send-btn"
              title="Send message"
              style={{
                color: themeKey === 'shinchan' ? 'var(--color-ink)' : 'white'
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating Action Button ─────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="tour-oracle"
          className="oracle-fab"
          title="Ask The Oracle"
          style={{
            color: themeKey === 'shinchan' ? 'var(--color-ink)' : 'white'
          }}
        >
          <Sparkles size={26} />
        </button>
      )}
    </>
  );
}
