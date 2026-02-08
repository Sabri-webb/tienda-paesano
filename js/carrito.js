// =======================================================
// CARRITO.JS
// SOLO maneja la vista carrito.html (NO guarda datos)
// =======================================================

const CART_ITEMS_CONTAINER = document.getElementById("cart-items");
const CART_TOTAL_ELEMENT = document.getElementById("cart-total");
const EMPTY_CART_MESSAGE = document.getElementById("empty-cart");


// =======================================================
// INIT
// =======================================================

document.addEventListener("DOMContentLoaded", () => {
    mostrarCarrito();
});


// =======================================================
// MOSTRAR CARRITO
// =======================================================

function mostrarCarrito() {

    const carrito = obtenerCarrito(); // 👈 viene de app.js

    CART_ITEMS_CONTAINER.innerHTML = "";

    if (carrito.length === 0) {
        EMPTY_CART_MESSAGE.classList.remove("d-none");
        CART_TOTAL_ELEMENT.textContent = "$0.00";
        return;
    }

    EMPTY_CART_MESSAGE.classList.add("d-none");

    let total = 0;

    carrito.forEach(item => {

        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        CART_ITEMS_CONTAINER.innerHTML += `
            <tr>
                <td class="d-flex align-items-center gap-3 text-start">
                    <img src="${item.imagen}" width="60" class="rounded">
                    <span>${item.nombre}</span>
                </td>

                <td>$${item.precio.toFixed(2)}</td>

                <td>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary"
                            onclick="cambiarCantidad(${item.id}, -1)">-</button>

                        <span>${item.cantidad}</span>

                        <button class="btn btn-sm btn-outline-secondary"
                            onclick="cambiarCantidad(${item.id}, 1)">+</button>
                    </div>
                </td>

                <td class="fw-bold">$${subtotal.toFixed(2)}</td>

                <td>
                    <button class="btn btn-sm btn-danger"
                        onclick="eliminarItem(${item.id})">
                        🗑
                    </button>
                </td>
            </tr>
        `;
    });

    CART_TOTAL_ELEMENT.textContent = `$${total.toFixed(2)}`;
}


// =======================================================
// CAMBIAR CANTIDAD
// =======================================================

function cambiarCantidad(id, cambio) {

    let carrito = obtenerCarrito();

    carrito = carrito.map(item => {
        if (item.id === id) {
            item.cantidad += cambio;
            if (item.cantidad < 1) item.cantidad = 1;
        }
        return item;
    });

    guardarCarrito(carrito); // 👈 app.js
    mostrarCarrito();        // 👈 refresca tabla
}


// =======================================================
// ELIMINAR ITEM
// =======================================================

function eliminarItem(id) {

    let carrito = obtenerCarrito();

    carrito = carrito.filter(item => item.id !== id);

    guardarCarrito(carrito);
    mostrarCarrito();
}


// =======================================================
// VACIAR CARRITO
// =======================================================

function vaciarCarrito() {

    if (!confirm("¿Vaciar carrito completo?")) return;

    localStorage.removeItem(CART_STORAGE_KEY); // 👈 misma key de app.js

    mostrarCarrito();
    actualizarContadorCarrito();
}


// =======================================================
// FINALIZAR PEDIDO → WHATSAPP
// =======================================================

function finalizarPedido() {

    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    let mensaje = "Hola! Quiero hacer el siguiente pedido:%0A%0A";
    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        mensaje += `• ${item.nombre} x${item.cantidad} - $${subtotal}%0A`;
    });

    mensaje += `%0A💰 Total: $${total}`;

    const telefono = "5493518095270";

    window.open(`https://wa.me/${telefono}?text=${mensaje}`, "_blank");
}
