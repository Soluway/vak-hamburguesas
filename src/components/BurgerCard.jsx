import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Plus } from 'lucide-react';

const BurgerCard = ({ product }) => {
  const { id, name, desc, prices, tags } = product;
  const { addToCart } = useCart();
  
  // Parse name to format specifically like the PDF (e.g. KLASI — K)
  const [firstPart, ...restParts] = name.split('-');
  const firstLetter = name.charAt(0);
  const restName = name.substring(1);

  // We dynamically generate available sizes/variations from the prices object
  const sizes = Object.entries(prices || {})
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({
      label: key.toUpperCase(),
      key: key,
      price: value
    }));

  const formatPrice = (price) => `$${price.toLocaleString('es-AR')}`;

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>
          <span style={styles.titleBold}>{firstLetter}</span>
          <span style={styles.titleLight}>{restName}</span>
        </h2>
        
        {tags && tags.includes('VEGGIE') && (
          <div style={styles.tagBadge}>VEGGIE</div>
        )}
      </div>

      <p style={styles.description}>{desc}</p>

      <div style={styles.sizesContainer}>
        {sizes.map((size) => (
          <div key={size.key} style={styles.sizeColumn}>
            <span style={styles.sizeLabel}>{size.label}</span>
            <button 
              className="burger-size-btn"
              style={styles.priceButton}
              onClick={() => addToCart(product, size.label, size.price)}
              title={`Agregar ${name} ${size.label}`}
            >
              <div className="price-btn-hover">
                <span className="price-text">{formatPrice(size.price)}</span>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  card: {
    padding: '1.5rem',
    borderBottom: '1px solid var(--vak-red)',
    backgroundColor: 'var(--vak-bg)',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: 'var(--vak-red)',
    fontSize: '2.5rem',
    textTransform: 'uppercase',
    letterSpacing: '-1px',
    margin: '0',
  },
  titleBold: {
    fontWeight: 900,
  },
  titleLight: {
    fontWeight: 400,
  },
  tagBadge: {
    backgroundColor: 'var(--vak-red)',
    color: 'white',
    padding: '0.5rem',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    transform: 'rotate(-10deg)',
  },
  description: {
    fontSize: '0.9rem',
    fontWeight: 600,
    marginTop: '1rem',
    marginBottom: '1.5rem',
    lineHeight: '1.4',
    maxWidth: '90%',
  },
  sizesContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  sizeColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    minWidth: '80px',
  },
  sizeLabel: {
    color: 'var(--vak-red)',
    fontSize: '0.8rem',
    fontWeight: 800,
    marginBottom: '0.5rem',
  },
  priceButton: {
    border: '1px solid var(--vak-red)',
    borderRadius: '30px',
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: 'var(--vak-dark)',
    fontWeight: '700',
    width: '100%',
    transition: 'all 0.2s',
  }
};

export default BurgerCard;
