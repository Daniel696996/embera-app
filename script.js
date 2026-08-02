const map = L.map('mapa', { zoomControl: false }).setView([8.0, -75.5812], 7);
L.control.zoom({ position: 'bottomleft' }).addTo(map);

// CAPAS DE MAPA: 
const capaCalles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

const capaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
});

capaSatelite.addTo(map);

// Ocultar loader cuando el mapa base esté listo
map.whenReady(() => {
    setTimeout(() => {
        const loader = document.getElementById('map-loader');
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }, 800);
});

const baseLayers = {
    "🌍 Satélite Real": capaSatelite,
    "🗺️ Mapa Estándar": capaCalles
};
L.control.layers(baseLayers, null, { position: 'topleft' }).addTo(map);

const createCustomIcon = (isActive = false) => {
    return L.divIcon({
        className: isActive ? 'custom-marker active' : 'custom-marker',
        html: '<div class="marker-dot"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

const traducciones = {
    es: {
        subtitulo: "Agencia de Viajes & Turismo",
        headerPunto: '<i class="ph ph-castle-turret"></i> Punto de Interés',
        headerHistoria: '<i class="ph ph-scroll"></i> Historia General',
        headerDatos: '<i class="ph ph-warning-circle"></i> Datos Clave',
        headerSonidos: '<i class="ph ph-music-notes"></i> Sonidos de la Región',
        placeholderSitioNombre: "¡Hola! Haz clic en cualquier marcador...",
        placeholderSitioDesc: "Selecciona un punto en el mapa para descubrir su magia, historia y sonidos.",
        btnEscucharIntro: '<i class="ph ph-speaker-high"></i> Escuchar Introducción',
        btnDetenerIntro: '<i class="ph ph-speaker-slash"></i> Detener Introducción',
        txtHistoriaInicial: "Navega por el mapa para desbloquear los relatos de nuestra tierra.",
        btnLeerMas: "Leer más detalles ▼",
        btnOcultarMas: "Ocultar detalles ▲",
        btnEscucharHistoria: '<i class="ph ph-speaker-high"></i> Escuchar Historia Completa',
        btnDetenerHistoria: '<i class="ph ph-speaker-slash"></i> Detener Historia',
        lblHora: '<i class="ph ph-clock"></i> Hora local:',
        lblClima: '<i class="ph ph-cloud-sun"></i> Clima:',
        lblContexto: '<i class="ph ph-chart-bar"></i> Contexto:',
        lblCurioso: '<i class="ph ph-lightbulb"></i> Dato Curioso',
        placeholderCurioso: "Selecciona un destino para ver curiosidades...",
        txtPrecaucionDefecto: "Disfruta el viaje, cuida el entorno y apoya siempre el comercio local.",
        lblInstruccionSonidos: "Haz clic en una canción para reproducirla aquí mismo",
        lblExploraMusica: "Explora el mapa para destapar la música...",
        portalTitulo: '<i class="ph ph-airplane-tilt"></i> Portal de Viajeros & Agencias',
        placeholderCorreo: "Correo (ej: agencia@travel.com)",
        placeholderPass: "Contraseña",
        btnLogin: "Iniciar Sesión",
        txtSede: '<i class="ph ph-map-pin"></i> Sede Principal: Medellín, Antioquia',
        idiomaLabel: '<i class="ph ph-globe"></i> Idioma:'
    },
    en: {
        subtitulo: "Travel & Tourism Agency",
        headerPunto: '<i class="ph ph-castle-turret"></i> Point of Interest',
        headerHistoria: '<i class="ph ph-scroll"></i> General History',
        headerDatos: '<i class="ph ph-warning-circle"></i> Key Data',
        headerSonidos: '<i class="ph ph-music-notes"></i> Sounds of the Region',
        placeholderSitioNombre: "Hello! Click on any marker...",
        placeholderSitioDesc: "Select a point on the map to discover its magic, history, and sounds.",
        btnEscucharIntro: '<i class="ph ph-speaker-high"></i> Listen to Intro',
        btnDetenerIntro: '<i class="ph ph-speaker-slash"></i> Stop Intro',
        txtHistoriaInicial: "Navigate the map to unlock the tales of our land.",
        btnLeerMas: "Read more details ▼",
        btnOcultarMas: "Hide details ▲",
        btnEscucharHistoria: '<i class="ph ph-speaker-high"></i> Listen to History',
        btnDetenerHistoria: '<i class="ph ph-speaker-slash"></i> Stop History',
        lblHora: '<i class="ph ph-clock"></i> Local Time:',
        lblClima: '<i class="ph ph-cloud-sun"></i> Weather:',
        lblContexto: '<i class="ph ph-chart-bar"></i> Context:',
        lblCurioso: '<i class="ph ph-lightbulb"></i> Fun Fact',
        placeholderCurioso: "Select a destination to view fun facts...",
        txtPrecaucionDefecto: "Enjoy the trip, care for the environment, and always support local commerce.",
        lblInstruccionSonidos: "Click on a song to play it right here",
        lblExploraMusica: "Explore the map to uncover music...",
        portalTitulo: '<i class="ph ph-airplane-tilt"></i> Traveler & Agency Portal',
        placeholderCorreo: "Email (e.g., agency@travel.com)",
        placeholderPass: "Password",
        btnLogin: "Log In",
        txtSede: '<i class="ph ph-map-pin"></i> Headquarters: Medellín, Antioquia',
        idiomaLabel: '<i class="ph ph-globe"></i> Language:'
    }
};

const lugares = [
    {
        id: "cartagena",
        coordenadas: [10.4224, -75.5398],
        es: {
            nombre: "Castillo de San Felipe de Barajas",
            ciudad: "Cartagena",
            introCiudad: "Hola, te doy la bienvenida a Cartagena de Indias, el tesoro colonial del Caribe. Una ciudad de brisa cálida, murallas centenarias y plazas mágicas.",
            descripcion: "Una imponente fortaleza militar del siglo diecisiete, perfecta para sentir la historia bajo el sol tropical.",
            historia: "Cartagena guarda entre sus murallas los secretos de los puertos de la historia americana.",
            historiaExtensa: "Construido sobre el cerro de San Lázaro en 1657, el Castillo de San Felipe fue la mayor obra militar española en América. Su edificación requirió mano de obra esclava y se utilizó piedra coralina y ladrillo. Su diseño incluía baterías escalonadas y una compleja red de túneles que funcionaban como vías de escape y como trampas acústicas para oír al enemigo desde lejos. Superó asedios legendarios, como el del Almirante Edward Vernon en 1741, consolidando la reputación de Cartagena como ciudad heroica.",
            precaucion: "¡El sol del Caribe brilla fuerte! No olvides llevar una buena botella de agua y protector solar.",
            clima: "Cálido y alegre, ~30°C.",
            datosGenerales: "Patrimonio de la Humanidad (UNESCO).",
            curiosidades: [
                "Sus murallas tardaron más de dos siglos en construirse por completo para defenderse de corsarios.",
                "Bajo el castillo existe una red de túneles diseñada para escuchar los pasos del enemigo.",
                "Cartagena is known worldwide as 'The Heroic City' due to its resilience in multiple sieges."
            ]
        },
        en: {
            nombre: "Castle of San Felipe de Barajas",
            ciudad: "Cartagena",
            introCiudad: "Hello, welcome to Cartagena de Indias, the colonial treasure of the Caribbean. A city of warm breeze, centuries-old walls, and magical squares.",
            descripcion: "An imposing seventeenth-century military fortress, perfect for feeling history under the tropical sun.",
            historia: "Cartagena keeps within its walls the secrets of the ports of American history.",
            historiaExtensa: "Built on San Lázaro hill in 1657, the Castle of San Felipe was the largest Spanish military work in America. Its construction required slave labor and used coral stone and brick. Its design included tiered batteries and a complex network of tunnels that functioned as escape routes and acoustic traps to hear the enemy from afar. It overcame legendary sieges, such as that of Admiral Edward Vernon in 1741, consolidating Cartagena's reputation as a heroic city.",
            precaucion: "The Caribbean sun shines bright! Don't forget to bring a good bottle of water and sunscreen.",
            clima: "Warm and cheerful, ~30°C.",
            datosGenerales: "World Heritage Site (UNESCO).",
            curiosidades: [
                "Its walls took over two centuries to be fully built to defend against privateers.",
                "Beneath the castle, there is a network of tunnels designed to hear the enemy's footsteps.",
                "Cartagena is known worldwide as 'The Heroic City' due to its resilience in multiple sieges."
            ]
        },
        canciones: [
            { nombre: "🌊 El Mapalé", audioUrl: "audio/El Mapale Original.mp3" },
            { nombre: "🎶 Rebelión - Joe Arroyo", audioUrl: "audio/Rebelion.mp3" },
            { nombre: "🎣 Totó La Momposina - El Pescador", audioUrl: "audio/El pescador.mp3" }
        ]
    },
    {
        id: "medellin",
        coordenadas: [6.2366, -75.5804],
        es: {
            nombre: "Pueblito Paisa",
            ciudad: "Medellín",
            introCiudad: "Hola, te doy la bienvenida a Medellín, que descansa sobre un hermoso valle rodeado de montañas, destacando por su constante innovación y la amabilidad de su gente.",
            descripcion: "Un rincón tradicional que recrea los hermosos pueblos antioqueños en lo alto del Cerro Nutibara.",
            historia: "Diseñado para mantener vivo el legado de los arrieros antioqueños y sus tradiciones intactas.",
            historiaExtensa: "Inaugurado en marzo de 1978, el Pueblito Paisa fue construido utilizando materiales de casas antiguas del municipio del Peñol, antes de que este fuera inundado para crear la famosa represa. El diseño recrea milimétricamente la distribución de los pueblos de antaño: la plaza empedrada en el centro, rodeada por la iglesia parroquial, la alcaldía, la escuela y las tradicionales tiendas de abarrotes con balcones de madera tallada. Es un testimonio arquitectónico de la colonización antioqueña.",
            precaucion: "Es un plan excelente para caminar sin afán al atardecer y disfrutar de una vista panorámica.",
            clima: "Primaveral, ~22°C.",
            datosGenerales: "Mirador principal del Valle de Aburrá.",
            curiosidades: [
                "El Cerro Nutibara tiene una altura de ochenta metros sobre el nivel de la ciudad.",
                "Las tejas de barro del Pueblito Paisa provienen de demoliciones de auténticas casas coloniales.",
                "Medellín es mundialmente reconocida como la 'Ciudad de la Eterna Primavera'."
            ]
        },
        en: {
            nombre: "Pueblito Paisa",
            ciudad: "Medellín",
            introCiudad: "Hello, welcome to Medellín, resting in a beautiful valley surrounded by mountains, noted for its constant innovation and the kindness of its people.",
            descripcion: "A traditional corner recreating beautiful Antioquian towns atop Nutibara Hill.",
            historia: "Designed to keep the legacy of Antioquian muleteers and their intact traditions alive.",
            historiaExtensa: "Inaugurated in March 1978, Pueblito Paisa was built using materials from old houses in the municipality of El Peñol before it was flooded to create the famous dam. The design meticulously recreates the layout of old towns: the cobblestone plaza in the center, surrounded by the parish church, town hall, school, and traditional grocery stores with carved wooden balconies. It is an architectural testimony of Antioquian colonization.",
            precaucion: "It's an excellent plan to stroll leisurely at sunset and enjoy a panoramic view.",
            clima: "Spring-like, ~22°C.",
            datosGenerales: "Main viewpoint of the Aburrá Valley.",
            curiosidades: [
                "Nutibara Hill stands eighty meters above the city level.",
                "The clay tiles of Pueblito Paisa come from demolitions of authentic colonial houses.",
                "Medellín is globally recognized as the 'City of Eternal Spring'."
            ]
        },
        canciones: [
            { nombre: "🤠 Trova Paisa (Fogata de Montaña)", audioUrl: "https://actions.google.com/sounds/v1/ambiences/daytime_forest_bonfire.ogg" }
        ]
    },
    {
        id: "apartado",
        coordenadas: [7.8833, -76.6333],
        es: {
            nombre: "Monumento al Banano",
            ciudad: "Apartadó",
            introCiudad: "Hola, te doy la bienvenida a Apartadó, el vibrante corazón del Urabá antioqueño, donde la cordillera abraza el mar Caribe.",
            descripcion: "Un gran homenaje a la pujanza agrícola y la alegría inigualable de nuestra región bananera.",
            historia: "Apartadó late con fuerza como la capital bananera de Colombia, un motor económico crucial.",
            historiaExtensa: "Este monumento rinde tributo a la principal actividad económica del Urabá: la agroindustria bananera. Desde mediados del siglo XX, la exportación de variedades como el Cavendish transformó radicalmente la región, atrayendo a miles de trabajadores de diversas zonas del país. Esto generó un crisol cultural único donde se mezclan tradiciones indígenas Emberá, afrodescendientes y andinas. El monumento es un recordatorio de que la identidad de Apartadó está forjada en el trabajo de la tierra.",
            precaucion: "Prepárate para clima de selva tropical; usa ropa fresca y repelente.",
            clima: "Tropical húmedo, ~29°C.",
            datosGenerales: "La puerta de oro del mar en Antioquia.",
            curiosidades: [
                "Urabá es uno de los principales exportadores de banano y plátano de alta calidad en el mundo.",
                "Apartadó destaca por su gran diversidad cultural, albergando comunidades indígenas y afrodescendientes.",
                "El nombre 'Apartadó' proviene de la lengua indígena y hace alusión a un río de la región."
            ]
        },
        en: {
            nombre: "Banana Monument",
            ciudad: "Apartadó",
            introCiudad: "Hello, welcome to Apartadó, the vibrant heart of Antioquian Urabá, where the mountain range embraces the Caribbean Sea.",
            descripcion: "A grand tribute to agricultural drive and the unmatched joy of our banana region.",
            historia: "Apartadó beats strongly as Colombia's banana capital, a crucial economic engine.",
            historiaExtensa: "This monument pays tribute to Urabá's main economic activity: the banana agro-industry. Since the mid-20th century, the export of varieties like Cavendish radically transformed the region, attracting thousands of workers from various areas of the country. This generated a unique cultural melting pot blending Emberá indigenous, Afro-descendant, and Andean traditions. The monument is a reminder that Apartadó's identity is forged in the work of the land.",
            precaucion: "Prepare for a tropical rainforest climate; wear fresh clothing and repellent.",
            clima: "Humid tropical, ~29°C.",
            datosGenerales: "The golden gateway to the sea in Antioquia.",
            curiosidades: [
                "Urabá is one of the world's leading exporters of high-quality bananas and plantains.",
                "Apartadó stands out for its great cultural diversity, housing indigenous and Afro-descendant communities.",
                "The name 'Apartadó' comes from the indigenous language, referring to a local river."
            ]
        },
        canciones: [
            { nombre: "🪘 Bullerengue (Aves de Selva)", audioUrl: "https://actions.google.com/sounds/v1/ambiences/jungle_birds.ogg" }
        ]
    }
];

let marcadores = []; 
let lugarActual = null;
let idiomaActual = "es";
let estadoVozPrincipal = false; 
let estadoVozHistoria = false;
let intervaloCuriosidades = null;

const panelLateral = document.getElementById('panel-lateral');
const btnToggleMenu = document.getElementById('btn-toggle-menu');
const selectIdioma = document.getElementById('select-idioma');
const audioLocal = document.getElementById('audio-local');
const reproductorAudio = document.getElementById('reproductor-audio');
const reproductorContenedor = document.getElementById('reproductor-integrado');
const infoCancionSonando = document.getElementById('info-cancion-sonando');

const btnVozPrincipal = document.getElementById('btn-voz-principal');
const btnVozHistoria = document.getElementById('btn-voz-historia');
const btnToggleTextoHistoria = document.getElementById('btn-toggle-texto-historia');
const contenedorHistoriaExtensa = document.getElementById('contenedor-historia-extensa');

if (window.innerWidth <= 768) {
    panelLateral.classList.add('colapsado');
    btnToggleMenu.innerHTML = '<i class="ph ph-caret-left"></i>';
}

// LOGICA MODO OSCURO
const btnTema = document.getElementById('btn-tema');
btnTema.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    if(document.body.classList.contains('dark-theme')) {
        btnTema.innerHTML = '<i class="ph ph-sun"></i>';
    } else {
        btnTema.innerHTML = '<i class="ph ph-moon"></i>';
    }
});

// LÓGICA GEOLOCALIZACIÓN
document.getElementById('btn-ubicacion').addEventListener('click', () => {
    map.locate({setView: true, maxZoom: 14});
});
map.on('locationfound', function(e) {
    L.marker(e.latlng).addTo(map)
        .bindPopup(idiomaActual === 'es' ? "📍 Estás aquí" : "📍 You are here").openPopup();
});
map.on('locationerror', function(e) {
    alert(idiomaActual === 'es' ? "No se pudo acceder a tu ubicación." : "Could not access your location.");
});

selectIdioma.addEventListener('change', (e) => {
    idiomaActual = e.target.value;
    actualizarTextosUI();
    if (lugarActual) {
        poblarDatosLugar(lugarActual);
    }
});

function actualizarTextosUI() {
    const t = traducciones[idiomaActual];
    document.getElementById('lbl-idioma-text').innerHTML = t.idiomaLabel;
    document.getElementById('txt-subtitulo').innerText = t.subtitulo;
    document.getElementById('header-punto').innerHTML = t.headerPunto;
    document.getElementById('header-historia').innerHTML = t.headerHistoria;
    document.getElementById('header-datos').innerHTML = t.headerDatos;
    document.getElementById('header-sonidos').innerHTML = t.headerSonidos;
    
    if (!lugarActual) {
        document.getElementById('nombre-sitio').innerText = t.placeholderSitioNombre;
        document.getElementById('desc-sitio').innerText = t.placeholderSitioDesc;
        document.getElementById('sec-historia').innerText = t.txtHistoriaInicial;
        document.getElementById('info-clima').innerText = idiomaActual === 'es' ? "Elige un lugar..." : "Choose a place...";
        document.getElementById('info-general').innerText = idiomaActual === 'es' ? "Elige un lugar..." : "Choose a place...";
        document.getElementById('info-curiosidad').innerText = t.placeholderCurioso;
        document.getElementById('sec-precaucion').innerText = t.txtPrecaucionDefecto;
        document.getElementById('lbl-explora-musica').innerText = t.lblExploraMusica;
    }

    document.getElementById('btn-toggle-texto-historia').innerText = contenedorHistoriaExtensa.style.display === 'block' ? t.btnOcultarMas : t.btnLeerMas;
    document.getElementById('lbl-hora').innerHTML = t.lblHora;
    document.getElementById('lbl-clima').innerHTML = t.lblClima;
    document.getElementById('lbl-contexto').innerHTML = t.lblContexto;
    document.getElementById('lbl-curioso').innerHTML = t.lblCurioso;
    document.getElementById('lbl-instruccion-sonidos').innerText = t.lblInstruccionSonidos;
    document.getElementById('txt-portal-titulo').innerHTML = t.portalTitulo;
    document.getElementById('login-email').placeholder = t.placeholderCorreo;
    document.getElementById('login-pass').placeholder = t.placeholderPass;
    document.getElementById('btn-login-text').innerText = t.btnLogin;
    document.getElementById('txt-sede').innerHTML = t.txtSede;

    if (estadoVozPrincipal) btnVozPrincipal.innerHTML = t.btnDetenerIntro;
    else btnVozPrincipal.innerHTML = t.btnEscucharIntro;

    if (estadoVozHistoria) btnVozHistoria.innerHTML = t.btnDetenerHistoria;
    else btnVozHistoria.innerHTML = t.btnEscucharHistoria;
}

document.querySelectorAll('.acordeon-cabecera').forEach(cabecera => {
    cabecera.addEventListener('click', () => {
        cabecera.parentElement.classList.toggle('activo');
    });
});

function actualizarHora() {
    document.getElementById('info-hora').innerText = new Date().toLocaleTimeString(idiomaActual === 'es' ? 'es-CO' : 'en-US'); 
}
setInterval(actualizarHora, 1000); actualizarHora();

btnToggleMenu.addEventListener('click', () => {
    panelLateral.classList.toggle('colapsado');
    const isColapsado = panelLateral.classList.contains('colapsado');
    btnToggleMenu.innerHTML = isColapsado ? '<i class="ph ph-caret-left"></i>' : '<i class="ph ph-caret-right"></i>';
});

let touchStartX = 0;
let touchEndX = 0;

panelLateral.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

panelLateral.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    manejarGestoTactil();
}, { passive: true });

