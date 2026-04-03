import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import ClientView from './pages/ClientView';
import AdminView from './pages/AdminView';
import LoginView from './pages/LoginView';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="container">
            <Header />
            <CartSidebar />
            <main style={{ flex: 1, paddingBottom: '20px' }}>
              <Routes>
                <Route path="/" element={<ClientView />} />
                <Route path="/admin/login" element={<LoginView />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminView />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
