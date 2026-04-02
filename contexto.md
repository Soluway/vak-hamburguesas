# Contexto de la Aplicación: VAK Hamburguesas Web

Este documento describe la estructura, tecnologías y contexto del proyecto para facilitar futuros desarrollos o configuraciones.

## 🍔 Acerca del Proyecto
VAK Hamburguesas Web App es una aplicación frontend desarrollada para simular y facilitar la experiencia de compra (pedidos) del restaurante, replicando en formato web el diseño de su menú impreso/PDF original. Cuenta con un diseño adaptable a móviles (mobile-first), carrito interactivo y un panel de administración básico para simular la gestión de pedidos y menú.

## 🛠 Stack Tecnológico
- **Entorno:** Node.js, `npm`
- **Framework Principal:** React (versión moderna con Hooks)
- **Empaquetador/Bundler:** Vite
- **Enrutamiento:** `react-router-dom`
- **Iconografía:** `lucide-react`
- **Estilación:** CSS puro con variables en CSS Modules (ubicado en `src/index.css` e inline-styles) para diseño a medida.
- **Gestión de Estado Global:** React Context API (`CartContext.jsx`).

## 📁 Estructura del Código
El proyecto se encuentra en `C:\Users\tizia\Documents\VAK-Proyect`. A continuación, el detalle de carpetas y archivos críticos de `src/`:

- **`/components`**:
  - `Header.jsx`: Contiene el logo superior ('VA-K' estilizado) y el widget de carrito a la derecha con un badge dinámico de artículos.
  - `Footer.jsx`: Contiene datos de contacto, Instagram y un enlace discreto (opacidad baja) que lleva al panel de Administración.
  - `BurgerCard.jsx`: El componente principal de la tienda. Muestra una hamburguesa con título separado entre "letra inicial" y "resto del nombre", con las distintas opciones de tamaño (Simple, Doble, Triple) y su precio dinámico.
  - `CartSidebar.jsx`: Un modal lateral tipo sidebar con animación. Utiliza el contexto para leer y modificar cantidades de los productos seleccionados, y permite "efectuar" o simular la compra.
  
- **`/context`**:
  - `CartContext.jsx`: Define las variables y funciones principales del carrito de compras (`addToCart`, `updateQuantity`, `removeFromCart`, `clearCart`, etc.).
  
- **`/data`**:
  - `menu.js`: Documento "mock" o simulador de la base de datos de productos. Exporta el array `menuData` con los 7 productos iniciales y las imágenes de prueba (traídas de Unsplash temporalmente, con foco visual en "Smash Burgers").

- **`/pages`**:
  - `ClientView.jsx`: La página principal del cliente (`/`). Contiene el banner informativo visual imitando el panel PDF (con texto "MENÚ ENERO" e "INCLUYEN PAPAS") y la lista renderizada de `BurgerCard`s.
  - `AdminView.jsx`: Accesible desde `/admin` o el footer. Cuenta con 2 solapas (tabs). "Pedidos Entrantes" carga la información temporal en el localStorage (simulando Base de Datos) para ver y aceptar órdenes, marcándolas "COMPLETADO". "Editor de Menú" permite redefinir interactivamente los precios.

- **`index.css`**: Concentra las variables de colores requeridas (por ejemplo, `--vak-red: #ea1d2c;` y el tono de fondo `--vak-bg: #e8e3d9;`), los resets base y la fuente tipográfica (`Inter` via Google Fonts).

## 🐛 Correcciones y Patrones
- **Patrón de Hover en Botón:** Se utilizó un diseño de CSS nativo con clases específicas de hover (`.price-btn-hover`, `.add-icon`), para asegurar que, al poner el mouse sobre los precios de las hamburguesas, el texto parpadee transformándose en un icono '+', sin dañar/colapsar la estabilidad y altura de los botones gracias a un uso correcto de posiciones (`absolute`/`relative`) y opacidades.

## 🚀 Despliegue (Cómo empezar)
- **Local:** Ejecutar `npm run dev` en la terminal, lo cual arranca el servicio, comúnmente en `http://localhost:5173/`.
- **Producción:** Para emular un build utilizar `npm run build` o subir directamente hacia Netlify/Vercel conectando con el repositorio en Github de *Soluway-team/vak-hamburguesas*.
