// =======================================================
// CONFIGURACIÓN GLOBAL
// =======================================================

// !!! REEMPLAZA ESTA URL CON TU ENLACE CSV PUBLICADO DE GOOGLE SHEETS !!!
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTqpQndZ9-Eg9_4e6KNDTfvRlb-O9aienMFHIOJbaXQgWpKSX9A9eRIaBGuUrVnwlxSnRBmX5K5ORKD/pub?gid=0&single=true&output=csv'; 

const PRODUCTS_CONTAINER = document.getElementById('products-container');
const LOADING_MESSAGE = document.getElementById('loading-message');
const CART_COUNT_ELEMENT = document.getElementById('cart-count');

// Clave para guardar el carrito en el almacenamiento local
const CART_STORAGE_KEY = 'ilPaesanoCart';

let productosCatalogo = []; // Almacena el array de productos una vez cargados

// =======================================================
// FUNCIONES DE UTILIDAD (PARSING CSV)
// =======================================================

/**
 /**
 * Convierte el texto CSV puro obtenido de Google Sheets en un Array de Objetos JS.
 * **(VERSION MEJORADA: Detecta el delimitador y maneja decimales.)**
 * @param {string} csvText - El contenido CSV como una cadena de texto.
 * @returns {Array<Object>} El catálogo de productos en formato JSON.
 */
function parseCSV(csvText) {
    const filas = csvText.trim().split('\n');
    if (filas.length <= 1) return [];

    // 1. Detectar el delimitador (coma o punto y coma)
    const primeraFila = filas[0];
    const delimitador = primeraFila.includes(';') ? ';' : ','; 
    console.log(`Delimitador detectado: "${delimitador}"`);

    // 2. Obtener encabezados
    const encabezados = filas[0].split(delimitador).map(header => header.trim().toLowerCase()); 
    
    const productos = filas.slice(1).map(fila => {
        const valores = fila.split(delimitador);
        let producto = {};
        
        encabezados.forEach((encabezado, i) => {
            let valor = valores[i] ? valores[i].trim() : '';

            if (encabezado === 'precio') {
                // Si el delimitador es punto y coma, asumimos que el decimal es coma
                // Lo reemplazamos por punto para que parseFloat() funcione correctamente en JS.
                const valorLimpio = valor.replace(',', '.'); 
                producto[encabezado] = parseFloat(valorLimpio) || 0; 
            } else if (encabezado === 'stock' || encabezado === 'id') {
                producto[encabezado] = parseInt(valor) || 0;
            }
            else {
                producto[encabezado] = valor;
            }
        });
        return producto;
    }).filter(p => p.id !== 0 && p.nombre !== ''); // Filtra filas vacías

    return productos;
}

// =======================================================
// FUNCIÓN PRINCIPAL DE CARGA DE DATOS
// =======================================================

/**
 * 1. Obtiene el CSV de Google Sheets.
 * 2. Lo convierte en JSON.
 * 3. Almacena el catálogo y lo muestra en productos.html.
 */
async function cargarProductos() {
    if (!PRODUCTS_CONTAINER) return; // Solo ejecuta en productos.html

    try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const dataCSV = await response.text();
        
        productosCatalogo = parseCSV(dataCSV);
        
        // Ocultar mensaje de carga
        if (LOADING_MESSAGE) {
            LOADING_MESSAGE.style.display = 'none';
        }

        mostrarProductosEnCatalogo(productosCatalogo);

    } catch (error) {
        console.error("Error al cargar productos desde Google Sheets:", error);
        if (LOADING_MESSAGE) {
            LOADING_MESSAGE.textContent = "¡Error al cargar el menú! Revisa la URL de tu Hoja de Google o la conexión.";
            LOADING_MESSAGE.classList.remove('alert-info');
            LOADING_MESSAGE.classList.add('alert-danger');
        }
    }
}

// =======================================================
// RENDERIZADO DEL CATÁLOGO
// =======================================================

/**
 * Genera el HTML de las Cards de Bootstrap e inyecta en el DOM.
 * @param {Array<Object>} productos - Array de productos a mostrar.
 */
