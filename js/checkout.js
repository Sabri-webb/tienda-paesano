// =======================================================
// CHECKOUT
// =======================================================

const ITEMS_CONTAINER = document.getElementById("checkout-items");
const TOTAL_ELEMENT = document.getElementById("checkout-total");
const direccionInput = document.getElementById("direccion");
const deliveryRadio = document.getElementById("delivery-radio");


// =======================================================
// INIT
// =======================================================

document.addEventListener("DOMContentLoaded", () => {
    mostrarResumen();
    toggleDireccion();
});

deliveryRadio.addEventListener("change", toggleDireccion);


// =======================================================
// MOSTRAR / OCULTAR DIRECCIÓN
// =======================================================

function toggleDireccion() {
    if (deliveryRadio.checked) {
        direccionInput.classList.remove("d-none");
    } else {
        direccionInput.classList.add("d-none");
    }
}


// =======================================================
// RESUMEN DEL CARRITO
// =======================================================

function mostrarResumen() {

    const carrito = obtenerCarrito(); // usa app.js

    let total = 0;

    ITEMS_CONTAINER.innerHTML = "";

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        ITEMS_CONTAINER.innerHTML += `
            <li class="list-group-item d-flex justify-content-between">
                ${item.nombre} x${item.cantidad}
                <span>$${subtotal.toFixed(2)}</span>
            </li>
        `;
    });

    TOTAL_ELEMENT.textContent = `$${total.toFixed(2)}`;
}


// =======================================================
// ENVIAR WHATSAPP
// =======================================================

function enviarPedido() {

    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    const nombre = document.getElementById("nombre").value;
    const telefonoCliente = document.getElementById("telefono").value;
    const entrega = document.querySelector('input[name="entrega"]:checked').value;
    const pago = document.querySelector('input[name="pago"]:checked').value;
    const direccionInput = document.getElementById("direccion");
    const direccion = direccionInput ? direccionInput.value : "";

    if (!nombre || !telefonoCliente) {
        alert("Completá nombre y teléfono");
        return;
    }

    if (entrega === "Envío a domicilio" && !direccion) {
        alert("Ingresá la dirección de entrega");
        return;
    }

    // =====================
    // MENSAJE LIMPIO (texto normal)
    // =====================

    let mensaje = "Hola! Quiero hacer el siguiente pedido:\n\n";
    let total = 0;

    carrito.forEach(item => {

        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        let linea = `• ${item.nombre} x${item.cantidad}`;

        // ✅ AQUÍ VA LA NOTA
        if (item.nota && item.nota.trim() !== "") {
            linea += ` (Nota: ${item.nota})`;
        }

        linea += ` - $${subtotal}\n`;

        mensaje += linea;
    });

    mensaje += `\n💰 Total: $${total}\n\n`;
    mensaje += `--- DATOS ---\n`;
    mensaje += `Nombre: ${nombre}\n`;
    mensaje += `Teléfono: ${telefonoCliente}\n`;
    mensaje += `Entrega: ${entrega}\n`;

    if (entrega === "Envío a domicilio") {
        mensaje += `Dirección: ${direccion}\n`;
    }

    mensaje += `Pago: ${pago}`;

    const telefonoNegocio = "5493518095270";

    // ✅ encode UNA sola vez
    const mensajeCodificado = encodeURIComponent(mensaje);

    window.open(`https://wa.me/${telefonoNegocio}?text=${mensajeCodificado}`, "_blank");

    localStorage.removeItem("ilPaesanoCart");
}

