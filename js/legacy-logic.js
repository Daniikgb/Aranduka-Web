/* Ported Legacy Logic from Original Site */

$(window).on('load', function () {
    const userData = localStorage.getItem('userData');
    const downloadButtons = document.querySelectorAll('.downloadDocBtn');

    if (!userData) {
        // Warning: #registerModal was not found in the provided HTML source.
        // Ensure this ID exists in your layout if you want the modal to appear.
        if ($("#registerModal").length) {
            $("#registerModal").modal("show");
        }
        downloadButtons.forEach(button => {
            button.classList.remove('d-block');
            button.classList.add('d-none');
        });
    } else {
        downloadButtons.forEach(button => {
            button.classList.remove('d-none');
            button.classList.add('d-block');
        });
    }
});

$(document).ready(function () {
    $(document).on('click', '.downloadDocBtn', function (event) {
        // MODO INDEPENDIENTE: No contactar servidor externo
        // event.preventDefault(); // Si quieres que la descarga sea directa, quitamos esto o lo manejamos aqui.

        // Simplemente permitimos la descarga directa si el href es válido
        // O si queremos simular el proceso anterior:
        console.log("Descarga iniciada (Modo Independiente - Sin rastreo externo)");

        // Confetti Celebration!
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#0c647c', '#0ee0f3', '#f472b6']
            });
        }

        // Mostrar SweetAlert para dar feedback visual al usuario antes de descargar
        Swal.fire({
            icon: 'success',
            title: '¡Descarga en curso!',
            text: 'Tu material se está descargando...',
            timer: 2000,
            showConfirmButton: false
        });

        // No hacemos preventDefault() para que el navegador maneje la descarga del archivo linkeado en href
        return true;
    });

    $('#frontUserRegister').on('submit', function (event) {
        event.preventDefault();

        // MODO INDEPENDIENTE: Simulación de respuesta exitosa sin backend
        // var cliente = $(this).serializeJSON(); // Dependencia externa posible
        var cliente = {};
        $(this).serializeArray().forEach(function (item) {
            cliente[item.name] = item.value;
        });

        // Simulamos una respuesta exitosa inmediata
        var response = {
            error: false,
            userData: cliente, // Usamos los datos del formulario como datos de usuario
            message: "Registro local exitoso (Modo Independiente)"
        };

        console.log("Simulando respuesta del servidor:", response);
        localStorage.setItem("userData", JSON.stringify(response.userData));

        document.querySelectorAll('.downloadDocBtn').forEach(button => {
            button.classList.remove('d-none');
            button.classList.add('d-block');
        });

        $("#registerModal").modal("hide");
        Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            html: `<h6>${response.message}</h6>`,
            showConfirmButton: false,
            timer: 3000
        });
    });

    $("#contact-form-front").submit(function (e) {
        e.preventDefault();
        // MODO INDEPENDIENTE: Simulación local

        console.log("Formulario de contacto enviado localmente (Simulado)");

        // Simulamos respuesta positiva inmediata
        var response = {
            error: false,
            message: "Mensaje enviado correctamente (Modo Independiente)"
        };

        Swal.fire({
            icon: 'success',
            title: '¡Enviado!',
            html: `<h6>${response.message}</h6>`,
            showConfirmButton: false,
            timer: 3000
        });

        window.setTimeout(function () {
            var form = document.querySelector('form#contact-form-front');
            if (form) form.reset();
        }, 0);
    });
});
