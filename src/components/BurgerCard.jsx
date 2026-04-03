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
      {product.image && (
        <div style={styles.imageBackground}>
          <img src={product.image} alt={name} style={styles.burgerImage} />
        </div>
      )}
      
      <div style={styles.contentWrapper}>
        <div style={styles.topSection}>
          <div style={styles.textColumn}>
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
          </div>
        </div>

        <div style={styles.sizesContainer}>
          {sizes.map((size) => (
            <div key={size.key} style={styles.sizeColumn}>
              <button
                className="burger-size-btn"
                style={styles.priceButton}
                onClick={() => addToCart(product, size.label, size.price)}
                title={`Agregar ${name} ${size.label}`}
              >
                <div className="price-btn-hover" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.5px' }}>{size.label}</span>
                  <span className="price-text">{formatPrice(size.price)}</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    position: 'relative',
    overflow: 'hidden',
    padding: '1.5rem',
    borderBottom: '1px solid var(--vak-red)',
    backgroundColor: 'var(--vak-bg)',
  },
  imageBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '45%', /* Menos del 50% para que el texto nunca la pise en celulares chicos */
    maxWidth: '280px', /* Tope máximo para PC */
    zIndex: 1,
    clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)',
  },
  burgerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  contentWrapper: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  topSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
    maxWidth: '52%', /* asegurar que el texto llegue solo un poco más allá del centro */
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
    textShadow: '1px 1px 0px var(--vak-bg), -1px -1px 0px var(--vak-bg), 1px -1px 0px var(--vak-bg), -1px 1px 0px var(--vak-bg)',
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
    fontWeight: 800,
    marginBottom: '1.25rem',
    lineHeight: '1.4',
    color: 'var(--vak-dark)',
  },
  sizesContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: 'auto',
  },
  sizeColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    minWidth: '80px',
    maxWidth: '130px', /* evita que un botón solitario como el de la Veggie se estire a todo el ancho */
  },
  priceButton: {
    border: '2px solid var(--vak-red)',
    borderRadius: '30px',
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--vak-red)',
    color: 'white',
    fontWeight: 800,
    width: '100%',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
  },
};

export default BurgerCard;
