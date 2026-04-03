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

const TagPill = ({ tag }) => {
  const c = TAG_COLORS[tag] || TAG_COLORS.DEFAULT;
  return (
    <span style={{
      backgroundColor: c.bg,
      color: c.color,
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '0.65rem',
      fontWeight: 800,
      letterSpacing: '0.5px',
      whiteSpace: 'nowrap',
    }}>
      {tag}
    </span>
  );
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

      {/* Título + tags en la misma fila */}
      <div style={styles.headerRow}>
        <h2 style={styles.title}>
          <span style={styles.titleBold}>{firstLetter}</span>
          <span style={styles.titleLight}>{restName}</span>
        </h2>
        {activeTags.length > 0 && (
          <div style={styles.tagsRow}>
            {activeTags.map(tag => <TagPill key={tag} tag={tag} />)}
          </div>
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
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '0.75rem',
  },
  title: {
    color: 'var(--vak-red)',
    fontSize: '2.5rem',
    textTransform: 'uppercase',
    letterSpacing: '-1px',
    margin: 0,
    lineHeight: 1,
  },
  titleBold:  { fontWeight: 900 },
  titleLight: { fontWeight: 400 },
  tagsRow: {
    display: 'flex',
    gap: '5px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  description: {
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: '1.25rem',
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
    fontWeight: 700,
    width: '100%',
    transition: 'all 0.2s',
  },
};

export default BurgerCard;
