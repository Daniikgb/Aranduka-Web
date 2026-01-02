
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
            document.body.style.overflow = ''; // FIX: Restore scroll functionality
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
        { id: 101, title: "Texto \"Mis Huellas\" Pre-Jardín", category: "inicial", level: "pre-jardin", image: "img/portadas/pre-jardin.png", file: "documentos/libro-ejemplo.pdf", guideFile: "documentos/guia-docente-ejemplo.docx", author: "Equipo de Aranduka", description: "Diseñado con cariño por el Equipo de Aranduka, este libro para el nivel inicial estimula el desarrollo cognitivo y motor de los más pequeños. Con ilustraciones coloridas y actividades lúdicas, es el compañero perfecto para sus primeros pasos en el aprendizaje escolar." },
        { id: 102, title: "Texto \"Mis Huellas\" Jardín", category: "inicial", level: "jardin", image: "img/portadas/jardin.png", file: "documentos/libro-ejemplo.pdf", guideFile: "documentos/guia-docente-ejemplo.docx", author: "Equipo de Aranduka", description: "Este material del Equipo de Aranduka fomenta la expresión creativa y la autonomía en los niños de Jardín. A través de juegos y ejercicios interactivos, los pequeños exploran su entorno y desarrollan habilidades sociales y emocionales fundamentales para su crecimiento." },
        { id: 103, title: "Texto \"Mis Huellas\" Pre-Escolar", category: "inicial", level: "pre-escolar", image: "img/portadas/MISHUELLASPREESCOLAR.png", file: "documentos/libro-ejemplo.pdf", guideFile: "documentos/guia-docente-ejemplo.docx", author: "Equipo de Aranduka", description: "Preparación integral para la lectoescritura y el cálculo matemático, elaborada por el Equipo de Aranduka. Este libro guía a los niños de Pre-Escolar en la transición hacia la educación primaria, fortaleciendo su confianza y capacidades cognitivas básicas." },
        { id: 104, title: "Texto \"Mis Lecciones\" Pre-Escolar", category: "inicial", level: "pre-escolar", image: "img/portadas/MISLECCIONESPREESCOLAR.png", file: "documentos/libro-ejemplo.pdf", guideFile: "documentos/guia-docente-ejemplo.docx", author: "Equipo de Aranduka", description: "Guía complementaria con actividades prácticas desarrollada por el Equipo de Aranduka. Ofrece ejercicios adicionales para reforzar los conocimientos adquiridos en clase, asegurando una base sólida para el futuro académico de los estudiantes de nivel inicial." },

        // --- 1° y 2° CICLO ---
        { id: 201, title: "Matemática 1° Grado", category: "matematica", level: "1-grado", image: "img/portadas/mat1.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Este libro de Matemáticas ha sido diseñado meticulosamente por el Equipo de Aranduka para introducir a los niños en el mundo de los números. A través de ejercicios lúdicos y visuales, los alumnos darán sus primeros pasos en el pensamiento lógico-matemático." },
        { id: 202, title: "Matemática 2° Grado", category: "matematica", level: "2-grado", image: "img/portadas/mat2.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "El Equipo de Aranduka presenta este material enfocado en operaciones básicas y pensamiento lógico. Los estudiantes de 2° Grado aprenderán a sumar, restar y resolver problemas sencillos mediante actividades que conectan las matemáticas con situaciones de la vida cotidiana." },
        { id: 203, title: "Matemática 3° Grado", category: "matematica", level: "3-grado", image: "img/portadas/mat3.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Centrado en la resolución de problemas y medidas, este libro del Equipo de Aranduka desafía a los estudiantes a aplicar sus conocimientos. Incluye ejercicios variados que fortalecen la comprensión numérica y preparan el terreno para conceptos matemáticos más complejos." },
        { id: 204, title: "Matemática 4° Grado", category: "matematica", level: "4-grado", image: "img/portadas/mat4.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Este texto del Equipo de Aranduka aborda temas clave como fracciones, decimales y geometría aplicada. Está diseñado para consolidar las bases aritméticas y fomentar el razonamiento analítico en los estudiantes del 4° Grado, preparándolos para desafíos mayores." },
        { id: 205, title: "Matemática 5° Grado", category: "matematica", level: "5-grado", image: "img/portadas/mat5.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "El análisis de datos y la proporcionalidad son los ejes de este material elaborado por el Equipo de Aranduka. Los alumnos desarrollarán habilidades críticas para interpretar información cuantitativa y resolver problemas matemáticos de mayor complejidad con confianza y precisión." },
        { id: 206, title: "Matemática 6° Grado", category: "matematica", level: "6-grado", image: "img/portadas/mat6.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Como cierre del segundo ciclo, este libro del Equipo de Aranduka consolida las competencias aritméticas y geométricas. Prepara a los estudiantes para la secundaria mediante un repaso exhaustivo y la introducción de nuevos conceptos fundamentales para su futuro académico." },

        { id: 211, title: "Guaraní 1° Grado", category: "guarani", level: "1-grado", image: "img/portadas/gua1.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Ñe’ê ñepyrû: Primeros pasos en la lengua materna guiados por el Equipo de Aranduka. Este material inicia a los niños en el aprendizaje sistemático del guaraní, valorando nuestra cultura y promoviendo el bilingüismo desde una edad temprana a través de juegos y canciones." },
        { id: 212, title: "Guaraní 2° Grado", category: "guarani", level: "2-grado", image: "img/portadas/gua2.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Expansión del vocabulario y construcción de frases cortas son los objetivos de este libro del Equipo de Aranduka. Los estudiantes enriquecerán su léxico y comenzarán a comunicarse de manera sencilla, fortaleciendo su identidad cultural y su amor por el idioma guaraní." },
        { id: 213, title: "Guaraní 3° Grado", category: "guarani", level: "3-grado", image: "img/portadas/gua3.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "El Equipo de Aranduka promueve la lectura comprensiva de textos breves en guaraní. Este material incluye cuentos y leyendas adaptados que no solo enseñan el idioma, sino que también transmiten los valores y tradiciones profundas de nuestro pueblo paraguayo." },
        { id: 214, title: "Guaraní 4° Grado", category: "guarani", level: "4-grado", image: "img/portadas/gua4.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Enfocado en la gramática básica y la redacción, este libro del Equipo de Aranduka ayuda a los estudiantes a estructurar correctamente sus ideas. A través de ejercicios prácticos, mejorarán su escritura y comprensión de las reglas fundamentales de la lengua guaraní." },
        { id: 215, title: "Guaraní 5° Grado", category: "guarani", level: "5-grado", image: "img/portadas/gua5.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Diálogos sobre historia y folclore enriquecen este material del Equipo de Aranduka. Los alumnos practicarán la conversación fluida y aprenderán sobre nuestras raíces culturales, integrando el idioma en contextos significativos y cotidianos de la vida paraguaya." },
        { id: 216, title: "Guaraní 6° Grado", category: "guarani", level: "6-grado", image: "img/portadas/gua6.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Análisis literario básico y producción de textos son el foco de este libro final del ciclo, creado por el Equipo de Aranduka. Los estudiantes demostrarán su dominio del idioma creando composiciones propias y analizando obras sencillas de la literatura guaraní." },

        { id: 221, title: "Comunicación 1° Grado", category: "comunicacion", level: "1-grado", image: "img/portadas/lit1.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Iniciación a la lectura y escritura de la mano del Equipo de Aranduka. Este libro fundamental guía a los niños en el descubrimiento de las letras y las palabras, abriendo la puerta al maravilloso mundo de la comunicación escrita con métodos didácticos innovadores." },
        { id: 222, title: "Comunicación 2° Grado", category: "comunicacion", level: "2-grado", image: "img/portadas/lit2.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Mejora de la fluidez lectora con este material del Equipo de Aranduka. A través de lecturas graduadas y divertidas, los estudiantes ganarán confianza en su capacidad de leer en voz alta y comprender textos sencillos, base esencial para todo aprendizaje futuro." },
        { id: 223, title: "Comunicación 3° Grado", category: "comunicacion", level: "3-grado", image: "img/portadas/lit3.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Comprensión lectora y redacción creativa son impulsadas por el Equipo de Aranduka en este texto. Los alumnos aprenderán a extraer ideas principales y a expresar sus propios pensamientos por escrito, desarrollando su imaginación y habilidades comunicativas de manera integral." },
        { id: 224, title: "Comunicación 4° Grado", category: "comunicacion", level: "4-grado", image: "img/portadas/lit4.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Reglas ortográficas y gramática explicadas claramente por el Equipo de Aranduka. Este libro es una herramienta indispensable para escribir correctamente, ayudando a los estudiantes a evitar errores comunes y a mejorar la calidad y claridad de sus textos escolares." },
        { id: 225, title: "Comunicación 5° Grado", category: "comunicacion", level: "5-grado", image: "img/portadas/lit5.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Producción de textos periodísticos e informativos con la guía del Equipo de Aranduka. Los estudiantes explorarán diferentes tipos de textos, aprendiendo a redactar noticias, entrevistas y artículos, fomentando un espíritu crítico y una comunicación efectiva en la sociedad actual." },
        { id: 226, title: "Comunicación 6° Grado", category: "comunicacion", level: "6-grado", image: "img/portadas/lit6.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Refinamiento de la expresión oral y escrita para cerrar el ciclo, elaborado por el Equipo de Aranduka. Este material prepara a los estudiantes para la exigencia de la educación media, puliendo sus habilidades retóricas y su capacidad de argumentación lógica." },

        { id: 231, title: "Mis Lecciones: Vida Social 1°", category: "sociales", level: "1-grado", image: "img/portadas/mislecciones1dogrado.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Conociendo mi entorno, familia y escuela con el apoyo del Equipo de Aranduka. Este libro ayuda a los niños a entender su lugar en la comunidad, promoviendo valores de respeto, colaboración y convivencia armónica desde los primeros años escolares." },
        { id: 232, title: "Mis Lecciones: Vida Social 2°", category: "sociales", level: "2-grado", image: "img/portadas/mislecciones2dogrado.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Interacción social y normas de convivencia explicadas por el Equipo de Aranduka. Los estudiantes aprenderán la importancia de las reglas y el respeto mutuo, fundamentales para vivir en sociedad y construir relaciones positivas con sus compañeros y familiares." },
        { id: 233, title: "Mis Lecciones: Vida Social 3°", category: "sociales", level: "3-grado", image: "img/portadas/mislecciones3dogrado.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Ubicación espacial y departamentos del Paraguay presentados por el Equipo de Aranduka. Un viaje geográfico que enseña a los niños a orientarse y a conocer la división política de nuestro país, despertando su interés por la geografía nacional." },

        { id: 244, title: "Ciencias Naturales 4°", category: "ciencias-de-la-naturaleza-y-salud", level: "4-grado", image: "img/portadas/c4.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Ecosistemas, materia y energía explorados con el Equipo de Aranduka. Este libro introduce conceptos científicos fundamentales, animando a los estudiantes a observar la naturaleza, realizar experimentos sencillos y comprender los procesos vitales que ocurren a su alrededor." },
        { id: 245, title: "Ciencias Naturales 5°", category: "ciencias-de-la-naturaleza-y-salud", level: "5-grado", image: "img/portadas/c5.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Cuerpo humano y salud bajo la lupa del Equipo de Aranduka. Los alumnos aprenderán sobre el funcionamiento de su organismo y la importancia de hábitos saludables, adquiriendo conocimientos vitales para su bienestar físico y su desarrollo personal." },
        { id: 246, title: "Ciencias Naturales 6°", category: "ciencias-de-la-naturaleza-y-salud", level: "6-grado", image: "img/portadas/c6.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Fenómenos físicos, químicos y la célula detallados por el Equipo de Aranduka. Un material avanzado que prepara a los estudiantes para las ciencias exactas, profundizando en la estructura de la materia y las leyes que rigen el universo físico." },

        { id: 251, title: "Calígrafo 1° Grado", category: "caligrafia", level: "1-grado", image: "img/portadas/2gradocaligrafo.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Ejercicios de trazo inicial cuidadosamente diseñados por el Equipo de Aranduka. Ayuda a los niños a desarrollar la motricidad fina necesaria para una escritura clara y legible, sentando las bases para una buena caligrafía a lo largo de su vida." },
        { id: 252, title: "Calígrafo 2° Grado", category: "caligrafia", level: "2-grado", image: "img/portadas/1gradocaligrafo.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Práctica de escritura cursiva con el método del Equipo de Aranduka. Los estudiantes mejorarán la fluidez y elegancia de su letra, aprendiendo a enlazar caracteres correctamente y a mantener un estilo de escritura ordenado y estéticamente agradable." },
        { id: 253, title: "Calígrafo 3° Grado", category: "caligrafia", level: "3-grado", image: "img/portadas/3gradocaligrafo.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Perfeccionamiento de la caligrafía guiado por el Equipo de Aranduka. Este cuaderno ofrece ejercicios avanzados para corregir imperfecciones y consolidar un estilo de letra personal, claro y profesional, esencial para la presentación de trabajos escolares." },
        { id: 254, title: "Calígrafo 4° Grado", category: "caligrafia", level: "4-grado", image: "img/portadas/4gradocaligrafo.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Refuerzo de escritura ordenada desarrollado por el Equipo de Aranduka. Ideal para mantener la disciplina caligráfica, asegurando que los estudiantes no pierdan la claridad en su escritura a medida que aumenta la carga de trabajo académico." },
        { id: 255, title: "Calígrafo 5° Grado", category: "caligrafia", level: "5-grado", image: "img/portadas/5gradocaligrafo.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Estética y presentación son el foco de este material del Equipo de Aranduka. Enseña a los alumnos a valorar la buena presentación de sus escritos, una habilidad importante que refleja orden, dedicación y respeto por el lector." },
        { id: 256, title: "Calígrafo 6° Grado", category: "caligrafia", level: "6-grado", image: "img/portadas/6gradocaligrafo.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Dominio de caligrafía clara logrado con el Equipo de Aranduka. El objetivo final es automatizar una escritura legible y rápida, permitiendo a los estudiantes concentrarse en el contenido de sus textos sin descuidar la forma y la legibilidad." },

        // --- 3° CICLO ---
        { id: 301, title: "Matemática 7° Grado", category: "matematica", level: "7-grado", image: "img/portadas/mat7.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Álgebra y conjuntos numéricos presentados por el Equipo de Aranduka. Este libro introduce el pensamiento abstracto, fundamental para el tercer ciclo, con explicaciones claras y ejercicios desafiantes que estimulan el razonamiento lógico de los adolescentes." },
        { id: 302, title: "Matemática 8° Grado", category: "matematica", level: "8-grado", image: "img/portadas/mat8.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Polinomios y ecuaciones lineales explicados por el Equipo de Aranduka. Los estudiantes profundizarán en el lenguaje algebraico, aprendiendo a modelar y resolver situaciones matemáticas complejas, una habilidad clave para las ciencias exactas y la ingeniería." },
        { id: 303, title: "Matemática 9° Grado", category: "matematica", level: "9-grado", image: "img/portadas/mat9.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Funciones y trigonometría desarrolladas por el Equipo de Aranduka. Este texto prepara a los alumnos para el nivel medio, abarcando conceptos avanzados de geometría y análisis matemático, esenciales para una sólida formación académica pre-universitaria." },

        { id: 311, title: "Lit. Castellana 7°", category: "comunicacion", level: "7-grado", image: "img/portadas/lit7.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Obras juveniles y técnicas de estudio seleccionadas por el Equipo de Aranduka. Fomenta el hábito de la lectura placer y enseña estrategias para analizar textos literarios, mejorando la comprensión lectora y la capacidad crítica de los estudiantes." },
        { id: 312, title: "Lit. Castellana 8°", category: "comunicacion", level: "8-grado", image: "img/portadas/lit8.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Géneros literarios y ensayos estudiados con el Equipo de Aranduka. Un recorrido por la narrativa, la lírica y el drama que permite a los alumnos apreciar la diversidad literaria y expresarse creativamente a través de sus propios ensayos." },
        { id: 313, title: "Lit. Castellana 9°", category: "comunicacion", level: "9-grado", image: "img/portadas/lit9.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Literatura paraguaya y oratoria promovidas por el Equipo de Aranduka. Valoriza a nuestros autores nacionales y entrena a los estudiantes en el arte de hablar en público, fortaleciendo su identidad cultural y sus habilidades de comunicación verbal." },

        { id: 321, title: "Guaraní 7° Grado", category: "guarani", level: "7-grado", image: "img/portadas/g7.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Gramática profunda y folclore analizados por el Equipo de Aranduka. Un estudio detallado de la estructura de la lengua guaraní combinado con la riqueza de nuestras tradiciones, formando hablantes competentes y orgullosos de su herencia cultural." },
        { id: 322, title: "Guaraní 8° Grado", category: "guarani", level: "8-grado", image: "img/portadas/g8.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Producción literaria en guaraní impulsada por el Equipo de Aranduka. Invita a los estudiantes a ser creadores de cultura, escribiendo poemas, cuentos y relatos en su lengua materna, revitalizando el idioma y su uso en el ámbito académico." },
        { id: 323, title: "Guaraní 9° Grado", category: "guarani", level: "9-grado", image: "img/portadas/g9.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Investigación cultural y traducción con la guía del Equipo de Aranduka. Los alumnos realizarán proyectos de investigación sobre temas paraguayos y practicarán la traducción bidireccional, una habilidad valiosa en nuestro contexto bilingüe nacional." },

        { id: 331, title: "Trabajo y Tec. 7°", category: "trabajo-tecnologia", level: "7-grado", image: "img/portadas/tyt7.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Informática y economía doméstica enseñadas por el Equipo de Aranduka. Introduce habilidades prácticas para la vida moderna, desde el uso de herramientas digitales hasta la administración básica del hogar, preparando a los jóvenes para la autonomía." },
        { id: 332, title: "Trabajo y Tec. 8°", category: "trabajo-tecnologia", level: "8-grado", image: "img/portadas/tyt8.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Emprendedurismo y orientación vocacional con el Equipo de Aranduka. Fomenta el espíritu emprendedor y ayuda a los estudiantes a descubrir sus intereses y talentos, guiándolos en la planificación de su futuro académico y profesional." },
        { id: 333, title: "Trabajo y Tec. 9°", category: "trabajo-tecnologia", level: "9-grado", image: "img/portadas/tyt9.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Proyectos y marketing básico desarrollados por el Equipo de Aranduka. Los alumnos aprenderán a diseñar, gestionar y promocionar pequeños proyectos, adquiriendo competencias valiosas para el mundo laboral y el desarrollo de iniciativas propias." },

        { id: 341, title: "Historia 7° Grado", category: "historia", level: "7-grado", image: "img/portadas/hyg7.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Prehistoria y civilizaciones antiguas exploradas con el Equipo de Aranduka. Un viaje fascinante a los orígenes de la humanidad y las grandes culturas del pasado, ayudando a entender cómo hemos llegado a ser la sociedad que somos hoy." },
        { id: 342, title: "Historia 8° Grado", category: "historia", level: "8-grado", image: "img/portadas/hyg8.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Historia colonial e independencia narrada por el Equipo de Aranduka. Analiza los procesos clave que formaron las naciones americanas, con especial énfasis en la gesta independentista paraguaya y la construcción de nuestra identidad nacional." },
        { id: 343, title: "Historia 9° Grado", category: "historia", level: "9-grado", image: "img/portadas/hyg9.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Historia del Paraguay independiente detallada por el Equipo de Aranduka. Estudia los desafíos, logros y conflictos de nuestra nación desde 1811 hasta la actualidad, fomentando una conciencia histórica crítica y comprometida con el futuro del país." },

        { id: 351, title: "Ética 7° Grado", category: "etica", level: "7-grado", image: "img/portadas/etica7.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Valores humanos y convivencia reflexionados con el Equipo de Aranduka. Este libro promueve el desarrollo moral y la ética personal, discutiendo temas como la honestidad, la solidaridad y el respeto, bases para una sociedad justa y armoniosa." },
        { id: 352, title: "Ética 8° Grado", category: "etica", level: "8-grado", image: "img/portadas/etica8.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Constitución y estado de derecho explicados por el Equipo de Aranduka. Introduce a los estudiantes en el conocimiento de las leyes fundamentales y la organización del estado, formando ciudadanos informados, responsables y defensores de la democracia." },
        { id: 353, title: "Ética 9° Grado", category: "etica", level: "9-grado", image: "img/portadas/etica9.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Derechos humanos universales analizados por el Equipo de Aranduka. Un estudio profundo sobre la dignidad humana y los derechos inalienables de todas las personas, inspirando a los jóvenes a ser agentes de cambio y defensores de la justicia social." },

        { id: 361, title: "Ciencias 7° Grado", category: "ciencias-de-la-naturaleza-y-salud", level: "7-grado", image: "img/portadas/ciencias7.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Método científico y materia investigados con el Equipo de Aranduka. Enseña a pensar como científicos, formulando hipótesis y experimentando para comprender las propiedades de la materia y los principios básicos que rigen el mundo físico." },
        { id: 362, title: "Ciencias 8° Grado", category: "ciencias-de-la-naturaleza-y-salud", level: "8-grado", image: "img/portadas/ciencias8.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Física, química y anatomía integradas por el Equipo de Aranduka. Un enfoque multidisciplinario que conecta el funcionamiento del cuerpo humano con los principios físicos y químicos, ofreciendo una visión holística de las ciencias naturales." },
        { id: 363, title: "Ciencias 9° Grado", category: "ciencias-de-la-naturaleza-y-salud", level: "9-grado", image: "img/portadas/ciencia9.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Genética y educación sexual abordadas con responsabilidad por el Equipo de Aranduka. Provee información científica y ética sobre la herencia biológica y la salud reproductiva, temas cruciales para el desarrollo y la madurez de los adolescentes." },

        // --- NIVEL MEDIO ---
        { id: 401, title: "Literatura 1° Curso", category: "comunicacion", level: "1-curso", image: "img/portadas/litcurso1.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Análisis de obras clásicas universales con el Equipo de Aranduka. Un viaje por las grandes obras de la literatura mundial que han moldeado el pensamiento humano, desarrollando la capacidad interpretativa y el gusto estético de los estudiantes." },
        { id: 402, title: "Literatura 2° Curso", category: "comunicacion", level: "2-curso", image: "img/portadas/litcurso2.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Literatura hispanoamericana explorada por el Equipo de Aranduka. Descubre las voces más potentes de nuestro continente, desde el realismo mágico hasta la poesía vanguardista, reconociendo nuestra identidad compartida a través de las letras." },
        { id: 403, title: "Literatura 3° Curso", category: "comunicacion", level: "3-curso", image: "img/portadas/litcurso3.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Literatura paraguaya contemporánea destacada por el Equipo de Aranduka. Celebra a nuestros escritores actuales, analizando sus obras y comprendiendo cómo reflejan y cuestionan la realidad paraguaya de hoy, cerrando el ciclo con una mirada local." },

        { id: 411, title: "Guaraní 1° Curso", category: "guarani", level: "1-curso", image: "img/portadas/guarani primercurso.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Ñe’êporâhaipyre avanzado estudiado con el Equipo de Aranduka. Profundiza en la belleza literaria del guaraní, analizando figuras retóricas y estilos narrativos complejos que demuestran la sofisticación y riqueza expresiva de nuestra lengua nativa." },
        { id: 412, title: "Guaraní 2° Curso", category: "guarani", level: "2-curso", image: "img/portadas/guarani2.jpeg", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Traducción técnica y periodística practicada con el Equipo de Aranduka. Prepara a los estudiantes para el uso profesional del guaraní, enseñando técnicas para traducir textos especializados y noticias con precisión y fidelidad al sentido original." },
        { id: 413, title: "Guaraní 3° Curso", category: "guarani", level: "3-curso", image: "img/portadas/guarani tercercurso.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Obras teatrales y ensayos creados con el apoyo del Equipo de Aranduka. Fomenta la dramaturgia y el pensamiento crítico en guaraní, animando a los alumnos a producir cultura y a reflexionar sobre temas sociales en su propio idioma." },

        { id: 421, title: "Historia 1° Curso", category: "historia", level: "1-curso", image: "img/portadas/hyg1.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Historia Universal analizada por el Equipo de Aranduka. Un panorama global de los eventos que han marcado a la humanidad, desde las revoluciones industriales hasta los conflictos mundiales, para entender el contexto internacional actual." },
        { id: 422, title: "Historia 2° Curso", category: "historia", level: "2-curso", image: "img/portadas/hyg2.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Historia Americana profundizada por el Equipo de Aranduka. Estudia la evolución política, social y económica del continente americano, comprendiendo las dinámicas regionales y las relaciones interamericanas a lo largo de los siglos." },
        { id: 423, title: "Historia 3° Curso", category: "historia", level: "3-curso", image: "img/portadas/hyg3.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Historia contemporánea y geopolítica explicadas por el Equipo de Aranduka. Analiza el escenario mundial actual, las tensiones geopolíticas y el papel del Paraguay en el mundo globalizado, formando ciudadanos con visión estratégica." },

        { id: 431, title: "Política 3° Curso", category: "politica", level: "3-curso", image: "img/portadas/politica3.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Sistemas de gobierno y teoría política con el Equipo de Aranduka. Introduce a los estudiantes en las ciencias políticas, comparando diferentes modelos estatales e ideologías para comprender mejor el funcionamiento del poder y la administración pública." },
        { id: 432, title: "Sociología 3° Curso", category: "sociologia", level: "3-curso", image: "img/portadas/sociologia3.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Estudio de la sociedad y sus estructuras por el Equipo de Aranduka. Analiza los grupos sociales, las instituciones y los fenómenos colectivos, proporcionando herramientas teóricas para interpretar la realidad social y sus constantes cambios." },

        { id: 442, title: "Física 2° Curso", category: "fisica", level: "2-curso", image: "img/portadas/fisica2.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Termodinámica y óptica enseñadas por el Equipo de Aranduka. Explora el calor, la energía y la luz a través de leyes físicas y experimentos, fundamentales para comprender tecnologías modernas y fenómenos naturales cotidianos." },
        { id: 443, title: "Física 3° Curso", category: "fisica", level: "3-curso", image: "img/portadas/fisica3.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Electricidad y física moderna detalladas por el Equipo de Aranduka. Un curso avanzado sobre electromagnetismo, circuitos y física cuántica básica, preparando a los estudiantes para carreras en ingeniería, tecnología y ciencias aplicadas." },
        { id: 445, title: "Química 2° Curso", category: "quimica", level: "2-curso", image: "img/portadas/quimica2.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Reacciones y estequiometría dominadas con el Equipo de Aranduka. Enseña a balancear ecuaciones y calcular cantidades químicas, habilidades esenciales para el trabajo de laboratorio y la comprensión de los procesos industriales." },
        { id: 446, title: "Química 3° Curso", category: "quimica", level: "3-curso", image: "img/portadas/quimmica3.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Química orgánica y bioquímica exploradas por el Equipo de Aranduka. Estudia los compuestos del carbono y las moléculas de la vida, base para la medicina, la farmacología y la biotecnología, campos de gran relevancia futura." },
        { id: 460, title: "Filosofía 2° Curso", category: "filosofia", level: "2-curso", image: "img/portadas/filosofia2.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Pensamiento filosófico y lógica introducidos por el Equipo de Aranduka. Invita a la reflexión profunda sobre la existencia, el conocimiento y la verdad, desarrollando el pensamiento crítico y la capacidad de argumentación racional." },

        // --- ENSAYOS DE CLIENTES / COMUNIDAD ---
        { id: 901, title: "Ensayo sobre la Reforma Educativa", category: "ensayo", level: "comunidad", image: "img/portadas/default_cover.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Aporte valioso sobre la educación paraguaya, analizado y presentado por el Equipo de Aranduka. Este ensayo ofrece una perspectiva crítica sobre los cambios necesarios en nuestro sistema educativo para enfrentar los desafíos del siglo XXI." },
        { id: 902, title: "La Importancia de la Lectura", category: "ensayo", level: "comunidad", image: "img/portadas/default_cover.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Reflexión sobre el hábito lector en jóvenes, destacada por el Equipo de Aranduka. Argumenta convincentemente sobre cómo la lectura transforma mentes y abre horizontes, siendo una herramienta indispensable para el desarrollo personal y profesional." },
        { id: 903, title: "Héroes del Paraguay", category: "ensayo", level: "comunidad", image: "img/portadas/default_cover.png", file: "documentos/libro-ejemplo.pdf", author: "Equipo de Aranduka", description: "Reseña histórica colaborativa curada por el Equipo de Aranduka. Rinde homenaje a las figuras que forjaron nuestra patria, recordando sus sacrificios y legados para inspirar a las nuevas generaciones a amar y servir al Paraguay." }
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

        // Metadata - New Fields
        const authorEl = document.getElementById('modalBookAuthor');
        if (authorEl) authorEl.innerText = book.author || 'Gómez Hurtado y Francisco Javier García Prieto'; // Default to match screenshot style if missing

        const yearEl = document.getElementById('modalBookYear');
        if (yearEl) yearEl.innerText = '2025';

        const genreEl = document.getElementById('modalBookGenre');
        if (genreEl) {
            // Map category to a nicer string if possible
            const catMap = {
                'matematica': 'Didáctica, Pedagogía, Ciencias Exactas',
                'comunicacion': 'Lengua, Literatura, Pedagogía',
                'guarani': 'Lengua Guaraní, Cultura, Educación',
                'sociales': 'Ciencias Sociales, Formación Ética',
                'historia': 'Historia, Geografía, Ciencias Sociales',
                'ciencias-de-la-naturaleza-y-salud': 'Ciencias Naturales, Salud, Medio Ambiente',
                'inicial': 'Educación Inicial, Didáctica Infantil'
            };
            genreEl.innerText = catMap[book.category] || book.category.replace(/-/g, ' ').toUpperCase();
        }

        // Kept for compatibility but hidden in new HTML
        const catTextEl = document.getElementById('modalBookCategoryText');
        if (catTextEl) catTextEl.innerText = book.category.replace(/-/g, ' ').toUpperCase();

        const badgeEl = document.getElementById('modalBookBadge');
        if (badgeEl) badgeEl.innerText = book.level.toUpperCase();

        // 5. Actions Logic (Revised for Aranduka 2.0)
        const user = JSON.parse(localStorage.getItem('aranduka_currentUser'));
        
        // --- Button 1: Proyectar Clase ---
        const btnProject = document.getElementById('btnProjectClass');
        if (btnProject) {
            btnProject.onclick = () => {
                if(!user) {
                     Swal.fire({
                        title: 'Acceso Restringido',
                        text: 'Debes iniciar sesión para proyectar clases listas.',
                        icon: 'warning',
                        confirmButtonText: 'Iniciar Sesión'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            closeBookModal();
                            $('#loginModal').modal('show');
                        }
                    });
                    return;
                }
                
                // Demo Action
                Swal.fire({
                    title: 'Generando Clase...',
                    html: 'Aranduka está organizando la presentación, actividades y cierre.<br><b>Tiempo estimado: 3 segundos.</b>',
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                }).then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Clase Lista!',
                        text: 'Se ha abierto el modo presentación en una nueva pestaña (Demo).',
                        confirmButtonColor: '#1565c0'
                    });
                });
            };
        }

        // --- Button 2: Descargar Recursos ---
        const btnDownload = document.getElementById('btnDownloadResources');
        if (btnDownload) {
             btnDownload.onclick = () => {
                if (!user) {
                    Swal.fire({
                        title: '¿Eres Docente?',
                        text: 'Para descargar solucionarios y guías, necesitamos verificar tu cuenta.',
                        icon: 'info',
                        showCancelButton: true,
                        confirmButtonText: 'Iniciar Sesión',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            closeBookModal();
                            $('#loginModal').modal('show');
                        }
                    });
                } else {
                    // Real Download Logic
                    const link = document.createElement('a');
                    link.href = book.file || '#';
                    link.download = book.title;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Descarga Iniciada',
                        text: 'El pack de recursos se está descargando.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            };
        }

        // --- Button 3: Crear mi Clase (AI) ---
        const btnCreate = document.getElementById('btnCreateClass');
        if (btnCreate) {
            btnCreate.onclick = () => {
                if(!user) {
                     Swal.fire({
                        title: 'Asistente IA',
                        text: 'Inicia sesión para usar el asistente de creación de clases.',
                        icon: 'warning',
                        confirmButtonText: 'Entrar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            closeBookModal();
                            $('#loginModal').modal('show');
                        }
                    });
                    return;
                }

                Swal.fire({
                    title: 'Crear mi Clase',
                    input: 'textarea',
                    inputLabel: '¿Sobre qué quieres dar clase hoy?',
                    inputPlaceholder: 'Ej: El ciclo del agua para niños de 3er grado...',
                    inputAttributes: {
                        'aria-label': 'Tema de la clase'
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Generar Clase',
                    confirmButtonColor: '#00695c',
                    showLoaderOnConfirm: true,
                    preConfirm: (text) => {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                resolve();
                            }, 2000); // Fake AI delay
                        });
                    },
                    allowOutsideClick: () => !Swal.isLoading()
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Estructura Creada',
                            text: 'Hemos generado una propuesta de clase basada en tu idea. Revisa tu correo.',
                        });
                    }
                });
            };
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
                            <img src="${rb.image}" class="img-fluid rounded mb-2 shadow-sm" style="display: block; margin: 0 auto;">
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
        // 1. Prioritize History Navigation if valid state exists (fixes "resetting app" issue)
        if (!isNavigatingHistory && window.history.state && window.history.state.modalOpen) {
            window.history.back();
            return; // Let popstate handle the UI changes
        }

        // 2. Fallback: Manual Close (only if no history state)
        const m = document.getElementById('quickViewModal');
        m.classList.remove('active');
        document.body.style.overflow = '';
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
        if (typeof $ !== 'undefined') $('#heroCarousel').carousel({ interval: 3000, pause: 'hover' });
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
