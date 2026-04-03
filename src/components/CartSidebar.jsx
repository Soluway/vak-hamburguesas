import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { getSettings } from '../data/menu';
import { X, Plus, Minus, MessageCircle, ChevronLeft, Navigation } from 'lucide-react';
import Swal from 'sweetalert2';

const WA_NUMBER = '5491135889974';
const DEFAULT_COORDS = { lat: -34.7167, lng: -58.2833 };

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const CartSidebar = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState('cart');
  const [delivery, setDelivery] = useState('');
  const [payment, setPayment] = useState('');

  // Dirección detallada
  const [addrStreet, setAddrStreet] = useState('');
  const [addrNumber, setAddrNumber] = useState('');
  const [addrExtra, setAddrExtra] = useState('');
  const [addrBell, setAddrBell] = useState('');
  const [addrNotes, setAddrNotes] = useState('');
  const [addressValidated, setAddressValidated] = useState(false);
  const [addressDisplay, setAddressDisplay] = useState('');
  const [addressCoords, setAddressCoords] = useState(null);
  const [checking, setChecking] = useState(false);

  const settings = getSettings();
  const {
    deliveryPrice = 0,
    storeCoords = DEFAULT_COORDS,
    storeZone = 'la zona de envío',
    deliveryRadiusKm = 4,
  } = settings;

  const deliveryCost = delivery === 'envio' ? deliveryPrice : 0;
  const grandTotal = cartTotal + deliveryCost;
  const formatPrice = (p) => `$${p.toLocaleString('es-AR')}`;

  const resetAddress = () => {
    setAddrStreet(''); setAddrNumber(''); setAddrExtra('');
    setAddrBell(''); setAddrNotes('');
    setAddressValidated(false); setAddressDisplay(''); setAddressCoords(null);
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setStep('cart');
    setDelivery(''); setPayment('');
    resetAddress();
  };

  const handleDeliverySelect = (v) => {
    setDelivery(v);
    resetAddress();
  };

  // ── Validar coordenadas contra el radio ─────────────────────
  const validateCoords = (lat, lng, displayName) => {
    const dist = haversineKm(storeCoords.lat, storeCoords.lng, lat, lng);
    if (dist > deliveryRadiusKm) {
      Swal.fire({
        icon: 'warning',
        title: 'Fuera de zona',
        html: `Solo hacemos envíos en la zona de <strong>${storeZone}</strong>.<br><br>Tu ubicación está a ${dist.toFixed(1)} km del local.`,
        confirmButtonColor: '#ea1d2c',
        confirmButtonText: 'Entendido',
      });
      setAddressValidated(false);
      setAddressCoords(null);
    } else {
      setAddressValidated(true);
      setAddressDisplay(displayName);
      setAddressCoords({ lat, lng });
      Swal.fire({
        icon: 'success',
        title: '¡Zona confirmada!',
        text: `Tu dirección está dentro de la zona de ${storeZone}.`,
        confirmButtonColor: '#ea1d2c',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  // ── GPS ──────────────────────────────────────────────────────
  const useGPS = () => {
    if (!navigator.geolocation) {
      Swal.fire({ icon: 'error', title: 'Sin soporte GPS', text: 'Tu dispositivo no soporta geolocalización.', confirmButtonColor: '#ea1d2c' });
      return;
    }
    setChecking(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'es' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const street = addr.road || addr.pedestrian || '';
          const number = addr.house_number || '';
          const display = [street, number].filter(Boolean).join(' ') || data.display_name?.split(',')[0] || 'Ubicación GPS';
          setAddrStreet(street);
          setAddrNumber(number);
          validateCoords(lat, lng, display);
        } catch {
          Swal.fire({ icon: 'error', title: 'Error', text: 'No pudimos obtener tu dirección.', confirmButtonColor: '#ea1d2c' });
        } finally {
          setChecking(false);
        }
      },
      (err) => {
        setChecking(false);
        const msgs = {
          1: 'Permiso de ubicación denegado. Activá el GPS e intentá de nuevo.',
          2: 'No se pudo obtener tu ubicación.',
          3: 'Tiempo de espera agotado.',
        };
        Swal.fire({ icon: 'error', title: 'Error de ubicación', text: msgs[err.code] || 'Error desconocido.', confirmButtonColor: '#ea1d2c' });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ── Geocoding manual ─────────────────────────────────────────
  const validateManual = async () => {
    if (!addrStreet.trim() || !addrNumber.trim()) return;
    setChecking(true);
    try {
      const q = encodeURIComponent(`${addrStreet} ${addrNumber}, ${storeZone}, Buenos Aires, Argentina`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await res.json();
      if (!data.length) {
        Swal.fire({
          icon: 'error',
          title: 'Dirección no encontrada',
          text: 'Verificá que la calle y el número sean correctos.',
          confirmButtonColor: '#ea1d2c',
        });
        return;
      }
      validateCoords(parseFloat(data[0].lat), parseFloat(data[0].lon), `${addrStreet} ${addrNumber}`);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'Verificá tu internet e intentá de nuevo.', confirmButtonColor: '#ea1d2c' });
    } finally {
      setChecking(false);
    }
  };

  // ── WhatsApp ─────────────────────────────────────────────────
  const buildMessage = () => {
    const lines = cart.map(i => `• ${i.quantity}x ${i.name} (${i.size}) — ${formatPrice(i.price * i.quantity)}`);
    if (delivery === 'envio' && deliveryPrice > 0) lines.push(`• Envío — ${formatPrice(deliveryPrice)}`);

    const parts = [
      '🍔 *Pedido VAK Hamburguesas*', '',
      ...lines, '',
      `*Total: ${formatPrice(grandTotal)}*`, '',
      `📦 *Entrega:* ${delivery === 'envio' ? '🛵 Envío a domicilio' : '🏠 Retiro en local'}`,
    ];
    if (delivery === 'envio' && addressDisplay) {
      const streetLine = [addrStreet, addrNumber].filter(Boolean).join(' ') || addressDisplay;
      parts.push(`📍 *Dirección:* ${streetLine}`);
      if (addrExtra) parts.push(`🏢 *Piso/Dpto:* ${addrExtra}`);
      if (addrBell) parts.push(`🔔 *Timbre:* ${addrBell}`);
      if (addressCoords) parts.push(`🗺️ *Ubicación:* https://maps.google.com/?q=${addressCoords.lat},${addressCoords.lng}`);
      if (addrNotes) parts.push(`📝 *Observaciones:* ${addrNotes}`);
    }
    parts.push(`💰 *Pago:* ${payment === 'transferencia' ? '💳 Transferencia' : '💵 Efectivo'}`);
    return encodeURIComponent(parts.join('\n'));
  };

  const canConfirm = delivery && payment && (delivery === 'retiro' || addressValidated);

  const sendToWhatsApp = () => {
    if (!canConfirm) return;
    const msg = buildMessage();
    clearCart();
    setStep('cart'); setDelivery(''); setPayment('');
    resetAddress(); setIsCartOpen(false);
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
  };

  if (!isCartOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.sidebar} onClick={(e) => e.stopPropagation()} className="animate-slide-in">

        {/* HEADER */}
        <div style={styles.header}>
          {step === 'checkout' && (
            <button onClick={() => setStep('cart')} style={styles.backBtn}><ChevronLeft size={20} /></button>
          )}
          <h2 style={{ flex: 1 }}>{step === 'cart' ? 'TU PEDIDO' : 'FINALIZAR PEDIDO'}</h2>
          <button onClick={handleClose} style={styles.closeBtn}><X size={24} /></button>
        </div>

        {/* CARRITO */}
        {step === 'cart' && (
          <>
            <div style={styles.itemsContainer}>
              {cart.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5 }}>Tu carrito está vacío.</p>
              )}
              {cart.map(item => (
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
            {cart.length > 0 && (
              <div style={styles.footer}>
                <div style={styles.totalRow}><span>TOTAL</span><span>{formatPrice(cartTotal)}</span></div>
                <button style={styles.checkoutBtn} onClick={() => setStep('checkout')}>
                  CONTINUAR <MessageCircle size={20} style={{ marginLeft: '10px' }} />
                </button>
                <button style={styles.keepShoppingBtn} onClick={handleClose}>← Seguir eligiendo</button>
              </div>
            )}
          </>
        )}

        {/* CHECKOUT */}
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
                <button style={delivery === 'envio' ? styles.optionActive : styles.option} onClick={() => handleDeliverySelect('envio')}>🛵 Envío</button>
                <button style={delivery === 'retiro' ? styles.optionActive : styles.option} onClick={() => handleDeliverySelect('retiro')}>🏠 Retiro</button>
              </div>

              {/* Dirección */}
              {delivery === 'envio' && (
                <div style={styles.addressSection}>
                  <p style={styles.sectionLabel}>📍 ¿A dónde enviamos?</p>
                  <p style={styles.addressNote}>
                    Envíos solo en la zona de <strong>{storeZone}</strong> ({deliveryRadiusKm} km del local).
                  </p>

                  {/* Botón GPS */}
                  <button
                    style={{ ...styles.gpsBtn, opacity: checking ? 0.6 : 1 }}
                    onClick={useGPS}
                    disabled={checking}
                  >
                    <Navigation size={18} style={{ marginRight: '8px', flexShrink: 0 }} />
                    {checking ? 'Detectando...' : 'Usar mi ubicación actual'}
                  </button>

                  {/* Divider */}
                  <div style={styles.divider}><span style={styles.dividerText}>o ingresá tu dirección</span></div>

                  {/* Form detallado */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 2 }}>
                        <label style={styles.fieldLabel}>Calle *</label>
                        <input
                          style={{ ...styles.fieldInput, borderColor: addressValidated ? '#2e7d32' : '#e0e0e0' }}
                          placeholder="Ej: Av. Calchaquí"
                          value={addrStreet}
                          onChange={(e) => { setAddrStreet(e.target.value); setAddressValidated(false); }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={styles.fieldLabel}>Número *</label>
                        <input
                          style={{ ...styles.fieldInput, borderColor: addressValidated ? '#2e7d32' : '#e0e0e0' }}
                          placeholder="1234"
                          value={addrNumber}
                          onChange={(e) => { setAddrNumber(e.target.value); setAddressValidated(false); }}
                          onKeyDown={(e) => e.key === 'Enter' && validateManual()}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>Piso / Dpto <span style={{ fontWeight: 400, color: '#aaa' }}>(opcional)</span></label>
                      <input
                        style={styles.fieldInput}
                        placeholder="Ej: 3° B"
                        value={addrExtra}
                        onChange={(e) => setAddrExtra(e.target.value)}
                      />
                    </div>
                    <button
                      style={{ ...styles.validateBtn, opacity: checking || !addrStreet.trim() || !addrNumber.trim() ? 0.5 : 1 }}
                      onClick={validateManual}
                      disabled={checking || !addrStreet.trim() || !addrNumber.trim()}
                    >
                      {checking ? 'Verificando...' : 'Verificar dirección'}
                    </button>
                  </div>

                  {addressValidated && (
                    <p style={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: 700, marginTop: '6px' }}>
                      ✓ {addressDisplay} — dentro de la zona de cobertura
                    </p>
                  )}

                  {/* Timbre y observaciones — siempre visibles para envío */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    <div>
                      <label style={styles.fieldLabel}>Timbre / referencia <span style={{ fontWeight: 400, color: '#aaa' }}>(opcional)</span></label>
                      <input
                        style={styles.fieldInput}
                        placeholder="Ej: Rodriguez, timbre 3B"
                        value={addrBell}
                        onChange={(e) => setAddrBell(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>Observaciones <span style={{ fontWeight: 400, color: '#aaa' }}>(opcional)</span></label>
                      <input
                        style={styles.fieldInput}
                        placeholder="Ej: sin sal, alergia, etc."
                        value={addrNotes}
                        onChange={(e) => setAddrNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pago */}
              <p style={styles.sectionLabel}>¿Cómo pagás?</p>
              <div style={styles.optionGroup}>
                <button style={payment === 'transferencia' ? styles.optionActive : styles.option} onClick={() => setPayment('transferencia')}>💳 Transferencia</button>
                <button style={payment === 'efectivo' ? styles.optionActive : styles.option} onClick={() => setPayment('efectivo')}>💵 Efectivo</button>
              </div>

            </div>

            <div style={styles.footer}>
              <button
                style={{ ...styles.checkoutBtn, opacity: canConfirm ? 1 : 0.4 }}
                onClick={sendToWhatsApp}
                disabled={!canConfirm}
              >
                ENVIAR POR WHATSAPP <MessageCircle size={20} style={{ marginLeft: '10px' }} />
              </button>
              {delivery === 'envio' && !addressValidated && (
                <p style={{ fontSize: '0.75rem', color: '#aaa', textAlign: 'center', marginTop: '6px' }}>
                  Verificá tu dirección para habilitar el envío
                </p>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' },
  sidebar: { width: '100%', maxWidth: '400px', backgroundColor: 'white', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 15px rgba(0,0,0,0.1)' },
  header: { padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', color: 'var(--vak-red)', gap: '8px' },
  backBtn: { color: 'var(--vak-red)', display: 'flex', alignItems: 'center' },
  closeBtn: { color: 'var(--vak-dark)' },
  itemsContainer: { flex: 1, overflowY: 'auto', padding: '1.5rem' },
  cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid #eee' },
  itemInfo: { display: 'flex', flexDirection: 'column' },
  itemName: { fontWeight: 'bold' },
  itemSize: { fontSize: '0.8rem', color: 'gray' },
  itemPrice: { color: 'var(--vak-red)', fontWeight: 'bold', marginTop: '0.2rem' },
  quantityControls: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--vak-bg)', borderRadius: '20px', padding: '0.3rem' },
  qtyBtn: { backgroundColor: 'white', borderRadius: '50%', width: '25px', height: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  qtyValue: { fontWeight: 'bold', width: '20px', textAlign: 'center' },
  footer: { padding: '1.5rem', borderTop: '1px solid #eee', backgroundColor: '#fafafa' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '1.2rem', marginBottom: '1rem' },
  checkoutBtn: { width: '100%', padding: '1rem', backgroundColor: 'var(--vak-red)', color: 'white', borderRadius: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '10px' },
  keepShoppingBtn: { width: '100%', padding: '0.75rem', backgroundColor: 'transparent', color: 'var(--vak-dark)', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', border: '2px solid #e0e0e0', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' },
  summaryBox: { backgroundColor: 'var(--vak-bg)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '6px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' },
  sectionLabel: { fontWeight: 800, fontSize: '0.85rem', color: 'var(--vak-dark)', marginBottom: '0.6rem', letterSpacing: '0.5px' },
  optionGroup: { display: 'flex', gap: '10px', marginBottom: '1.25rem' },
  option: { flex: 1, padding: '0.75rem', borderRadius: '10px', border: '2px solid #e0e0e0', backgroundColor: 'white', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', color: '#555' },
  optionActive: { flex: 1, padding: '0.75rem', borderRadius: '10px', border: '2px solid var(--vak-red)', backgroundColor: 'rgba(234,29,44,0.07)', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', color: 'var(--vak-red)' },

  addressSection: { marginBottom: '1.25rem' },
  addressNote: { fontSize: '0.78rem', color: '#888', marginBottom: '10px' },
  gpsBtn: {
    width: '100%', padding: '0.85rem', borderRadius: '10px',
    backgroundColor: 'var(--vak-dark)', color: 'white', border: 'none',
    fontFamily: 'inherit', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '16px',
  },
  divider: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  dividerText: { fontSize: '0.75rem', color: '#bbb', fontWeight: 600, whiteSpace: 'nowrap', padding: '0 4px', backgroundColor: 'white', position: 'relative', zIndex: 1 },
  fieldLabel: { display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--vak-red)', marginBottom: '4px' },
  fieldInput: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '0.9rem', fontFamily: 'inherit', color: 'var(--vak-dark)', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' },
  validateBtn: { width: '100%', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--vak-red)', color: 'white', border: 'none', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', marginTop: '4px' },
};

export default CartSidebar;
