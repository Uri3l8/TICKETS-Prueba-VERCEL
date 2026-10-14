const API_URL = "/api/tickets";

const ticketForm = document.getElementById("ticketForm");
const nombreUsuario = document.getElementById("nombreUsuario");
const buscarUsuario = document.getElementById("buscarUsuario");
const btnBuscar = document.getElementById("btnBuscar");
const btnMostrarTodos = document.getElementById("btnMostrarTodos");
const listaTickets = document.getElementById("listaTickets");
const mensajeUsuario = document.getElementById("mensajeUsuario");

function mostrarMensaje(texto, tipo) {
    mensajeUsuario.textContent = texto;
    mensajeUsuario.className = `user-message alert alert-${tipo}`;

    setTimeout(() => {
        mensajeUsuario.classList.add("hidden");
    }, 4000);
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleString("es-GT", {
        dateStyle: "medium",
        timeStyle: "short"
    });
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

function textoEstado(estado) {
    const textos = {
        PENDIENTE: "Pendiente",
        EN_REVISION: "En revisión",
        EN_PROCESO: "En proceso",
        RESUELTO: "Resuelto"
    };

    return textos[estado] || estado;
}

function crearTicketVisual(ticket) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "ticket-card";

    const encabezado = document.createElement("div");
    encabezado.className = "ticket-card-top";

    const id = document.createElement("span");
    id.className = "ticket-id";
    id.textContent = `Ticket #${ticket.id}`;

    const estado = document.createElement("span");
    estado.className = `badge ${claseEstado(ticket.estado)}`;
    estado.textContent = textoEstado(ticket.estado);

    encabezado.append(id, estado);

    const titulo = document.createElement("h3");
    titulo.textContent = ticket.titulo;

    const descripcion = document.createElement("p");
    descripcion.textContent = ticket.descripcion;

    const usuario = document.createElement("p");
    usuario.className = "ticket-user-name";
    usuario.textContent = `Solicitado por: ${ticket.nombre_usuario}`;

    const informacion = document.createElement("div");
    informacion.className = "ticket-info";

    const prioridad = document.createElement("span");
    prioridad.className = `badge ${clasePrioridad(ticket.prioridad)}`;
    prioridad.textContent = ticket.prioridad;

    const fecha = document.createElement("span");
    fecha.className = "ticket-date";
    fecha.textContent = formatearFecha(ticket.fecha_creacion);

    informacion.append(prioridad, fecha);

    tarjeta.append(
        encabezado,
        titulo,
        descripcion,
        usuario,
        informacion
    );

    return tarjeta;
}

function mostrarTickets(tickets) {
    listaTickets.replaceChildren();

    if (tickets.length === 0) {
        const vacio = document.createElement("div");
        vacio.className = "user-empty";

        const titulo = document.createElement("strong");
        titulo.textContent = "No se encontraron tickets";

        vacio.append(
            titulo,
            document.createTextNode(
                "No existen solicitudes para mostrar."
            )
        );

        listaTickets.appendChild(vacio);
        return;
    }

    tickets.forEach((ticket) => {
        listaTickets.appendChild(crearTicketVisual(ticket));
    });
}

async function cargarTodosLosTickets() {
    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("No se pudieron consultar los tickets.");
        }

        const tickets = await respuesta.json();
        mostrarTickets(tickets);
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
}

async function consultarTicketsPorUsuario(usuario) {
    try {
        const respuesta = await fetch(
            `${API_URL}?usuario=${encodeURIComponent(usuario)}`
        );

        if (!respuesta.ok) {
            throw new Error("No se pudieron consultar los tickets.");
        }

        const tickets = await respuesta.json();
        mostrarTickets(tickets);
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
}

ticketForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const datos = {
        nombre_usuario: nombreUsuario.value.trim(),
        titulo: document.getElementById("titulo").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        prioridad: document.getElementById("prioridad").value
    };

    try {
        const respuesta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.error || "No se pudo crear el ticket."
            );
        }

        mostrarMensaje(
            "Ticket creado correctamente.",
            "success"
        );

        ticketForm.reset();
        nombreUsuario.value = datos.nombre_usuario;

        await cargarTodosLosTickets();
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
});

btnBuscar.addEventListener("click", () => {
    const usuario = buscarUsuario.value.trim();

    if (!usuario) {
        cargarTodosLosTickets();
        return;
    }

    consultarTicketsPorUsuario(usuario);
});

btnMostrarTodos.addEventListener("click", () => {
    buscarUsuario.value = "";
    cargarTodosLosTickets();
});

buscarUsuario.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        btnBuscar.click();
    }
});

cargarTodosLosTickets();