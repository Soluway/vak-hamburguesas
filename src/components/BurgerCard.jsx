import React from 'react';
import { useCart } from '../context/CartContext';

const TAG_COLORS = {
  VEGGIE:   { bg: '#2e7d32', color: '#fff' },
  BACON:    { bg: '#6d1a1a', color: '#fff' },
  PICANTE:  { bg: '#e65100', color: '#fff' },
  ESPECIAL: { bg: '#1565c0', color: '#fff' },
  NUEVO:    { bg: '#6a1b9a', color: '#fff' },
  DEFAULT:  { bg: 'var(--vak-dark)', color: '#fff' },
};

const tagStyle = (tag) => {
  const c = TAG_COLORS[tag] || TAG_COLORS.DEFAULT;
  return {
    backgroundColor: c.bg,
    color: c.color,
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: 800,
    letterSpacing: '0.5px',
    display: 'inline-block',
  };
};

const BurgerCard = ({ product }) => {
  const { name, desc, prices, tags } = product;
  const { addToCart } = useCart();

  const firstLetter = name.charAt(0);
  const restName = name.substring(1);

  const sizes = Object.entries(prices || {})
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({ label: key.toUpperCase(), key, price: value }));

  const formatPrice = (price) => `$${price.toLocaleString('es-AR')}`;
  const activeTags = (tags || []).filter(Boolean);

  return (
    <div style={styles.card}>
      <div style={styles.topSection}>
        <div style={styles.textColumn}>
          <div style={styles.headerRow}>
            <h2 style={styles.title}>
              <span style={styles.titleBold}>{firstLetter}</span>
              <span style={styles.titleLight}>{restName}</span>
            </h2>
            {activeTags.includes('VEGGIE') && (
              <div style={styles.veggieBadge}>VEGGIE</div>
            )}
          </div>

          <p style={styles.description}>{desc}</p>

          {activeTags.filter(t => t !== 'VEGGIE').length > 0 && (
            <div style={styles.tagsRow}>
              {activeTags.filter(t => t !== 'VEGGIE').map(tag => (
                <span key={tag} style={tagStyle(tag)}>{tag}</span>
              ))}
            </div>
          )}
        </div>

        {product.image && (
          <div style={styles.imageColumn}>
            <img src={product.image} alt={name} style={styles.burgerImage} />
          </div>
        )}
      </div>

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
  topSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
  },
  imageColumn: {
    width: '140px',
    height: '100px',
    flexShrink: 0,
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  burgerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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
    margin: 0,
  },
  titleBold:  { fontWeight: 900 },
  titleLight: { fontWeight: 400 },
  veggieBadge: {
    backgroundColor: TAG_COLORS.VEGGIE.bg,
    color: TAG_COLORS.VEGGIE.color,
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
    flexShrink: 0,
  },
  description: {
    fontSize: '0.9rem',
    fontWeight: 600,
    marginTop: '1rem',
    marginBottom: '0.75rem',
    lineHeight: '1.4',
  },
  tagsRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  sizesContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
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
    fontWeight: 700,
    width: '100%',
    transition: 'all 0.2s',
  },
};

export default BurgerCard;
