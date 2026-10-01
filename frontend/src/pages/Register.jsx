import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getError, PHONE_REGEX } from '../utils/format.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!PHONE_REGEX.test(form.phone)) return setError('Phone must be 11 digits like 03XXXXXXXXX');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');

    setBusy(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-box">
      <h2>Create account</h2>
      {error && <p className="alert">{error}</p>}
      <form onSubmit={onSubmit}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={onChange} required />
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={onChange} required />
        <label>Phone (03XXXXXXXXX)</label>
        <input name="phone" value={form.phone} onChange={onChange} maxLength={11} required />
        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={onChange} required />
        <button className="btn" disabled={busy}>{busy ? 'Please wait...' : 'Register'}</button>
      </form>
      <p>Already have an account? <Link to="/login" className="link">Login</Link></p>
    </div>
  );
}
