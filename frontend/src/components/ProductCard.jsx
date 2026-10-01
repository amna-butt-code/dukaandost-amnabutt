import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { pkr } from '../utils/format.js';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const inStock = product.stock > 0;

  return (
    <div className="card">
      <Link to={`/product/${product._id}`}>
        <img src={product.images?.[0]} alt={product.title} className="card-img" />
      </Link>
      <div className="card-body">
        <Link to={`/product/${product._id}`} className="card-title">{product.title}</Link>
        <p className="price">{pkr(product.price)}</p>
        <p className={inStock ? 'ok' : 'danger'}>{inStock ? `In stock (${product.stock})` : 'Out of stock'}</p>
        {user?.role !== 'seller' && (
          <button className="btn" disabled={!inStock} onClick={() => addItem(product, 1)}>
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
}
