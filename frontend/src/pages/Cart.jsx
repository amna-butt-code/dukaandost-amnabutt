import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { pkr } from '../utils/format.js';

export default function Cart() {
  const { items, removeItem, setQuantity, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="center">
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Your cart</h2>
      {items.map((i) => (
        <div key={i._id} className="cart-row">
          <img src={i.image} alt={i.title} className="cart-img" />
          <div className="cart-info">
            <Link to={`/product/${i._id}`} className="card-title">{i.title}</Link>
            <p className="price">{pkr(i.price)}</p>
          </div>
          <div className="row">
            <button className="btn btn-outline" onClick={() => setQuantity(i._id, i.quantity - 1)}>-</button>
            <span className="qty-text">{i.quantity}</span>
            <button className="btn btn-outline" onClick={() => setQuantity(i._id, i.quantity + 1)}>+</button>
          </div>
          <p className="price">{pkr(i.price * i.quantity)}</p>
          <button className="btn btn-danger" onClick={() => removeItem(i._id)}>Remove</button>
        </div>
      ))}
      <div className="cart-total">
        <h3>Total: {pkr(total)}</h3>
        <button className="btn" onClick={() => navigate('/checkout')}>Proceed to checkout</button>
      </div>
    </div>
  );
}
