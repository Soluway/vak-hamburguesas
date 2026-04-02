import React, { useState, useEffect } from 'react';
import BurgerCard from '../components/BurgerCard';
// We fetch data dynamically now
import { getMenuData } from '../data/menu';

const ClientView = () => {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    // Only load items that are NOT paused
    const storedMenu = getMenuData();
    const activeMenu = storedMenu.filter(item => !item.paused);
    setMenu(activeMenu);
  }, []);

  return (
    <div style={styles.page}>
      
      {/* Banner Superior Rojo */}
      <div style={styles.bannerContainer}>
        <div style={styles.banner}>
          <div style={styles.bannerTextContainer}>
            <div style={styles.bannerTitleRow}>
              <span style={styles.bannerTitle}>MENÚ</span>
              <span style={styles.bannerSubtitle}>ENERO</span>
            </div>
            <div style={styles.bannerSeparator}></div>
            <div style={styles.bannerPapas}>
              TODAS LAS<br/>
              HAMBURGUESAS<br/>
              <span style={{fontWeight: 800}}>INCLUYEN PAPAS</span>
            </div>
          </div>
          <div style={styles.bannerImageContainer}>
            {menu.length > 0 && (
               <img 
                 src={menu[0].image} 
                 alt="Promo Hamburguesa" 
                 style={styles.bannerImage}
               />
            )}
          </div>
        </div>
      </div>

      {/* Lista de Hamburguesas */}
      <div style={styles.menuList}>
        {menu.map(product => (
          <BurgerCard key={product.id} product={product} />
        ))}
        {menu.length === 0 && (
          <p style={{textAlign: 'center', marginTop: '2rem', color: 'gray'}}>No hay hamburguesas disponibles en este momento.</p>
        )}
      </div>
      
    </div>
  );
};

const styles = {
  page: {
    width: '100%',
  },
  bannerContainer: {
    padding: '1rem',
  },
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
  bannerTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  bannerTitle: {
    fontSize: '2rem',
    fontWeight: 300,
    letterSpacing: '1px',
  },
  bannerSubtitle: {
    fontSize: '0.9rem',
    fontWeight: 800,
  },
  bannerSeparator: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.5)',
    margin: '0.5rem 0',
  },
  bannerPapas: {
    fontSize: '0.8rem',
    lineHeight: '1.2',
  },
  bannerImageContainer: {
    position: 'absolute',
    right: '-20px',
    bottom: '-20px',
    width: '60%',
    height: '150%',
    zIndex: 1,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'drop-shadow(-10px 10px 10px rgba(0,0,0,0.3))',
    transform: 'rotate(-5deg)',
  },
  menuList: {
    display: 'flex',
    flexDirection: 'column',
  }
};

export default ClientView;
