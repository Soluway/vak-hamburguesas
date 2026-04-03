import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const LoginView = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = login(username, password);
    if (ok) {
      navigate('/admin');
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <Lock size={28} color="var(--vak-red)" />
        </div>
        <h2 style={styles.title}>Acceso Administrador</h2>
        <p style={styles.subtitle}>Panel VAK Hamburguesas</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              style={styles.input}
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              style={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.btn}>Ingresar</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
    padding: '2rem 1rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '360px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    textAlign: 'center',
  },
  iconWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(234,29,44,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 900,
    color: 'var(--vak-dark)',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#999',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    textAlign: 'left',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--vak-red)',
    paddingLeft: '4px',
  },
  input: {
    padding: '0.7rem 1rem',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
    fontSize: '1rem',
    fontFamily: 'inherit',
    color: 'var(--vak-dark)',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  error: {
    color: 'var(--vak-red)',
    fontSize: '0.85rem',
    fontWeight: 600,
    textAlign: 'center',
  },
  btn: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    backgroundColor: 'var(--vak-red)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

export default LoginView;