function manejarGestoTactil() {
    const distanciaMinima = 50; 
    if (touchEndX - touchStartX > distanciaMinima) {
        if (!panelLateral.classList.contains('colapsado')) {
            panelLateral.classList.add('colapsado');
            btnToggleMenu.innerHTML = '<i class="ph ph-caret-left"></i>';
        }
    } else if (touchStartX - touchEndX > distanciaMinima) {
        if (panelLateral.classList.contains('colapsado')) {
            panelLateral.classList.remove('colapsado');
            btnToggleMenu.innerHTML = '<i class="ph ph-caret-right"></i>';
        }
    }
}

function detenerTodaMusicaYVoz() {
    reproductorAudio.pause();
    reproductorAudio.currentTime = 0;
    reproductorContenedor.style.display = 'none';
    window.speechSynthesis.cancel();
    
    estadoVozPrincipal = false;
    btnVozPrincipal.innerHTML = traducciones[idiomaActual].btnEscucharIntro;
    btnVozPrincipal.classList.remove('btn-stop-dinamico');

    estadoVozHistoria = false;
    btnVozHistoria.innerHTML = traducciones[idiomaActual].btnEscucharHistoria;
    btnVozHistoria.classList.remove('btn-stop-dinamico');
}

function iniciarRotacionCuriosidades(curiosidades) {
    if (intervaloCuriosidades) clearInterval(intervaloCuriosidades);
    if (!curiosidades || curiosidades.length === 0) return;

    let index = 0;
    const elemCuriosidad = document.getElementById('info-curiosidad');
    elemCuriosidad.style.opacity = 0;
    elemCuriosidad.innerText = curiosidades[index];
    setTimeout(() => { elemCuriosidad.style.opacity = 1; }, 100);

    intervaloCuriosidades = setInterval(() => {
        elemCuriosidad.style.opacity = 0;
        setTimeout(() => {
            index = (index + 1) % curiosidades.length;
            elemCuriosidad.innerText = curiosidades[index];
            elemCuriosidad.style.opacity = 1;
        }, 300);
    }, 6000); 
}

