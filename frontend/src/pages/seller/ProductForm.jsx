import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.js';
import { getError } from '../../utils/format.js';

const empty = { title: '', description: '', price: '', stock: '', category: '', images: '' };

// Used for both "Add product" (/new) and "Edit product" (/:id/edit)
export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data;
        setForm({
          title: p.title,
          description: p.description,
          price: p.price,
          stock: p.stock,
          category: p.category,
          images: (p.images || []).join(', '),
        });
      })
      .catch((err) => setError(getError(err)));
  }, [id, isEdit]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.description.trim() || !form.category.trim()) {
      return setError('Title, description and category are required');
    }
    if (Number(form.price) <= 0) return setError('Price must be greater than 0');
    if (form.stock === '' || Number(form.stock) < 0) return setError('Stock cannot be negative');

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
    };
    if (payload.images.length === 0) return setError('Add at least one image URL');

    setBusy(true);
    try {
      if (isEdit) await api.put(`/products/${id}`, payload);
      else await api.post('/products', payload);
      navigate('/seller/products');
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-box wide">
      <h2>{isEdit ? 'Edit product' : 'Add product'}</h2>
      {error && <p className="alert">{error}</p>}
      <form onSubmit={onSubmit}>
        <label>Title</label>
        <input name="title" value={form.title} onChange={onChange} required />
        <label>Description</label>
        <textarea name="description" rows="4" value={form.description} onChange={onChange} required />
        <label>Price (PKR)</label>
        <input name="price" type="number" min="1" value={form.price} onChange={onChange} required />
        <label>Stock</label>
        <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={onChange} required />
        <label>Category</label>
        <input name="category" value={form.category} onChange={onChange} placeholder="Clothes, Jewelry, Food..." required />
        <label>Image URL (separate several with commas)</label>
        <input name="images" value={form.images} onChange={onChange} placeholder="https://..." required />
        <button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Save product'}</button>
      </form>
    </div>
  );
}
