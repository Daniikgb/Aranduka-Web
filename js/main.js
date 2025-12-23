
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

    // DOM Elements
    const elements = {
        loginModal: $('#loginModal'),
        authRequiredModal: $('#authRequiredModal'),
        adminDashboardModal: $('#adminDashboardModal'),
        booksContainer: document.getElementById('books-container'),
        introTitle: document.querySelector('.section-header p') || document.getElementById('viewTitle'),
        viewTitle: document.getElementById('viewTitle'),
        searchInput: document.getElementById('searchInput'),
        sortSelect: document.getElementById('sortBooks'),
        heroCarouselInner: document.getElementById('heroCarouselInner'),
        tabs: document.querySelectorAll('.tab-btn'),
        sections: document.querySelectorAll('.filter-section'),
        adminTableBody: document.getElementById('admin-users-table-body'),
        voiceBtn: document.getElementById('voiceSearchBtn')
    };

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
        { id: 461, title: "Filosofía 2° Curso", category: "filosofia", level: "2-curso", image: "img/portadas/filosofia2.png", file: "documentos/libro-ejemplo.pdf", description: "Pensamiento filosófico y lógica." }
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

    // --- DEMO MOCK LOGIN (For GitHub Pages) ---
    $('#studentLoginForm').on('submit', async function (e) {
        e.preventDefault();
        const ci = $(this).find('input[name="ci"]').val().trim();
        if (!ci) return Swal.fire('Error', 'Ingresa tu cédula o usuario', 'warning');

        Swal.showLoading();

        // SIMULATION
        setTimeout(() => {
            const mockUser = {
                id: 1,
                nombre_completo: "Estudiante Demo",
                role: (ci === 'admin') ? 'admin' : 'student' // Simple backdoor for demo
            };
            localStorage.setItem('aranduka_currentUser', JSON.stringify(mockUser));
            checkSession();
            elements.loginModal.modal('hide');
            Swal.fire('¡Bienvenido!', `Modo Demo Activado. Hola ${mockUser.nombre_completo}`, 'success').then(() => location.reload());
        }, 800);
    });

    $('#studentRegisterForm').on('submit', async function (e) {
        e.preventDefault();
        Swal.showLoading();
        // SIMULATION
        setTimeout(() => {
            const mockUser = { id: 2, nombre_completo: "Nuevo Usuario", role: 'student' };
            localStorage.setItem('aranduka_currentUser', JSON.stringify(mockUser));
            checkSession();
            elements.loginModal.modal('hide');
            Swal.fire('¡Registrado!', 'Cuenta Demo creada correctamente.', 'success').then(() => location.reload());
        }, 800);
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
        let adminControls = isAdmin() ? `
            <button class="btn btn-sm shadow" onclick="deleteBook(${book.id})" 
                style="position: absolute; top: 15px; right: 15px; z-index: 25; background: white; border-radius: 50%; width: 35px; height: 35px; color: #dc3545; border:none;">
                <i class="fas fa-trash"></i>
            </button>` : '';

        return `
            <div class="book-card quick-view-trigger" data-id="${book.id}">
                <button class="btn btn-sm fav-btn" data-id="${book.id}" aria-label="Añadir a favoritos"
                    style="position: absolute; top: 15px; left: 15px; z-index: 25; background: rgba(255,255,255,0.9); border-radius: 50%; width: 35px; height: 35px; border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <i class="${heartClass}"></i>
                </button>
                ${adminControls}
                <div class="book-cover">
                    <div class="book-spine"></div>
                    <img src="${book.image}" alt="${book.title}" loading="lazy" onerror="this.src='img/portadas/default_cover.png';">
                    <span class="book-status-badge">Disponible</span>
                </div>
                <div class="book-info">
                    <h4>${book.title}</h4>
                    <p>${book.category.replace(/-/g, ' ').toUpperCase()}</p>
                    <div class="d-flex justify-content-center">
                        <button type="button" class="btn btn-outline-primary btn-sm px-4">Ver Detalles</button>
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
                // Scroll to simplified container for Levels/Grades
                const containerTop = elements.booksContainer.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: containerTop, behavior: 'smooth' });
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
    elements.searchInput?.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.length > 2) {
            elements.introTitle.innerText = `Resultados: "${val}"`;
            renderBooks('search', val);
            scrollToResults();
        } else if (val.length === 0) {
            elements.introTitle.innerText = "Explora nuestros materiales";
            renderBooks('all');
        }
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
            elements.searchInput.dispatchEvent(new Event('input'));
            elements.voiceBtn.style.color = '#888';
        };
        recognition.onend = () => elements.voiceBtn.style.color = '#888';
    }

    // Tab Switching (RESTORED Community Logic)
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            elements.sections.forEach(s => s.classList.remove('active'));
            const targetId = tab.dataset.target;
            const targetSec = document.getElementById(targetId);
            if (targetSec) targetSec.classList.add('active');

            // --- RESTORED: Community Layout Management --
            const uploadCol = document.getElementById('community-upload-col');
            const listCol = document.getElementById('community-list-col');

            if (targetId === 'comunidad') {
                elements.introTitle.innerText = 'Aportes de la Comunidad';
                renderCommunityBooks();
                // Ensure Layout is Reset (Show Form)
                if (uploadCol) uploadCol.classList.remove('d-none');
                if (listCol) { listCol.classList.remove('col-md-12'); listCol.classList.add('col-md-8'); }
            } else {
                // If not community, we can reset view if needed, or just let tabs handle it
                if (targetId === 'secciones') renderBooks('all');
                if (targetId === 'favoritos') {
                    elements.introTitle.innerText = 'Tus Favoritos';
                    renderBooks('favorites');
                }
            }

            const offset = 120;
            const container = document.querySelector('.dashboard-container');
            if (container) {
                const top = container.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ==========================================
    // 6. MODALS & UI COMPONENTS
    // ==========================================

    function openBookModal(id) {
        const book = books.find(b => b.id === id);
        if (!book) return;

        const m = document.getElementById('quickViewModal');
        document.getElementById('modalBookImage').src = book.image;
        document.getElementById('modalBookTitle').innerText = book.title;
        document.getElementById('modalBookDescription').innerText = book.description || 'Sin descripción';
        document.getElementById('modalBookCategory').innerText = book.category.toUpperCase();
        document.getElementById('modalBookBadge').innerText = book.level.toUpperCase();

        // RESTORED: Guide Button Logic
        const guideBtn = document.getElementById('modalGuideBtn');
        if (guideBtn) {
            if (book.guideFile) {
                guideBtn.href = book.guideFile;
                guideBtn.style.display = 'block';
            } else {
                guideBtn.style.display = 'none';
            }
        }

        document.getElementById('modalDownloadBtn').href = book.file;
        m.classList.add('active');
        m.querySelector('.close-modal').onclick = () => m.classList.remove('active');
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

    // RESTORED: Grade Grid with Cards
    window.showGradeGrid = function (level) {
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

    window.loadDashboardStats = function () {
        if (!isAdmin()) return;
        document.getElementById('total-books').textContent = books.length;
        // Mock rendering users (Replace with PHP fetch later)
        const tbody = document.getElementById('admin-users-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Cargando datos desde Base de Datos...</td></tr>';
    };

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