btnToggleTextoHistoria.addEventListener('click', () => {
    const t = traducciones[idiomaActual];
    if (contenedorHistoriaExtensa.style.display === 'none') {
        contenedorHistoriaExtensa.style.display = 'block';
        btnToggleTextoHistoria.innerText = t.btnOcultarMas;
    } else {
        contenedorHistoriaExtensa.style.display = 'none';
        btnToggleTextoHistoria.innerText = t.btnLeerMas;
    }
});

function hablarTexto(texto) {
    window.speechSynthesis.cancel();
    const mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = idiomaActual === 'es' ? 'es-CO' : 'en-US'; 
    mensaje.rate = 0.90; 
    mensaje.pitch = 1.05; 
    return mensaje;
}

btnVozPrincipal.addEventListener('click', () => {
    const t = traducciones[idiomaActual];
    if (!lugarActual) return;
    const datosLugar = lugarActual[idiomaActual];

    if (estadoVozPrincipal) {
        window.speechSynthesis.cancel();
        estadoVozPrincipal = false;
        btnVozPrincipal.innerHTML = t.btnEscucharIntro;
        btnVozPrincipal.classList.remove('btn-stop-dinamico');
    } else {
        detenerTodaMusicaYVoz();
        const textoIntro = `${datosLugar.introCiudad} Estás viendo ${datosLugar.nombre}. ${datosLugar.descripcion}.`;
        const mensajeIntro = hablarTexto(textoIntro);

        window.speechSynthesis.speak(mensajeIntro);
        estadoVozPrincipal = true;
        btnVozPrincipal.innerHTML = t.btnDetenerIntro;
        btnVozPrincipal.classList.add('btn-stop-dinamico');

        mensajeIntro.onend = () => {
            estadoVozPrincipal = false;
            btnVozPrincipal.innerHTML = t.btnEscucharIntro;
            btnVozPrincipal.classList.remove('btn-stop-dinamico');
        };
    }
});

