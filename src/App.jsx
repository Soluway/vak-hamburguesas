import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import ClientView from './pages/ClientView';
import AdminView from './pages/AdminView';

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="container">
          <Header />
          <CartSidebar />
          <main style={{ flex: 1, paddingBottom: '20px' }}>
            <Routes>
              <Route path="/" element={<ClientView />} />
              <Route path="/admin" element={<AdminView />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
