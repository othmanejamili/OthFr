import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProductList from './components/productsList';
import TestAddProduct from './components/test';
import UpdateProduct from './components/testUpdate';
import Home from './components/Home';
import NavBar from './components/navbar';
import Footer from './components/foter';
import Product from './components/product';
import ProductDetail from './components/detailsProduct';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import CreateAdmin from './components/CreateAdmin';
import LuxuryCart from './components/Cart';
import Checkout from './components/Checkout';
import CheckoutSuccess from './components/CheckoutSuccess';
import AdminOrders from './components/AdminOrder';
import AdminOrderDetail from './components/AdminOrderDetail';
import Register from './components/Register';
import Profile from './components/Profile';
import ForgotPassword from './components/ForgotPassword';
import SeasonalCollections from './components/Collections';

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
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Protected Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminDashboard />
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