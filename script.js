const formulario = document.getElementById("formulario-turno");
const estadoFormulario = document.getElementById("estado-formulario");
const horarios = document.getElementById("horarios");
const endpointTurnos = "https://script.google.com/macros/s/AKfycbxvhdakYXCajHEk5ZoMMYXuMhN-W4OsT73vtb1j4RTWPCSLR9I_G6s-i3FiXXT-yq2K/exec";

let horarioSeleccionado = "";
let turnos = [];

function mostrarMensaje(texto, tipo) {
    estadoFormulario.textContent = texto;
    estadoFormulario.className = `mensaje-formulario ${tipo}`;
    estadoFormulario.hidden = false;
}

function configurarAnimacionesDeEntrada() {
    const elementos = document.querySelectorAll(
        ".tarjeta, .formulario, .texto-ubicacion, .contenedor-mapa"
    );

    if (!("IntersectionObserver" in window)) return;

    elementos.forEach((elemento, indice) => {
        elemento.classList.add("revelar-activo");
        elemento.style.transitionDelay = `${Math.min(indice % 3, 2) * 100}ms`;
    });

    const observador = new IntersectionObserver((entradas, instancia) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add("visible");
            instancia.unobserve(entrada.target);
        });
    }, { threshold: 0.12 });

    elementos.forEach((elemento) => observador.observe(elemento));
}

async function cargarTurnos() {
    try {
        const respuesta = await fetch(endpointTurnos);
        if (!respuesta.ok) throw new Error("No se pudieron cargar los turnos.");

        const datos = await respuesta.json();
        turnos = Array.isArray(datos) ? datos : [];
    } catch (error) {
        console.error(error);
        turnos = [];
    }
}

function actualizarHorariosDisponibles(fecha) {
    horarioSeleccionado = "";

    document.querySelectorAll(".hora").forEach((boton) => {
        const ocupado = turnos.some(
            (turno) => turno.fecha === fecha && turno.hora === boton.textContent.trim()
        );

        boton.disabled = ocupado;
        boton.classList.toggle("ocupado", ocupado);
        boton.classList.remove("seleccionado");
        boton.setAttribute("aria-pressed", "false");
    });
}

function configurarSelectorDeFechas() {
    if (typeof flatpickr !== "function") {
        mostrarMensaje("No se pudo cargar el selector de fechas. Recargá la página e intentá nuevamente.", "error");
        return;
    }

    flatpickr("#fecha", {
        dateFormat: "d/m/Y",
        minDate: "today",
        maxDate: new Date().fp_incr(30),
        disable: [(date) => date.getDay() === 0 || date.getDay() === 6],
        onChange: (_, fecha) => {
            horarios.hidden = false;
            actualizarHorariosDisponibles(fecha);
        }
    });
}

function configurarSeleccionDeHorario() {
    document.querySelectorAll(".hora").forEach((boton) => {
        boton.addEventListener("click", () => {
            if (boton.disabled) return;

            horarioSeleccionado = boton.textContent.trim();
            document.querySelectorAll(".hora").forEach((item) => {
                item.classList.remove("seleccionado");
                item.setAttribute("aria-pressed", "false");
            });

            boton.classList.add("seleccionado");
            boton.setAttribute("aria-pressed", "true");
        });
    });
}

function configurarFormulario() {
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        if (!horarioSeleccionado) {
            mostrarMensaje("Elegí un horario disponible para continuar.", "consulta");
            return;
        }

        const botonEnviar = formulario.querySelector(".boton");
        const datos = Object.fromEntries(new FormData(formulario));
        datos.hora = horarioSeleccionado;

        botonEnviar.disabled = true;
        mostrarMensaje("Enviando tu consulta…", "consulta");

        try {
            const respuesta = await fetch(endpointTurnos, {
                method: "POST",
                body: JSON.stringify(datos)
            });

            if (!respuesta.ok) throw new Error("No se pudo enviar la consulta.");

            mostrarMensaje("Solicitud enviada correctamente. ¡Gracias!", "exito");
            formulario.reset();
            horarioSeleccionado = "";
            horarios.hidden = true;
            await cargarTurnos();
        } catch (error) {
            console.error(error);
            mostrarMensaje("No se pudo enviar la consulta. Por favor, intentá nuevamente.", "error");
        } finally {
            botonEnviar.disabled = false;
        }
    });
}

configurarAnimacionesDeEntrada();
configurarSelectorDeFechas();
configurarSeleccionDeHorario();
configurarFormulario();
cargarTurnos();
