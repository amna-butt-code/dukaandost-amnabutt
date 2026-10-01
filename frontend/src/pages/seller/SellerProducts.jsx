import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { getError, pkr } from '../../utils/format.js';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/products')
      .then((res) => setProducts(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <div>
      <div className="row between">
        <h2>Manage products</h2>
        <Link to="/seller/products/new" className="btn">+ Add product</Link>
      </div>
      {error && <p className="alert">{error}</p>}
      {loading && <p className="center">Loading...</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Image</th><th>Title</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td><img src={p.images?.[0]} alt="" className="thumb" /></td>
                <td>{p.title}</td>
                <td>{p.category}</td>
                <td>{pkr(p.price)}</td>
                <td>{p.stock}</td>
                <td>
                  <div className="row">
                    <Link to={`/seller/products/${p._id}/edit`} className="btn btn-outline">Edit</Link>
                    <button className="btn btn-danger" onClick={() => handleDelete(p)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
