import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import ProductList from './components/Admin/productsList.js';
import TestAddProduct from './components/Admin/test.js';
import UpdateProduct from './components/Admin/testUpdate.js';
import Home from './components/Home/Home.js';
import NavBar from './components/Nav&Foo/navbar.js';
import Footer from './components/Nav&Foo/foter.js';
import Product from './components/Product/product.js';
import ProductDetail from './components/Product/detailsProduct.js';
import { AuthProvider, AuthContext } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import Login from './components/Auth/Login.js';
import AdminDashboard from './components/Admin/AdminDashboard.js';
import CreateAdmin from './components/Admin/CreateAdmin.js';
import LuxuryCart from './components/Shop/Cart.js';
import Checkout from './components/Shop/Checkout.js';
import CheckoutSuccess from './components/Shop/CheckoutSuccess.js';
import AdminOrders from './components/Admin/AdminOrder.js';
import AdminOrderDetail from './components/Admin/AdminOrderDetail.js';
import Register from './components/Auth/Register.js';
import Profile from './components/Auth/Profile.js';
import ForgotPassword from './components/Auth/ForgotPassword.js';
import SeasonalCollections from './components/Collection/Collections.js';
import CreateCollection from './components/Collection/CreateCollection.js';
import GiftOutOfStock from './components/Gifts/Gifts.js';
import SpinToWinUnavailable from './components/Spinner/spinner.js';

const MainLayout = ({ children }) => (
  <>
    <NavBar />
    {children}
    <Footer />
  </>
);

const MainLayouts = ({ children }) => (
  <>
    <NavBar />
    {children}
  </>
);

// ProtectedRoute component to handle auth checks
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && (!currentUser?.isAdmin)) {
    return <Navigate to={`/profile/${currentUser?.id || ''}`} />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        <MainLayout>
          <Home />
        </MainLayout>
      } />
      
      <Route path="/product" element={
        <MainLayouts>
          <Product />
        </MainLayouts>
      } />

      <Route path="/collection" element={
        <MainLayouts>
          <SeasonalCollections />
        </MainLayouts>
      } />

      <Route path="/gifts" element={
        <MainLayouts>
          <GiftOutOfStock />
        </MainLayouts>
      } />

      <Route path="/spinner" element={
        <MainLayouts>
          <SpinToWinUnavailable />
        </MainLayouts>
      } />
      
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Cart and Checkout Routes */}
      <Route path="/cart" element={<LuxuryCart />} />
      
      <Route path="/checkout" element={
          <Checkout />
      } />
      
      <Route path="/checkout/success" element={
            <CheckoutSuccess />
      } />

      {/* Protected user routes */}
      <Route path="/profile/:userId" element={
        <MainLayouts>
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </MainLayouts>
      } />
      
      {/* Protected Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin/collections/add" element={
        <ProtectedRoute requireAdmin={true}>
          <CreateCollection />
        </ProtectedRoute>
      } />

      
      <Route path="/admin/products" element={
        <ProtectedRoute requireAdmin={true}>
          <ProductList />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/products/add" element={
        <ProtectedRoute requireAdmin={true}>
          <TestAddProduct />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/products/updute/:id" element={
        <ProtectedRoute requireAdmin={true}>
          <UpdateProduct />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/users/add" element={
        <ProtectedRoute requireAdmin={true}>
          <CreateAdmin />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/orders" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminOrders />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/orders/details/:id" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminOrderDetail />
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={isAuthenticated ? (currentUser?.isAdmin ? '/admin/dashboard' : '/') : '/login'} />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;