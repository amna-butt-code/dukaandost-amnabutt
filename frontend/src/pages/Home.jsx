import { useEffect, useState } from 'react';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { getError } from '../utils/format.js';

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Store info and the category list (loaded once)
  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data)).catch(() => {});
    api
      .get('/products')
      .then((res) => setCategories([...new Set(res.data.map((p) => p.category))]))
      .catch(() => {});
  }, []);

  // Products, reloaded whenever the category filter changes
  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get('/products', { params: category === 'All' ? {} : { category } })
      .then((res) => setProducts(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div>
      {settings && (
        <section className="hero">
          <h1>{settings.storeName}</h1>
          <p className="muted">{settings.city} · WhatsApp: {settings.whatsappNumber}</p>
          <p>{settings.deliveryPolicy}</p>
          {settings.faqs?.length > 0 && (
            <details>
              <summary>Frequently asked questions</summary>
              {settings.faqs.map((f) => (
                <div key={f._id} className="faq">
                  <strong>{f.question}</strong>
                  <p>{f.answer}</p>
                </div>
              ))}
            </details>
          )}
        </section>
      )}

      <div className="filters">
        {['All', ...categories].map((c) => (
          <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {loading && <p className="center">Loading products...</p>}
      {error && <p className="alert">{error}</p>}
      {!loading && !error && products.length === 0 && <p className="center">No products found.</p>}

      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
