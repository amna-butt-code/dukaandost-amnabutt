import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { getError, pkr } from '../../utils/format.js';
import '../../orders.css';

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => setOrders(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (order, status) => {
    setError('');
    try {
      const { data } = await api.patch(`/orders/${order._id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === data._id ? { ...o, status: data.status } : o)));
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <div>
      <h2>All orders</h2>
      {error && <p className="alert">{error}</p>}
      {loading && <p className="center">Loading...</p>}
      {!loading && orders.length === 0 && <p className="center">No orders yet.</p>}

      {orders.map((o) => (
        <div key={o._id} className="order-card">
          <div className="order-head">
            <strong>{o.orderNumber}</strong>
            <StatusBadge status={o.status} />
          </div>
          <p className="muted">{new Date(o.createdAt).toLocaleString('en-PK')}</p>
          <p>
            Customer: {o.customer?.name || o.shippingAddress.name} · {o.shippingAddress.phone}
          </p>
          <div className="order-items">
            {o.items.map((i, idx) => (
              <p key={idx}>{i.title} × {i.quantity} — {pkr(i.price * i.quantity)}</p>
            ))}
          </div>
          <p><strong>Total: {pkr(o.totalAmount)}</strong> ({o.paymentMethod})</p>
          <p className="muted">
            Address: {o.shippingAddress.address}, {o.shippingAddress.city}
          </p>

          <div className="row">
            {o.status === 'Pending' && (
              <>
                <button className="btn" onClick={() => changeStatus(o, 'Confirmed')}>Confirm</button>
                <button className="btn btn-danger" onClick={() => changeStatus(o, 'Cancelled')}>Cancel</button>
              </>
            )}
            {o.status === 'Confirmed' && (
              <button className="btn" onClick={() => changeStatus(o, 'Delivered')}>Mark as delivered</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