function mostrarProductosEnCatalogo(productos) {
    if (!PRODUCTS_CONTAINER) return;

    let htmlContent = '';
    
    productos.forEach(producto => {
        // Validación básica de stock
        const stockStatus = producto.stock > 0 ? 
            `<p class="text-success fw-bold mb-2">Disponible (${producto.stock} uds)</p>` :
            `<p class="text-danger fw-bold mb-2">Agotado</p>`;
        
        const button = producto.stock > 0 ? 
            `<button onclick="agregarAlCarrito(${producto.id})" class="btn btn-success w-100"><i class="bi bi-plus-circle me-2"></i> Añadir al Pedido</button>` :
            `<button class="btn btn-secondary w-100" disabled><i class="bi bi-x-circle me-2"></i> Sin Stock</button>`;

        const precioFormateado = `$${producto.precio.toFixed(2)}`;

        htmlContent += `
            <div class="col">
                <div class="card h-100 product-card shadow-sm">
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${producto.nombre}</h5>
                        <p class="card-text text-muted">${producto.descripcion}</p>
                    </div>
                    <div class="card-footer bg-white border-0 text-center">
                        ${stockStatus}
                        <p class="text-danger fw-bold fs-5 mb-2">${precioFormateado}</p>
                        ${button}
                    </div>
                </div>
            </div>
        `;
    });
    
    PRODUCTS_CONTAINER.innerHTML = htmlContent;
}

// =======================================================
// GESTIÓN DEL CARRITO (LOCAL STORAGE)
// =======================================================

/**
 * Obtiene el carrito del localStorage.
 * @returns {Array<Object>} El carrito actual, o un array vacío si no existe.
 */
function obtenerCarrito() {
    const carritoJSON = localStorage.getItem(CART_STORAGE_KEY);
    return carritoJSON ? JSON.parse(carritoJSON) : [];
}

/**
 * Guarda el carrito en el localStorage.
 * @param {Array<Object>} carrito - El carrito a guardar.
 */
function guardarCarrito(carrito) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carrito));
    actualizarContadorCarrito();
}

/**
 * Añade un producto al carrito o incrementa su cantidad.
 * @param {number} productoId - El ID del producto a añadir.
 */
function agregarAlCarrito(productoId) {
    const producto = productosCatalogo.find(p => p.id === productoId);

    if (!producto || producto.stock <= 0) {
        alert('Este producto no está disponible o no existe.');
        return;
    }

    let carrito = obtenerCarrito();
    const itemExistente = carrito.find(item => item.id === productoId);

    if (itemExistente) {
        // Verificar stock antes de añadir
        if (itemExistente.cantidad < producto.stock) {
            itemExistente.cantidad++;
        } else {
            alert(`No hay suficiente stock disponible para ${producto.nombre}.`);
            return;
        }
    } else {
        // Añadir nuevo ítem al carrito
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    alert(`"${producto.nombre}" añadido al pedido.`);
}

/**
 * Actualiza el número total de ítems en el ícono del carrito en el navbar.
 */
function actualizarContadorCarrito() {
    if (CART_COUNT_ELEMENT) {
        const carrito = obtenerCarrito();
        // Suma la cantidad de ítems de todos los productos
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        CART_COUNT_ELEMENT.textContent = totalItems;
    }
}


// =======================================================
// FUNCIONALIDADES ADICIONALES (Filtro en productos.html)
// =======================================================

/**
 * Filtra los productos en el catálogo basándose en la entrada de búsqueda.
 */
function filtrarProductos() {
    const input = document.getElementById('search-input');
    if (!input) return;
    
    const textoBusqueda = input.value.toLowerCase();
    
    const productosFiltrados = productosCatalogo.filter(producto => {
        // Busca en el nombre o descripción
        return producto.nombre.toLowerCase().includes(textoBusqueda) || 
               producto.descripcion.toLowerCase().includes(textoBusqueda);
    });

    mostrarProductosEnCatalogo(productosFiltrados);
}


// =======================================================
// INICIALIZACIÓN
// =======================================================

// Cargar catálogo SIEMPRE (para que el carrito funcione en todas las páginas)
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    actualizarContadorCarrito();
});


// Llamada para asegurar que el contador del carrito se actualice en TODAS las páginas
actualizarContadorCarrito();