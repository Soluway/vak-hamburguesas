import React, { useState, useEffect, useRef } from 'react';
import { getMenuData, saveMenuData, getSettings, saveSettings } from '../data/menu';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash, Pause, Play, Plus, Save, Upload, Download, Image as ImageIcon, Edit2, X, Check, LogOut, KeyRound } from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const PRESET_TAGS = ['VEGGIE', 'BACON', 'PICANTE', 'ESPECIAL', 'NUEVO'];

const vak = Swal.mixin({
  confirmButtonColor: '#ea1d2c',
  cancelButtonColor: '#1f1f1f',
  borderRadius: '16px',
  customClass: { popup: 'vak-swal' },
});

const AdminView = () => {
  const { logout, changeCredentials } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pedidos');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [newVarName, setNewVarName] = useState('');
  const [newVarPrice, setNewVarPrice] = useState('');
  const [isAddingVar, setIsAddingVar] = useState(false);

  // Credenciales
  const [credsForm, setCredsForm] = useState({ currentPassword: '', newUsername: '', newPassword: '', confirm: '' });
  const [credsMsg, setCredsMsg] = useState(null);

  // Configuración
  const [settings, setSettings] = useState(getSettings);
  const [settingsMsg, setSettingsMsg] = useState(null);
  const [geocodingStore, setGeocodingStore] = useState(false);
  const [gpsStore, setGpsStore] = useState(false);

  // Auto-save menú
  const [saveStatus, setSaveStatus] = useState(''); // '' | 'guardando' | 'guardado'
  const isFirstRender = useRef(true);

  useEffect(() => {
    const loadOrders = () => {
      const stored = JSON.parse(localStorage.getItem('vak_orders') || '[]');
      setOrders(stored);
    };
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    setMenuItems(getMenuData());
    return () => clearInterval(interval);
  }, []);

  // Auto-save con debounce cada vez que cambia el menú
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setSaveStatus('guardando');
    const timer = setTimeout(() => {
      saveMenuData(menuItems);
      setSaveStatus('guardado');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 800);
    return () => clearTimeout(timer);
  }, [menuItems]);

  // ── Pedidos ────────────────────────────────────────────────
  const handleStatusChange = (orderId, newStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem('vak_orders', JSON.stringify(updated));
  };

  // ── Menú ──────────────────────────────────────────────────
  const handleItemChange = (id, field, value) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handlePriceChange = (id, key, newPrice) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, prices: { ...item.prices, [key]: newPrice === '' ? null : Number(newPrice) } };
    }));
  };

  const addVariation = (id) => {
    if (!newVarName || !newVarPrice) return;
    const cleanKey = newVarName.trim().toLowerCase();
    setMenuItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, prices: { ...item.prices, [cleanKey]: Number(newVarPrice) } };
    }));
    setNewVarName(''); setNewVarPrice(''); setIsAddingVar(false);
  };

  const removeVariation = (id, keyToRemove) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newPrices = { ...item.prices };
      delete newPrices[keyToRemove];
      return { ...item, prices: newPrices };
    }));
  };

  const toggleTag = (id, tag) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const tags = item.tags || [];
      const next = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
      return { ...item, tags: next };
    }));
  };

  const togglePause = (id) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, paused: !item.paused } : item));
  };

  const deleteItem = async (id) => {
    const item = menuItems.find(i => i.id === id);
    const result = await vak.fire({
      title: '¿Eliminar hamburguesa?',
      text: `"${item?.name}" se eliminará del menú.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      setMenuItems(prev => prev.filter(i => i.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const addNewItem = () => {
    const newItem = {
      id: Date.now(),
      name: 'NUEVA — H',
      desc: 'Ingredientes y descripción...',
      prices: { simple: 0 },
      image: '',
      tags: [],
      paused: true,
    };
    setMenuItems(prev => [newItem, ...prev]);
    setEditingId(newItem.id);
    setActiveTab('menu');
  };


  // ── Imágenes ──────────────────────────────────────────────
  const handleImageUpload = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scale = MAX_WIDTH / img.width;
        canvas.width = scale < 1 ? MAX_WIDTH : img.width;
        canvas.height = scale < 1 ? img.height * scale : img.height;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        handleItemChange(id, 'image', canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ── Excel ─────────────────────────────────────────────────
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(menuItems.map(item => ({
      ID: item.id,
      Nombre: item.name,
      Descripción: item.desc,
      Variaciones: Object.entries(item.prices).filter(([, v]) => v !== null).map(([k, v]) => `${k}:${v}`).join(';'),
      Etiquetas: (item.tags || []).join(','),
      Imagen_Referencia: item.image ? 'Base64/URL adjunta' : '',
      Pausada: item.paused ? 'Si' : 'No',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Menu_VAK');
    XLSX.writeFile(wb, 'Menu_Vak.xlsx');
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      setMenuItems(data.map(row => {
        const parsedPrices = {};
        if (row.Variaciones) {
          String(row.Variaciones).split(';').forEach(p => {
            const [k, v] = p.split(':');
            if (k && v) parsedPrices[k.trim().toLowerCase()] = Number(v);
          });
        }
        return {
          id: row.ID || Date.now() + Math.random(),
          name: row.Nombre || 'Sin Nombre',
          desc: row.Descripción || '',
          prices: Object.keys(parsedPrices).length > 0 ? parsedPrices : { simple: 0 },
          tags: row.Etiquetas ? String(row.Etiquetas).split(',').map(t => t.trim()).filter(Boolean) : [],
          image: '',
          paused: String(row.Pausada).toLowerCase() === 'si',
        };
      }));
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  // ── Credenciales ──────────────────────────────────────────
  const handleCredsChange = (e) => {
    setCredsForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCredsMsg(null);
  };

  const handleSaveCreds = (e) => {
    e.preventDefault();
    if (credsForm.newPassword !== credsForm.confirm) { setCredsMsg({ ok: false, text: 'Las contraseñas nuevas no coinciden.' }); return; }
    if (!credsForm.newUsername || !credsForm.newPassword) { setCredsMsg({ ok: false, text: 'Completá todos los campos.' }); return; }
    const ok = changeCredentials(credsForm.currentPassword, credsForm.newUsername, credsForm.newPassword);
    if (ok) { setCredsMsg({ ok: true, text: '¡Credenciales actualizadas!' }); setCredsForm({ currentPassword: '', newUsername: '', newPassword: '', confirm: '' }); }
    else setCredsMsg({ ok: false, text: 'La contraseña actual es incorrecta.' });
  };

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  // ── Configuración ─────────────────────────────────────────
  const geocodeStoreAddress = async () => {
    if (!settings.storeAddress?.trim()) return;
    setGeocodingStore(true);
    try {
      const query = encodeURIComponent(settings.storeAddress);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await res.json();
      if (!data.length) {
        vak.fire({ icon: 'error', title: 'Dirección no encontrada', text: 'Intentá ser más específico.', confirmButtonText: 'OK' });
        return;
      }
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      const addr = data[0].address || {};
      const zone = addr.suburb || addr.neighbourhood || addr.city_district || addr.town || addr.city || 'la zona';
      const updated = { ...settings, storeCoords: coords, storeZone: zone };
      setSettings(updated);
      saveSettings(updated);
      setSettingsMsg('¡Dirección del local verificada y guardada!');
      setTimeout(() => setSettingsMsg(null), 3000);
    } catch {
      vak.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo verificar la dirección.', confirmButtonText: 'OK' });
    } finally {
      setGeocodingStore(false);
    }
  };

  const useGPSStore = () => {
    if (!navigator.geolocation) {
      vak.fire({ icon: 'error', title: 'Sin GPS', text: 'Tu dispositivo no soporta geolocalización.', confirmButtonText: 'OK' });
      return;
    }
    setGpsStore(true);
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
          const road = addr.road || addr.pedestrian || '';
          const number = addr.house_number ? ` ${addr.house_number}` : '';
          const displayAddr = road ? `${road}${number}` : data.display_name?.split(',')[0] || '';
          const zone = addr.suburb || addr.neighbourhood || addr.city_district || addr.town || addr.city || 'la zona';
          const coords = { lat, lng };
          const updated = { ...settings, storeAddress: displayAddr, storeCoords: coords, storeZone: zone };
          setSettings(updated);
          saveSettings(updated);
          setSettingsMsg(`¡Ubicación del local guardada! Zona: ${zone}`);
          setTimeout(() => setSettingsMsg(null), 3000);
        } catch {
          vak.fire({ icon: 'error', title: 'Error', text: 'No se pudo obtener la ubicación.', confirmButtonText: 'OK' });
        } finally {
          setGpsStore(false);
        }
      },
      (err) => {
        setGpsStore(false);
        const msgs = { 1: 'Permiso denegado. Activá el GPS.', 2: 'No se pudo obtener la ubicación.', 3: 'Tiempo de espera agotado.' };
        vak.fire({ icon: 'error', title: 'Error de GPS', text: msgs[err.code] || 'Error desconocido.', confirmButtonText: 'OK' });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveSettings(settings);
    setSettingsMsg('¡Configuración guardada!');
    setTimeout(() => setSettingsMsg(null), 2500);
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={styles.adminPage}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: 'var(--vak-red)' }}>Panel VAK</h1>
        <button style={styles.btnLogout} onClick={handleLogout}>
          <LogOut size={16} /> Salir
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'pedidos', label: `Pedidos (${orders.filter(o => o.status === 'PENDIENTE').length})` },
          { id: 'menu',    label: 'Editor de Menú' },
          { id: 'config',  label: 'Configuración' },
        ].map(tab => (
          <button
            key={tab.id}
            style={activeTab === tab.id ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PEDIDOS ── */}
      {activeTab === 'pedidos' && (
        <div style={styles.contentArea}>
          {orders.length === 0 ? (
            <p style={{ color: 'gray', textAlign: 'center', marginTop: '2rem' }}>No hay pedidos recientes.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} style={styles.orderCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Pedido #{order.id.toString().slice(-4)}</strong>
                  <span style={styles.statusBadge(order.status)}>{order.status}</span>
                </div>
                <div style={{ margin: '10px 0', fontSize: '0.9rem' }}>
                  {order.items.map(i => (
                    <div key={i.tempId}>🔹 {i.quantity}x {i.name} ({i.size})</div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--vak-red)', fontSize: '1.2rem' }}>${order.total.toLocaleString('es-AR')}</strong>
                  {order.status === 'PENDIENTE' && (
                    <button style={styles.btnUniform} onClick={() => handleStatusChange(order.id, 'COMPLETADO')}>
                      <Check size={16} /> Marcar Listo
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MENU ── */}
      {activeTab === 'menu' && (
        <div style={styles.contentArea}>

          {/* Botón agregar prominente */}
          <button style={styles.btnAddBig} onClick={addNewItem}>
            <Plus size={20} /> Agregar Nueva Hamburguesa
          </button>

          {/* Herramientas secundarias */}
          <div style={styles.topTools}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button style={styles.btnUniform} onClick={exportToExcel}><Download size={16} /> Exportar Excel</button>
              <label style={styles.btnUniformUpload}>
                <Upload size={16} /> Importar Excel
                <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={importFromExcel} />
              </label>
            </div>
            <span style={styles.saveIndicator}>
              {saveStatus === 'guardando' && '⏳ Guardando...'}
              {saveStatus === 'guardado' && '✓ Guardado'}
            </span>
          </div>

          <div style={styles.infoBox}>Los cambios se guardan automáticamente. Tocá ✏️ en cada tarjeta para editar.</div>

          {/* Cards de hamburguesas */}
          {menuItems.map(item => {
            const isEditing = editingId === item.id;
            return (
              <div key={item.id} style={{ ...styles.menuEditCard, opacity: item.paused ? 0.6 : 1 }}>

                {/* Header: nombre + botones — layout diferente en edit vs view */}
                {isEditing ? (
                  // EDIT MODE: nombre arriba full-width, botones abajo
                  <div style={{ marginBottom: '1rem' }}>
                    <input
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      style={styles.inputName}
                      placeholder="Ej: NUEVA BURGER"
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => setEditingId(null)} className="admin-icon-btn" style={styles.iconBtn} title="Cerrar edición">
                        <Check size={20} color="#333" />
                      </button>
                      <button onClick={() => togglePause(item.id)} className="admin-icon-btn" style={styles.iconBtn} title={item.paused ? 'Reanudar' : 'Pausar'}>
                        {item.paused ? <Play size={20} color="#666" /> : <Pause size={20} color="#666" />}
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="admin-icon-btn" style={styles.iconBtn} title="Eliminar">
                        <Trash size={20} color="#999" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // VIEW MODE: nombre y botones en fila
                  <div style={styles.menuHeader}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', flex: 1 }}>{item.name}</h2>
                    <div style={styles.actions}>
                      <button onClick={() => setEditingId(item.id)} className="admin-icon-btn" style={styles.iconBtn} title="Editar">
                        <Edit2 size={20} color="#333" />
                      </button>
                      <button onClick={() => togglePause(item.id)} className="admin-icon-btn" style={styles.iconBtn} title={item.paused ? 'Reanudar' : 'Pausar'}>
                        {item.paused ? <Play size={20} color="#666" /> : <Pause size={20} color="#666" />}
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="admin-icon-btn" style={styles.iconBtn} title="Eliminar">
                        <Trash size={20} color="#999" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Descripción */}
                {isEditing ? (
                  <textarea
                    value={item.desc}
                    onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)}
                    style={styles.inputDesc}
                    placeholder="Describe los ingredientes..."
                  />
                ) : (
                  <p style={{ margin: '0 0 0.75rem 0', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.desc}</p>
                )}

                {/* Tags */}
                {isEditing ? (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--vak-red)', marginBottom: '6px' }}>ETIQUETAS:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {PRESET_TAGS.map(tag => {
                        const active = (item.tags || []).includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTag(item.id, tag)}
                            style={{
                              padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                              border: '2px solid var(--vak-dark)', cursor: 'pointer', fontFamily: 'inherit',
                              backgroundColor: active ? 'var(--vak-dark)' : 'transparent',
                              color: active ? '#fff' : 'var(--vak-dark)',
                            }}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (item.tags || []).length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {(item.tags || []).map(tag => (
                      <span key={tag} style={{ backgroundColor: 'var(--vak-dark)', color: '#fff', padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>{tag}</span>
                    ))}
                  </div>
                )}

                {/* Imagen */}
                {isEditing ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                    <label className="admin-icon-btn" style={styles.fileUploadContainer}>
                      <ImageIcon size={18} color="#555" /> Subir Foto
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(item.id, e)} />
                    </label>
                    {item.image && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={item.image} alt="preview" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        <span style={{ color: 'green', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Imagen cargada</span>
                      </div>
                    )}
                  </div>
                ) : (
                  item.image && (
                    <div style={{ marginBottom: '1rem' }}>
                      <img src={item.image} alt="burger" style={{ width: '100px', height: '70px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    </div>
                  )
                )}

                {/* Precios */}
                <div style={styles.priceInputsContainer}>
                  <p style={{ width: '100%', margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 'bold' }}>Variaciones y Precios:</p>

                  {Object.entries(item.prices).map(([size, value]) => (
                    <div key={size} style={styles.inputGroupWrapper}>
                      {isEditing ? (
                        <div style={styles.inputGroup}>
                          <label style={styles.sizeLabel}>{size.toUpperCase()}</label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                              type="number"
                              placeholder="Ej: 8000"
                              value={value === null ? '' : value}
                              onChange={(e) => handlePriceChange(item.id, size, e.target.value)}
                              style={{ ...styles.priceInput, paddingRight: '40px' }}
                            />
                            <button className="admin-icon-btn" style={styles.removeSizeBtn} onClick={() => removeVariation(item.id, size)} title="Borrar variación">
                              <X size={14} color="#999" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={styles.viewSizePill}>
                          <span style={{ fontWeight: 800 }}>{size.toUpperCase()}</span>
                          <span>${value?.toLocaleString('es-AR')}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {isEditing && (
                    <div style={{ marginTop: '12px', width: '100%' }}>
                      {isAddingVar ? (
                        <div style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '10px' }}>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', fontWeight: 'bold' }}>NUEVA VARIACIÓN:</p>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ color: 'var(--vak-red)', fontSize: '0.7rem', fontWeight: 'bold' }}>VARIANTE</label>
                              <input type="text" placeholder="Ej: COMBO" value={newVarName} onChange={(e) => setNewVarName(e.target.value)} style={{ ...styles.varInput, borderRadius: '10px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ color: 'var(--vak-red)', fontSize: '0.7rem', fontWeight: 'bold' }}>PRECIO</label>
                              <input type="number" placeholder="Ej: 5000" value={newVarPrice} onChange={(e) => setNewVarPrice(e.target.value)} style={{ ...styles.varInputSmall, borderRadius: '10px' }} />
                            </div>
                            <button className="admin-icon-btn" onClick={() => addVariation(item.id)} style={{ ...styles.addVarBtn, borderRadius: '10px' }}><Check size={20} color="#333" /></button>
                            <button className="admin-icon-btn" onClick={() => { setIsAddingVar(false); setNewVarName(''); setNewVarPrice(''); }} style={{ ...styles.addVarBtn, borderRadius: '10px' }}><X size={20} color="#999" /></button>
                          </div>
                        </div>
                      ) : (
                        <button className="admin-icon-btn" onClick={() => setIsAddingVar(true)} style={{ backgroundColor: '#fff', border: 'none', borderRadius: '10px', height: '40px', padding: '0 1rem', display: 'flex', alignItems: 'center', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}>
                          <Plus size={16} style={{ marginRight: '6px' }} /> Agregar Variación
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CONFIGURACIÓN ── */}
      {activeTab === 'config' && (
        <div style={styles.contentArea}>

          {/* Zona de envío */}
          <div style={styles.configCard}>
            <h3 style={{ marginBottom: '0.25rem', color: 'var(--vak-dark)' }}>📍 Zona de envío</h3>
            <p style={{ fontSize: '0.8rem', color: 'gray', marginBottom: '1rem' }}>
              Definí la dirección del local y el radio de cobertura. Los clientes fuera de esa zona no podrán pedir envío.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '360px' }}>
              <div style={styles.credField}>
                <label style={styles.credLabel}>Dirección del local</label>
                {/* GPS button */}
                <button
                  type="button"
                  onClick={useGPSStore}
                  disabled={gpsStore}
                  style={{ ...styles.btnUniform, width: '100%', justifyContent: 'center', marginBottom: '8px', opacity: gpsStore ? 0.6 : 1 }}
                >
                  📍 {gpsStore ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={settings.storeAddress || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, storeAddress: e.target.value }))}
                    style={{ ...styles.credInput, flex: 1 }}
                    placeholder="Ej: Av. Calchaquí 1000, Bernal"
                    onKeyDown={(e) => e.key === 'Enter' && geocodeStoreAddress()}
                  />
                  <button
                    type="button"
                    onClick={geocodeStoreAddress}
                    disabled={geocodingStore || !settings.storeAddress?.trim()}
                    style={{ ...styles.btnUniform, flexShrink: 0, opacity: geocodingStore ? 0.6 : 1 }}
                  >
                    {geocodingStore ? '...' : 'Verificar'}
                  </button>
                </div>
                {settings.storeCoords && settings.storeAddress && (
                  <span style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: 600 }}>
                    ✓ Zona detectada: <strong>{settings.storeZone}</strong> ({settings.storeCoords.lat.toFixed(4)}, {settings.storeCoords.lng.toFixed(4)})
                  </span>
                )}
              </div>

              <div style={styles.credField}>
                <label style={styles.credLabel}>Radio de cobertura (km)</label>
                <input
                  type="number"
                  value={settings.deliveryRadiusKm ?? 4}
                  onChange={(e) => setSettings(prev => ({ ...prev, deliveryRadiusKm: Number(e.target.value) }))}
                  style={styles.credInput}
                  placeholder="Ej: 4"
                  min="1"
                  max="30"
                />
                <span style={{ fontSize: '0.75rem', color: 'gray' }}>Radio en kilómetros desde el local.</span>
              </div>

              <div style={styles.credField}>
                <label style={styles.credLabel}>Costo de envío ($)</label>
                <input
                  type="number"
                  value={settings.deliveryPrice ?? 0}
                  onChange={(e) => setSettings(prev => ({ ...prev, deliveryPrice: Number(e.target.value) }))}
                  style={styles.credInput}
                  placeholder="Ej: 2000"
                  min="0"
                />
                <span style={{ fontSize: '0.75rem', color: 'gray' }}>Ponelo en 0 si el envío es gratis.</span>
              </div>

              {settingsMsg && <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2e7d32' }}>{settingsMsg}</p>}
              <button type="button" onClick={handleSaveSettings} style={styles.btnPrimary}>
                <Save size={16} /> Guardar configuración
              </button>
            </div>
          </div>

          {/* Credenciales */}
          <div style={styles.configCard}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--vak-dark)' }}>🔑 Credenciales de acceso</h3>
            <form onSubmit={handleSaveCreds} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '320px' }}>
              <div style={styles.credField}>
                <label style={styles.credLabel}>Contraseña actual</label>
                <input type="password" name="currentPassword" value={credsForm.currentPassword} onChange={handleCredsChange} style={styles.credInput} placeholder="••••••••" autoComplete="current-password" />
              </div>
              <div style={styles.credField}>
                <label style={styles.credLabel}>Nuevo usuario</label>
                <input type="text" name="newUsername" value={credsForm.newUsername} onChange={handleCredsChange} style={styles.credInput} placeholder="admin" autoComplete="username" />
              </div>
              <div style={styles.credField}>
                <label style={styles.credLabel}>Nueva contraseña</label>
                <input type="password" name="newPassword" value={credsForm.newPassword} onChange={handleCredsChange} style={styles.credInput} placeholder="••••••••" autoComplete="new-password" />
              </div>
              <div style={styles.credField}>
                <label style={styles.credLabel}>Confirmar contraseña</label>
                <input type="password" name="confirm" value={credsForm.confirm} onChange={handleCredsChange} style={styles.credInput} placeholder="••••••••" autoComplete="new-password" />
              </div>
              {credsMsg && <p style={{ fontSize: '0.85rem', fontWeight: 600, color: credsMsg.ok ? 'green' : 'var(--vak-red)' }}>{credsMsg.text}</p>}
              <button type="submit" style={styles.btnPrimary}>
                <Save size={16} /> Guardar credenciales
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};

const styles = {
  adminPage: { padding: '1.5rem 1rem', backgroundColor: '#fff', minHeight: '80vh' },

  tabs: { display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' },
  tab: { padding: '0.5rem 0.9rem', borderRadius: '10px', backgroundColor: '#eee', color: '#333', fontWeight: 'bold', fontFamily: 'inherit', fontSize: '0.85rem' },
  activeTab: { padding: '0.5rem 0.9rem', borderRadius: '10px', backgroundColor: 'var(--vak-red)', color: 'white', fontWeight: 'bold', fontFamily: 'inherit', fontSize: '0.85rem' },

  contentArea: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },

  topTools: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
  infoBox: { fontSize: '0.8rem', color: 'gray', fontStyle: 'italic' },
  saveIndicator: { fontSize: '0.85rem', fontWeight: 700, color: '#2e7d32', display: 'flex', alignItems: 'center' },

  btnAddBig: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    backgroundColor: 'var(--vak-red)', color: 'white', padding: '1rem',
    borderRadius: '12px', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
    fontSize: '1rem', border: 'none', width: '100%',
  },
  btnUniform: {
    display: 'flex', alignItems: 'center', gap: '5px',
    backgroundColor: 'var(--vak-dark)', color: 'white', padding: '0.6rem 1rem',
    borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit', border: 'none',
  },
  btnUniformUpload: {
    display: 'flex', alignItems: 'center', gap: '5px',
    backgroundColor: 'var(--vak-dark)', color: 'white', padding: '0.6rem 1rem',
    borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit',
  },
  btnPrimary: {
    display: 'flex', alignItems: 'center', gap: '5px',
    backgroundColor: 'var(--vak-red)', color: 'white', padding: '0.6rem 1rem',
    borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit', border: 'none',
  },
  btnLogout: {
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: '#f0f0f0', color: '#555', padding: '0.5rem 0.9rem',
    borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', border: 'none',
  },

  orderCard: {
    border: '1px solid #eee', borderLeft: '4px solid var(--vak-red)',
    padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  statusBadge: (status) => ({
    backgroundColor: status === 'COMPLETADO' ? 'green' : 'orange',
    color: 'white', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold',
  }),

  menuEditCard: {
    padding: '1.25rem', borderRadius: '12px', backgroundColor: 'var(--vak-bg)',
    color: 'var(--vak-dark)', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', border: '1px solid var(--vak-red)',
  },
  menuHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  inputName: {
    fontSize: '1.1rem', fontWeight: 900, border: 'none', padding: '0.6rem',
    borderRadius: '10px', width: '100%', color: 'var(--vak-dark)', fontFamily: 'inherit',
  },
  iconBtn: {
    padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', border: 'none', borderRadius: '10px', marginLeft: '6px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.15)', cursor: 'pointer', width: '38px', height: '38px',
    flexShrink: 0,
  },
  actions: { display: 'flex', flexShrink: 0 },

  inputDesc: {
    width: '100%', padding: '0.6rem', border: 'none', borderRadius: '10px',
    marginBottom: '10px', fontFamily: 'inherit', fontWeight: 600, color: 'var(--vak-dark)',
    resize: 'none', height: '60px',
  },
  fileUploadContainer: {
    display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#fff',
    padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold',
    cursor: 'pointer', color: '#555', boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
  },
  priceInputsContainer: {
    display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
    backgroundColor: 'rgba(0,0,0,0.07)', padding: '1rem', borderRadius: '10px',
  },
  inputGroupWrapper: { display: 'flex', alignItems: 'flex-end', position: 'relative' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  sizeLabel: { color: 'var(--vak-red)', fontSize: '0.75rem', fontWeight: 'bold' },
  priceInput: { padding: '0.6rem', border: 'none', borderRadius: '10px', fontWeight: 'bold', width: '110px', color: 'var(--vak-dark)' },
  removeSizeBtn: {
    backgroundColor: 'transparent', color: '#999', borderRadius: '50%',
    width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', position: 'absolute', right: '5px', cursor: 'pointer',
  },
  viewSizePill: {
    backgroundColor: 'white', color: 'var(--vak-red)', padding: '0.4rem 0.8rem',
    borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center',
  },
  varInput: { padding: '0.6rem', border: 'none', fontWeight: 'bold', width: '120px', color: 'var(--vak-dark)', height: '40px' },
  varInputSmall: { padding: '0.6rem', border: 'none', fontWeight: 'bold', width: '90px', color: 'var(--vak-dark)', height: '40px' },
  addVarBtn: { backgroundColor: '#fff', border: 'none', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' },

  configCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' },
  credField: { display: 'flex', flexDirection: 'column', gap: '5px' },
  credLabel: { fontSize: '0.8rem', fontWeight: 700, color: 'var(--vak-red)', paddingLeft: '4px' },
  credInput: { padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid #e0e0e0', fontSize: '0.95rem', fontFamily: 'inherit', color: 'var(--vak-dark)', outline: 'none' },
};

export default AdminView;
