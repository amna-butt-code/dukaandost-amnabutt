import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MyOrders from './pages/MyOrders.jsx';
import SellerProducts from './pages/seller/SellerProducts.jsx';
import ProductForm from './pages/seller/ProductForm.jsx';
import SellerSettings from './pages/seller/SellerSettings.jsx';
import SellerOrders from './pages/seller/SellerOrders.jsx';

export default function App() {
  const customer = ['customer'];
  const seller = ['seller'];

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer only */}
          <Route path="/checkout" element={<ProtectedRoute roles={customer}><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute roles={customer}><OrderSuccess /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute roles={customer}><MyOrders /></ProtectedRoute>} />

          {/* Seller only */}
          <Route path="/seller" element={<Navigate to="/seller/products" replace />} />
          <Route path="/seller/products" element={<ProtectedRoute roles={seller}><SellerProducts /></ProtectedRoute>} />
          <Route path="/seller/products/new" element={<ProtectedRoute roles={seller}><ProductForm /></ProtectedRoute>} />
          <Route path="/seller/products/:id/edit" element={<ProtectedRoute roles={seller}><ProductForm /></ProtectedRoute>} />
          <Route path="/seller/settings" element={<ProtectedRoute roles={seller}><SellerSettings /></ProtectedRoute>} />
          <Route path="/seller/orders" element={<ProtectedRoute roles={seller}><SellerOrders /></ProtectedRoute>} />

          <Route path="*" element={<p className="center">Page not found</p>} />
        </Routes>
      </main>
      <ChatWidget />
    </>
  );
}
