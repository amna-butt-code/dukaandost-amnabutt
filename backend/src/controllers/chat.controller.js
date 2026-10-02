import { getChatReply } from '../services/ai/chat.service.js';

export const chat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Please type a message' });
    }
    if (message.length > 500) {
      return res.status(400).json({ message: 'Message is too long (max 500 characters)' });
    }

    const reply = await getChatReply(message.trim(), history);
    res.json({ reply });
  } catch (err) {
    // Full error only in the server log, never shown to the customer
    console.error('Chat error:', err.message);
    res.status(503).json({
      message:
        'Sorry, the assistant is not available right now. Please try again in a moment or contact the store on WhatsApp.',
    });
  }
};
