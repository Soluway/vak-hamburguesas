import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Send } from 'lucide-react';

const CartSidebar = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [orderSent, setOrderSent] = useState(false);

  const formatPrice = (price) => `$${price.toLocaleString('es-AR')}`;

  const sendOrder = () => {
    if (cart.length === 0) return;
    
    // Aquí podrías agregar lógica para guardar el pedido en un backend o state general.
    // Simulamos el envío:
    const newOrder = {
      id: Date.now(),
      items: cart,
      total: cartTotal,
      status: 'PENDIENTE',
      createdAt: new Date().toISOString()
    };

    // Grabamos para el AdminView via localStorage temporalmente
    const existingOrders = JSON.parse(localStorage.getItem('vak_orders') || '[]');
    localStorage.setItem('vak_orders', JSON.stringify([newOrder, ...existingOrders]));

    setOrderSent(true);
    setTimeout(() => {
      clearCart();
      setOrderSent(false);
    }, 2500);
  };

  if (!isCartOpen) return null;

  return (
    <div style={styles.overlay} onClick={() => setIsCartOpen(false)}>
      <div style={styles.sidebar} onClick={(e) => e.stopPropagation()} className="animate-slide-in">
        <div style={styles.header}>
          <h2>TU PEDIDO</h2>
          <button onClick={() => setIsCartOpen(false)} style={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.itemsContainer}>
          {cart.length === 0 && !orderSent && (
            <p style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5 }}>Tu carrito está vacío.</p>
          )}

          {orderSent && (
            <div style={styles.successMessage}>
              <h3 style={{color: 'green'}}>¡Pedido enviado con éxito!</h3>
              <p>Te avisaremos cuando esté listo.</p>
            </div>
          )}

          {!orderSent && cart.map(item => (
            <div key={item.tempId} style={styles.cartItem}>
              <div style={styles.itemInfo}>
                <span style={styles.itemName}>{item.name} <span style={styles.itemSize}>({item.size})</span></span>
                <span style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
              </div>
              <div style={styles.quantityControls}>
                <button style={styles.qtyBtn} onClick={() => updateQuantity(item.tempId, item.quantity - 1)}><Minus size={16} /></button>
                <span style={styles.qtyValue}>{item.quantity}</span>
                <button style={styles.qtyBtn} onClick={() => updateQuantity(item.tempId, item.quantity + 1)}><Plus size={16} /></button>
              </div>
            </div>
          ))}
        </div>

        {!orderSent && cart.length > 0 && (
          <div style={styles.footer}>
            <div style={styles.totalRow}>
              <span>TOTAL</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <button style={styles.checkoutBtn} onClick={sendOrder}>
              CONFIRMAR PEDIDO <Send size={20} style={{marginLeft: '10px'}} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  sidebar: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'white',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
  },
  header: {
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    color: 'var(--vak-red)'
  },
  closeBtn: {
    color: 'var(--vak-dark)',
  },
  itemsContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
  },
  successMessage: {
    textAlign: 'center',
    padding: '2rem 1rem',
    backgroundColor: '#e6ffe6',
    borderRadius: '10px',
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    marginBottom: '1rem',
    borderBottom: '1px solid #eee',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemName: {
    fontWeight: 'bold',
  },
  itemSize: {
    fontSize: '0.8rem',
    color: 'gray',
  },
  itemPrice: {
    color: 'var(--vak-red)',
    fontWeight: 'bold',
    marginTop: '0.2rem',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--vak-bg)',
    borderRadius: '20px',
    padding: '0.3rem',
  },
  qtyBtn: {
    backgroundColor: 'white',
    borderRadius: '50%',
    width: '25px', height: '25px',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  qtyValue: {
    fontWeight: 'bold',
    width: '20px',
    textAlign: 'center',
  },
  footer: {
    padding: '1.5rem',
    borderTop: '1px solid #eee',
    backgroundColor: '#fafafa',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: '900',
    fontSize: '1.2rem',
    marginBottom: '1rem',
  },
  checkoutBtn: {
    width: '100%',
    padding: '1rem',
    backgroundColor: 'var(--vak-red)',
    color: 'white',
    borderRadius: '10px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1rem',
  }
};

export default CartSidebar;
