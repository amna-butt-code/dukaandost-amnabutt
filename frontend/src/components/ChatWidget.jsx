import { useEffect, useRef, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getError } from '../utils/format.js';
import '../chat.css';

const GREETING = {
  role: 'assistant',
  text: 'Assalam o Alaikum! Main DukaanDost ka assistant hoon. Products, price, stock ya delivery ke bare me poochiye.',
};

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  // The seller does not need the customer assistant
  if (user?.role === 'seller') return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Last 10 messages (without error bubbles) are sent as the conversation so far
    const history = messages
      .filter((m) => !m.error)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat', { message: text, history });
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: getError(err), error: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(!open)} aria-label="Chat with the store assistant">
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-header">Store Assistant</div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role} ${m.error ? 'error' : ''}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="bubble assistant">Typing...</div>}
            <div ref={endRef} />
          </div>
          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type your question..."
              maxLength={500}
            />
            <button className="btn" onClick={send} disabled={loading || !input.trim()}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
