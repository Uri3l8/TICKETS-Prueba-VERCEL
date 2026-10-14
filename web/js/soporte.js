const API_URL = "/api/tickets";

const tablaTickets = document.getElementById("tablaTickets");
const detalleTicket = document.getElementById("detalleTicket");
const mensajeSoporte = document.getElementById("mensajeSoporte");

const filtroEstado = document.getElementById("filtroEstado");
const filtroPrioridad = document.getElementById("filtroPrioridad");

const btnActualizar = document.getElementById("btnActualizar");
const btnGuardarTicket = document.getElementById("btnGuardarTicket");
const btnEliminarTicket = document.getElementById("btnEliminarTicket");
const btnCerrarDetalle = document.getElementById("btnCerrarDetalle");

let tickets = [];
let ticketSeleccionado = null;

function mostrarMensaje(texto, tipo) {
    mensajeSoporte.textContent = texto;
    mensajeSoporte.className = `support-message alert alert-${tipo}`;

    setTimeout(() => {
        mensajeSoporte.classList.add("hidden");
    }, 4000);
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleString("es-GT", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function textoEstado(estado) {
    const estados = {
        PENDIENTE: "Pendiente",
        EN_REVISION: "En revisión",
        EN_PROCESO: "En proceso",
        RESUELTO: "Resuelto"
    };

    return estados[estado] || estado;
}

function claseEstado(estado) {
    const clases = {
        PENDIENTE: "status-pendiente",
        EN_REVISION: "status-revision",
        EN_PROCESO: "status-proceso",
        RESUELTO: "status-resuelto"
    };

    return clases[estado] || "";
}

function clasePrioridad(prioridad) {
    const clases = {
        BAJA: "priority-baja",
        MEDIA: "priority-media",
        ALTA: "priority-alta"
    };

    return clases[prioridad] || "";
}

function actualizarMetricas() {
    const contar = (estado) =>
        tickets.filter((ticket) => ticket.estado === estado).length;

    document.getElementById("metricPendientes").textContent =
        contar("PENDIENTE");

    document.getElementById("metricRevision").textContent =
        contar("EN_REVISION");

    document.getElementById("metricProceso").textContent =
        contar("EN_PROCESO");

    document.getElementById("metricResueltos").textContent =
        contar("RESUELTO");
}

function obtenerTicketsFiltrados() {
    return tickets.filter((ticket) => {
        const coincideEstado =
            !filtroEstado.value ||
            ticket.estado === filtroEstado.value;

        const coincidePrioridad =
            !filtroPrioridad.value ||
            ticket.prioridad === filtroPrioridad.value;

        return coincideEstado && coincidePrioridad;
    });
}

function crearBadge(texto, clase) {
    const badge = document.createElement("span");

    badge.className = `badge ${clase}`;
    badge.textContent = texto;

    return badge;
}

function crearFila(ticket) {
    const fila = document.createElement("tr");

    const id = document.createElement("td");
    id.textContent = `#${ticket.id}`;

    const solicitud = document.createElement("td");

    const titulo = document.createElement("div");
    titulo.className = "support-ticket-title";
    titulo.textContent = ticket.titulo;

    const usuario = document.createElement("div");
    usuario.className = "support-ticket-user";
    usuario.textContent = ticket.nombre_usuario;

    solicitud.append(titulo, usuario);

    const prioridad = document.createElement("td");
    prioridad.appendChild(
        crearBadge(
            ticket.prioridad,
            clasePrioridad(ticket.prioridad)
        )
    );

    const estado = document.createElement("td");
    estado.appendChild(
        crearBadge(
            textoEstado(ticket.estado),
            claseEstado(ticket.estado)
        )
    );

    const fecha = document.createElement("td");
    fecha.textContent = formatearFecha(ticket.fecha_creacion);

    const accion = document.createElement("td");

    const boton = document.createElement("button");
    boton.className = "btn btn-secondary btn-small";
    boton.textContent = "Ver";
    boton.addEventListener("click", () => mostrarDetalle(ticket));

    accion.appendChild(boton);

    fila.append(
        id,
        solicitud,
        prioridad,
        estado,
        fecha,
        accion
    );

    return fila;
}

function mostrarTabla() {
    tablaTickets.replaceChildren();

    const filtrados = obtenerTicketsFiltrados();

    if (filtrados.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        const vacio = document.createElement("div");

        celda.colSpan = 6;
        vacio.className = "support-empty";
        vacio.textContent = "No hay tickets para mostrar.";

        celda.appendChild(vacio);
        fila.appendChild(celda);
        tablaTickets.appendChild(fila);

        return;
    }

    filtrados.forEach((ticket) => {
        tablaTickets.appendChild(crearFila(ticket));
    });
}

function mostrarDetalle(ticket) {
    ticketSeleccionado = ticket;

    document.getElementById("detalleTitulo").textContent =
        `#${ticket.id} · ${ticket.titulo}`;

    document.getElementById("detalleUsuario").textContent =
        `Solicitado por ${ticket.nombre_usuario}`;

    document.getElementById("detalleDescripcion").textContent =
        ticket.descripcion;

    document.getElementById("detalleFecha").textContent =
        `Creado: ${formatearFecha(ticket.fecha_creacion)}`;

    document.getElementById("detallePrioridad").value =
        ticket.prioridad;

    document.getElementById("detalleEstado").value =
        ticket.estado;

    const badge = document.getElementById("detalleEstadoBadge");

    badge.className = `badge ${claseEstado(ticket.estado)}`;
    badge.textContent = textoEstado(ticket.estado);

    detalleTicket.classList.remove("hidden");

    detalleTicket.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function cerrarDetalle() {
    ticketSeleccionado = null;
    detalleTicket.classList.add("hidden");
}

async function cargarTickets() {
    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los tickets.");
        }

        tickets = await respuesta.json();

        actualizarMetricas();
        mostrarTabla();
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
}

async function guardarCambios() {
    if (!ticketSeleccionado) {
        return;
    }

    const datos = {
        estado: document.getElementById("detalleEstado").value
    };

    try {
        const respuesta = await fetch(
            `${API_URL}/${ticketSeleccionado.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.error ||
                "No se pudo actualizar el ticket."
            );
        }

        mostrarMensaje(
            "Estado actualizado correctamente.",
            "success"
        );

        ticketSeleccionado = resultado;

        await cargarTickets();
        mostrarDetalle(resultado);
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
}

async function eliminarTicket() {
    if (!ticketSeleccionado) {
        return;
    }

    const confirmar = window.confirm(
        `¿Deseas eliminar el ticket #${ticketSeleccionado.id}?`
    );

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(
            `${API_URL}/${ticketSeleccionado.id}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.error ||
                "No se pudo eliminar el ticket."
            );
        }

        mostrarMensaje(
            "Ticket eliminado correctamente.",
            "success"
        );

        cerrarDetalle();
        await cargarTickets();
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
}

filtroEstado.addEventListener("change", mostrarTabla);
filtroPrioridad.addEventListener("change", mostrarTabla);

btnActualizar.addEventListener("click", cargarTickets);
btnGuardarTicket.addEventListener("click", guardarCambios);
btnEliminarTicket.addEventListener("click", eliminarTicket);
btnCerrarDetalle.addEventListener("click", cerrarDetalle);

cargarTickets();