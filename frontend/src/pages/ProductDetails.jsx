import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ReviewSection from '../components/ReviewSection.jsx';
import { getError, pkr } from '../utils/format.js';

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  const loadProduct = useCallback(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(getError(err)));
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  if (error) return <p className="alert">{error}</p>;
  if (!product) return <p className="center">Loading...</p>;

  const inStock = product.stock > 0;

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div>
      <div className="details">
        <img src={product.images?.[0]} alt={product.title} className="details-img" />
        <div>
          <h1>{product.title}</h1>
          <p className="price big">{pkr(product.price)}</p>
          <p className={inStock ? 'ok' : 'danger'}>{inStock ? `In stock (${product.stock} available)` : 'Out of stock'}</p>
          <p className="muted">Category: {product.category}</p>
          {product.averageRating > 0 && (
            <p>⭐ {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)</p>
          )}
          <p>{product.description}</p>

          {user?.role !== 'seller' && inStock && (
            <div className="row">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value) || 1, product.stock)))}
                className="qty"
              />
              <button className="btn" onClick={handleAdd}>{added ? 'Added ✓' : 'Add to cart'}</button>
            </div>
          )}
        </div>
      </div>

      <ReviewSection productId={id} onReviewAdded={loadProduct} />
    </div>
  );
}
