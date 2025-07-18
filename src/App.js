// App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './AppRoutes';

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