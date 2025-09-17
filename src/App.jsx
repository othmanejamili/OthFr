import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProductList from './components/Admin/productsList';
import TestAddProduct from './components/Admin/test';
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