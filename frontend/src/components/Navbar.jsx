import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="brand">DukaanDost</Link>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          {user?.role !== 'seller' && <Link to="/cart">Cart ({count})</Link>}
          {user?.role === 'customer' && <Link to="/my-orders">My Orders</Link>}
          {user?.role === 'seller' && (
            <>
              <Link to="/seller/products">Products</Link>
              <Link to="/seller/orders">Orders</Link>
              <Link to="/seller/reviews">Reviews</Link>
              <Link to="/seller/settings">Settings</Link>
            </>
          )}
          {user ? (
            <>
              <span className="muted">{user.name}</span>
              <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
