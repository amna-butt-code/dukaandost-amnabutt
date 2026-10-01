import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getError, PHONE_REGEX, pkr } from '../utils/format.js';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', city: '', address: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (items.length === 0) {
    return (
      <div className="center">
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn">Continue shopping</Link>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.city.trim() || !form.address.trim()) {
      return setError('Please fill in all fields');
    }
    if (!PHONE_REGEX.test(form.phone)) {
      return setError('Phone must be 11 digits like 03XXXXXXXXX');
    }

    setBusy(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: form,
      });
      clearCart();
      navigate('/order-success', { state: { orderNumber: data.orderNumber }, replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="checkout">
      <div className="form-box">
        <h2>Checkout</h2>
        {error && <p className="alert">{error}</p>}
        <form onSubmit={onSubmit}>
          <label>Full name</label>
          <input name="name" value={form.name} onChange={onChange} required />
          <label>Phone (03XXXXXXXXX)</label>
          <input name="phone" value={form.phone} onChange={onChange} maxLength={11} required />
          <label>City</label>
          <input name="city" value={form.city} onChange={onChange} required />
          <label>Address</label>
          <textarea name="address" rows="3" value={form.address} onChange={onChange} required />
          <p className="muted">Payment method: Cash on Delivery</p>
          <button className="btn" disabled={busy}>{busy ? 'Placing order...' : `Place order (${pkr(total)})`}</button>
        </form>
      </div>

      <div className="summary">
        <h3>Order summary</h3>
        {items.map((i) => (
          <p key={i._id}>{i.title} × {i.quantity} — {pkr(i.price * i.quantity)}</p>
        ))}
        <h3>Total: {pkr(total)}</h3>
      </div>
    </div>
  );
}
