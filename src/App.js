import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';

import ProductList from './components/Admin/productsList';
import TestAddProduct from './components/Admin/test.js';
import UpdateProduct from './components/Admin/testUpdate';
import Home from './components/Home/Home';
import NavBar from './components/Nav&Foo/navbar';
import Footer from './components/Nav&Foo/foter';
import Product from './components/Product/product';
import ProductDetail from './components/Product/detailsProduct';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './components/Auth/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import CreateAdmin from './components/Admin/CreateAdmin';
import LuxuryCart from './components/Shop/Cart';
import Checkout from './components/Shop/Checkout';
import CheckoutSuccess from './components/Shop/CheckoutSuccess';
import AdminOrders from './components/Admin/AdminOrder';
import AdminOrderDetail from './components/Admin/AdminOrderDetail';
import Register from './components/Auth/Register';
import Profile from './components/Auth/Profile';
import ForgotPassword from './components/Auth/ForgotPassword';
import SeasonalCollections from './components/Collection/Collections';
import CreateCollection from './components/Collection/CreateCollection';
import GiftOutOfStock from './components/Gifts/Gifts';
import SpinToWinUnavailable from './components/Spinner/spinner';

// Layout with Navbar and Footer (will NOT re-render on route change)
const MainLayout = () => (
  <>
    <NavBar />
    <Outlet /> {/* Render nested routes here */}
    <Footer />
  </>
);

// ProtectedRoute wrapper
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requireAdmin && !currentUser?.isAdmin)
    return <Navigate to={`/profile/${currentUser?.id || ''}`} />;

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);

  return (
    <Routes>
      {/* Routes with layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<Product />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/collection" element={<SeasonalCollections />} />
        <Route path="/gifts" element={<GiftOutOfStock />} />
        <Route path="/spinner" element={<SpinToWinUnavailable />} />
        <Route path="/cart" element={<LuxuryCart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Route>

      {/* Auth routes without layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/login" element={<Login />} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/products" element={
        <ProtectedRoute requireAdmin>
          <ProductList />
        </ProtectedRoute>
      } />
      <Route path="/admin/products/add" element={
        <ProtectedRoute requireAdmin>
          <TestAddProduct />
        </ProtectedRoute>
      } />
      <Route path="/admin/products/update/:id" element={
        <ProtectedRoute requireAdmin>
          <UpdateProduct />
        </ProtectedRoute>
      } />
      <Route path="/admin/users/add" element={
        <ProtectedRoute requireAdmin>
          <CreateAdmin />
        </ProtectedRoute>
      } />
      <Route path="/admin/collections/add" element={
        <ProtectedRoute requireAdmin>
          <CreateCollection />
        </ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute requireAdmin>
          <AdminOrders />
        </ProtectedRoute>
      } />
      <Route path="/admin/orders/details/:id" element={
        <ProtectedRoute requireAdmin>
          <AdminOrderDetail />
        </ProtectedRoute>
      } />

      {/* Catch-all redirect */}
      <Route path="*" element={
        <Navigate to={isAuthenticated
          ? (currentUser?.isAdmin ? '/admin/dashboard' : '/')
          : '/login'} />
      } />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <CartProvider>
      <Router>
        <AppRoutes />
      </Router>
    </CartProvider>
  </AuthProvider>
);

export default App;
