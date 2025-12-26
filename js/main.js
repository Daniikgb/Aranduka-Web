
document.addEventListener('DOMContentLoaded', function () {
    // ==========================================
    // 0. INITIALIZATION & CONFIG
    // ==========================================

    // Force Scroll to Top
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    // Core State
    let currentUser = JSON.parse(localStorage.getItem('aranduka_currentUser')) || null;
    let currentFilter = { type: 'all', value: '' };
    let currentSort = 'az';
    let isNavigatingHistory = false;

    // Handle Browser Back Button (Anti-Gravity Pro+)
    window.addEventListener('popstate', (event) => {
        isNavigatingHistory = true;
        const modal = document.getElementById('quickViewModal');
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open-freeze');
        } else {
            // Default State
            $('.modal').modal('hide');
            renderBooks('all');
            elements.introTitle.innerText = "Explora nuestros materiales";
        }
        isNavigatingHistory = false;
    });

    // DOM Elements
    const elements = {
        loginModal: $('#loginModal'),
        authRequiredModal: $('#authRequiredModal'),
        adminDashboardModal: $('#adminDashboardModal'),
        booksContainer: document.getElementById('books-container'),
        introTitle: document.querySelector('.dashboard-header-bg .section-header p') || document.getElementById('viewTitle'),
        viewTitle: document.getElementById('viewTitle'),
        searchInput: document.getElementById('searchInput'),
        sortSelect: document.getElementById('sortBooks'),
        heroCarouselInner: document.getElementById('heroCarouselInner'),
        tabs: document.querySelectorAll('.tab-btn'),
        sections: document.querySelectorAll('.filter-section'),
        adminTableBody: document.getElementById('admin-users-table-body'),
        voiceBtn: document.getElementById('voiceSearchBtn'),
        loginBtn: document.getElementById('loginBtn')
    };

    // Auth Listeners
    if (elements.loginBtn) {
        elements.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            elements.loginModal.modal('show');
        });
    }

    // ==========================================
    // 1. DATA (CATALOGO DIGITAL & HIERARCHY)
    // ==========================================

    // Hierarchy Definition (Critical for "Elegir distintos cursos sin salir")
    const educationLevels = {
        'educacion inicial': ['Jardín', 'Pre-Jardín', 'Pre-Escolar'],
        'primer ciclo': ['1° Grado', '2° Grado', '3° Grado'],
        'segundo ciclo': ['4° Grado', '5° Grado', '6° Grado'],
        'tercer ciclo': ['7° Grado', '8° Grado', '9° Grado'],
        'nivel medio': ['1° Curso', '2° Curso', '3° Curso']
    };

    // Lista base de libros (Completo)
    const books = [
        // --- NIVEL INICIAL ---
        { id: 101, title: "Texto \"Mis Huellas\" Pre-Jardín", category: "inicial", level: "pre-jardin", image: "img/portadas/pre-jardin.png", file: "documentos/libro-ejemplo.pdf", guideFile: "documentos/guia-docente-ejemplo.docx", description: "Material lúdico para el desarrollo sensorio-motor." },
        { id: 102, title: "Texto \"Mis Huellas\" Jardín", category: "inicial", level: "jardin", image: "img/portadas/jardin.png", file: "documentos/libro-ejemplo.pdf", guideFile: "documentos/guia-docente-ejemplo.docx", description: "Fomenta la expresión creativa y la autonomía." },
        { id: 103, title: "Texto \"Mis Huellas\" Pre-Escolar", category: "inicial", level: "pre-escolar", image: "img/portadas/MISHUELLASPREESCOLAR.png", file: "documentos/libro-ejemplo.pdf", guideFile: "documentos/guia-docente-ejemplo.docx", description: "Preparación para la lectoescritura y cálculo." },
        { id: 104, title: "Texto \"Mis Lecciones\" Pre-Escolar", category: "inicial", level: "pre-escolar", image: "img/portadas/MISLECCIONESPREESCOLAR.png", file: "documentos/libro-ejemplo.pdf", guideFile: "documentos/guia-docente-ejemplo.docx", description: "Guía complementaria con actividades prácticas." },

        // --- 1° y 2° CICLO ---
        { id: 201, title: "Matemática 1° Grado", category: "matematica", level: "1-grado", image: "img/portadas/mat1.png", file: "documentos/libro-ejemplo.pdf", description: "Introducción al mundo de los números y formas." },
        { id: 202, title: "Matemática 2° Grado", category: "matematica", level: "2-grado", image: "img/portadas/mat2.png", file: "documentos/libro-ejemplo.pdf", description: "Operaciones básicas y pensamiento lógico." },
        { id: 203, title: "Matemática 3° Grado", category: "matematica", level: "3-grado", image: "img/portadas/mat3.png", file: "documentos/libro-ejemplo.pdf", description: "Resolución de problemas y medidas." },
        { id: 204, title: "Matemática 4° Grado", category: "matematica", level: "4-grado", image: "img/portadas/mat4.png", file: "documentos/libro-ejemplo.pdf", description: "Fracciones, decimales y geometría aplicada." },
        { id: 205, title: "Matemática 5° Grado", category: "matematica", level: "5-grado", image: "img/portadas/mat5.png", file: "documentos/libro-ejemplo.pdf", description: "Análisis de datos y proporcionalidad." },
        { id: 206, title: "Matemática 6° Grado", category: "matematica", level: "6-grado", image: "img/portadas/mat6.png", file: "documentos/libro-ejemplo.pdf", description: "Consolidación de competencias aritméticas." },

        { id: 211, title: "Guaraní 1° Grado", category: "guarani", level: "1-grado", image: "img/portadas/gua1.png", file: "documentos/libro-ejemplo.pdf", description: "Ñe’ê ñepyrû: Primeros pasos en la lengua materna." },
        { id: 212, title: "Guaraní 2° Grado", category: "guarani", level: "2-grado", image: "img/portadas/gua2.png", file: "documentos/libro-ejemplo.pdf", description: "Expansión del vocabulario y frases cortas." },
        { id: 213, title: "Guaraní 3° Grado", category: "guarani", level: "3-grado", image: "img/portadas/gua3.png", file: "documentos/libro-ejemplo.pdf", description: "Lectura comprensiva de textos breves." },
        { id: 214, title: "Guaraní 4° Grado", category: "guarani", level: "4-grado", image: "img/portadas/gua4.png", file: "documentos/libro-ejemplo.pdf", description: "Gramática básica y redacción." },
        { id: 215, title: "Guaraní 5° Grado", category: "guarani", level: "5-grado", image: "img/portadas/gua5.png", file: "documentos/libro-ejemplo.pdf", description: "Diálogos sobre historia y folclore." },
        { id: 216, title: "Guaraní 6° Grado", category: "guarani", level: "6-grado", image: "img/portadas/gua6.png", file: "documentos/libro-ejemplo.pdf", description: "Análisis literario básico y producción de textos." },

        { id: 221, title: "Comunicación 1° Grado", category: "comunicacion", level: "1-grado", image: "img/portadas/lit1.png", file: "documentos/libro-ejemplo.pdf", description: "Iniciación a la lectura y escritura." },
        { id: 222, title: "Comunicación 2° Grado", category: "comunicacion", level: "2-grado", image: "img/portadas/lit2.png", file: "documentos/libro-ejemplo.pdf", description: "Mejora de la fluidez lectora." },
        { id: 223, title: "Comunicación 3° Grado", category: "comunicacion", level: "3-grado", image: "img/portadas/lit3.png", file: "documentos/libro-ejemplo.pdf", description: "Comprensión lectora y redacción creativa." },
        { id: 224, title: "Comunicación 4° Grado", category: "comunicacion", level: "4-grado", image: "img/portadas/lit4.png", file: "documentos/libro-ejemplo.pdf", description: "Reglas ortográficas y gramática." },
        { id: 225, title: "Comunicación 5° Grado", category: "comunicacion", level: "5-grado", image: "img/portadas/lit5.png", file: "documentos/libro-ejemplo.pdf", description: "Producción de textos periodísticos." },
        { id: 226, title: "Comunicación 6° Grado", category: "comunicacion", level: "6-grado", image: "img/portadas/lit6.png", file: "documentos/libro-ejemplo.pdf", description: "Refinamiento de la expresión oral y escrita." },

        { id: 231, title: "Mis Lecciones: Vida Social 1°", category: "sociales", level: "1-grado", image: "img/portadas/mislecciones1dogrado.png", file: "documentos/libro-ejemplo.pdf", description: "Conociendo mi entorno, familia y escuela." },
        { id: 232, title: "Mis Lecciones: Vida Social 2°", category: "sociales", level: "2-grado", image: "img/portadas/mislecciones2dogrado.png", file: "documentos/libro-ejemplo.pdf", description: "Interacción social y normas de convivencia." },
        { id: 233, title: "Mis Lecciones: Vida Social 3°", category: "sociales", level: "3-grado", image: "img/portadas/mislecciones3dogrado.png", file: "documentos/libro-ejemplo.pdf", description: "Ubicación espacial y departamentos del Paraguay." },

        { id: 244, title: "Ciencias Naturales 4°", category: "ciencias-de-la-naturaleza-y-salud", level: "4-grado", image: "img/portadas/c4.png", file: "documentos/libro-ejemplo.pdf", description: "Ecosistemas, materia y energía." },
        { id: 245, title: "Ciencias Naturales 5°", category: "ciencias-de-la-naturaleza-y-salud", level: "5-grado", image: "img/portadas/c5.png", file: "documentos/libro-ejemplo.pdf", description: "Cuerpo humano y salud." },
        { id: 246, title: "Ciencias Naturales 6°", category: "ciencias-de-la-naturaleza-y-salud", level: "6-grado", image: "img/portadas/c6.png", file: "documentos/libro-ejemplo.pdf", description: "Fenómenos físicos, químicos y la célula." },

        { id: 251, title: "Calígrafo 1° Grado", category: "caligrafia", level: "1-grado", image: "img/portadas/2gradocaligrafo.png", file: "documentos/libro-ejemplo.pdf", description: "Ejercicios de trazo inicial." },
        { id: 252, title: "Calígrafo 2° Grado", category: "caligrafia", level: "2-grado", image: "img/portadas/1gradocaligrafo.png", file: "documentos/libro-ejemplo.pdf", description: "Práctica de escritura cursiva." },
        { id: 253, title: "Calígrafo 3° Grado", category: "caligrafia", level: "3-grado", image: "img/portadas/3gradocaligrafo.png", file: "documentos/libro-ejemplo.pdf", description: "Perfeccionamiento de la caligrafía." },
        { id: 254, title: "Calígrafo 4° Grado", category: "caligrafia", level: "4-grado", image: "img/portadas/4gradocaligrafo.png", file: "documentos/libro-ejemplo.pdf", description: "Refuerzo de escritura ordenada." },
        { id: 255, title: "Calígrafo 5° Grado", category: "caligrafia", level: "5-grado", image: "img/portadas/5gradocaligrafo.png", file: "documentos/libro-ejemplo.pdf", description: "Estética y presentación." },
        { id: 256, title: "Calígrafo 6° Grado", category: "caligrafia", level: "6-grado", image: "img/portadas/6gradocaligrafo.png", file: "documentos/libro-ejemplo.pdf", description: "Dominio de caligrafía clara." },

        // --- 3° CICLO ---
        { id: 301, title: "Matemática 7° Grado", category: "matematica", level: "7-grado", image: "img/portadas/mat7.png", file: "documentos/libro-ejemplo.pdf", description: "Álgebra y conjuntos numéricos." },
        { id: 302, title: "Matemática 8° Grado", category: "matematica", level: "8-grado", image: "img/portadas/mat8.png", file: "documentos/libro-ejemplo.pdf", description: "Polinomios y ecuaciones lineales." },
        { id: 303, title: "Matemática 9° Grado", category: "matematica", level: "9-grado", image: "img/portadas/mat9.png", file: "documentos/libro-ejemplo.pdf", description: "Funciones y trigonometría." },

        { id: 311, title: "Lit. Castellana 7°", category: "comunicacion", level: "7-grado", image: "img/portadas/lit7.png", file: "documentos/libro-ejemplo.pdf", description: "Obras juveniles y técnicas de estudio." },
        { id: 312, title: "Lit. Castellana 8°", category: "comunicacion", level: "8-grado", image: "img/portadas/lit8.png", file: "documentos/libro-ejemplo.pdf", description: "Géneros literarios y ensayos." },
        { id: 313, title: "Lit. Castellana 9°", category: "comunicacion", level: "9-grado", image: "img/portadas/lit9.png", file: "documentos/libro-ejemplo.pdf", description: "Literatura paraguaya y oratoria." },

        { id: 321, title: "Guaraní 7° Grado", category: "guarani", level: "7-grado", image: "img/portadas/g7.png", file: "documentos/libro-ejemplo.pdf", description: "Gramática profunda y folclore." },
        { id: 322, title: "Guaraní 8° Grado", category: "guarani", level: "8-grado", image: "img/portadas/g8.png", file: "documentos/libro-ejemplo.pdf", description: "Producción literaria en guaraní." },
        { id: 323, title: "Guaraní 9° Grado", category: "guarani", level: "9-grado", image: "img/portadas/g9.png", file: "documentos/libro-ejemplo.pdf", description: "Investigación cultural y traducción." },

        { id: 331, title: "Trabajo y Tec. 7°", category: "trabajo-tecnologia", level: "7-grado", image: "img/portadas/tyt7.png", file: "documentos/libro-ejemplo.pdf", description: "Informática y economía doméstica." },
        { id: 332, title: "Trabajo y Tec. 8°", category: "trabajo-tecnologia", level: "8-grado", image: "img/portadas/tyt8.png", file: "documentos/libro-ejemplo.pdf", description: "Emprendedurismo y orientación." },
        { id: 333, title: "Trabajo y Tec. 9°", category: "trabajo-tecnologia", level: "9-grado", image: "img/portadas/tyt9.png", file: "documentos/libro-ejemplo.pdf", description: "Proyectos y marketing básico." },

        { id: 341, title: "Historia 7° Grado", category: "historia", level: "7-grado", image: "img/portadas/hyg7.png", file: "documentos/libro-ejemplo.pdf", description: "Prehistoria y civilizaciones." },
        { id: 342, title: "Historia 8° Grado", category: "historia", level: "8-grado", image: "img/portadas/hyg8.png", file: "documentos/libro-ejemplo.pdf", description: "Historia colonial e independencia." },
        { id: 343, title: "Historia 9° Grado", category: "historia", level: "9-grado", image: "img/portadas/hyg9.png", file: "documentos/libro-ejemplo.pdf", description: "Historia del Paraguay independiente." },

        { id: 351, title: "Ética 7° Grado", category: "etica", level: "7-grado", image: "img/portadas/etica7.png", file: "documentos/libro-ejemplo.pdf", description: "Valores humanos y convivencia." },
        { id: 352, title: "Ética 8° Grado", category: "etica", level: "8-grado", image: "img/portadas/etica8.png", file: "documentos/libro-ejemplo.pdf", description: "Constitución y estado de derecho." },
        { id: 353, title: "Ética 9° Grado", category: "etica", level: "9-grado", image: "img/portadas/etica9.png", file: "documentos/libro-ejemplo.pdf", description: "Derechos humanos universales." },

        { id: 361, title: "Ciencias 7° Grado", category: "ciencias-de-la-naturaleza-y-salud", level: "7-grado", image: "img/portadas/ciencias7.png", file: "documentos/libro-ejemplo.pdf", description: "Método científico y materia." },
        { id: 362, title: "Ciencias 8° Grado", category: "ciencias-de-la-naturaleza-y-salud", level: "8-grado", image: "img/portadas/ciencias8.png", file: "documentos/libro-ejemplo.pdf", description: "Física, química y anatomía." },
        { id: 363, title: "Ciencias 9° Grado", category: "ciencias-de-la-naturaleza-y-salud", level: "9-grado", image: "img/portadas/ciencia9.png", file: "documentos/libro-ejemplo.pdf", description: "Genética y educación sexual." },

        // --- NIVEL MEDIO ---
        { id: 401, title: "Literatura 1° Curso", category: "comunicacion", level: "1-curso", image: "img/portadas/litcurso1.png", file: "documentos/libro-ejemplo.pdf", description: "Análisis de obras clásicas." },
        { id: 402, title: "Literatura 2° Curso", category: "comunicacion", level: "2-curso", image: "img/portadas/litcurso2.png", file: "documentos/libro-ejemplo.pdf", description: "Literatura hispanoamericana." },
        { id: 403, title: "Literatura 3° Curso", category: "comunicacion", level: "3-curso", image: "img/portadas/litcurso3.png", file: "documentos/libro-ejemplo.pdf", description: "Literatura paraguaya contemporánea." },

        { id: 411, title: "Guaraní 1° Curso", category: "guarani", level: "1-curso", image: "img/portadas/guarani primercurso.png", file: "documentos/libro-ejemplo.pdf", description: "Ñe’êporâhaipyre avanzado." },
        { id: 412, title: "Guaraní 2° Curso", category: "guarani", level: "2-curso", image: "img/portadas/guarani2.jpeg", file: "documentos/libro-ejemplo.pdf", description: "Traducción técnica y periodística." },
        { id: 413, title: "Guaraní 3° Curso", category: "guarani", level: "3-curso", image: "img/portadas/guarani tercercurso.png", file: "documentos/libro-ejemplo.pdf", description: "Obras teatrales y ensayos." },

        { id: 421, title: "Historia 1° Curso", category: "historia", level: "1-curso", image: "img/portadas/hyg1.png", file: "documentos/libro-ejemplo.pdf", description: "Historia Universal." },
        { id: 422, title: "Historia 2° Curso", category: "historia", level: "2-curso", image: "img/portadas/hyg2.png", file: "documentos/libro-ejemplo.pdf", description: "Historia Americana." },
        { id: 423, title: "Historia 3° Curso", category: "historia", level: "3-curso", image: "img/portadas/hyg3.png", file: "documentos/libro-ejemplo.pdf", description: "Historia contemporánea y geopolítica." },

        { id: 431, title: "Política 3° Curso", category: "politica", level: "3-curso", image: "img/portadas/politica3.png", file: "documentos/libro-ejemplo.pdf", description: "Sistemas de gobierno." },
        { id: 432, title: "Sociología 3° Curso", category: "sociologia", level: "3-curso", image: "img/portadas/sociologia3.png", file: "documentos/libro-ejemplo.pdf", description: "Estudio de la sociedad." },

        { id: 442, title: "Física 2° Curso", category: "fisica", level: "2-curso", image: "img/portadas/fisica2.png", file: "documentos/libro-ejemplo.pdf", description: "Termodinámica y óptica." },
        { id: 443, title: "Física 3° Curso", category: "fisica", level: "3-curso", image: "img/portadas/fisica3.png", file: "documentos/libro-ejemplo.pdf", description: "Electricidad y física moderna." },
        { id: 445, title: "Química 2° Curso", category: "quimica", level: "2-curso", image: "img/portadas/quimica2.png", file: "documentos/libro-ejemplo.pdf", description: "Reacciones y estequiometría." },
        { id: 446, title: "Química 3° Curso", category: "quimica", level: "3-curso", image: "img/portadas/quimmica3.png", file: "documentos/libro-ejemplo.pdf", description: "Química orgánica." },
        { id: 460, title: "Filosofía 2° Curso", category: "filosofia", level: "2-curso", image: "img/portadas/filosofia2.png", file: "documentos/libro-ejemplo.pdf", description: "Pensamiento filosófico y lógica." },

        // --- ENSAYOS DE CLIENTES / COMUNIDAD ---
        { id: 901, title: "Ensayo sobre la Reforma Educativa", category: "ensayo", level: "comunidad", image: "img/portadas/default_cover.png", file: "documentos/libro-ejemplo.pdf", description: "Aporte de Juan Pérez sobre la educación paraguaya." },
        { id: 902, title: "La Importancia de la Lectura", category: "ensayo", level: "comunidad", image: "img/portadas/default_cover.png", file: "documentos/libro-ejemplo.pdf", description: "Reflexión sobre el hábito lector en jóvenes." },
        { id: 903, title: "Héroes del Paraguay", category: "ensayo", level: "comunidad", image: "img/portadas/default_cover.png", file: "documentos/libro-ejemplo.pdf", description: "Reseña histórica colaborativa." }
    ];

    // ==========================================
    // 2. UTILITIES (HELPERS)
    // ==========================================

    const normalizeKey = (str) => {
        if (!str) return '';
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[°º]/g, '').toLowerCase().trim();
    };

    const isAdmin = () => currentUser && currentUser.role === 'admin';

    // ==========================================
    // 3. AUTHENTICATION (PHP/FETCH)
    // ==========================================

    // ==========================================
    // 3. AUTHENTICATION (DEMO MODE FOR GITHUB PAGES)
    // ==========================================

    const checkSession = () => {
        currentUser = JSON.parse(localStorage.getItem('aranduka_currentUser'));
        const authMenuItem = document.getElementById('auth-menu-item');
        const userDisplayItem = document.getElementById('user-display-item');
        const headerUserName = document.getElementById('headerUserName');
        const adminMenuItem = document.getElementById('admin-menu-item');
        const logoutTab = document.querySelector('.tab-btn[data-target="logout"]');

        if (currentUser) {
            if (authMenuItem) authMenuItem.classList.add('d-none');
            if (userDisplayItem) userDisplayItem.classList.remove('d-none');
            if (headerUserName) headerUserName.innerText = currentUser.nombre_completo || currentUser.name || 'Usuario';
            if (logoutTab) logoutTab.classList.remove('d-none');

            document.body.classList.toggle('is-admin', currentUser.role === 'admin');
            if (adminMenuItem) {
                currentUser.role === 'admin' ? adminMenuItem.classList.remove('d-none') : adminMenuItem.classList.add('d-none');
            }
        } else {
            if (authMenuItem) authMenuItem.classList.remove('d-none');
            if (userDisplayItem) userDisplayItem.classList.add('d-none');
            if (adminMenuItem) adminMenuItem.classList.add('d-none');
            if (logoutTab) logoutTab.classList.add('d-none');
            document.body.classList.remove('is-admin');
        }
    };

    // --- REAL BACKEND LOGIN ---
    $('#studentLoginForm').on('submit', async function (e) {
        e.preventDefault();
        const ci = $(this).find('input[name="ci"]').val().trim();
        if (!ci) return Swal.fire('Error', 'Ingresa tu cédula o usuario', 'warning');

        Swal.showLoading();

        try {
            const formData = new FormData();
            formData.append('ci', ci);

            const response = await fetch('backend/login.php', {
                method: 'POST',
                body: JSON.stringify({ ci: ci }), // Send as JSON as preferred by backend logic
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();

            if (data.success) {
                // Login Success
                localStorage.setItem('aranduka_currentUser', JSON.stringify(data.user));
                checkSession();
                elements.loginModal.modal('hide');
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido!',
                    text: data.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => location.reload());
            } else {
                Swal.fire('Error de Acceso', data.message, 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
        }
    });

    // --- REAL BACKEND REGISTER ---
    $('#studentRegisterForm').on('submit', async function (e) {
        e.preventDefault();

        // Basic Client Validation
        const form = this;
        const ci = form.ci.value.trim();
        const nombre = form.nombre.value.trim();

        if (!ci || !nombre) {
            return Swal.fire('Atención', 'Completá los campos obligatorios.', 'warning');
        }

        Swal.showLoading();

        // Prepare Data
        const formData = {
            ci: ci,
            nombre: nombre,
            telefono: form.telefono.value,
            email: form.email.value,
            colegio: form.colegio.value,
            password: '' // Backend will handle default
        };

        try {
            const response = await fetch('backend/registro.php', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();

            if (data.success) {
                // Auto Login on Register Success
                localStorage.setItem('aranduka_currentUser', JSON.stringify(data.user));
                checkSession();
                elements.loginModal.modal('hide');
                Swal.fire('¡Registrado!', data.message, 'success').then(() => location.reload());
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        } catch (error) {
            console.error('Registration Error:', error);
            // Show more specific error if available from response parsing failure or network
            Swal.fire('Error', `Hubo un problema al registrar: ${error.message || error}`, 'error');
        }
    });

    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('aranduka_currentUser');
        checkSession();
        Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Sesión cerrada', timer: 1500, showConfirmButton: false }).then(() => location.reload());
    });

    // ==========================================
    // 4. RENDERING & FILTERS (RESTORED LOGIC)
    // ==========================================

    function generateCard(book, favorites) {
        const isFav = favorites.includes(book.id);
        const heartClass = isFav ? 'fas fa-heart text-danger' : 'far fa-heart text-muted';
        const user = JSON.parse(localStorage.getItem('aranduka_currentUser'));

        // Logic for File Type Badge
        let fileType = 'PDF';
        let badgeColor = '#D52B1E'; // Default PDF Red
        if (book.file) {
            const ext = book.file.split('.').pop().toLowerCase();
            if (ext === 'docx' || ext === 'doc') {
                fileType = 'WORD';
                badgeColor = '#2b579a'; // Word Blue
            } else if (ext === 'xlsx' || ext === 'xls') {
                fileType = 'EXCEL';
                badgeColor = '#217346'; // Excel Green
            } else if (ext === 'pptx' || ext === 'ppt') {
                fileType = 'PPT';
                badgeColor = '#b7472a'; // PPT Orange
            }
        }

        let adminControls = isAdmin() ? `
            <button class="btn btn-sm shadow" onclick="deleteBook(${book.id}); event.stopPropagation();" 
                style="position: absolute; top: 15px; left: 50px; z-index: 25; background: white; border-radius: 50%; width: 35px; height: 35px; color: #dc3545; border:none;">
                <i class="fas fa-trash"></i>
            </button>` : '';

        // Quick Download (Only if logged in)
        let quickAction = '';
        if (user) {
            quickAction = `
                <button class="quick-download-btn ml-2" onclick="handleQuickDownload(${book.id}); event.stopPropagation();" title="Descarga Rápida">
                    <i class="fas fa-download"></i>
                </button>
            `;
        }

        return `
            <div class="book-card quick-view-trigger" data-id="${book.id}">

            <button class="btn btn-sm fav-btn" data-id="${book.id}" aria-label="Añadir a favoritos"
                style="position: absolute; top: 8px; left: 8px; z-index: 25; background: rgba(255,255,255,0.9); border-radius: 50%; width: 35px; height: 35px; border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <i class="${heartClass}"></i>
            </button>
            ${adminControls}
            <div class="book-cover">
                <div class="book-spine"></div>
                <img src="${book.image}" alt="${book.title}" loading="lazy" onerror="this.src='img/portadas/default_cover.png';">
            </div>
            <div class="book-info">
                <h4>${book.title}</h4>
                <p>${book.category.replace(/-/g, ' ').toUpperCase()}</p>
                <div class="d-flex justify-content-center align-items-center">
                    <button type="button" class="btn btn-outline-primary btn-sm px-4">Ver Detalles</button>
                    ${quickAction}
                </div>
            </div>
        </div>`;
    }

    // --- RESTORED: Advanced Filter Logic with Sub-Nav ---
    window.renderBooks = function (filterType, filterValue) {
        currentFilter = { type: filterType, value: filterValue };
        const container = elements.booksContainer;
        if (!container) return;

        container.innerHTML = '';
        container.style.display = 'grid'; // ensure grid layout

        const favorites = JSON.parse(localStorage.getItem('aranduka_favorites') || '[]');
        let filtered = [];

        // 1. Filter Logic
        if (filterType === 'all') {
            filtered = books;
        } else if (filterType === 'favorites') {
            filtered = books.filter(b => favorites.includes(b.id));
        } else if (filterType === 'search') {
            const term = normalizeKey(filterValue);
            filtered = books.filter(b => normalizeKey(b.title).includes(term) || normalizeKey(b.category).includes(term));
        } else if (filterType === 'filter') {
            const target = normalizeKey(filterValue).replace(/\s+/g, '-');
            filtered = books.filter(b => {
                const bLevel = normalizeKey(b.level).replace(/\s+/g, '-');
                const bCat = normalizeKey(b.category).replace(/\s+/g, '-');
                return bLevel === target || bCat === target;
            });
        }

        // 2. Sort
        const sortMode = elements.sortSelect.value;
        filtered.sort((a, b) => {
            if (sortMode === 'az') return a.title.localeCompare(b.title);
            if (sortMode === 'za') return b.title.localeCompare(a.title);
            if (sortMode === 'newest') return b.id - a.id;
            return 0;
        });

        // 3. RESTORED: Parent Level Sub-Navigation (The "Elegir cursos sin salir" feature)
        let parentLevel = null;
        for (const [levelName, grades] of Object.entries(educationLevels)) {
            const gradeKeys = grades.map(g => normalizeKey(g).replace(/\s+/g, '-'));
            // Check if current filter is one of these grades OR the level itself
            if (gradeKeys.includes(normalizeKey(filterValue)) || normalizeKey(levelName) === normalizeKey(filterValue)) {
                parentLevel = levelName;
                break;
            }
        }

        // Update Breadcrumbs
        updateBreadcrumbs(parentLevel, filterType === 'filter' ? filterValue : null);

        if (parentLevel && filterType !== 'all' && filterType !== 'search') {
            const gradesInLevel = educationLevels[parentLevel];
            let gradeButtons = '';

            gradesInLevel.forEach(g => {
                const gKey = normalizeKey(g).replace(/\s+/g, '-');
                const activeClass = (gKey === filterValue) ? 'btn-primary text-white' : 'btn-outline-primary bg-white';
                gradeButtons += `
                    <button class="btn ${activeClass} rounded-pill px-4 py-2 mx-1 my-1 shadow-sm font-weight-bold"
                            onclick="renderBooks('filter', '${gKey}')" style="border-width: 2px;">
                        ${g}
                    </button>`;
            });

            const backNav = document.createElement('div');
            backNav.className = 'col-12 mb-4 d-flex flex-column align-items-center';
            backNav.style.gridColumn = '1 / -1';
            backNav.innerHTML = `
                <div class="small text-uppercase font-weight-bold text-muted mb-2" style="letter-spacing:1px">
                    <i class="fas fa-layer-group mr-1"></i> Explorando: ${parentLevel.toUpperCase()}
                </div>
                <div class="d-flex flex-wrap justify-content-center">
                    ${gradeButtons}
                    <button class="btn btn-link text-muted ml-md-3 font-weight-bold" onclick="showGradeGrid('${parentLevel}')">
                        <i class="fas fa-th-large mr-1"></i> Ver Grilla
                    </button>
                </div>
                <hr class="w-100 mt-4 opacity-1">
            `;
            container.appendChild(backNav);
        }

        // 4. Render Books
        if (filtered.length === 0) {
            container.innerHTML += '<div class="col-12 text-center py-5 text-muted"><p>No se encontraron libros para esta selección.</p></div>';
        } else {
            filtered.forEach(book => {
                container.insertAdjacentHTML('beforeend', generateCard(book, favorites));
            });

            // --- SCROLL ANIMATION: Observer Hook ---
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.book-card').forEach(card => {
                observer.observe(card);
            });
        }
    };

    window.renderCommunityBooks = function () {
        const container = document.getElementById('community-books-list');
        if (!container) return;

        container.innerHTML = `
            <div class="col-12 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-center text-center text-md-left">
                <div class="mb-2 mb-md-0">
                    <h4 class="font-weight-bold text-dark mb-1">Aportes de la Comunidad</h4>
                    <p class="text-muted small mb-0">Ensayos, guías y resúmenes compartidos por estudiantes.</p>
                </div>
                <button class="btn btn-outline-primary btn-sm rounded-pill px-3 font-weight-bold" 
                        onclick="$('#uploadMaterialModal').modal('show');" style="font-size: 0.75rem; border-width:1px;">
                    <i class="fas fa-plus mr-1"></i> Subir Material
                </button>
            </div>
            <div class="row w-100 m-0" id="essays-grid"></div>
        `;

        const grid = document.getElementById('essays-grid');
        const ensayos = books.filter(b => b.category === 'ensayo');
        const favorites = JSON.parse(localStorage.getItem('aranduka_favorites') || '[]');

        if (ensayos.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5 border rounded" style="border-style: dashed !important; border-width: 2px !important; background: #f9f9f9;">
                    <i class="fas fa-cloud-upload-alt fa-3x text-light mb-3"></i>
                    <h5 class="text-muted">¡Sé el primero en aportar!</h5>
                    <p class="text-muted small">Tu ensayo aparecerá aquí una vez aprobado.</p>
                </div>`;
        } else {
            ensayos.forEach(book => {
                grid.insertAdjacentHTML('beforeend', `
                    <div class="col-md-6 mb-4">
                        ${generateCard(book, favorites)}
                    </div>
                `);
            });
        }
    };

    // ==========================================
    // 5. EVENT DELEGATION
    // ==========================================

    const handleGlobalClick = (e) => {
        // A. BOOK / QUICK VIEW
        const bookCard = e.target.closest('.quick-view-trigger');
        if (bookCard) {
            const favBtn = e.target.closest('.fav-btn');
            if (favBtn) {
                e.preventDefault(); e.stopPropagation();
                toggleFavorite(parseInt(favBtn.dataset.id), favBtn);
                return;
            }
            openBookModal(parseInt(bookCard.dataset.id));
            return;
        }

        // B. FILTER CARDS
        const filterCard = e.target.closest('.filter-card');
        if (filterCard) {
            e.preventDefault();
            document.querySelectorAll('.filter-card').forEach(c => c.classList.remove('selected'));
            filterCard.classList.add('selected');

            // Community Trigger
            if (filterCard.classList.contains('community-trigger')) {
                document.querySelector('.tab-btn[data-target="comunidad"]').click();
                return;
            }

            // Logic: Level > Grade > Category
            if (filterCard.dataset.level) {
                showGradeGrid(filterCard.dataset.level);
                // Scroll to the books container area where grades appear
                smoothScrollTo(elements.booksContainer, 140);
            } else if (filterCard.dataset.grade) {
                renderBooks('filter', filterCard.dataset.grade);
                scrollToResults();
            } else if (filterCard.dataset.category) {
                elements.introTitle.innerText = `Materia: ${filterCard.querySelector('span').innerText}`;
                renderBooks('filter', filterCard.dataset.category);
                scrollToResults();
            }
        }
    };

    const scrollToResults = () => {
        const resultsArea = document.querySelector('.results-area');
        if (resultsArea) {
            const top = resultsArea.getBoundingClientRect().top + window.scrollY - 120; // 120px offset for header
            window.scrollTo({ top: top, behavior: 'smooth' });
        }
    };

    document.addEventListener('click', handleGlobalClick);

    // Search Input
    // Search Input Logic (Input + Submit)
    const smoothScrollTo = (element, offset = 100) => {
        if (!element) return;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    };

    const handleSearch = (val, shouldScroll = false) => {
        if (val.length > 0) {
            elements.introTitle.innerText = `Resultados: "${val}"`;
            renderBooks('search', val);
            if (shouldScroll) {
                smoothScrollTo(document.querySelector('.results-area'), 120);
            }
        } else {
            elements.introTitle.innerText = "Explora nuestros materiales";
            renderBooks('all');
        }
    };

    elements.searchInput?.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.length > 2 || val.length === 0) handleSearch(val, false);
    });

    document.getElementById('searchForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = elements.searchInput.value;
        handleSearch(val, true);
    });

    // RESTORED: Voice Search
    if (elements.voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';

        elements.voiceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            recognition.start();
            elements.voiceBtn.style.color = '#D52B1E';
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            elements.searchInput.value = transcript;
            handleSearch(transcript, true); // Voice usually means intent to see results immediately
            elements.voiceBtn.style.color = '#888';
        };

        recognition.onend = () => elements.voiceBtn.style.color = '#888';
    }

    // --- Dashboard Tabs Logic (Unified) ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.filter-section');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. UI Updates
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 2. Section Display
            const targetId = btn.dataset.target; // secciones, materias, favoritos, comunidad
            sections.forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === targetId) {
                    sec.classList.add('active');

                    // 3. Auto-Scroll Logic: Targeted for flow
                    // Execute after a slight delay to ensure the browser has repainted the new section
                    setTimeout(() => {
                        smoothScrollTo(sec, 140);
                    }, 50);
                }
            });

            // 3. Special Handlers
            if (targetId === 'favoritos') {
                renderBooks('favorites');
                elements.introTitle.innerText = "Tus Libros Favoritos";
            } else if (targetId === 'comunidad') {
                renderCommunityBooks();
                elements.introTitle.innerText = 'Aportes de la Comunidad';
                const uploadCol = document.getElementById('community-upload-col');
                const listCol = document.getElementById('community-list-col');
                if (uploadCol) uploadCol.classList.remove('d-none');
                if (listCol) { listCol.classList.remove('col-md-12'); listCol.classList.add('col-md-8'); }
            } else {
                renderBooks('all');
                elements.introTitle.innerText = "Explora todos los libros";
            }
        });
    });

    // ==========================================
    // 6. MODALS & UI COMPONENTS (History Enhanced)
    // ==========================================

    window.openBookModal = function (id) {
        const book = books.find(b => b.id === id);
        if (!book) return;

        // Store ID for Share Button
        const m = document.getElementById('quickViewModal');
        m.dataset.bookId = id;

        // 1. Scroll Lock (Cleaner Approach)
        // Store current scroll position to restore if needed, but 'overflow: hidden' usually keeps it visually
        document.body.style.overflow = 'hidden';
        m.classList.add('active');

        // 2. Reset Scroll of the internal container
        const scrollContainer = m.querySelector('.modal-scroll-container');
        if (scrollContainer) scrollContainer.scrollTop = 0;

        // 3. History Push
        if (!isNavigatingHistory) {
            window.history.pushState({ modalOpen: true }, "");
        }

        // 4. Populate Content
        document.getElementById('modalBookImage').src = book.image;
        document.getElementById('modalBookTitle').innerText = book.title;
        document.getElementById('modalBookDescription').innerText = book.description || 'Sin descripción disponible.';
        document.getElementById('modalBookCategoryText').innerText = book.category.replace(/-/g, ' ').toUpperCase();

        const badgeEl = document.getElementById('modalBookBadge');
        if (badgeEl) badgeEl.innerText = book.level.toUpperCase();

        // 5. Actions
        const downloadBtns = [document.getElementById('modalDownloadBtn'), document.getElementById('modalDownloadBtn2')];
        const user = JSON.parse(localStorage.getItem('aranduka_currentUser'));

        downloadBtns.forEach(btn => {
            if (!btn) return;

            if (!user) {
                // If not logged in, change button to Trigger Login
                btn.innerHTML = '<i class="fas fa-lock mr-2"></i> INICIA SESIÓN PARA DESCARGAR';
                btn.onclick = (e) => {
                    e.preventDefault();
                    $('#tab-register').tab('show'); // Bootstrap 4 syntax
                    $('#loginModal').modal('show');
                };
                btn.removeAttribute('download');
                btn.href = '#';
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-secondary');
            } else {
                // Logged In -> Prepare Download
                btn.innerHTML = btn.id === 'modalDownloadBtn' ? '<i class="fas fa-download mr-1"></i> DESCARGAR' : '<i class="fas fa-download mr-2"></i> DESCARGAR MATERIAL';
                btn.href = book.file;
                btn.setAttribute('download', book.title);
                btn.onclick = null;

                // FORCE GRAY STYLE
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-secondary');
                btn.style.backgroundColor = '#6c757d';
                btn.style.borderColor = '#6c757d';
            }
        });

        const guideBtn = document.getElementById('modalGuideBtn');
        if (guideBtn) {
            if (book.guideFile) {
                guideBtn.href = book.guideFile;
                guideBtn.style.display = 'inline-flex';
            } else {
                guideBtn.style.display = 'none';
            }
        }

        // 6. Related Books Logic (Grid for Mobile)
        const relatedContainer = document.getElementById('relatedBooksContainer');
        if (relatedContainer) {
            const related = books.filter(b => (b.level === book.level || b.category === book.category) && b.id !== book.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 2); // Show exactly 2 books as requested

            if (related.length > 0) {
                // Populate Related Books
                let relatedHtml = `
                    <h5 class="text-center font-weight-bold mb-4" id="relatedTitle">También te podría interesar</h5>
                    <div class="row justify-content-center">`;

                related.forEach(rb => {
                    relatedHtml += `
                    <div class="col-6 mb-4 cursor-pointer related-book-card" onclick="openBookModal(${rb.id})">
                        <div class="card h-100 border-0 bg-transparent">
                            <img src="${rb.image}" class="img-fluid rounded mb-2 shadow-sm" style="width: 100%; height: auto; display: block;">
                            <p class="small font-weight-bold text-center mb-0 mt-1 text-dark" style="line-height: 1.2;">${rb.title}</p>
                        </div>
                    </div>`;
                });
                relatedHtml += '</div>';
                relatedContainer.innerHTML = relatedHtml;
                relatedContainer.style.display = 'block';

                // INJECT SCROLL INDICATOR HIGHER UP (After Buttons)
                // We check if it already exists to avoid duplicates
                let existingIndicator = document.getElementById('dynamicScrollIndicator');
                if (existingIndicator) existingIndicator.remove();

                const indicatorHtml = `
                    <div id="dynamicScrollIndicator" class="scroll-indicator mt-3 w-100 d-flex flex-column align-items-center justify-content-center" onclick="document.getElementById('relatedBooksContainer').scrollIntoView({behavior: 'smooth'})">
                        <p>VER RELACIONADOS</p>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                `;

                // Append to the details column (modal-column-right) so it's part of the main view
                const detailsCol = document.querySelector('.modal-column-right');
                if (detailsCol) {
                    detailsCol.insertAdjacentHTML('beforeend', indicatorHtml);
                }

            } else {
                relatedContainer.style.display = 'none';
                // Remove indicator if no related books
                let existingIndicator = document.getElementById('dynamicScrollIndicator');
                if (existingIndicator) existingIndicator.remove();
            }
        }

        // 7. Closing Logic
        const closeBtn = m.querySelector('.close-modal-btn');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.preventDefault(); // Stop any jump
                closeBookModal();
            };
        }
    };

    window.closeBookModal = function () {
        const m = document.getElementById('quickViewModal');
        m.classList.remove('active');
        document.body.style.overflow = ''; // Unlock scroll

        // Handle History
        if (!isNavigatingHistory && window.history.state && window.history.state.modalOpen) {
            window.history.back();
        }
    };


    window.shareBook = function (id) {
        const book = books.find(b => b.id === id);
        const url = `${window.location.origin}${window.location.pathname} #book - ${id} `;

        if (navigator.share) {
            navigator.share({
                title: book.title,
                text: `¡Mira este libro en Aranduka: ${book.title} !`,
                url: url
            }).catch(console.error);
        } else {
            // Fallback: Copy to clipboard or open WhatsApp
            const text = `¡Mira este libro en Aranduka: ${book.title} !${url} `;

            // Try clipboard first
            navigator.clipboard.writeText(text).then(() => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Enlace copiado al portapapeles',
                    showConfirmButton: false,
                    timer: 2000
                });
            }).catch(() => {
                // Final fallback: WhatsApp
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            });
        }
    };

    // Check Deep Link on Load
    const hash = window.location.hash;
    if (hash && hash.startsWith('#book-')) {
        const bookId = parseInt(hash.replace('#book-', ''));
        if (!isNaN(bookId)) {
            // Slight delay to ensure books are loaded/rendered if they come from async (though currently static/local)
            // Ideally we wait for fetch, but here books are likely available or we need to ensure they are. 
            // Assuming 'books' array is available. IF it's async populated later, we might need a hook.
            // For now, simple check:
            setTimeout(() => {
                if (typeof openBookModal === 'function') openBookModal(bookId);
            }, 500);
        }
    }

    function toggleFavorite(id, btnElem) {
        let favs = JSON.parse(localStorage.getItem('aranduka_favorites') || '[]');
        const icon = btnElem.querySelector('i');
        if (favs.includes(id)) {
            favs = favs.filter(f => f !== id);
            icon.className = 'far fa-heart text-muted';
            if (currentFilter.type === 'favorites') renderBooks('favorites');
        } else {
            favs.push(id);
            icon.className = 'fas fa-heart text-danger';
        }
        localStorage.setItem('aranduka_favorites', JSON.stringify(favs));
    }

    // ==========================================
    // 7. CAROUSEL & VISUALS
    // ==========================================

    function initCarousel() {
        const container = elements.heroCarouselInner;
        if (!container) return;
        const shuffled = [...books].sort(() => 0.5 - Math.random()).slice(0, 5);
        let html = '';
        shuffled.forEach((book, idx) => {
            html += `
            <div class="carousel-item ${idx === 0 ? 'active' : ''}">
                <div class="d-flex flex-column align-items-center justify-content-center h-100" style="padding: 1rem;">
                    <div class="position-relative" style="transition: transform 0.3s;">
                        <span class="badge badge-white text-dark shadow-sm px-3 py-1 mb-3 font-weight-bold" 
                              style="position: absolute; top: -15px; right: -15px; z-index: 10; background: white; border-radius: 50px; font-size: 0.8rem;">
                            ★ DESTACADO
                        </span>
                        <div class="hero-book-wrapper" style="perspective: 1000px;">
                            <img src="${book.image}" class="img-fluid rounded shadow-lg quick-view-trigger" 
                                 data-id="${book.id}"
                                 style="max-height: 380px; cursor: pointer; transform: rotateY(-10deg); transition: transform 0.5s; border-left: 5px solid rgba(255,255,255,0.2);">
                        </div>
                    </div>
                    <div class="text-center mt-4 d-none d-md-block">
                        <h5 class="text-white font-weight-bold mb-1" style="text-shadow: 0 2px 4px rgba(0,0,0,0.6); letter-spacing: 0.5px;">${book.title}</h5>
                        <small class="text-light" style="opacity: 0.8;">${book.category.toUpperCase()}</small>
                    </div>
                </div>
            </div>`;
        });
        container.innerHTML = html;
        if (typeof $ !== 'undefined') $('#heroCarousel').carousel({ interval: 4000, pause: 'hover' });
    }

    // RESTORED: Grade Grid with Cards (History Enhanced)
    window.showGradeGrid = function (level) {
        // Push state for Back Button support
        if (!isNavigatingHistory) {
            history.pushState({ view: 'grid', level: level }, '', `#nivel-${level.replace(/\s+/g, '-')}`);
        }

        const container = elements.booksContainer;
        container.style.display = 'block';
        elements.introTitle.innerText = `Nivel: ${level.toUpperCase()}`;

        container.innerHTML = `
            <div class="col-12 mb-4 d-flex align-items-center">
                <button class="btn btn-outline-dark rounded-pill mr-3" onclick="renderBooks('all')">
                    <i class="fas fa-arrow-left"></i> Volver al Inicio
                </button>
                <h5 class="m-0 text-primary font-weight-bold">Selecciona un Grado</h5>
            </div>
            <div class="row m-0 justify-content-center">
                ${(educationLevels[level] || []).map(grade => `
                    <div class="col-6 col-md-4 mb-4">
                        <div class="filter-card h-100 p-4 d-flex flex-column align-items-center justify-content-center" 
                             data-grade="${normalizeKey(grade).replace(/\s+/g, '-')}" style="cursor:pointer">
                            <i class="fas fa-graduation-cap mb-3" style="font-size:2.5rem; color:var(--primary-color)"></i>
                            <h4 class="m-0 font-weight-bold">${grade}</h4>
                        </div>
                    </div>`).join('')}
            </div>
        `;
    };

    // ==========================================
    // 8. ADMIN & UPLOADS
    // ==========================================

    window.loadDashboardStats = async function () {
        if (!isAdmin()) return;

        try {
            const res = await fetch('backend/admin_dashboard.php');
            const data = await res.json();

            if (data.success) {
                // 1. Stats
                document.getElementById('total-users').textContent = data.stats.users;
                document.getElementById('pending-requests').textContent = data.stats.pending;
                document.getElementById('total-books').textContent = books.length; // Keep using local count or backend

                // 2. Users Table
                const usersBody = document.getElementById('admin-users-table-body');
                if (data.users_list && data.users_list.length > 0) {
                    usersBody.innerHTML = data.users_list.map(u => `
                        <tr>
                            <td>
                                <div class="font-weight-bold text-dark">${u.nombre_completo}</div>
                                <div class="small text-muted">${u.email}</div>
                            </td>
                            <td>
                                <div class="small">CI: ${u.ci}</div>
                                <div class="small">${u.colegio || '-'}</div>
                            </td>
                            <td>
                                <span class="badge badge-${u.rol === 'admin' ? 'danger' : 'success'} rounded-pill px-2">${u.rol}</span>
                            </td>
                            <td>
                                <div class="small text-muted" style="max-height:80px; overflow-y:auto; scrollbar-width:thin;">
                                    ${(u.historial_descargas || []).map(h =>
                        `<div class="text-truncate" title="${h.libro_titulo}"><i class="fas fa-download mx-1 text-primary"></i> ${h.libro_titulo}</div>`
                    ).join('') || '<span class="text-muted">-</span>'}
                                </div>
                            </td>
                            <td class="text-center font-weight-bold text-primary">${(u.historial_aportes || []).length}</td>
                            <td class="small text-muted">${new Date(u.fecha_registro).toLocaleDateString()}</td>
                        </tr>
                    `).join('');
                } else {
                    usersBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No hay usuarios registrados.</td></tr>';
                }

                // 3. Pending Aportes Table
                const pendingBody = document.getElementById('admin-pending-table-body');
                const pendingAportes = data.aportes_list.filter(a => a.estado === 'pendiente');
                if (pendingAportes.length > 0) {
                    pendingBody.innerHTML = pendingAportes.map(a => `
                        <tr>
                            <td class="small">${new Date(a.fecha_subida).toLocaleDateString()}</td>
                            <td>
                                <div class="font-weight-bold">${a.autor_nombre || 'Anónimo'}</div>
                            </td>
                            <td>
                                <div class="font-weight-bold">${a.titulo}</div>
                                <small class="text-muted">${a.descripcion || ''}</small>
                            </td>
                            <td><a href="${a.archivo_url}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="fas fa-file-pdf"></i> Ver</a></td>
                            <td><span class="badge badge-warning">Pendiente</span></td>
                            <td>
                                <button class="btn btn-sm btn-success rounded-circle shadow-sm" title="Aprobar"><i class="fas fa-check"></i></button>
                                <button class="btn btn-sm btn-danger rounded-circle shadow-sm" title="Rechazar"><i class="fas fa-times"></i></button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    pendingBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No hay aportes pendientes.</td></tr>';
                }

                // Update Badge Count
                const reqCount = document.getElementById('req-count');
                if (reqCount) reqCount.innerText = data.stats.pending;

            } else {
                console.error("Admin Data Error:", data.message);
            }
        } catch (err) {
            console.error("Admin Fetch Error:", err);
            const tbody = document.getElementById('admin-users-table-body');
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Error de conexión con la base de datos.</td></tr>';
        }
    };

    // Auto-load when opening modal
    $('#adminDashboardModal').on('shown.bs.modal', loadDashboardStats);

    $('#uploadForm').on('submit', async function (e) {
        e.preventDefault();
        if (!currentUser) return elements.authRequiredModal.modal('show');
        const formData = new FormData(this);
        if (currentUser.id) formData.append('user_id', currentUser.id);

        Swal.showLoading();
        try {
            const res = await fetch('backend/upload.php', { method: 'POST', body: formData });
            const data = await res.json().catch(() => ({}));

            if (data.success || res.ok) {
                Swal.fire('¡Enviado!', 'Tu aporte está en revisión.', 'success');
                this.reset();
                document.querySelector('.custom-file-label').innerText = 'Elegir archivo...';
            } else {
                Swal.fire('Error', 'No se pudo subir el archivo.', 'error');
            }
        } catch (err) {
            Swal.fire('Info', 'Backend no conectado. (Demo Mode)', 'info');
        }
    });

    window.deleteBook = (id) => {
        Swal.fire({
            title: '¿Eliminar?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, borrar'
        }).then((result) => {
            if (result.isConfirmed) {
                const idx = books.findIndex(b => b.id === id);
                if (idx > -1) books.splice(idx, 1);
                renderBooks(currentFilter.type, currentFilter.value);
                Swal.fire('Eliminado', '', 'success');
            }
        });
    };

    // Breadcrumbs Logic
    window.updateBreadcrumbs = function (level, category) {
        const container = document.getElementById('breadcrumbs');
        if (!container) return;

        let html = '<a href="#" class="breadcrumb-link" onclick="location.reload()">Inicio</a>';

        if (level && level !== 'all') {
            html += ` <span>/</span> <a href="#" class="breadcrumb-link" onclick="showGradeGrid('${level}')" style="text-transform:capitalize">${level.replace(/-/g, ' ')}</a>`;
            container.style.display = 'inline-block';
        } else {
            container.style.display = 'none'; // Hide on simple "all" view if preferred, or keep generic
        }

        if (category) {
            html += ` <span>/</span> <span class="current" style="text-transform:capitalize">${category.replace(/-/g, ' ')}</span>`;
            container.style.display = 'inline-block';
        }

        container.innerHTML = html;
    };

    // Handle Sticky Tabs
    const tabsContainer = document.querySelector('.dashboard-tabs');
    if (tabsContainer) {
        document.addEventListener('scroll', () => {
            // Toggle sticky based on scroll
            if (window.scrollY > 350) {
                tabsContainer.classList.add('sticky');
            } else {
                tabsContainer.classList.remove('sticky');
            }
        }, { passive: true });
    }

    // Quick Download Handler
    window.handleQuickDownload = function (bookId) {
        const book = books.find(b => b.id === bookId);
        if (!book) return;

        const user = JSON.parse(localStorage.getItem('aranduka_currentUser'));
        if (!user) return Swal.fire('Error', 'Debes iniciar sesión', 'error');

        // Trigger Download
        const link = document.createElement('a');
        link.href = book.file;
        link.download = `${book.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Descarga iniciada',
            showConfirmButton: false,
            timer: 2000
        });
    };

    // ==========================================
    // 9. INIT
    // ==========================================

    checkSession();
    initCarousel();
    renderBooks('all');

    // Restore File Input Label logic
    $('.custom-file-input').on('change', function () {
        const fileName = $(this).val().split('\\').pop();
        $(this).next('.custom-file-label').html(fileName);
    });

    console.log("Aranduka v2.5 Restore Complete: UI Features + Clean Architecture");
});
