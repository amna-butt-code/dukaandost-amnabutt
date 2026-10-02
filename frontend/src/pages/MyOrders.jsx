import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { getError, pkr } from '../utils/format.js';
import '../orders.css';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/orders/my')
      .then((res) => setOrders(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (order) => {
    if (!window.confirm(`Cancel order ${order.orderNumber}?`)) return;
    setError('');
    try {
      const { data } = await api.patch(`/orders/${order._id}/cancel`);
      setOrders((prev) => prev.map((o) => (o._id === data._id ? { ...o, status: data.status } : o)));
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <div>
      <h2>My orders</h2>
      {error && <p className="alert">{error}</p>}
      {loading && <p className="center">Loading...</p>}
      {!loading && orders.length === 0 && (
        <div className="center">
          <p>You have not placed any orders yet.</p>
          <Link to="/" className="btn">Start shopping</Link>
        </div>
      )}

      {orders.map((o) => (
        <div key={o._id} className="order-card">
          <div className="order-head">
            <strong>{o.orderNumber}</strong>
            <StatusBadge status={o.status} />
          </div>
          <p className="muted">{new Date(o.createdAt).toLocaleString('en-PK')}</p>
          <div className="order-items">
            {o.items.map((i, idx) => (
              <p key={idx}>{i.title} × {i.quantity} — {pkr(i.price * i.quantity)}</p>
            ))}
          </div>
          <p><strong>Total: {pkr(o.totalAmount)}</strong> ({o.paymentMethod})</p>
          <p className="muted">
            Deliver to: {o.shippingAddress.name}, {o.shippingAddress.address}, {o.shippingAddress.city} · {o.shippingAddress.phone}
          </p>
          {o.status === 'Pending' && (
            <button className="btn btn-danger" onClick={() => handleCancel(o)}>Cancel order</button>
          )}
        </div>
      ))}
    </div>
  );
}
