import React, { useState, useEffect } from 'react';
import { getMenuData, saveMenuData } from '../data/menu';
import { Trash, Pause, Play, Plus, Save, Upload, Download, Image as ImageIcon, Edit2, X, Check } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminView = () => {
  const [activeTab, setActiveTab] = useState('pedidos'); 
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrice, setNewVarPrice] = useState('');
  const [isAddingVar, setIsAddingVar] = useState(false);

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

  const handleStatusChange = (orderId, newStatus) => {
    const updated = orders.map(o => o.id === orderId ? {...o, status: newStatus} : o);
    setOrders(updated);
    localStorage.setItem('vak_orders', JSON.stringify(updated));
  };
  
  const handleItemChange = (id, field, value) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handlePriceChange = (id, key, newPrice) => {
    setMenuItems(prev => prev.map(item => {
      if(item.id === id) {
        return {
          ...item,
          prices: { ...item.prices, [key]: newPrice === '' ? null : Number(newPrice) }
        }
      }
      return item;
    }));
  };

  const addVariation = (id) => {
    if(!newVarName || !newVarPrice) return;
    const cleanKey = newVarName.trim().toLowerCase();
    
    setMenuItems(prev => prev.map(item => {
      if(item.id === id) {
        return {
          ...item,
          prices: { ...item.prices, [cleanKey]: Number(newVarPrice) }
        }
      }
      return item;
    }));
    setNewVarName('');
    setNewVarPrice('');
    setIsAddingVar(false);
  };

  const removeVariation = (id, keyToRemove) => {
    setMenuItems(prev => prev.map(item => {
      if(item.id === id) {
        const newPrices = { ...item.prices };
        delete newPrices[keyToRemove];
        return { ...item, prices: newPrices };
      }
      return item;
    }));
  };

  const togglePause = (id) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, paused: !item.paused } : item));
  };

  const deleteItem = (id) => {
    if(window.confirm('¿Eliminar definitivamente esta hamburguesa?')) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
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
      paused: true
    };
    setMenuItems([...menuItems, newItem]);
    setEditingId(newItem.id); // Open in edit mode right away
  };

  const saveMenu = () => {
    saveMenuData(menuItems);
    setEditingId(null);
    alert("¡Cambios guardados con éxito!");
  };

  // --- IMAGES ---
  const handleImageUpload = (id, e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        if (scaleSize < 1) {
          canvas.height = img.height * scaleSize;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
        handleItemChange(id, 'image', dataUrl);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  // --- EXCEL ---
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(menuItems.map(item => {
      // Serializar precios: "simple:9000;doble:11200"
      const pricesStr = Object.entries(item.prices)
        .filter(([k,v]) => v !== null)
        .map(([k,v]) => `${k}:${v}`)
        .join(';');
        
      return {
        ID: item.id,
        Nombre: item.name,
        Descripción: item.desc,
        Variaciones: pricesStr,
        Imagen_Referencia: item.image ? 'Base64/URL adjunta' : '',
        Pausada: item.paused ? 'Si' : 'No'
      }
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menu_VAK");
    XLSX.writeFile(wb, "Menu_Vak.xlsx");
  };

  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);
      
      const importedMenu = data.map(row => {
        // Deserializar Variaciones
        const parsedPrices = {};
        if (row.Variaciones) {
          const varPieces = String(row.Variaciones).split(';');
          varPieces.forEach(p => {
             const [k, v] = p.split(':');
             if(k && v) parsedPrices[k.trim().toLowerCase()] = Number(v);
          });
        }

        return {
          id: row.ID || Date.now() + Math.random(),
          name: row.Nombre || 'Sin Nombre',
          desc: row.Descripción || '',
          prices: Object.keys(parsedPrices).length > 0 ? parsedPrices : { simple: 0 },
          image: '', 
          tags: [],
          paused: String(row.Pausada).toLowerCase() === 'si'
        }
      });
      setMenuItems(importedMenu);
    };
    reader.readAsBinaryString(file);
    e.target.value = null; 
  };

  return (
    <div style={styles.adminPage}>
      <h1 style={{color: 'var(--vak-red)', marginBottom: '1rem'}}>Panel de Autogestión</h1>
      
      <div style={styles.tabs}>
        <button 
          style={activeTab === 'pedidos' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('pedidos')}
        >
          Pedidos ({orders.filter(o => o.status === 'PENDIENTE').length})
        </button>
        <button 
          style={activeTab === 'menu' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('menu')}
        >
          Editor de Menú
        </button>
      </div>

      {activeTab === 'pedidos' && (
        <div style={styles.contentArea}>
           {/* ... Lógica de Pedidos (Igual que antes) ... */}
           {orders.length === 0 ? (
            <p>No hay pedidos recientes.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} style={styles.orderCard}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <strong>Pedido #{order.id.toString().slice(-4)}</strong>
                  <span style={styles.statusBadge(order.status)}>{order.status}</span>
                </div>
                <div style={{margin: '10px 0', fontSize: '0.9rem'}}>
                  {order.items.map(i => (
                    <div key={i.tempId}>🔹 {i.quantity}x {i.name} ({i.size})</div>
                  ))}
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <strong style={{color: 'var(--vak-red)', fontSize: '1.2rem'}}>${order.total.toLocaleString('es-AR')}</strong>
                  {order.status === 'PENDIENTE' && (
                    <button style={styles.btnUniform} onClick={() => handleStatusChange(order.id, 'COMPLETADO')}>
                      <Check size={16}/> Marcar Listo
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        <div style={styles.contentArea}>
          <div style={styles.topTools}>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
              <button style={styles.btnUniform} onClick={addNewItem}><Plus size={16}/> Agregar Hamburguesa</button>
              <button style={styles.btnUniform} onClick={exportToExcel}><Download size={16}/> Exportar Excel</button>
              
              <label style={styles.btnUniformUpload}>
                <Upload size={16}/> Importar Excel
                <input type="file" accept=".xlsx, .xls" style={{display: 'none'}} onChange={importFromExcel} />
              </label>
            </div>
            
            <button style={styles.btnPrimary} onClick={saveMenu}>
              <Save size={16}/> Guardar Base de Datos
            </button>
          </div>
          
          <div style={styles.infoBox}>* Usa el botón "Editar" en la tarjeta para asegurarte de no hacer cambios por error. ¡No olvides guardar arriba del todo al finalizar!</div>

          {menuItems.map(item => {
            const isEditing = editingId === item.id;

            return (
              <div key={item.id} style={{...styles.menuEditCard, opacity: item.paused ? 0.6 : 1}}>
                
                {/* Header Superior y Controles de Tarjeta */}
                <div style={styles.menuHeader}>
                  <div style={{display: 'flex', alignItems: 'center', flex: 1}}>
                    {isEditing ? (
                      <input 
                        value={item.name} 
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        style={styles.inputName}
                        placeholder="Ej: NUEVA BURGER"
                      />
                    ) : (
                      <h2 style={{margin: 0, fontSize: '1.5rem'}}>{item.name}</h2>
                    )}
                  </div>
                  
                  <div style={styles.actions}>
                    {isEditing ? (
                       <button 
                         onClick={() => { setEditingId(null); saveMenuData(menuItems); }} 
                         className="admin-icon-btn" 
                         style={styles.iconBtn} 
                         title="Guardar y Cerrar Edición"
                       >
                         <Check size={20} color="#333"/>
                       </button>
                    ) : (
                       <button onClick={() => setEditingId(item.id)} className="admin-icon-btn" style={styles.iconBtn} title="Editar esta hamburguesa">
                         <Edit2 size={20} color="#333"/>
                       </button>
                    )}

                    <button onClick={() => togglePause(item.id)} className="admin-icon-btn" style={styles.iconBtn} title={item.paused ? "Reanudar" : "Pausar"}>
                      {item.paused ? <Play size={20} color="#666"/> : <Pause size={20} color="#666"/>}
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="admin-icon-btn" style={styles.iconBtn} title="Eliminar">
                      <Trash size={20} color="#999"/>
                    </button>
                  </div>
                </div>

                {/* Área de Descripción */}
                {isEditing ? (
                  <textarea 
                    value={item.desc}
                    onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)}
                    style={styles.inputDesc}
                    placeholder="Describe los ingredientes de la hamburguesa..."
                  />
                ) : (
                  <p style={{margin: '0 0 1rem 0', fontWeight: 'bold'}}>{item.desc}</p>
                )}

                {/* Subida de Imagen */}
                {isEditing && (
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem'}}>
                    <label className="admin-icon-btn" style={styles.fileUploadContainer}>
                      <ImageIcon size={18} color="#555" /> Subir Foto de Galería
                      <input type="file" accept="image/*" style={{display: 'none'}} onChange={(e) => handleImageUpload(item.id, e)} />
                    </label>
                    {item.image && (
                       <span style={{color: 'var(--vak-red)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', fontWeight: 'bold'}}>✓ Imagen cargada</span>
                    )}
                  </div>
                )}

                {/* Controles de Precio y Variaciones dinámicas */}
                <div style={styles.priceInputsContainer}>
                  <p style={{width: '100%', margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 'bold'}}>Variaciones y Precios:</p>
                  
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
                              style={{...styles.priceInput, paddingRight: '40px'}} 
                            />
                            <button className="admin-icon-btn" style={styles.removeSizeBtn} onClick={() => removeVariation(item.id, size)} title="Borrar variación">
                              <X size={14} color="#999" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={styles.viewSizePill}>
                          <span style={{fontWeight: 800}}>{size.toUpperCase()}</span>
                          <span>${value}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Creador de nueva variable si estamos editando */}
                  {isEditing && (
                    <div style={{marginTop: '15px'}}>
                      {isAddingVar ? (
                        <div style={{padding: '10px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '10px', width: 'fit-content'}}>
                          <p style={{margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--vak-dark)'}}>AGREGAR NUEVA VARIACIÓN:</p>
                          <div style={{display: 'flex', gap: '8px', alignItems: 'flex-end'}}>
                             <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                               <label style={{color: 'var(--vak-red)', fontSize:'0.75rem', fontWeight:'bold', paddingLeft: '5px'}}>VARIANTE</label>
                               <input 
                                 type="text" 
                                 placeholder="Ej: COMBO" 
                                 value={newVarName}
                                 onChange={(e) => setNewVarName(e.target.value)}
                                 style={{...styles.varInput, borderRadius: '10px'}}
                               />
                             </div>
                             <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                               <label style={{color: 'var(--vak-red)', fontSize:'0.75rem', fontWeight:'bold', paddingLeft: '5px'}}>PRECIO</label>
                               <input 
                                 type="number" 
                                 placeholder="Ej: 5000" 
                                 value={newVarPrice}
                                 onChange={(e) => setNewVarPrice(e.target.value)}
                                 style={{...styles.varInputSmall, borderRadius: '10px'}}
                               />
                             </div>
                             <button className="admin-icon-btn" onClick={() => addVariation(item.id)} style={{...styles.addVarBtn, borderRadius: '10px'}} title="Confirmar">
                               <Check size={20} color="#333" />
                             </button>
                             <button className="admin-icon-btn" onClick={() => { setIsAddingVar(false); setNewVarName(''); setNewVarPrice(''); }} style={{...styles.addVarBtn, borderRadius: '10px'}} title="Cancelar">
                               <X size={20} color="#999" />
                             </button>
                          </div>
                        </div>
                      ) : (
                        <button className="admin-icon-btn" onClick={() => setIsAddingVar(true)} style={{backgroundColor: '#ffffff', color: '#333', border: 'none', borderRadius: '10px', height: '40px', padding: '0 1rem', display: 'flex', alignItems: 'center', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.15)'}} title="Agregar nueva variación">
                          <Plus size={16} color="#333" style={{marginRight: '8px'}} /> Agregar Variación
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
    </div>
  );
};

const styles = {
  adminPage: {
    padding: '2rem 1rem',
    backgroundColor: '#fff',
    minHeight: '80vh',
  },
  tabs: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  },
  tab: {
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    backgroundColor: '#eee',
    color: '#333',
    fontWeight: 'bold',
  },
  activeTab: {
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    backgroundColor: 'var(--vak-red)',
    color: 'white',
    fontWeight: 'bold',
  },
  contentArea: {
    display: 'flex', flexDirection: 'column', gap: '1.5rem',
  },
  topTools: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
  },
  infoBox: {
    fontSize: '0.8rem', color: 'gray', fontStyle: 'italic', marginBottom: '0.5rem'
  },
  // UNIFIED BUTTON STYLES
  btnUniform: {
    display: 'flex', alignItems: 'center', gap: '5px',
    backgroundColor: 'var(--vak-dark)', color: 'white', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
    fontFamily: 'inherit'
  },
  btnUniformUpload: {
    display: 'flex', alignItems: 'center', gap: '5px',
    backgroundColor: 'var(--vak-dark)', color: 'white', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
    fontFamily: 'inherit'
  },
  btnPrimary: {
    display: 'flex', alignItems: 'center', gap: '5px',
    backgroundColor: 'var(--vak-red)', color: 'white', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
    fontFamily: 'inherit'
  },

  orderCard: {
    border: '1px solid #eee', borderLeft: '4px solid var(--vak-red)', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  statusBadge: (status) => ({
    backgroundColor: status === 'COMPLETADO' ? 'green' : 'orange', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold',
  }),

  // BURGER CARD ADMIN STYLES
  menuEditCard: {
    padding: '1.5rem', borderRadius: '12px', backgroundColor: 'var(--vak-bg)', color: 'var(--vak-dark)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', transition: 'all 0.2s', border: '1px solid var(--vak-red)'
  },
  menuHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'
  },
  inputName: {
    fontSize: '1.2rem', fontWeight: '900', border: 'none', padding: '0.6rem', borderRadius: '10px', flex: 1, marginRight: '10px', color: 'var(--vak-dark)'
  },
  iconBtn: {
    padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', border: 'none', borderRadius: '10px', marginLeft: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.15)', cursor: 'pointer', width: '40px', height: '40px'
  },
  actions: {
    display: 'flex'
  },
  inputDesc: {
    width: '100%', padding: '0.6rem', border: 'none', borderRadius: '10px', marginBottom: '10px', fontFamily: 'inherit', fontWeight: '600', color: 'var(--vak-dark)', resize: 'none', height: '60px'
  },
  fileUploadContainer: {
    display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#ffffff', padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', color: '#555', boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
  },
  priceInputsContainer: {
    display: 'flex', gap: '0.5rem', flexWrap: 'wrap', backgroundColor: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '10px'
  },
  inputGroupWrapper: {
    display: 'flex', alignItems: 'flex-end', position: 'relative'
  },
  inputGroup: {
    display: 'flex', flexDirection: 'column', gap: '5px',
  },
  sizeLabel: {
    color: 'var(--vak-red)', fontSize:'0.8rem', fontWeight:'bold'
  },
  priceInput: {
    padding: '0.6rem', border: 'none', borderRadius: '10px', fontWeight: 'bold', width: '110px', color: 'var(--vak-dark)'
  },
  removeSizeBtn: {
    backgroundColor: 'transparent',
    color: '#999', 
    borderRadius: '50%', 
    width: '24px', 
    height: '24px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    border: 'none', 
    position: 'absolute', 
    right: '5px', 
    cursor: 'pointer'
  },
  viewSizePill: {
    backgroundColor: 'white', color: 'var(--vak-red)', padding: '0.4rem 0.8rem', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center'
  },
  addVariationBox: {
    display: 'flex', gap: '0', alignItems: 'flex-end', boxShadow: '0 2px 5px rgba(0,0,0,0.15)', borderRadius: '10px'
  },
  varInput: {
    padding: '0.6rem', border: 'none', fontWeight: 'bold', width: '130px', color: 'var(--vak-dark)', boxSizing: 'border-box', height: '40px'
  },
  varInputSmall: {
    padding: '0.6rem', border: 'none', fontWeight: 'bold', width: '90px', color: 'var(--vak-dark)', boxSizing: 'border-box', height: '40px'
  },
  addVarBtn: {
    backgroundColor: '#ffffff', color: '#333', border: 'none', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.15)', boxSizing: 'border-box'
  }
};

export default AdminView;