btnVozHistoria.addEventListener('click', () => {
    const t = traducciones[idiomaActual];
    if (!lugarActual) return;
    const datosLugar = lugarActual[idiomaActual];

    if (estadoVozHistoria) {
        window.speechSynthesis.cancel();
        estadoVozHistoria = false;
        btnVozHistoria.innerHTML = t.btnEscucharHistoria;
        btnVozHistoria.classList.remove('btn-stop-dinamico');
    } else {
        detenerTodaMusicaYVoz(); 
        const textoHistoria = `${datosLugar.historia} ${datosLugar.historiaExtensa}`;
        const mensaje = hablarTexto(textoHistoria);

        window.speechSynthesis.speak(mensaje);
        estadoVozHistoria = true;
        btnVozHistoria.innerHTML = t.btnDetenerHistoria;
        btnVozHistoria.classList.add('btn-stop-dinamico');

        mensaje.onend = () => {
            estadoVozHistoria = false;
            btnVozHistoria.innerHTML = t.btnEscucharHistoria;
            btnVozHistoria.classList.remove('btn-stop-dinamico');
        };
    }
});

function poblarDatosLugar(lugar) {
    const t = traducciones[idiomaActual];
    const datosLugar = lugar[idiomaActual];

    document.getElementById('nombre-sitio').innerText = datosLugar.nombre;
    document.getElementById('desc-sitio').innerText = datosLugar.descripcion;
    document.getElementById('controles-principal').style.display = 'block';
    
    document.getElementById('sec-historia').innerText = datosLugar.historia;
    document.getElementById('sec-historia-extensa').innerText = datosLugar.historiaExtensa;
    document.getElementById('controles-historia').style.display = 'block';
    
    contenedorHistoriaExtensa.style.display = 'none';
    btnToggleTextoHistoria.innerText = t.btnLeerMas;

    document.getElementById('sec-precaucion').innerText = datosLugar.precaucion;
    document.getElementById('info-clima').innerText = datosLugar.clima;
    document.getElementById('info-general').innerText = datosLugar.datosGenerales;

    iniciarRotacionCuriosidades(datosLugar.curiosidades);
    detenerTodaMusicaYVoz();

    const listaCanciones = document.getElementById('lista-canciones');
    listaCanciones.innerHTML = ''; 
    if (lugar.canciones) {
        lugar.canciones.forEach(cancion => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="ph ph-play-circle"></i> ${cancion.nombre}`;
            li.className = 'cancion-item';
            li.onclick = () => {
                reproductorContenedor.style.display = 'block';
                infoCancionSonando.innerText = `▶ ${cancion.nombre}`;
                reproductorAudio.src = cancion.audioUrl;
                reproductorAudio.play();
            };
            listaCanciones.appendChild(li);
        });
    }

    const textoIntro = `${datosLugar.introCiudad} Estás viendo ${datosLugar.nombre}. ${datosLugar.descripcion}.`;
    const mensajeIntro = hablarTexto(textoIntro);

    window.speechSynthesis.speak(mensajeIntro);
    estadoVozPrincipal = true;
    btnVozPrincipal.innerHTML = t.btnDetenerIntro;
    btnVozPrincipal.classList.add('btn-stop-dinamico');

    mensajeIntro.onend = () => {
        estadoVozPrincipal = false;
        btnVozPrincipal.innerHTML = t.btnEscucharIntro;
        btnVozPrincipal.classList.remove('btn-stop-dinamico');
    };
}

lugares.forEach((lugarObj) => {
    const marcador = L.marker(lugarObj.coordenadas, { icon: createCustomIcon(false) }).addTo(map);
    marcadores.push({ marcador, lugarObj });
    marcador.bindPopup(`<b>${lugarObj.es.nombre}</b><br>Haz clic para explorar.`);

    marcador.on('click', () => {
        lugarActual = lugarObj;
        marcadores.forEach(m => m.marcador.setIcon(createCustomIcon(false)));
        marcador.setIcon(createCustomIcon(true));
        
        map.flyTo(lugarObj.coordenadas, 16, { 
            duration: 2.2,       
            easeLinearity: 0.25  
        });

        if(panelLateral.classList.contains('colapsado')) {
            panelLateral.classList.remove('colapsado');
            btnToggleMenu.innerHTML = '<i class="ph ph-caret-right"></i>'; 
        }

        document.querySelectorAll('.acordeon').forEach(acc => acc.classList.add('activo'));
        poblarDatosLugar(lugarObj);
    });
});

const formLogin = document.getElementById('form-login');
const authMensaje = document.getElementById('auth-mensaje');
formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    formLogin.style.display = 'none';
    authMensaje.style.display = 'block';
    
    const msgExito = idiomaActual === 'es' ? `¡Bienvenido, <span>${email}</span>!<br><span style="font-size:0.9rem; color:#2E7D32;">Sesión iniciada con éxito.</span>` : `Welcome, <span>${email}</span>!<br><span style="font-size:0.9rem; color:#2E7D32;">Logged in successfully.</span>`;
    authMensaje.innerHTML = msgExito;
    
    authMensaje.onclick = () => {
        formLogin.reset();
        formLogin.style.display = 'flex';
        authMensaje.style.display = 'none';
    };
    authMensaje.title = idiomaActual === 'es' ? "Haz clic para cerrar sesión" : "Click to log out";
    authMensaje.style.cursor = "pointer";
});