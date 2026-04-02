import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Header = () => {
  const { cart, setIsCartOpen } = useCart();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header style={styles.header}>
      <Link to="/" style={styles.logoContainer}>
        {/* Usamos un texto estilizado simulando el logo. Podés reemplazar esta etiqueta con un <img src="/logo.png" /> */}
        <h1 style={styles.logoText}>VA-K</h1>
      </Link>
      
      <button 
        style={styles.cartButton}
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingCart size={24} color="#ffffff" />
        {totalItems > 0 && (
          <span style={styles.badge}>{totalItems}</span>
        )}
      </button>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: 'var(--vak-red)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem 1rem',
    position: 'relative',
    borderBottomLeftRadius: '20px',
    borderBottomRightRadius: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 900,
    fontSize: '4rem',
    color: 'var(--vak-white)',
    letterSpacing: '-2px',
    transform: 'rotate(-3deg)',
    textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
  },
  cartButton: {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    width: '45px',
    height: '45px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#ffffff',
    color: 'var(--vak-red)',
    fontWeight: 'bold',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
  }
};

export default Header;
