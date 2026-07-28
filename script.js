const formulario = document.getElementById("formulario-turno");

const URL = "https://script.google.com/macros/s/AKfycbxvhdakYXCajHEk5ZoMMYXuMhN-W4OsT73vtb1j4RTWPCSLR9I_G6s-i3FiXXT-yq2K/exec";

formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = {
        nombre: formulario.elements["nombre"].value,
        telefono: formulario.elements["telefono"].value,
        vehiculo: formulario.elements["vehiculo"].value,
        patente: formulario.elements["patente"].value,
        falla: formulario.elements["falla"].value
    };

    console.log(datos);

    try {

        await fetch(URL, {
    method: "POST",
    body: JSON.stringify(datos)
});

        console.log("Nombre:", datos.nombre);
        console.log("Telefono:", datos.telefono);
        console.log("Vehiculo:", datos.vehiculo);
        console.log("Patente:", datos.patente);
        console.log("Falla:", datos.falla);

        alert("✅ Solicitud enviada correctamente.");
        formulario.reset();

    } catch (error) {
        console.error(error);
        alert("❌ No se pudo enviar la solicitud.");
    }
});