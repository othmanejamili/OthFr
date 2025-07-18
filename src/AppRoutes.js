// AppRoutes.js
import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import NavBar from './components/Nav&Foo/navbar';
import Footer from './components/Nav&Foo/foter';

import Home from './components/Home/Home';
import Product from './components/Product/product';
import ProductDetail from './components/Product/detailsProduct';
import SeasonalCollections from './components/Collection/Collections';
import GiftOutOfStock from './components/Gifts/Gifts';
import SpinToWinUnavailable from './components/Spinner/spinner';
import LuxuryCart from './components/Shop/Cart';
import Checkout from './components/Shop/Checkout';
import CheckoutSuccess from './components/Shop/CheckoutSuccess';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import Profile from './components/Auth/Profile';

import AdminDashboard from './components/Admin/AdminDashboard';
import ProductList from './components/Admin/productsList';
import TestAddProduct from './components/Admin/test.js';
import UpdateProduct from './components/Admin/testUpdate';
import CreateAdmin from './components/Admin/CreateAdmin';
import CreateCollection from './components/Collection/CreateCollection';
import AdminOrders from './components/Admin/AdminOrder';
import AdminOrderDetail from './components/Admin/AdminOrderDetail';

// 🧱 Layout for public pages
const PublicLayout = () => (
  <>
    <NavBar />
    <Outlet />
    <Footer />
  </>
);

// 🔐 Protected route wrapper
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requireAdmin && !currentUser?.isAdmin)
    return <Navigate to={`/profile/${currentUser?.id}`} />;

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);

  return (
    <Routes>
      {/* ✅ Public routes wrapped with NavBar/Footer */}
      <Route element={<PublicLayout />}>
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

      {/* 🔑 Auth routes (without layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/login" element={<Login />} />

      {/* 🔐 Admin Routes (no NavBar/Footer) */}
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

      {/* 🌐 Catch-all route */}
      <Route path="*" element={
        <Navigate to={isAuthenticated
          ? (currentUser?.isAdmin ? '/admin/dashboard' : '/')
          : '/login'} />
      } />
    </Routes>
  );
};

export default AppRoutes;
