import React, { useState, useEffect } from 'react';
import BurgerCard from '../components/BurgerCard';
import { getMenuData } from '../data/menu';

const ClientView = () => {
  const [menu, setMenu] = useState([]);
  const [activeTag, setActiveTag] = useState('TODOS');

  useEffect(() => {
    const storedMenu = getMenuData();
    setMenu(storedMenu.filter(item => !item.paused));
  }, []);

  // Recolectar todos los tags únicos del menú
  const allTags = ['TODOS', ...Array.from(
    new Set(menu.flatMap(item => item.tags || []).filter(Boolean))
  )];

  const filtered = activeTag === 'TODOS'
    ? menu
    : menu.filter(item => (item.tags || []).includes(activeTag));

  return (
    <div style={styles.page}>

      {/* Banner */}
      <div style={styles.bannerContainer}>
        <div style={styles.banner}>
          <div style={styles.bannerTextContainer}>
            <div style={styles.bannerTitleRow}>
              <span style={styles.bannerTitle}>MENÚ</span>
              <span style={styles.bannerSubtitle}>ENERO</span>
            </div>
            <div style={styles.bannerSeparator}></div>
            <div style={styles.bannerPapas}>
              TODAS LAS<br />
              HAMBURGUESAS<br />
              <span style={{ fontWeight: 800 }}>INCLUYEN PAPAS</span>
            </div>
          </div>
          <div style={styles.bannerImageContainer}>
            {menu.length > 0 && menu[0].image && (
              <img src={menu[0].image} alt="Promo" style={styles.bannerImage} />
            )}
          </div>
        </div>
      </div>

      {/* Filtro de tags */}
      {allTags.length > 1 && (
        <div style={styles.filterWrapper}>
          <div style={styles.filterScroll}>
            {allTags.map(tag => (
              <button
                key={tag}
                style={activeTag === tag ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de hamburguesas */}
      <div style={styles.menuList}>
        {filtered.map(product => (
          <BurgerCard key={product.id} product={product} />
        ))}
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'gray' }}>
            No hay hamburguesas disponibles en este momento.
          </p>
        )}
      </div>

    </div>
  );
};

const styles = {
  page: { width: '100%' },
  bannerContainer: { padding: '1rem' },
  banner: {
    backgroundColor: 'var(--vak-red)',
    borderRadius: '15px',
    color: 'white',
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
    height: '180px',
  },
  bannerTextContainer: {
    padding: '1.5rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  bannerTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  bannerTitle:    { fontSize: '2rem', fontWeight: 300, letterSpacing: '1px' },
  bannerSubtitle: { fontSize: '0.9rem', fontWeight: 800 },
  bannerSeparator:{ height: '1px', backgroundColor: 'rgba(255,255,255,0.5)', margin: '0.5rem 0' },
  bannerPapas:    { fontSize: '0.8rem', lineHeight: '1.2' },
  bannerImageContainer: {
    position: 'absolute', right: '-20px', bottom: '-20px',
    width: '60%', height: '150%', zIndex: 1,
  },
  bannerImage: {
    width: '100%', height: '100%', objectFit: 'cover',
    filter: 'drop-shadow(-10px 10px 10px rgba(0,0,0,0.3))',
    transform: 'rotate(-5deg)',
  },

  // Filtro
  filterWrapper: {
    padding: '0 1rem',
    marginBottom: '0.5rem',
    overflow: 'hidden',
  },
  filterScroll: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '6px',
    scrollbarWidth: 'none',
  },
  filterBtn: {
    flexShrink: 0,
    padding: '6px 16px',
    borderRadius: '20px',
    border: '2px solid var(--vak-red)',
    backgroundColor: 'transparent',
    color: 'var(--vak-red)',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: '0.8rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  filterBtnActive: {
    flexShrink: 0,
    padding: '6px 16px',
    borderRadius: '20px',
    border: '2px solid var(--vak-red)',
    backgroundColor: 'var(--vak-red)',
    color: '#fff',
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: '0.8rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  menuList: { display: 'flex', flexDirection: 'column' },
};

export default ClientView;
