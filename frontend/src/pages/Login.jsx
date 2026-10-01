import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getError } from '../utils/format.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'seller' ? '/seller/products' : location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-box">
      <h2>Login</h2>
      {error && <p className="alert">{error}</p>}
      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={onChange} required />
        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={onChange} required />
        <button className="btn" disabled={busy}>{busy ? 'Please wait...' : 'Login'}</button>
      </form>
      <p>New customer? <Link to="/register" className="link">Create an account</Link></p>
    </div>
  );
}
