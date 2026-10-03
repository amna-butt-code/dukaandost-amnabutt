import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getError } from '../utils/format.js';
import '../reviews.css';

export const Stars = ({ value }) => (
  <span className="stars">{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
);

export default function ReviewSection({ productId, onReviewAdded }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [form, setForm] = useState({ rating: 5, text: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api
      .get(`/products/${productId}/reviews`)
      .then((res) => setReviews(res.data))
      .catch((err) => setError(getError(err)));

    if (user?.role === 'customer') {
      api
        .get(`/reviews/eligibility/${productId}`)
        .then((res) => setEligibility(res.data))
        .catch(() => setEligibility(null));
    } else {
      setEligibility(null);
    }
  }, [productId, user]);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!form.text.trim()) return setError('Please write your review');

    setBusy(true);
    try {
      await api.post('/reviews', { product: productId, rating: Number(form.rating), text: form.text });
      setForm({ rating: 5, text: '' });
      setMessage('Thank you! Your review was added.');
      load();
      onReviewAdded?.();
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const reasonText = {
    not_delivered: 'Only customers with a delivered order of this product can write a review.',
    already_reviewed: 'You have already reviewed this product.',
  };

  return (
    <section className="reviews">
      <h2>Reviews ({reviews.length})</h2>
      {error && <p className="alert">{error}</p>}
      {message && <p className="success">{message}</p>}

      {!user && (
        <p className="muted">
          <Link to="/login" className="link">Login</Link> as a customer to review products you have received.
        </p>
      )}
      {user?.role === 'customer' && eligibility && !eligibility.eligible && (
        <p className="muted">{reasonText[eligibility.reason]}</p>
      )}

      {user?.role === 'customer' && eligibility?.eligible && (
        <form className="review-form" onSubmit={onSubmit}>
          <label>Your rating</label>
          <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'star' : 'stars'}</option>
            ))}
          </select>
          <label>Your review</label>
          <textarea
            rows="3"
            maxLength={500}
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            placeholder="Write about the product..."
          />
          <div><button className="btn" disabled={busy}>{busy ? 'Submitting...' : 'Submit review'}</button></div>
        </form>
      )}

      {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
      {reviews.map((r) => (
        <div key={r._id} className="review">
          <div className="review-head">
            <Stars value={r.rating} />
            <strong>{r.customer?.name || 'Customer'}</strong>
            <span className={`sentiment sentiment-${r.sentiment}`}>{r.sentiment}</span>
            <span className="muted">{new Date(r.createdAt).toLocaleDateString('en-PK')}</span>
          </div>
          <p>{r.text}</p>
        </div>
      ))}
    </section>
  );
}
