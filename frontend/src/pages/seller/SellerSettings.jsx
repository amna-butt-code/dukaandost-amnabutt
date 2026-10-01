import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { getError } from '../../utils/format.js';

export default function SellerSettings() {
  const [form, setForm] = useState({ storeName: '', city: '', whatsappNumber: '', deliveryPolicy: '' });
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        const { storeName, city, whatsappNumber, deliveryPolicy, faqs } = res.data;
        setForm({ storeName, city, whatsappNumber, deliveryPolicy });
        setFaqs((faqs || []).map((f) => ({ question: f.question, answer: f.answer })));
      })
      .catch((err) => setError(getError(err)));
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const changeFaq = (index, field, value) =>
    setFaqs((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  const addFaq = () => setFaqs((prev) => [...prev, { question: '', answer: '' }]);
  const removeFaq = (index) => setFaqs((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const validFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());
    if (validFaqs.length < 3) return setError('Please add at least 3 FAQs');

    setBusy(true);
    try {
      await api.put('/settings', { ...form, faqs: validFaqs });
      setMessage('Settings saved ✓');
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-box wide">
      <h2>Store settings</h2>
      {error && <p className="alert">{error}</p>}
      {message && <p className="success">{message}</p>}
      <form onSubmit={onSubmit}>
        <label>Store name</label>
        <input name="storeName" value={form.storeName} onChange={onChange} required />
        <label>City</label>
        <input name="city" value={form.city} onChange={onChange} required />
        <label>WhatsApp number</label>
        <input name="whatsappNumber" value={form.whatsappNumber} onChange={onChange} required />
        <label>Delivery policy</label>
        <textarea name="deliveryPolicy" rows="3" value={form.deliveryPolicy} onChange={onChange} required />

        <h3>FAQs (at least 3)</h3>
        {faqs.map((f, i) => (
          <div key={i} className="faq-edit">
            <input placeholder="Question" value={f.question} onChange={(e) => changeFaq(i, 'question', e.target.value)} />
            <input placeholder="Answer" value={f.answer} onChange={(e) => changeFaq(i, 'answer', e.target.value)} />
            <button type="button" className="btn btn-danger" onClick={() => removeFaq(i)}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn btn-outline" onClick={addFaq}>+ Add FAQ</button>

        <div><button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Save settings'}</button></div>
      </form>
    </div>
  );
}
