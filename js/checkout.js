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
    const direccion = direccionInput.value;

    if (!nombre || !telefonoCliente) {
    alert("Completá nombre y teléfono");
    return;
    }

    if (entrega === "Envío a domicilio" && !direccion) {
        alert("Ingresá la dirección de entrega");
        return;
    }



    let mensaje = "Hola! Quiero hacer el siguiente pedido:%0A%0A";

    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        mensaje += `• ${item.nombre} x${item.cantidad} - $${subtotal}%0A`;
    });

    mensaje += `%0A💰 Total: $${total}%0A`;
    mensaje += `%0A--- DATOS ---`;
    mensaje += `%0ANombre: ${nombre}`;
    mensaje += `%0ATeléfono: ${telefonoCliente}`;
    mensaje += `%0AEntrega: ${entrega}`;

    if (entrega === "Envío a domicilio") {
        mensaje += `%0ADirección: ${direccion}`;
    }

    mensaje += `%0APago: ${pago}`;

    const telefonoNegocio = "5493518095270"; // tu número

    window.open(`https://wa.me/${telefonoNegocio}?text=${mensaje}`, "_blank");

    localStorage.removeItem("ilPaesanoCart");

}
