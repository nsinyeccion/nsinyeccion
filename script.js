const formulario = document.getElementById("formulario-turno");

const URL = "https://script.google.com/macros/s/AKfycbxvhdakYXCajHEk5ZoMMYXuMhN-W4OsT73vtb1j4RTWPCSLR9I_G6s-i3FiXXT-yq2K/exec";

let horarioSeleccionado = "";
let turnos = [];


// =========================
// Cargar turnos existentes
// =========================

async function cargarTurnos() {

    try {

        const respuesta = await fetch(URL);
        turnos = await respuesta.json();

        console.log("Turnos existentes:", turnos);

    } catch (error) {

        console.error("Error al cargar turnos:", error);

    }

}


// =========================
// Calendario
// =========================

flatpickr("#fecha", {

    dateFormat: "d/m/Y",
    minDate: "today",
    maxDate: new Date().fp_incr(30),

    disable: [
        function(date) {
            return date.getDay() === 0 || date.getDay() === 6;
        }
    ],


    onChange: function(selectedDates, dateStr) {

    mostrarHorarios();

    actualizarHorariosDisponibles(dateStr);

}

});


// =========================
// Mostrar horarios
// =========================

function mostrarHorarios() {

    document.getElementById("horarios").style.display = "block";

}



// =========================
// Bloquear horarios ocupados
// =========================

function actualizarHorariosDisponibles(fechaSeleccionada) {


    document.querySelectorAll(".hora").forEach(function(boton) {


        const hora = boton.textContent.trim();


        const ocupado = turnos.some(function(turno) {

    console.log("Comparando:");
    console.log("Fecha elegida:", fechaSeleccionada);
    console.log("Fecha turno:", turno.fecha);
    console.log("Hora botón:", hora);
    console.log("Hora turno:", turno.hora);


    return turno.fecha === fechaSeleccionada &&
           turno.hora === hora;

});



        if (ocupado) {

            boton.disabled = true;
            boton.classList.add("ocupado");


        } else {

            boton.disabled = false;
            boton.classList.remove("ocupado");

        }


    });


}


// =========================
// Selección de horario
// =========================

document.querySelectorAll(".hora").forEach(function(boton) {


    boton.addEventListener("click", function() {


        if (this.disabled) {
            return;
        }


        horarioSeleccionado = this.textContent.trim();


        console.log("Horario elegido:", horarioSeleccionado);



        document.querySelectorAll(".hora").forEach(function(b) {

            b.classList.remove("seleccionado");

        });



        this.classList.add("seleccionado");


    });


});



// =========================
// Enviar formulario
// =========================

formulario.addEventListener("submit", async (e) => {


    e.preventDefault();



    if (horarioSeleccionado === "") {

        alert("Por favor seleccione un horario.");

        return;

    }



    const datos = {


        nombre: formulario.elements["nombre"].value,

        telefono: formulario.elements["telefono"].value,

        vehiculo: formulario.elements["vehiculo"].value,

        patente: formulario.elements["patente"].value,

        falla: formulario.elements["falla"].value,

        fecha: formulario.elements["fecha"].value,

        hora: horarioSeleccionado


    };



    try {


        await fetch(URL, {

            method: "POST",

            body: JSON.stringify(datos)

        });



        alert("✅ Solicitud enviada correctamente.");



        formulario.reset();



        horarioSeleccionado = "";



        document.querySelectorAll(".hora").forEach(function(b) {

            b.classList.remove("seleccionado");

            b.disabled = false;

            b.classList.remove("ocupado");

        });



        document.getElementById("horarios").style.display = "none";



        // Actualizamos la lista por si alguien acaba de reservar
        await cargarTurnos();



    } catch (error) {


        console.error(error);


        alert("❌ No se pudo enviar la solicitud.");


    }


});

cargarTurnos();
