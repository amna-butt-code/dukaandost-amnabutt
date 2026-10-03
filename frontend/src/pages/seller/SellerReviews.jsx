import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { Stars } from '../../components/ReviewSection.jsx';
import { getError } from '../../utils/format.js';
import '../../reviews.css';

export default function SellerReviews() {
  const [data, setData] = useState({ counts: { positive: 0, neutral: 0, negative: 0 }, reviews: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/reviews')
      .then((res) => setData(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, []);

  const { counts, reviews } = data;

  return (
    <div>
      <h2>Customer reviews</h2>
      {error && <p className="alert">{error}</p>}
      {loading && <p className="center">Loading...</p>}

      <div className="counts">
        <div className="count-card"><strong>{counts.positive}</strong><span className="sentiment sentiment-positive">Positive</span></div>
        <div className="count-card"><strong>{counts.neutral}</strong><span className="sentiment sentiment-neutral">Neutral</span></div>
        <div className="count-card"><strong>{counts.negative}</strong><span className="sentiment sentiment-negative">Negative</span></div>
      </div>

      {!loading && reviews.length === 0 && <p className="center">No reviews yet.</p>}
      <div className="order-card">
        {reviews.map((r) => (
          <div key={r._id} className="review">
            <div className="review-head">
              <strong>{r.product?.title || 'Deleted product'}</strong>
              <Stars value={r.rating} />
              <span className={`sentiment sentiment-${r.sentiment}`}>{r.sentiment}</span>
            </div>
            <p className="muted">{r.customer?.name || 'Customer'} · {new Date(r.createdAt).toLocaleDateString('en-PK')}</p>
            <p>{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
