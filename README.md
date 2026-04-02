# VAK Hamburguesas - Documentación Abierta

Este documento recopila todo el contexto, el stack de tecnologías y la estructura de módulos de la aplicación web de VAK Hamburguesas. Esta guía sirve tanto para desarrollo futuro como para mantenimiento lógico del sistema.

---

## 💻 Tech Stack (Tecnologías Utilizadas)

- **React + Vite**: Framework principal en su última versión con renderizado ultrarrápido y refresco en caliente para desarrollo ágil.
- **Vanilla CSS (index.css)**: Creación de un sistema de diseño propio (sin librerías como Tailwind) lo que otorgó control total sobre micro-animaciones, colores orgánicos y formas consistentes en base a variables nativas (CSS Variables).
- **Lucide-React**: Colección iconográfica vectorizada sumamente ligera utilizada en todo el panel de administración y diseño cliente.
- **XLSX (SheetJS)**: Biblioteca empleada en el Panel de Administración para traducir estructuras de objetos JSON a planillas Excel y viceversa, permitiendo respaldos locales del menú.
- **LocalStorage Data persistence**: Base de datos simulada y persistente anclada en el navegador local, previniendo la pérdida de catálogo u órdenes si se refresca la ventana, preparado para eventual inyección de backend (Firebase, Node.js).

---

## 📂 Arquitectura y Módulos

La aplicación está íntegramente dividida en componentes pequeños (`components`) y pantallas principales (`pages`), facilitando la escalabilidad a futuro.

### 1. Sistema de Rutas y Entrada
- **`src/main.jsx`** y **`src/App.jsx`**: Punto de engranaje global de la aplicación. Configuran el **React Router Dom** distribuyendo la interfaz en dos mundos:
  - `/` -> Lado del Cliente (Venta de Burgers).
  - `/admin` -> Lado Administrativo (Gestión).

### 2. Páginas Principales (`src/pages/`)
- **`ClientView.jsx`**: Pantalla que el cliente visualiza. Recorre de forma dinámica la "Base de Datos" y renderiza cada hamburguesa habilitada. 
- **`AdminView.jsx`**: El cerebro de gestión comercial. Dividido en sub-solapas de *[Pedidos]* y *[Editor de Menú]*. Permite mutar la base de datos completa de las hamburguesas e importar planillas. Construido bajo un protocolo visual "Cremoso/Rojo" con esquinas unificadas (`10px`).

### 3. Componentes Visuales (`src/components/`)
- **`Header.jsx`**: Creado para encapsulación de identidad visual (el bloque rojo grueso superior curvo con acceso al carrito).
- **`Footer.jsx`**: Franja informativa inferior para colocar redes sociales e información de Contacto de VAK, de bordes rectos al cimiento de la web.
- **`BurgerCard.jsx`**: El componente más complejo del cliente. Una tarjeta en tonalidad Crema (Variable `--vak-bg`) que alberga condicionalmente los precios y variaciones dinámicas configuradas por el dueño en el admin. Muestra automáticamente los "Pills" rotados con la variante. 
- **`CartDrawer.jsx` (u homólogos de carro)**: Administrador de sesión donde viajan los productos desde el `BurgerCard` para contabilizar la totalización hacia un formato legible en *WhatsApp* u *Órdenes Pendientes*.

### 4. Fuentes de Datos (`src/data/`)
- **`menu.js`**: Este archivo exporta las funciones críticas del almacenamiento `(getMenuData / saveMenuData)` e inicializa objetos maestros en el primer inicio. Es de aquí de donde toda la aplicación lee y determina qué mostrar.

---

## 🎨 Decisiones de Diseño y UI/UX (Anotaciones)

Durante el último ciclo de desarrollo se prestó intensa atención a la *Unificación del Entorno Administrativo* vs *La Experiencia del Cliente*:

- Se descartaron esquinas agresivas sustituyéndolas en un 90% de los botones e `inputs` del sistema por `borderRadius` controlados a **10px** y **20px** para suavidad.
- Se implementaron fondos transparentes / semi-transparentes y blancos en los visores del administrador dentro en esquemas grupales (píldoras conjuntas) sin dejar espacios (`gap: 0`), simplificando el uso manual en móviles.
- Los Inputs Numéricos (`type="number"`) fueron anulados para evadir las fastidiosas "flechas" visuales de webkit, brindando espacios limpios de escritura para montos de alto volumen.
- Las imágenes subidas por el dueño del local en la administración se pre-escanean y comprimen al instante creando strings base64 en `canvas` de 400px; impidiendo así rebasar la capacidad de persistencia local.
