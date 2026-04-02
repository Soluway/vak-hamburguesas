import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.content}>
        <div style={styles.column}>
          <span style={styles.title}>CONTACTO</span>
          <span style={styles.text}>11 3588-9974</span>
        </div>
        <div style={styles.column}>
          <span style={styles.title}>INSTAGRAM</span>
          <span style={styles.text}>VA.K.BURGERS</span>
        </div>
      </div>
      <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', opacity: 0.8 }}>
        <Link to="/admin" style={{ color: 'white', textDecoration: 'underline' }}>Panel de Administración</Link>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: 'var(--vak-red)',
    color: 'var(--vak-white)',
    padding: '2rem 1rem 1rem 1rem',
    marginTop: 'auto',
  },
  content: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: 400,
    letterSpacing: '1px',
  },
  text: {
    fontSize: '1rem',
    fontWeight: 700,
  }
};

export default Footer;
