import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { getSettings } from '../data/menu';
import { X, Plus, Minus, MessageCircle, ChevronLeft } from 'lucide-react';

const WA_NUMBER = '5491135889974';

const CartSidebar = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout'
  const [delivery, setDelivery] = useState(''); // 'envio' | 'retiro'
  const [payment, setPayment] = useState(''); // 'transferencia' | 'efectivo'

  const { deliveryPrice = 0 } = getSettings();
  const deliveryCost = delivery === 'envio' ? deliveryPrice : 0;
  const grandTotal = cartTotal + deliveryCost;

  const formatPrice = (price) => `$${price.toLocaleString('es-AR')}`;

  const handleClose = () => {
    setIsCartOpen(false);
    setStep('cart');
    setDelivery('');
    setPayment('');
  };

  const buildWhatsAppMessage = () => {
    const lines = cart.map(item =>
      `• ${item.quantity}x ${item.name} (${item.size}) — ${formatPrice(item.price * item.quantity)}`
    );
    const deliveryLabel = delivery === 'envio' ? '🛵 Envío a domicilio' : '🏠 Retiro en local';
    const paymentLabel = payment === 'transferencia' ? '💳 Transferencia' : '💵 Efectivo';

    const msgLines = [
      '🍔 *Pedido VAK Hamburguesas*',
      '',
      ...lines,
    ];

    if (delivery === 'envio' && deliveryPrice > 0) {
      msgLines.push(`• Envío — ${formatPrice(deliveryPrice)}`);
    }

    msgLines.push('', `*Total: ${formatPrice(grandTotal)}*`, '', `📦 *Entrega:* ${deliveryLabel}`, `💰 *Pago:* ${paymentLabel}`);

    return encodeURIComponent(msgLines.join('\n'));
  };

  const sendToWhatsApp = () => {
    if (!delivery || !payment) return;
    const msg = buildWhatsAppMessage();
    clearCart();
    setStep('cart');
    setDelivery('');
    setPayment('');
    setIsCartOpen(false);
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
  };

  if (!isCartOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.sidebar} onClick={(e) => e.stopPropagation()} className="animate-slide-in">

        {/* HEADER */}
        <div style={styles.header}>
          {step === 'checkout' && (
            <button onClick={() => setStep('cart')} style={styles.backBtn}>
              <ChevronLeft size={20} />
            </button>
          )}
          <h2 style={{ flex: 1 }}>{step === 'cart' ? 'TU PEDIDO' : 'FINALIZAR PEDIDO'}</h2>
          <button onClick={handleClose} style={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        {/* STEP: CARRITO */}
        {step === 'cart' && (
          <>
            <div style={styles.itemsContainer}>
              {cart.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5 }}>Tu carrito está vacío.</p>
              )}
              {cart.map(item => (
                <div key={item.tempId} style={styles.cartItem}>
                  <div style={styles.itemInfo}>
                    <span style={styles.itemName}>
                      {item.name} <span style={styles.itemSize}>({item.size})</span>
                    </span>
                    <span style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                  <div style={styles.quantityControls}>
                    <button style={styles.qtyBtn} onClick={() => updateQuantity(item.tempId, item.quantity - 1)}>
                      <Minus size={16} />
                    </button>
                    <span style={styles.qtyValue}>{item.quantity}</span>
                    <button style={styles.qtyBtn} onClick={() => updateQuantity(item.tempId, item.quantity + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div style={styles.footer}>
                <div style={styles.totalRow}>
                  <span>TOTAL</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <button style={styles.checkoutBtn} onClick={() => setStep('checkout')}>
                  CONTINUAR <MessageCircle size={20} style={{ marginLeft: '10px' }} />
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP: CHECKOUT */}
        {step === 'checkout' && (
          <>
            <div style={styles.itemsContainer}>

              {/* Resumen */}
              <div style={styles.summaryBox}>
                {cart.map(item => (
                  <div key={item.tempId} style={styles.summaryRow}>
                    <span>{item.quantity}x {item.name} ({item.size})</span>
                    <span style={{ color: 'var(--vak-red)', fontWeight: 700 }}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                {delivery === 'envio' && deliveryPrice > 0 && (
                  <div style={styles.summaryRow}>
                    <span>🛵 Envío</span>
                    <span style={{ color: 'var(--vak-red)', fontWeight: 700 }}>{formatPrice(deliveryPrice)}</span>
                  </div>
                )}
                <div style={{ ...styles.summaryRow, borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '4px', fontWeight: 900 }}>
                  <span>TOTAL</span>
                  <span style={{ color: 'var(--vak-red)' }}>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Entrega */}
              <p style={styles.sectionLabel}>¿Cómo lo recibís?</p>
              <div style={styles.optionGroup}>
                <button
                  style={delivery === 'envio' ? styles.optionActive : styles.option}
                  onClick={() => setDelivery('envio')}
                >
                  🛵 Envío a domicilio
                </button>
                <button
                  style={delivery === 'retiro' ? styles.optionActive : styles.option}
                  onClick={() => setDelivery('retiro')}
                >
                  🏠 Retiro en local
                </button>
              </div>

              {/* Pago */}
              <p style={styles.sectionLabel}>¿Cómo pagás?</p>
              <div style={styles.optionGroup}>
                <button
                  style={payment === 'transferencia' ? styles.optionActive : styles.option}
                  onClick={() => setPayment('transferencia')}
                >
                  💳 Transferencia
                </button>
                <button
                  style={payment === 'efectivo' ? styles.optionActive : styles.option}
                  onClick={() => setPayment('efectivo')}
                >
                  💵 Efectivo
                </button>
              </div>
            </div>

            <div style={styles.footer}>
              <button
                style={{ ...styles.checkoutBtn, opacity: (!delivery || !payment) ? 0.5 : 1 }}
                onClick={sendToWhatsApp}
                disabled={!delivery || !payment}
              >
                ENVIAR POR WHATSAPP <MessageCircle size={20} style={{ marginLeft: '10px' }} />
              </button>
            </div>
          </>
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
    color: 'var(--vak-red)',
    gap: '8px',
  },
  backBtn: {
    color: 'var(--vak-red)',
    display: 'flex',
    alignItems: 'center',
  },
  closeBtn: {
    color: 'var(--vak-dark)',
  },
  itemsContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
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
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  summaryBox: {
    backgroundColor: 'var(--vak-bg)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
  },
  sectionLabel: {
    fontWeight: 800,
    fontSize: '0.85rem',
    color: 'var(--vak-dark)',
    marginBottom: '0.6rem',
    letterSpacing: '0.5px',
  },
  optionGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  option: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '10px',
    border: '2px solid #e0e0e0',
    backgroundColor: 'white',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    color: '#555',
    transition: 'all 0.15s',
    minWidth: '130px',
  },
  optionActive: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '10px',
    border: '2px solid var(--vak-red)',
    backgroundColor: 'rgba(234,29,44,0.07)',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    color: 'var(--vak-red)',
    transition: 'all 0.15s',
    minWidth: '130px',
  },
};

export default CartSidebar;
