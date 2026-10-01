import { Link, useLocation } from 'react-router-dom';

export default function OrderSuccess() {
  const { state } = useLocation();

  return (
    <div className="center">
      <h2>Order placed successfully ✓</h2>
      {state?.orderNumber && <p>Your order number is <strong>{state.orderNumber}</strong></p>}
      <p>You will pay with Cash on Delivery.</p>
      <Link to="/my-orders" className="btn">View my orders</Link>{' '}
      <Link to="/" className="btn btn-outline">Continue shopping</Link>
    </div>
  );
}
