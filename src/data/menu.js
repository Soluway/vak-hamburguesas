export const defaultMenuData = [
  {
    id: 1,
    name: 'KLASI — K',
    desc: 'PAN, KARNE SMASH, CHEDDAR',
    prices: { simple: 9600, doble: 11200, triple: 14600 },
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    tags: [],
    paused: false
  },
  {
    id: 2,
    name: 'KUARTO',
    desc: 'PAN, KARNE SMASH, KETCHUP, MOSTAZA, CEBOLLA BRUNOISE Y CHEDDAR',
    prices: { simple: 9900, doble: 12300, triple: 14900 },
    image: 'https://images.unsplash.com/photo-1594212265007-8e6c703d8b5c?auto=format&fit=crop&w=800&q=80',
    tags: [],
    paused: false
  },
  {
    id: 3,
    name: 'STAKER',
    desc: 'PAN, KARNE SMASH, CHEDDAR, SALSA STACKER, PANCETA.',
    prices: { simple: 11500, doble: 13800, triple: 15400 },
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
    tags: [],
    paused: false
  },
  {
    id: 4,
    name: 'KOMPLETA',
    desc: 'PAN, KARNE SMASH, PANCETA, LECHUGA, TOMATE, SALSA VA-K, CHEDDAR',
    prices: { simple: 11600, doble: 13900, triple: 15500 },
    image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&w=800&q=80',
    tags: [],
    paused: false
  },
  {
    id: 5,
    name: 'OKLAHOMA',
    desc: 'PAN, KARNE, CEBOLLA SMASHEADA, CHEDDAR',
    prices: { simple: 12700, doble: 14770, triple: null },
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    tags: [],
    paused: false
  },
  {
    id: 6,
    name: 'VA-K',
    desc: 'PAN, KARNE SMASH, CHEDDAR, MERMELADA DE MORRON, ALIOLI',
    prices: { simple: 13500, doble: 16300, triple: null },
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80',
    tags: [],
    paused: false
  },
  {
    id: 7,
    name: 'ORGANIK',
    desc: 'PAN, PORTOBELLO RELLENO DE MUZZARELLA, CHEDDAR, MERMELADA DE MORRÓN, ALIOLI.',
    prices: { simple: 16240, doble: null, triple: null },
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
    tags: ['VEGGIE'],
    paused: false
  }
];

export const getMenuData = () => {
  const stored = localStorage.getItem('vak_menu');
  if (stored) {
    return JSON.parse(stored);
  }
  return defaultMenuData;
};

export const saveMenuData = (data) => {
  localStorage.setItem('vak_menu', JSON.stringify(data));
};
