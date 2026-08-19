// Agrega esto al inicio de tu script.js
window.addEventListener('pageshow', function(event) {
    const rolUsuario = sessionStorage.getItem('embera_sesion');
    if (event.persisted && !rolUsuario) {
        window.location.replace('login.html');
    }
});
const rolUsuario = sessionStorage.getItem('embera_sesion');
if (!rolUsuario) {
    document.body.style.display = 'none'; // Apaga las luces y oculta todo
    window.location.replace('login.html'); // Saca al intruso
} else {
    initApp(rolUsuario); // ¡Todo bien, que empiece el juego!
}

function initApp(rol) {
    // Aquí adentro metemos los poderes del administrador que ya tenías:
    if(rol === 'admin') {
        const panelAdmin = el('panel-admin');
        const badgeAdmin = el('badge-admin');
        if (panelAdmin) panelAdmin.style.display = 'flex';
        if (badgeAdmin) badgeAdmin.style.display = 'inline-block';
        
        // --- INICIALIZACIÓN DE ESTADÍSTICAS CON CHART.JS ---
        let chartInstance = null;

        function renderizarEstadisticas(datosNuevos) {
            const graf = el('adminChartCanvas') || el('graficoVisitas');
            if (!graf) return;
            const ctx = graf.getContext('2d');

            if (chartInstance) {
                chartInstance.destroy();
            }

            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Barranquilla', 'Santa Marta', 'Cartagena', 'Boyacá', 'Amazonas'],
                    datasets: [{
                        label: 'Consultas de Destinos',
                        data: datosNuevos,
                        backgroundColor: ['#2E7D32', '#0288D1', '#F57C00', '#7B1FA2', '#C2185B'],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // ==========================================
        // ¡CÓDIGO MOVIDO AQUÍ ADENTRO!
        // ==========================================
        const modalStats = el('modalEstadisticas');
        if (modalStats) {
            modalStats.addEventListener('shown.bs.modal', function () {
                renderizarEstadisticas([438, 312, 385, 142, 195]);
            });
        }
        
    } // <-- AQUÍ CIERRA EL IF DE ADMIN

    function eliminarDestino(idx) {
        const rol = sessionStorage.getItem('embera_sesion');
        if (rol !== 'admin') {
            alert("Acción no autorizada");
            return;
        }
        // Lógica de eliminación...
    }
} // <-- AQUÍ CIERRA LA FUNCIÓN initApp

        // Actualización dentro de la función initApp(rol) en script.js
        const modalStats = el('modalEstadisticas');
        if (modalStats) {
        modalStats.addEventListener('shown.bs.modal', function () {
        // Datos representativos para las 5 zonas geográficas integradas:
        // [Barranquilla, Santa Marta, Cartagena, Boyacá, Amazonas]
        renderizarEstadisticas([438, 312, 385, 142, 195]);
    });
}

// --- FUNCIONES ADMIN (CREAR / EDITAR DESTINOS) ---
function poblarSelectEditar() {
    const sel = el('select-editar-destino');
    if (!sel) return;
    sel.innerHTML = '';
    lugares.forEach((l, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = l.es.nombre || l.id;
        sel.appendChild(opt);
    });
}

const modalNuevo = el('modalNuevoDestino');
const formNuevo = el('form-nuevo-destino');
const modalEditar = el('modalEditarDestino');

if (rolUsuario === 'admin') {
    // Poblar select cuando se abra el modal de editar
    if (modalEditar) modalEditar.addEventListener('show.bs.modal', () => poblarSelectEditar());

    // Guardar nuevo destino
    if (formNuevo) {
        formNuevo.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = (el('new-dest-name') && el('new-dest-name').value.trim()) || '';
            const coordsRaw = (el('new-dest-coords') && el('new-dest-coords').value.trim()) || '';
            const desc = (el('new-dest-desc') && el('new-dest-desc').value.trim()) || '';
            if (!name || !coordsRaw) {
                alert('Por favor completa nombre y coordenadas.');
                return;
            }
            const parts = coordsRaw.split(',').map(s => s.trim());
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            if (isNaN(lat) || isNaN(lng)) {
                alert('Coordenadas inválidas. Formato: lat, lng');
                return;
            }

            const newId = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
            const nuevo = {
                id: newId,
                categoria: 'cultura',
                coordenadas: [lat, lng],
                imagenes: [],
                es: { nombre: name, ciudad: '', introCiudad: '', descripcion: desc || '', historia: desc || '', historiaExtensa: desc || '', precaucion: '', clima: '', datosGenerales: '', curiosidades: [] },
                en: { nombre: name, ciudad: '', introCiudad: '', descripcion: desc || '', historia: desc || '', historiaExtensa: desc || '', precaucion: '', clima: '', datosGenerales: '', curiosidades: [] },
                canciones: []
            };

            lugares.push(nuevo);
            saveLugares();
            // agregar marcador en el mapa
            try {
                const marcador = L.marker(nuevo.coordenadas, { icon: createCustomIcon(false) }).addTo(map);
                marcadores.push({ marcador, lugarObj: nuevo });
                marcador.bindPopup(`<b>${nuevo.es.nombre}</b><br>Haz clic para explorar.`);
                marcador.on('click', () => {
                    marcadores.forEach(m => m.marcador.setIcon(createCustomIcon(false)));
                    marcador.setIcon(createCustomIcon(true));
                    map.flyTo(nuevo.coordenadas, 16);
                    poblarDatosLugar(nuevo);
                });
            } catch (err) { console.warn('No se pudo agregar marcador:', err); }

            // cerrar modal bootstrap
            try { bootstrap.Modal.getOrCreateInstance(modalNuevo).hide(); } catch (err) {}
            poblarSelectEditar();
            actualizarListaFavoritosUI();
            alert('Destino creado correctamente (temporal).');
        });
    }

    // Actualizar destino
    const btnUpdate = el('btn-update-dest');
    if (btnUpdate) {
        btnUpdate.addEventListener('click', () => {
            const sel = el('select-editar-destino');
            const txt = el('edit-dest-historia');
            if (!sel || !txt) return;
            const idx = parseInt(sel.value, 10);
            if (isNaN(idx) || !lugares[idx]) { alert('Seleccione un destino válido.'); return; }
            lugares[idx].es.historia = txt.value;
            lugares[idx].en.historia = txt.value; // simple sync
            saveLugares();
            // actualizar popup del marcador si existe
            const lugarId = lugares[idx].id;
            const marcadorObj = marcadores.find(m => m.lugarObj.id === lugarId);
            if (marcadorObj) {
                try { marcadorObj.marcador.setPopupContent(`<b>${lugares[idx].es.nombre}</b><br>Haz clic para explorar.`); } catch (err) {}
            }
            // si está abierto en panel, refrescar
            if (lugarActual && lugarActual.id === lugarId) poblarDatosLugar(lugares[idx]);
            actualizarListaFavoritosUI();
            alert('Información actualizada.');
            try { bootstrap.Modal.getOrCreateInstance(modalEditar).hide(); } catch (err) {}
        });
    }
    // Eliminar destino (solo admin)
    const btnDelete = el('btn-delete-dest');
    if (btnDelete) {
        btnDelete.addEventListener('click', () => {
            const sel = el('select-editar-destino');
            if (!sel) return;
            const idx = parseInt(sel.value, 10);
            if (isNaN(idx) || !lugares[idx]) { alert('Seleccione un destino válido.'); return; }
            const confirmar = confirm('¿Eliminar este destino de forma permanente?');
            if (!confirmar) return;

            const lugarId = lugares[idx].id;

            // eliminar marcador del mapa
            const marcadorObj = marcadores.find(m => m.lugarObj.id === lugarId);
            if (marcadorObj) {
                try { marcadorObj.marcador.remove(); } catch (err) { console.warn(err); }
                marcadores = marcadores.filter(m => m.lugarObj.id !== lugarId);
            }

            // eliminar del arreglo y persistir
            lugares.splice(idx, 1);
            saveLugares();

            // quitar de favoritos si existe
            favoritosIds = (favoritosIds || []).filter(id => id !== lugarId);
            try { localStorage.setItem('embera_favoritos', JSON.stringify(favoritosIds)); } catch (err) {}

            poblarSelectEditar();
            actualizarListaFavoritosUI();
            try { renderizarFavoritos(); } catch (err) {}
            // Si el destino estaba mostrado actualmente, limpiar panel
            if (lugarActual && lugarActual.id === lugarId) {
                lugarActual = null;
                setText('nombre-sitio', traducciones[idiomaActual].placeholderSitioNombre);
                setText('desc-sitio', traducciones[idiomaActual].placeholderSitioDesc);
                const galCont = el('galeria-sitio-container'); if (galCont) galCont.style.display = 'none';
                const controlesPrincipal = el('controles-principal'); if (controlesPrincipal) controlesPrincipal.style.display = 'none';
                const listaCanciones = el('lista-canciones'); if (listaCanciones) listaCanciones.innerHTML = `<li style="color: #2E7D32; font-style: italic;" id="lbl-explora-musica">${traducciones[idiomaActual].lblExploraMusica}</li>`;
            }
            alert('Destino eliminado.');
            try { bootstrap.Modal.getOrCreateInstance(modalEditar).hide(); } catch (err) {}
        });
    }
}

// Ajuste para incluir el Amazonas
const limitesMapa = [
    [-6.5, -83.0], // Suroeste ampliado para incluir el Amazonas profundo
    [14.0, -65.0]  // Noreste
];

const map = L.map('mapa', { 
    zoomControl: false,
    minZoom: 6,             // Evita que el usuario se aleje demasiado
    maxZoom: 18,            // Evita que el usuario se acerque demasiado
    maxBounds: limitesMapa, // Restringe el área para que no salgan del mapa
    maxBoundsViscosity: 1.0 // Hace que el rebote en los bordes sea rígido
}).setView([8.0, -75.5812], 7);
L.control.zoom({ position: 'bottomleft' }).addTo(map);

// CAPAS DE MAPA
const capaCalles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

const capaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
});

// CAPA DE ETIQUETAS FIABLE (CartoDB Voyager Labels)
const capaEtiquetas = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
});

// Agrupamos el satélite con las etiquetas
const sateliteConNombres = L.layerGroup([capaSatelite, capaEtiquetas]);

// Inicializar el mapa con satélite y nombres
sateliteConNombres.addTo(map);

// Ocultar loader cuando el mapa base esté listo
map.whenReady(() => {
    setTimeout(() => {
        const loader = document.getElementById('map-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 800);
});

// Actualizamos el control de capas para ofrecer las opciones al usuario
const baseLayers = {
    "🌍 Satélite (Con Nombres)": sateliteConNombres,
    "🗺️ Mapa Estándar (Calles)": capaCalles
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
        headerFavoritos: '<i class="ph ph-heart"></i> Mis Favoritos',
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
        cotizadorTitulo: '<i class="ph ph-calculator"></i> Cotizador de Viajes',
        txtSede: '<i class="ph ph-map-pin"></i> Sede Principal: Medellín, Antioquia',
        idiomaLabel: '<i class="ph ph-globe"></i> Idioma:',
        sinFavoritos: "No tienes destinos guardados aún...",
        placeholderBuscador: "Buscar destino...",
        filtroTodos: "Todos",
        filtroCultura: "Cultura",
        filtroHistoria: "Historia",
        filtroNaturaleza: "Naturaleza",
        lblDestinoCotizador: '<i class="ph ph-map-pin"></i> Destino:',
        lblPaisCotizador: '<i class="ph ph-globe-hemisphere-west"></i> País desde donde nos visitas:',
        lblViajerosCotizador: '<i class="ph ph-users"></i> Número de viajeros:',
        lblFechaCotizador: '<i class="ph ph-calendar"></i> Fecha del viaje:',
        btnCotizarWp: '<i class="ph ph-whatsapp-logo"></i> Consultar por WhatsApp'
    },
    en: {
        subtitulo: "Travel & Tourism Agency",
        headerPunto: '<i class="ph ph-castle-turret"></i> Point of Interest',
        headerFavoritos: '<i class="ph ph-heart"></i> My Favorites',
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
        cotizadorTitulo: '<i class="ph ph-calculator"></i> Trip Quote Calculator',
        txtSede: '<i class="ph ph-map-pin"></i> Headquarters: Medellín, Antioquia',
        idiomaLabel: '<i class="ph ph-globe"></i> Language:',
        sinFavoritos: "No saved destinations yet...",
        placeholderBuscador: "Search destination...",
        filtroTodos: "All",
        filtroCultura: "Culture",
        filtroHistoria: "History",
        filtroNaturaleza: "Nature",
        lblDestinoCotizador: '<i class="ph ph-map-pin"></i> Destination:',
        lblPaisCotizador: '<i class="ph ph-globe-hemisphere-west"></i> Country you are visiting from:',
        lblViajerosCotizador: '<i class="ph ph-users"></i> Number of travelers:',
        lblFechaCotizador: '<i class="ph ph-calendar"></i> Travel date:',
        btnCotizarWp: '<i class="ph ph-whatsapp-logo"></i> Inquire via WhatsApp'
    }
};

let lugares = [
    {
        id: "cartagena",
        categoria: "historia",
        coordenadas: [10.4224, -75.5398],
        imagenes: [
            "Images/Cartagena/cf1.jpg",
            "Images/Cartagena/cf2.jpg",
            "Images/Cartagena/cf3.jpeg",
            "Images/Cartagena/cf4.jpg"
        ],
        es: {
            nombre: "Cartagena de Indias & Castillo de San Felipe",
            ciudad: "Cartagena",
            introCiudad: "¡Hola! Te damos la bienvenida a Cartagena de Indias, la 'Ciudad Heroica' y joya colonial del Caribe colombiano.",
            descripcion: "Imponente fortaleza militar rodeada por murallas centenarias, baluartes y un centro histórico colonial repleto de color, cultura y romanticismo frente al mar Caribe.",
            historia: "Fundada en 1533 por Pedro de Heredia, Cartagena fue el puerto español más estratégico de Sudamérica para el almacenamiento y embarque de tesoros reales.",
            historiaExtensa: "Para resguardar las riquezas acumuladas frente a constantes incursiones piratas e invasiones de potencias europeas, la Corona española erigió el colosal Castillo de San Felipe de Barajas sobre el cerro San Lázaro en 1657. Esta fortaleza resistió célebres incursiones, incluida la victoriosa defensa de 1741 liderada por el almirante Blas de Lezo contra la masiva flota británica de Edward Vernon. Declarada Patrimonio Cultural de la Humanidad por la UNESCO en 1984, la ciudad entrelaza el encanto colonial de sus plazas con el fervor libertario de Getsemaní, la belleza arquitectónica del Palacio de la Inquisición y la icónica Torre del Reloj.",
            precaucion: "El sol caribeño brilla con fuerza e intensidad. Usa protector solar ecológico, sombrero y mantén una excelente hidratación constante durante tus caminatas por las murallas.",
            clima: "Cálido y tropical caribeño, ~30°C - 32°C.",
            datosGenerales: "Patrimonio Cultural y Natural de la Humanidad (UNESCO). Capital del departamento de Bolívar.",
            curiosidades: [
                "Sus murallas fortificadas de más de 11 kilómetros tardaron más de dos siglos en ser concluidas.",
                "El Castillo San Felipe posee una intrincada red de túneles subterráneos construidos con acústica especial para detectar pasos enemigos.",
                "Getsemaní fue el barrio popular donde se gestó el primer grito de independencia absoluta de la ciudad en 1811."
            ]
        },
        en: {
            nombre: "Cartagena de Indias & San Felipe Castle",
            ciudad: "Cartagena",
            introCiudad: "Hello! Welcome to Cartagena de Indias, the 'Heroic City' and colonial treasure of the Colombian Caribbean.",
            descripcion: "An imposing military fortress surrounded by centuries-old walls, bastions, and a vibrant colonial historic center facing the Caribbean Sea.",
            historia: "Founded in 1533 by Pedro de Heredia, Cartagena was Spain's most strategic South American port for shipping royal treasures.",
            historiaExtensa: "To protect gold and silver shipments from relentless pirate raids and foreign fleets, the Spanish Crown built the massive San Felipe de Barajas Castle atop San Lázaro hill in 1657. The fortress famously held off Edward Vernon's British fleet in 1741 under Admiral Blas de Lezo's command. Designated a UNESCO World Heritage Site in 1984, Cartagena harmonizes historic plazas with the vibrant culture of Getsemaní and iconic landmarks like the Clock Tower.",
            precaucion: "The Caribbean sun is strong. Wear sun protection, a hat, and stay well hydrated while walking along the stone walls.",
            clima: "Warm and tropical, ~30°C - 32°C.",
            datosGenerales: "UNESCO World Heritage Site. Capital of the Bolívar department.",
            curiosidades: [
                "Its 11-kilometer fortified stone walls took over two centuries to complete.",
                "San Felipe Castle features an underground tunnel network engineered to amplify intruding footsteps.",
                "Getsemaní was the historic neighborhood that spearheaded the city's independence movement in 1811."
            ]
        },
        canciones: [
            { nombre: "🌊 El Mapalé", audioUrl: "audio/Cartagena/El Mapale Original.mp3" },
            { nombre: "🎵 Rebelión - Joe Arroyo", audioUrl: "audio/Cartagena/Rebelion.mp3" },
            { nombre: "🪝 El Pescador - Totó la Momposina", audioUrl: "audio/Cartagena/El pescador.mp3" }
        ]
    },
    {
        id: "barranquilla",
        categoria: "cultura",
        coordenadas: [11.0258, -74.7986],
        imagenes: [
            "Images/Barranquilla/gm1.webp",
            "Images/Barranquilla/gm2.jpg",
            "Images/Barranquilla/gm3.webp",
            "Images/Barranquilla/gm4.jpg"
        ],
        es: {
            nombre: "Gran Malecón del Río",
            ciudad: "Barranquilla",
            introCiudad: "¡Hola! Siente la brisa cálida y el ritmo festivo. Te damos la bienvenida a Barranquilla, la 'Puerta de Oro de Colombia', donde el río Magdalena abraza al mar Caribe.",
            descripcion: "Un vibrante y moderno paseo público de 5 km a orillas del majestuoso Río Magdalena, ideal para contemplar barcos, atardeceres y monumentos de iconos locales.",
            historia: "Barranquilla nació de forma espontánea a orillas del río Magdalena. Esta condición fluvial la convirtió en la cuna de grandes avances nacionales y en la casa del Carnaval más representativo del país.",
            historiaExtensa: "El Gran Malecón del Río se extiende desde el centro de eventos Puerta de Oro hasta la Isla de la Loma. Ofrece plazas gastronómicas, espacios recreativos y esculturas emblemáticas como la estatua en bronce de Shakira y la de Sofía Vergara. Es el escenario perfecto para sentir el pulso del mayor río del país, disfrutar atardeceres caribeños y vivir la experiencia nocturna de la 'Luna del Río' junto a la tradición del Carnaval, declarado Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO.",
            precaucion: "Lleva ropa fresca y ligera, calzado cómodo para caminar, gafas de sol y mantente bien hidratado.",
            clima: "Cálido tropical, ~32°C.",
            datosGenerales: "Capital del departamento del Atlántico y principal puerto fluvial del Caribe colombiano.",
            curiosidades: [
                "El Gran Malecón es actualmente el sitio público más visitado de Colombia.",
                "Cuenta con una imponente escultura en bronce de Shakira de 6.2 metros de altura.",
                "El Carnaval de Barranquilla es la segunda festividad más grande del planeta después de Río de Janeiro."
            ]
        },
        en: {
            nombre: "Gran Malecón del Río",
            ciudad: "Barranquilla",
            introCiudad: "Hello! Feel the warm breeze and rhythmic beat. Welcome to Barranquilla, Colombia's 'Golden Gate', where the Magdalena River embraces the Caribbean Sea.",
            descripcion: "A vibrant 5 km riverside promenade along the majestic Magdalena River, perfect for sunset walks, dining, and viewing iconic monuments.",
            historia: "Barranquilla developed spontaneously along the riverbanks, evolving into a pioneer city for national commerce and host of Colombia's greatest carnival.",
            historiaExtensa: "The Gran Malecón connects Puerta de Oro to Isla de la Loma. It features food plazas, cultural areas, and famous statues including Shakira's bronze monument. Visitors can enjoy riverboat views, Caribbean sunsets, and the 'Luna del Río' night atmosphere while experiencing the spirit of the UNESCO-recognized Barranquilla Carnival.",
            precaucion: "Wear light clothes, comfortable walking shoes, sunglasses, and drink plenty of water.",
            clima: "Warm tropical, ~32°C.",
            datosGenerales: "Capital of the Atlántico department.",
            curiosidades: [
                "The Gran Malecón is currently Colombia's most visited public attraction.",
                "It features a 6.2-meter bronze statue dedicated to global pop icon Shakira.",
                "Barranquilla's Carnival is the world's second largest celebration after Rio de Janeiro."
            ]
        },
        canciones: [
            { nombre: "🌅 En Barranquilla me quedo - Joe Arroyo", audioUrl: "audio/Barranquilla/Barranquilla.mp3" },
            { nombre: "🎵 Danza de la Región del Caribe", audioUrl: "audio/Barranquilla/Cumbia.mp3" },
            { nombre: "🏖️ La Pollera Colorá - Pedro Salcedo", audioUrl: "audio/Barranquilla/la pollera.mp3" }
        ]
    },
    {
        id: "bocas_ceniza",
        categoria: "naturaleza",
        coordenadas: [11.106172, -74.854778],
        imagenes: [
            "Images/Barranquilla/bc1.avif",
            "Images/Barranquilla/bc2.jpg",
            "Images/Barranquilla/bc3.avif",
            "Images/Barranquilla/bc4.jpg"
        ],
        es: {
            nombre: "Bocas de Ceniza",
            ciudad: "Barranquilla",
            introCiudad: "Escucha el majestuoso choque del agua. Has llegado al punto exacto donde el río Magdalena se funde con el mar Caribe.",
            descripcion: "Una sobrecogedora obra de ingeniería y naturaleza ubicada en el barrio Las Flores, donde las aguas fluviales se mezclan con el océano.",
            historia: "Este tajamar fue construido e inaugurado en la década de 1930 para permitir la entrada de buques de gran calado al puerto de Barranquilla.",
            historiaExtensa: "Para llegar al punto extremo de Bocas de Ceniza se recorren antiguas vías de tren en ruinas mediante pintorescos vagones artesanales adaptados en un paseo de unos 20 minutos. El sitio se integra actualmente a un ambicioso corredor turístico que articula el Gran Malecón, la Ciénaga de Mallorquín, la playa de Puerto Mocho y el tajamar histórico, consolidando un ecosistema de avistamiento y aventura fluvial único.",
            precaucion: "Las brisas marinas son muy intensas y la radiación solar directa es fuerte. Protege tus ojos y usa abundante bloqueador solar.",
            clima: "Cálido y ventoso, ~30°C.",
            datosGenerales: "Punto neurálgico de la ingeniería hidráulica colombiana del siglo XX.",
            curiosidades: [
                "Su nombre obedece al color cenizo que adquiere el mar por la mezcla de sedimentos del río.",
                "El recorrido tradicional se realiza en un singular vagón motorizado sobre antiguas rieles."
            ]
        },
        en: {
            nombre: "Bocas de Ceniza",
            ciudad: "Barranquilla",
            introCiudad: "Listen to the powerful roar of meeting waters. You have reached the exact spot where the Magdalena River meets the Caribbean Sea.",
            descripcion: "A striking engineering and natural site in Las Flores neighborhood, marking the merger of river and ocean currents.",
            historia: "This breakwater was constructed in the 1930s to open Barranquilla's maritime port to international shipping trade.",
            historiaExtensa: "Reaching the tip of Bocas de Ceniza involves a 20-minute ride on improvised rail cars running over historic train tracks. It forms part of an ambitious new eco-tourist corridor connecting the Gran Malecón, Mallorquín Lagoon, Puerto Mocho beach, and the historical jetty.",
            precaucion: "Strong ocean winds and direct sunlight prevail. Bring sunblock and protect your belongings.",
            clima: "Warm and windy, ~30°C.",
            datosGenerales: "A key landmark of Colombian hydraulic engineering.",
            curiosidades: [
                "Named after the ash-colored tone the sea takes on when river sediments mix into the ocean.",
                "Visitors travel aboard unique motorized carts built over old railway tracks."
            ]
        },
        canciones: [
            { nombre: "🎺 Tal Para Cual - Joe Arroyo", audioUrl: "audio/Barranquilla/Tal para Cual.mp3" },
            { nombre: "🎉 Himno Carnaval de Barranquilla", audioUrl: "audio/Barranquilla/carnaval.mp3" },
            { nombre: "🌬️ La Subienda - Gabriel Romero", audioUrl: "audio/Barranquilla/La Subienda.mp3" }
        ]
    },
    {
        id: "boyaca_leyva",
        categoria: "historia",
        coordenadas: [5.633876, -73.523530],
        imagenes: [
            "Images/Boyaca/vdl1.jpg",
            "Images/Boyaca/vdl2.jpg",
            "Images/Boyaca/vdl3.jpeg",
            "Images/Boyaca/vdl4.jpg"
        ],
        es: {
            nombre: "Villa de Leyva",
            ciudad: "Boyacá",
            introCiudad: "Respira hondo e inhala el aire fresco de los Andes. Te damos la bienvenida a Villa de Leyva, tierra colonial de historia, páramos y devoción.",
            descripcion: "Pueblo colonial perfectamente conservado con fachadas blancas, calles empedradas y la Plaza Mayor más grande de Colombia.",
            historia: "Fundada en 1572 por orden de la Real Audiencia de Santafé como villa de retiro y aprovisionamiento agrícola en el altiplano cundiboyacense.",
            historiaExtensa: "En Boyacá se libraron batallas decisivas para la independencia de Colombia, y de sus veredas nació la música carranga. A pocos minutos del casco urbano de Villa de Leyva, paisajes semidesérticos y yacimientos paleontológicos milenarios contrastan con el verde de los páramos andinos. Su Plaza Mayor abarca 14.000 m² totalmente empedrados, siendo epicentro de festivales astronómicos y de cometas.",
            precaucion: "Debido a las piedras irregulares de sus calles, usa calzado cómodo y plano. Abrígate bien para el descenso de temperatura en las noches.",
            clima: "Frío de altiplano y templado de montaña, ~14°C - 18°C.",
            datosGenerales: "Red de Pueblos Patrimonio de Colombia.",
            curiosidades: [
                "Su Plaza Mayor es considerada la plaza completamente empedrada más grande de Colombia.",
                "En sus alrededores se conserva el fósil completo de un Kronosaurus de más de 110 millones de años."
            ]
        },
        en: {
            nombre: "Villa de Leyva",
            ciudad: "Boyacá",
            introCiudad: "Take a deep breath of fresh Andean air. Welcome to Villa de Leyva, a historic colonial sanctuary surrounded by highlands.",
            descripcion: "A preserved colonial town featuring white facades, cobblestone streets, and Colombia's largest main square.",
            historia: "Founded in 1572 as a countryside retreat for Spanish officials and a regional agricultural hub.",
            historiaExtensa: "Boyacá was the stage for pivotal independence battles and the birthplace of traditional 'carranga' folk music. Villa de Leyva blends historic architecture with desert landscapes and pre-historic fossil sites, all anchored by its massive 14,000 m² cobblestone plaza.",
            precaucion: "Wear flat walking shoes for uneven cobblestone streets and bring warm clothing for chilly evenings.",
            clima: "Highland cold, ~14°C - 18°C.",
            datosGenerales: "Member of Colombia's Heritage Town Network.",
            curiosidades: [
                "Its Main Square is the largest fully cobblestoned plaza in Colombia.",
                "Home to 'El Fósil', an almost intact 110-million-year-old Kronosaurus marine fossil."
            ]
        },
        canciones: [
            { nombre: "🏔️ El Carranguero - Los Carrangueros", audioUrl: "audio/Boyaca/El Carranguero.mp3" },
            { nombre: "🌄 El Cucharón - Clemencia Ruiz", audioUrl: "audio/Boyaca/El Cucharón.mp3" },
            { nombre: "🐴 Canto a Boyacá - Los Filipichines", audioUrl: "audio/Boyaca/Canto A Boyaca.mp3" }
        ]
    },
    {
        id: "raquira",
        categoria: "cultura",
        coordenadas: [5.538078, -73.633137],
        imagenes: [
            "Images/Boyaca/rq1.jpg",
            "Images/Boyaca/rq2.jpg",
            "Images/Boyaca/rq3.jpg",
            "Images/Boyaca/rq4.jpg"
        ],
        es: {
            nombre: "Ráquira, la Capital Artesanal",
            ciudad: "Boyacá",
            introCiudad: "¡Prepárate para un estallido de color y creatividad! Te damos la bienvenida a Ráquira, la Capital Artesanal de Colombia.",
            descripcion: "Pueblo pintoresco conocido como el 'pueblo de las ollas' debido a su tradición alfarera ancestral, fachadas llenas de color y talleres de cerámica.",
            historia: "Desde la época prehispánica, los indígenas Muiscas utilizaban las arcillas de la zona para moldear vasijas y objetos ceremoniales.",
            historiaExtensa: "En lengua Chibcha, Ráquira significa 'Ciudad de las Ollas'. Sus artesanos han mantenido viva la alfarería durante siglos, transmitiendo el arte del barro moldeado a mano de generación en generación. Caminar por sus calles decoradas con esculturas de arcilla, talleres artesanales y coloridas casonas mientras resuenan las guitarras y tiples de la música carranguera es una experiencia fotogénica e inolvidable.",
            precaucion: "Si adquieres artesanías o vajillas de barro, solicita al artesano empaque reforzado de protección para tu viaje.",
            clima: "Templado a frío de montaña, ~15°C.",
            datosGenerales: "Capital de la Alfarería y Artesanía Colombiana.",
            curiosidades: [
                "Cerca del 80% de la población local trabaja directamente en la elaboración y venta de cerámica.",
                "Las plazas del pueblo exhiben monumentales estatuas hechas enteramente en barro cocido."
            ]
        },
        en: {
            nombre: "Ráquira, Artisan Capital",
            ciudad: "Boyacá",
            introCiudad: "Get ready for a burst of color and craftmanship! Welcome to Ráquira, Colombia's Artisan Capital.",
            descripcion: "A colorful village famous for centuries-old pottery traditions, vivid facades, and hand-crafted ceramic workshops.",
            historia: "Since pre-Columbian times, indigenous Muisca artisans used local clay to craft pottery and ceremonial vessels.",
            historiaExtensa: "In the Chibcha language, Ráquira translates to 'City of Pots'. Generations of local artisans have preserved pottery techniques, shaping clay by hand. Exploring its bright streets decorated with clay sculptures and vibrant shops accompanied by traditional folk music makes for an enriching visit.",
            precaucion: "Ask sellers for cushioned protective packaging when purchasing fragile ceramic items.",
            clima: "Mountain cool, ~15°C.",
            datosGenerales: "Colombia's Handicraft and Pottery Capital.",
            curiosidades: [
                "Approximately 80% of the town's economy revolves around pottery and ceramic art.",
                "Public squares display large sculptures crafted entirely out of clay."
            ]
        },
        canciones: [
            { nombre: "🦜 Julia Julia - Jorge Velosa", audioUrl: "audio/Boyaca/Julia Julia.mp3" },
            { nombre: "⛲ La Pirinola - Jorge Velosa", audioUrl: "audio/Boyaca/La Pirinola.mp3" },
            { nombre: "🥄 La Cucharita - Jorge Velosa", audioUrl: "audio/Boyaca/La Cucharita.mp3" }
        ]
    },
    {
        id: "santamarta_tayrona",
        categoria: "naturaleza",
        coordenadas: [11.283, -74.183],
        imagenes: [
            "Images/Santa Marta/ty1.jpg",
            "Images/Santa Marta/ty2.jpg",
            "Images/Santa Marta/ty3.jpg",
            "Images/Santa Marta/ty4.jpg"
        ],
        es: {
            nombre: "Parque Nacional Natural Tayrona",
            ciudad: "Santa Marta",
            introCiudad: "Siente la magia de la selva tocando las olas del Caribe. Te damos la bienvenida al sagrado Parque Nacional Natural Tayrona.",
            descripcion: "Reserva natural de casi 20.000 hectáreas donde la selva tropical húmeda se derrama sobre playas de arena blanca, acantilados y arrecifes de coral.",
            historia: "Santa Marta, fundada en 1525, es la ciudad superviviente más antigua de Suramérica. La sierra es territorio ancestral de los pueblos Kogui, Wiwa, Arhuaco y Kankuamo.",
            historiaExtensa: "Abrazado por la Sierra Nevada de Santa Marta (la montaña costera más alta del planeta), el Parque Tayrona resguarda paisajes vírgenes como Cabo San Juan. Para los pueblos indígenas de la Sierra, el parque es un entramado sagrado de sitios espirituales. Por esta razón, el parque cierra sus puertas al público varias semanas al año para permitir la purificación ambiental y la renovación ritual de la tierra.",
            precaucion: "Respeta las banderas de advertencia en las playas. En sectores como Arrecifes no está permitido nadar por las intensas corrientes submarinas.",
            clima: "Cálido tropical y muy húmedo, ~31°C.",
            datosGenerales: "Uno de los parques naturales con mayor biodiversidad de Sudamérica.",
            curiosidades: [
                "El parque cierra tres veces al año (febrero, junio y octubre) para su recuperación ambiental y rituales indígenas.",
                "Cabo San Juan de Guía es una de las playas más famosas y fotografiadas del Caribe."
            ]
        },
        en: {
            nombre: "Tayrona National Natural Park",
            ciudad: "Santa Marta",
            introCiudad: "Feel the magic of the jungle meeting the ocean waves. Welcome to the sacred Tayrona National Park.",
            descripcion: "A nearly 20,000-hectare tropical reserve where rainforests flow into white sand beaches and coral reefs.",
            historia: "Santa Marta, founded in 1525, is South America's oldest surviving city. It serves as ancestral land for indigenous Kogui, Wiwa, Arhuaco, and Kankuamo communities.",
            historiaExtensa: "Nestled beneath the Sierra Nevada de Santa Marta, Tayrona holds iconic beaches like Cabo San Juan. Indigenous guardians view the park as a sacred spiritual network; thus, it closes to tourists during select weeks each year for ecological and ritual renewal.",
            precaucion: "Observe beach warning flags carefully. Swimming is strictly prohibited in high-current zones like Arrecifes.",
            clima: "Warm, tropical, and humid, ~31°C.",
            datosGenerales: "One of South America's most biodiverse natural reserves.",
            curiosidades: [
                "Closes temporarily three times a year for ecological recovery and indigenous spiritual ceremonies.",
                "Cabo San Juan is renowned globally for its hammock hut perched over the sea."
            ]
        },
        canciones: [
            { nombre: "🌄 La Tierra del Olvido - Carlos Vives", audioUrl: "audio/Santa Marta/La Tierra del Olvido.mp3" },
            { nombre: "🦜 Esta Vida - Raúl Ornelas", audioUrl: "audio/Santa Marta/Esta vida.mp3" },
            { nombre: "💧 La Gota Fría - Carlos Vives", audioUrl: "audio/Santa Marta/La Gota Fria.mp3" }
        ]
    },
    {
        id: "taganga",
        categoria: "aventura",
        coordenadas: [11.2674, -74.1908],
        imagenes: [
            "Images/Santa Marta/tg1.jpg",
            "Images/Santa Marta/tg2.jpg",
            "Images/Santa Marta/tg3.webp",
            "Images/Santa Marta/tg4.jpg"
        ],
        es: {
            nombre: "Bahía de Taganga",
            ciudad: "Santa Marta",
            introCiudad: "Desconéctate y contempla el mar. Te damos la bienvenida a la Bahía de Taganga.",
            descripcion: "Pintoresca bahía de pescadores convertida en meca del buceo submarino, descanso costero y deportes náuticos.",
            historia: "Antiguo asentamiento indígena de pesca artesanal que se transformó en un punto de encuentro internacional para mochileros y buceadores.",
            historiaExtensa: "Ubicada a solo 15 minutos del centro urbano de Santa Marta, la bahía de Taganga está rodeada por imponentes cerros secos. Es famosa por sus tranquilas aguas transparentes, ideales para obtener certificaciones internacionales de buceo a costos accesibles. Desde sus muelles parten diariamente lanchas rápidas que trasladan a los viajeros hacia las bahías del Parque Tayrona.",
            precaucion: "Exige y utiliza siempre tu chaleco salvavidas al abordar lanchas de transporte turístico.",
            clima: "Tropical seco y cálido, ~31°C.",
            datosGenerales: "Epicentro de buceo submarino y deportes acuáticos en el Magdalena.",
            curiosidades: [
                "Es catalogada como uno de los destinos más económicos del mundo para obtener la certificación de buceo PADI.",
                "Sus atardeceres muestran al sol ocultándose directamente sobre la línea del mar entre los cerros."
            ]
        },
        en: {
            nombre: "Taganga Bay",
            ciudad: "Santa Marta",
            introCiudad: "Relax and enjoy the coastal sea breeze. Welcome to Taganga Bay.",
            descripcion: "A picturesque fishing village transformed into a famous hub for scuba diving and coastal relaxation.",
            historia: "Formerly an isolated indigenous fishing cove, now a global meeting point for divers and travelers.",
            historiaExtensa: "Located 15 minutes from downtown Santa Marta, Taganga is surrounded by arid hills. It offers calm waters perfect for scuba diving courses and serves as a launching point for day-trip boats heading to Tayrona's beaches.",
            precaucion: "Always wear a life jacket when riding transport boats.",
            clima: "Warm and dry tropical, ~31°C.",
            datosGenerales: "Major scuba diving center on Colombia's Caribbean coast.",
            curiosidades: [
                "Ranked among the world's most affordable destinations to get PADI scuba certified.",
                "Offers breathtaking sunsets with the sun dipping directly into the ocean horizon."
            ]
        },
        canciones: [
            { nombre: "🪗 La Creciente - El Binomio de Oro", audioUrl: "audio/Santa Marta/La Creciente.mp3" },
            { nombre: "🎶 Te Quiero Más - Joe Arroyo", audioUrl: "audio/Santa Marta/te quiero.mp3" },
            { nombre: "🏞️ Muere una Flor - Binomio de Oro", audioUrl: "audio/Santa Marta/Muere.mp3" }
        ]
    },
    {
        id: "amazonas_leticia",
        categoria: "naturaleza",
        coordenadas: [-4.203625, -69.935265],
        imagenes: [
            "Images/Amazonas/lt1.jpg",
            "Images/Amazonas/lt2.webp",
            "Images/Amazonas/lt3.jpg",
            "Images/Amazonas/lt4.webp"
        ],
        es: {
            nombre: "Leticia & Las Tres Fronteras",
            ciudad: "Leticia",
            introCiudad: "Siente el palpitar del pulmón del mundo. Te damos la bienvenida a Leticia, puerta de entrada a la selva amazónica colombiana.",
            descripcion: "Capital del departamento del Amazonas a orillas del río más caudaloso del mundo, famosa por su dinámica de frontera trina con Brasil y Perú.",
            historia: "El departamento del Amazonas es el más extenso de Colombia (109.665 km², equivalentes al 9.6% del país). Leticia fue fundada el 25 de abril de 1867 por el militar peruano Benigno Bustamante con el nombre de San Antonio, y rebautizada en diciembre de ese año por Manuel Charón como 'Leticia' en honor a su prometida Leticia Smith.",
            historiaExtensa: "Habitada milenariamente por etnias de las familias Arawak, Tukano, Bora, Witoto, Caribe, Tikunas y Yaguas en torno a la maloca como centro espiritual y social. Leticia destaca por su ambiente multicultural fronterizo con Tabatinga (Brasil) y Santa Rosa de Yavarí (Perú). Es servida por el Aeropuerto Internacional Alfredo Vásquez Cobo, punto de partida para adentrarse en la selva profunda.",
            precaucion: "Lleva repelente de mosquitos, ropa fresca de manga larga y respeta las normas comunitarias de los Resguardos Indígenas.",
            clima: "Selva húmeda tropical, ~28°C.",
            datosGenerales: "Abarca el 9,6% del territorio nacional y limita con Brasil y Perú.",
            curiosidades: [
                "Puedes cruzar a pie la frontera con Brasil (Tabatinga) sin ningún trámite aduanero especial.",
                "Al atardecer, miles de periquitos llegan al Parque Santander en un fascinante espectáculo sonoro."
            ]
        },
        en: {
            nombre: "Leticia & The Tri-Border",
            ciudad: "Leticia",
            introCiudad: "Feel the pulse of the Amazon rainforest. Welcome to Leticia, gateway to Colombia's Amazon region.",
            descripcion: "Capital of the Amazonas department on the banks of the Amazon River, famous for its tri-border connection with Brazil and Peru.",
            historia: "The Amazonas department covers 109,665 km² (9.6% of Colombia). Leticia was founded on April 25, 1867, as San Antonio, and renamed Leticia in December 1867 after Leticia Smith.",
            historiaExtensa: "Home to ancestral indigenous groups including the Tikunas, Huitotos, and Yaguas centered around the sacred maloca. Leticia offers a unique tri-cultural dynamic alongside Tabatinga (Brazil) and Santa Rosa (Peru), connected by Alfredo Vásquez Cobo International Airport.",
            precaucion: "Bring mosquito repellent, wear long sleeves, and respect indigenous reservation guidelines.",
            clima: "Humid tropical rainforest, ~28°C.",
            datosGenerales: "Capitals of Colombia's largest department covering 9.6% of the country.",
            curiosidades: [
                "You can walk across the border into Tabatinga, Brazil without passport control.",
                "Thousands of green parrots gather at Santander Park every sunset."
            ]
        },
        canciones: [
            { nombre: "🍃 Lamento en la Selva - Los Mirlos", audioUrl: "audio/Amazonas/selva.mp3" },
            { nombre: "🛶 La Danza del Petroleo - Los Mirlos", audioUrl: "audio/Amazonas/la danza.mp3" },
            { nombre: "🦜 El Aguajal - Los Shapis", audioUrl: "audio/Amazonas/El aguajal.mp3" }
        ]
    },
    {
        id: "amazonas_tanimboca",
        categoria: "naturaleza",
        coordenadas: [-4.119542, -69.951018],
        imagenes: [
            "Images/Amazonas/nt1.jpg",
            "Images/Amazonas/nt2.jpg",
            "Images/Amazonas/nt3.jpg",
            "Images/Amazonas/nt4.jpg"
        ],
        es: {
            nombre: "Reserva Natural Tanimboca",
            ciudad: "Amazonas",
            introCiudad: "Adéntrate en el dosel de la selva tropical y vive la experiencia de dormir en la copa de los árboles. Bienvenido a la Reserva Natural Tanimboca.",
            descripcion: "Área protegida enfocada en el ecoturismo, la conservación de la biodiversidad y la educación ambiental en el corazón de la selva húmeda tropical.",
            historia: "Funciona como refugio de fauna silvestre y espacio de rescate y protección para la flora local, promoviendo el turismo sostenible con guías nativos.",
            historiaExtensa: "Ubicada a 11 km de Leticia en la vía a Tarapacá, Tanimboca ofrece cabañas rústicas elevadas a más de 10 metros del suelo en el dosel del bosque, brindando una inmersión directa en la naturaleza. Los visitantes pueden realizar recorridos nocturnos para observar fauna, actividades de canopy (tirolesa entre árboles gigantes), rappel y caminatas guiadas por baquianos indígenas para aprender sobre plantas medicinales y la fauna del Amazonas.",
            precaucion: "Lleva linterna para caminatas nocturnas, calzado cerrado para selva y sigue en todo momento las instrucciones de los guías nativos.",
            clima: "Selva húmeda tropical, ~28°C.",
            datosGenerales: "Reserva natural de ecoturismo y conservación biológica en la selva amazónica.",
            curiosidades: [
                "Sus cabañas de madera se encuentran suspendidas a más de 10 metros de altura en la copa de los árboles.",
                "Ofrece un emocionante circuito de tirolesas y puentes colgantes a través del dosel de la selva."
            ]
        },
        en: {
            nombre: "Tanimboca Natural Reserve",
            ciudad: "Amazonas",
            introCiudad: "Step into the rainforest canopy and sleep high above the jungle floor. Welcome to Tanimboca Natural Reserve.",
            descripcion: "A protected area dedicated to ecotourism, biodiversity conservation, and environmental education in the heart of the tropical rainforest.",
            historia: "Serves as a wildlife refuge and sanctuary for native flora, supporting sustainable tourism in partnership with indigenous guides.",
            historiaExtensa: "Located 11 km from Leticia, Tanimboca features rustic treehouse cabins elevated over 10 meters above the ground in the forest canopy. Guests can experience night jungle walks, zip-lining between giant trees, tree-climbing, and guided hikes with native experts on medicinal plants and rainforest wildlife.",
            precaucion: "Bring a flashlight for night walks, sturdy closed shoes, and always follow your native guide's instructions.",
            clima: "Humid tropical rainforest, ~28°C.",
            datosGenerales: "Ecotourism and conservation reserve in the Amazon rainforest.",
            curiosidades: [
                "Its treehouse cabins are built high in the canopy over 10 meters off the ground.",
                "Offers an exciting zip-line and canopy bridge course among giant jungle trees."
            ]
        },
        canciones: [
            { nombre: "🍃 Sonido Amazónico", audioUrl: "audio/Amazonas/amazonica.mp3" },
            { nombre: "🛶 Sueño de la Selva - Los Indios Tabajaras", audioUrl: "audio/Amazonas/sueño.mp3" },
            { nombre: "🦜 Te Invito - Herencia de Timbiquí", audioUrl: "audio/Amazonas/Te invito.mp3" } 
        ]
    }
];

// Persistencia de destinos en localStorage
function saveLugares() {
    try { localStorage.setItem('embera_lugares', JSON.stringify(lugares)); } catch (err) { console.warn('No se pudo guardar lugares:', err); }
}

try {
    const almacen = localStorage.getItem('embera_lugares');
    if (almacen) {
        const parsed = JSON.parse(almacen);
        if (Array.isArray(parsed) && parsed.length) lugares = parsed;
    } else {
        saveLugares();
    }
} catch (err) { console.warn('Error leyendo embera_lugares:', err); }

let marcadores = []; 
let lugarActual = null;
let idiomaActual = "es";
let estadoVozPrincipal = false; 
let estadoVozHistoria = false;
let intervaloCuriosidades = null;
let favoritosIds = JSON.parse(localStorage.getItem('embera_favoritos')) || [];
let indiceImagenActual = 0;
let intervaloGaleria = null;

const panelLateral = document.getElementById('panel-lateral');
const btnToggleMenu = document.getElementById('btn-toggle-menu');
const barraToggleDesktop = document.getElementById('barra-toggle-desktop');
const iconoToggle = document.getElementById('icono-toggle');
const selectIdioma = document.getElementById('select-idioma');

function el(id) { return document.getElementById(id); }
function setHTML(id, value) { const e = el(id); if (e) e.innerHTML = value; }
function setText(id, value) { const e = el(id); if (e) e.innerText = value; }
function safeOn(idOrEl, evt, handler) {
    const e = (typeof idOrEl === 'string') ? el(idOrEl) : idOrEl;
    if (e) e.addEventListener(evt, handler);
}

function actualizarEstadoMenu() {
    const estaColapsado = panelLateral.classList.contains('colapsado');
    const icono = estaColapsado ? '<i class="ph ph-caret-left"></i>' : '<i class="ph ph-caret-right"></i>';
    const texto = '<span>Desliza</span>';
    if (btnToggleMenu) {
        btnToggleMenu.innerHTML = texto + icono;
    }
}

let toqueInicialX = 0;
panelLateral.addEventListener('touchstart', (e) => {
    toqueInicialX = e.touches[0].clientX;
}, { passive: true });

panelLateral.addEventListener('touchend', (e) => {
    let toqueFinalX = e.changedTouches[0].clientX;
    let diferenciaX = toqueFinalX - toqueInicialX;
    const distanciaMinima = window.innerWidth * 0.15;

    if (Math.abs(diferenciaX) > distanciaMinima) {
        if (diferenciaX > 0) {
            if (!panelLateral.classList.contains('colapsado')) {
                togglePanel();
            }
        } else {
            if (panelLateral.classList.contains('colapsado')) {
                togglePanel();
            }
        }
    }
}, { passive: true });

function togglePanel() {
    panelLateral.classList.toggle('colapsado');
    if (panelLateral.classList.contains('colapsado')) {
        if (iconoToggle) iconoToggle.classList.replace('ph-caret-right', 'ph-caret-left');
    } else {
        if (iconoToggle) iconoToggle.classList.replace('ph-caret-left', 'ph-caret-right');
    }
}

if (barraToggleDesktop) {
    barraToggleDesktop.addEventListener('click', togglePanel);
}

if (btnToggleMenu) {
    btnToggleMenu.addEventListener('click', () => {
        togglePanel();
    });
}

const reproductorAudio = document.getElementById('reproductor-audio');
const reproductorContenedor = document.getElementById('reproductor-integrado');
const infoCancionSonando = document.getElementById('info-cancion-sonando');

const btnVozPrincipal = document.getElementById('btn-voz-principal');
const btnVozHistoria = document.getElementById('btn-voz-historia');
const btnToggleTextoHistoria = document.getElementById('btn-toggle-texto-historia');
const contenedorHistoriaExtensa = document.getElementById('contenedor-historia-extensa');
const btnFavoritoSitio = document.getElementById('btn-favorito-sitio');

const btnTema = el('btn-tema');
safeOn(btnTema, 'click', () => {
    document.body.classList.toggle('dark-theme');
    const b = el('btn-tema');
    if (document.body.classList.contains('dark-theme')) {
        if (b) b.innerHTML = '<i class="ph ph-sun"></i>';
    } else {
        if (b) b.innerHTML = '<i class="ph ph-moon"></i>';
    }
});

const btnCerrarSesion = el('btn-cerrar-sesion');
const modalLogout = el('modal-logout');
const btnConfirmarLogout = el('btn-confirmar-logout');
const btnCancelarLogout = el('btn-cancelar-logout');

safeOn(btnCerrarSesion, 'click', () => {
    if (modalLogout) modalLogout.classList.remove('oculto');
});

safeOn(btnCancelarLogout, 'click', () => {
    if (modalLogout) modalLogout.classList.add('oculto');
});

safeOn(btnConfirmarLogout, 'click', () => {
    sessionStorage.removeItem('embera_sesion');
    window.location.replace('login.html');
});

const btnUbicacion = el('btn-ubicacion');
safeOn(btnUbicacion, 'click', () => {
    map.locate({setView: true, maxZoom: 14});
});
map.on('locationfound', function(e) {
    L.marker(e.latlng).addTo(map)
        .bindPopup(idiomaActual === 'es' ? "📍 Estás aquí" : "📍 You are here").openPopup();
});
map.on('locationerror', function(e) {
    alert(idiomaActual === 'es' ? "No se pudo acceder a tu ubicación." : "Could not access your location.");
});

// --- COTIZADOR DE VIAJES COMPLETO (VALIDADO Y WHATSAPP) ---
const formCotizador = document.getElementById('form-cotizador');
const destSelect = document.getElementById('cotizador-destino');
const paxInput = document.getElementById('cotizador-personas');
const boxEstimado = document.getElementById('caja-estimado');
const txtEstimado = document.getElementById('precio-estimado');
const fechaInput = document.getElementById('cotizador-fecha');
const paisSelect = document.getElementById('cotizador-pais');

function obtenerFactorTemporada(fechaStr) {
    if (!fechaStr) return 1.0;
    const partesFecha = fechaStr.split('-');
    const mes = parseInt(partesFecha[1], 10); 

    switch(mes) {
        case 12: return 1.85;
        case 6:  return 1.45;
        case 1:  return 1.35;
        case 8:  return 1.25;
        case 11: return 1.20;
        case 10: return 1.15;
        default: return 1.00;
    }
}

function obtenerFactorPaisOrigen(pais) {
    switch(pais) {
        case 'us': return { tasa: 4100, moneda: 'USD', simbolo: 'US$' };
        case 'es': return { tasa: 4400, moneda: 'EUR', simbolo: '€' };
        case 'sa': return { tasa: 4100, moneda: 'USD', simbolo: 'US$' };
        case 'as': return { tasa: 110, moneda: 'JPY', simbolo: '¥' };
        default: return { tasa: 1, moneda: 'COP', simbolo: '$' };
    }
}

function obtenerFactorLogisticoSitio(valorDestino) {
    const destinosPremium = ['SantaMartaTayrona', 'CartagenaSanFelipe']; 
    const destinosAventura = ['SantaMartaTaganga', 'BoyacaRaquira']; 
    
    if (destinosPremium.includes(valorDestino)) {
        return 1.25; 
    } else if (destinosAventura.includes(valorDestino)) {
        return 1.10; 
    }
    return 1.00; 
}

function calcularEstimadoAvanzado() {
    if (!destSelect || !paxInput || !paisSelect || !fechaInput) return;

    const destinoVal = destSelect.value;
    const paisVal = paisSelect.value;
    const personasVal = paxInput.value;
    const fechaVal = fechaInput.value;

    // VALIDACIÓN: Si falta algún campo por completar, se oculta la caja
    if (!destinoVal || !paisVal || !personasVal || !fechaVal || parseInt(personasVal, 10) <= 0) {
        if (boxEstimado) boxEstimado.style.display = 'none';
        return;
    }

    const destinoOpt = destSelect.options[destSelect.selectedIndex];
    const precioBase = parseFloat(destinoOpt.getAttribute('data-precio') || 0);
    const personas = parseInt(personasVal, 10);

    if (precioBase > 0 && personas > 0) {
        const factorTemporada = obtenerFactorTemporada(fechaVal);
        const factorSitio = obtenerFactorLogisticoSitio(destinoVal);
        const infoPais = obtenerFactorPaisOrigen(paisVal);

        let totalCOP = precioBase * personas * factorTemporada * factorSitio;
        let totalFinal = totalCOP;
        if (infoPais.tasa > 1) {
            totalFinal = totalCOP / infoPais.tasa;
        }

        if (txtEstimado) {
            txtEstimado.innerText = infoPais.simbolo + ' ' + totalFinal.toLocaleString('es-CO', { maximumFractionDigits: 2 }) + ' ' + infoPais.moneda;
        }
        if (boxEstimado) boxEstimado.style.display = 'block';
    } else {
        if (boxEstimado) boxEstimado.style.display = 'none';
    }
}

// Escuchadores de eventos para actualizar en tiempo real
if (destSelect) destSelect.addEventListener('change', calcularEstimadoAvanzado);
if (paisSelect) paisSelect.addEventListener('change', calcularEstimadoAvanzado);
if (paxInput) {
    paxInput.addEventListener('input', calcularEstimadoAvanzado);
    paxInput.addEventListener('change', calcularEstimadoAvanzado);
}
if (fechaInput) {
    fechaInput.addEventListener('change', calcularEstimadoAvanzado);
    fechaInput.addEventListener('input', calcularEstimadoAvanzado);
}

// Manejador del envío del formulario (WhatsApp)
if (formCotizador) {
    formCotizador.addEventListener('submit', (e) => {
        e.preventDefault();
        calcularEstimadoAvanzado();

        const destino = destSelect.options[destSelect.selectedIndex].text;
        const personas = paxInput.value;
        const fecha = fechaInput.value || 'No especificada';
        const total = txtEstimado ? txtEstimado.innerText : 'Pendiente de confirmación';
        const pais = paisSelect.options[paisSelect.selectedIndex].text;

        const mensajeTexto = 
            `¡Hola, Embera Travel Agency!\n` +
            `Estoy listo/a para vivir una experiencia inolvidable y me encantaría recibir una cotización a la medida. A continuación, comparto los detalles de mi próxima aventura:\n\n` +
            `* País de origen: ${pais}\n` +
            `* Destino: ${destino}\n` +
            `* Número de viajeros: ${personas}\n` +
            `* Fecha estimada: ${fecha}\n` +
            `* Valor Estimado: ${total}\n\n` +
            `_Mi Viaje, Mi Historia, Mi Próximo Destino._ ¡Muchas gracias!`;

        window.open(`https://wa.me/573146382810?text=${encodeURIComponent(mensajeTexto)}`, '_blank');
    });
}

safeOn(selectIdioma, 'change', (e) => {
    idiomaActual = e.target.value;
    actualizarTextosUI();
    if (lugarActual) {
        poblarDatosLugar(lugarActual);
    }
    actualizarListaFavoritosUI();
});

function actualizarTextosUI() {
    const t = traducciones[idiomaActual];
    setHTML('lbl-idioma-text', t.idiomaLabel);
    
    let adminBadgeHtml = '';
    if(rolUsuario === 'admin'){
        adminBadgeHtml = ' <span id="badge-admin" style="display:inline-block; color:#D32F2F; font-size: 0.8rem; border: 1px solid #D32F2F; padding: 2px 6px; border-radius: 12px; margin-left: 5px;">ADMINISTRADOR</span>';
    }
    setHTML('txt-subtitulo', t.subtitulo + adminBadgeHtml);
    
    setHTML('txt-header-punto-span', t.headerPunto);
    setHTML('header-favoritos', `<span>${t.headerFavoritos}</span>`);
    setHTML('header-historia', `<span>${t.headerHistoria}</span>`);
    setHTML('header-datos', `<span>${t.headerDatos}</span>`);
    setHTML('header-sonidos', `<span>${t.headerSonidos}</span>`);
    
    // Actualizar Buscador y Filtros
    const inputBuscador = el('input-buscador');
    if(inputBuscador) inputBuscador.placeholder = t.placeholderBuscador;
    
    setText('btn-filtro-todos', t.filtroTodos);
    setText('btn-filtro-cultura', t.filtroCultura);
    setText('btn-filtro-historia', t.filtroHistoria);
    setText('btn-filtro-naturaleza', t.filtroNaturaleza);

    // Actualizar Cotizador
    setHTML('titulo-cotizador-viajes', t.cotizadorTitulo);
    setHTML('lbl-cotizador-destino', t.lblDestinoCotizador);
    setHTML('lbl-cotizador-pais', t.lblPaisCotizador);
    setHTML('lbl-cotizador-personas', t.lblViajerosCotizador);
    setHTML('lbl-cotizador-fecha', t.lblFechaCotizador);
    setHTML('btn-submit-cotizador', t.btnCotizarWp);

    if (!lugarActual) {
        setText('nombre-sitio', t.placeholderSitioNombre);
        setText('desc-sitio', t.placeholderSitioDesc);
        setText('sec-historia', t.txtHistoriaInicial);
        setText('info-clima', idiomaActual === 'es' ? "Elige un lugar..." : "Choose a place...");
        setText('info-general', idiomaActual === 'es' ? "Elige un lugar..." : "Choose a place...");
        setText('info-curiosidad', t.placeholderCurioso);
        setText('sec-precaucion', t.txtPrecaucionDefecto);
        setText('lbl-explora-musica', t.lblExploraMusica);
    }

    const btnToggle = el('btn-toggle-texto-historia');
    if (btnToggle) btnToggle.innerText = (contenedorHistoriaExtensa && contenedorHistoriaExtensa.style.display === 'block') ? t.btnOcultarMas : t.btnLeerMas;

    setHTML('lbl-hora', t.lblHora);
    setHTML('lbl-clima', t.lblClima);
    setHTML('lbl-contexto', t.lblContexto);
    setHTML('lbl-curioso', t.lblCurioso);
    setText('lbl-instruccion-sonidos', t.lblInstruccionSonidos);
    setHTML('txt-sede', t.txtSede);

    if (btnVozPrincipal) btnVozPrincipal.innerHTML = estadoVozPrincipal ? t.btnDetenerIntro : t.btnEscucharIntro;
    if (btnVozHistoria) btnVozHistoria.innerHTML = estadoVozHistoria ? t.btnDetenerHistoria : t.btnEscucharHistoria;
    
    actualizarBotonFavoritoUI();
    actualizarListaFavoritosUI();
    try { renderizarFavoritos(); } catch (err) {}
}

document.querySelectorAll('.acordeon-cabecera').forEach(cabecera => {
    cabecera.addEventListener('click', (e) => {
        if (e.target.closest('#btn-favorito-sitio')) return; 
        cabecera.parentElement.classList.toggle('activo');
    });
});

function actualizarHora() {
    const infoHora = document.getElementById('info-hora');
    if (infoHora) {
        infoHora.innerText = new Date().toLocaleTimeString(idiomaActual === 'es' ? 'es-CO' : 'en-US'); 
    }
}
setInterval(actualizarHora, 1000); 
actualizarHora();

function detenerTodaMusicaYVoz() {
    if (reproductorAudio) {
        reproductorAudio.pause();
        reproductorAudio.currentTime = 0;
    }
    if (reproductorContenedor) reproductorContenedor.style.display = 'none';
    
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    
    estadoVozPrincipal = false;
    if (btnVozPrincipal) {
        btnVozPrincipal.innerHTML = traducciones[idiomaActual].btnEscucharIntro;
        btnVozPrincipal.classList.remove('btn-stop-dinamico');
    }

    estadoVozHistoria = false;
    if (btnVozHistoria) {
        btnVozHistoria.innerHTML = traducciones[idiomaActual].btnEscucharHistoria;
        btnVozHistoria.classList.remove('btn-stop-dinamico');
    }
}

function iniciarRotacionCuriosidades(curiosidades) {
    if (intervaloCuriosidades) clearInterval(intervaloCuriosidades);
    if (!curiosidades || curiosidades.length === 0) return;

    let index = 0;
    const elemCuriosidad = document.getElementById('info-curiosidad');
    if (!elemCuriosidad) return;
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

safeOn(btnToggleTextoHistoria, 'click', () => {
    const t = traducciones[idiomaActual];
    if (!contenedorHistoriaExtensa) return;
    if (contenedorHistoriaExtensa.style.display === 'none' || contenedorHistoriaExtensa.style.display === '') {
        contenedorHistoriaExtensa.style.display = 'block';
        if (btnToggleTextoHistoria) btnToggleTextoHistoria.innerText = t.btnOcultarMas;
    } else {
        contenedorHistoriaExtensa.style.display = 'none';
        if (btnToggleTextoHistoria) btnToggleTextoHistoria.innerText = t.btnLeerMas;
    }
});

function hablarTexto(texto) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const mensaje = new SpeechSynthesisUtterance(texto);
        mensaje.lang = idiomaActual === 'es' ? 'es-CO' : 'en-US'; 
        mensaje.rate = 0.90; 
        mensaje.pitch = 1.05; 
        return mensaje;
    }
    return null;
}

safeOn(btnVozPrincipal, 'click', () => {
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

        if (mensajeIntro) {
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
    }
});

safeOn(btnVozHistoria, 'click', () => {
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

        if (mensaje) {
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
    }
});

function alternarFavorito(idLugar) {
    if (!idLugar) return;

    const index = favoritosIds.indexOf(idLugar);
    if (index > -1) {
        favoritosIds.splice(index, 1);
    } else {
        favoritosIds.push(idLugar);
    }

    localStorage.setItem('embera_favoritos', JSON.stringify(favoritosIds));
    actualizarBotonFavoritoUI();
    actualizarListaFavoritosUI();
    try { renderizarFavoritos(); } catch (err) {}
}

safeOn(btnFavoritoSitio, 'click', (e) => {
    e.stopPropagation();
    if (!lugarActual) return;
    alternarFavorito(lugarActual.id);
});

function actualizarBotonFavoritoUI() {
    if (!btnFavoritoSitio) return;
    if (!lugarActual) {
        btnFavoritoSitio.style.display = 'none';
        return;
    }

    btnFavoritoSitio.style.display = 'inline-flex';
    const esFav = favoritosIds.includes(lugarActual.id);

    btnFavoritoSitio.classList.toggle('btn-favorito-activo', esFav);
    btnFavoritoSitio.classList.toggle('btn-favorito-inactivo', !esFav);

    if (esFav) {
        btnFavoritoSitio.innerHTML = '<i class="ph ph-heart-fill"></i><span>' + (idiomaActual === 'es' ? 'Favorito' : 'Favorite') + '</span>';
        btnFavoritoSitio.title = idiomaActual === 'es' ? "Quitar de favoritos" : "Remove from favorites";
        btnFavoritoSitio.setAttribute('aria-pressed', 'true');
    } else {
        btnFavoritoSitio.innerHTML = '<i class="ph ph-heart"></i><span>' + (idiomaActual === 'es' ? 'Guardar' : 'Save') + '</span>';
        btnFavoritoSitio.title = idiomaActual === 'es' ? "Guardar en favoritos" : "Save to favorites";
        btnFavoritoSitio.setAttribute('aria-pressed', 'false');
    }
}

function crearBotonDesmarcarFavorito(idFav) {
    const btnCorazonFav = document.createElement('button');
    btnCorazonFav.type = 'button';
    btnCorazonFav.title = idiomaActual === 'es' ? "Quitar de favoritos" : "Remove from favorites";
    btnCorazonFav.setAttribute('aria-label', idiomaActual === 'es' ? 'Quitar de favoritos' : 'Remove from favorites');
    btnCorazonFav.innerHTML = '<i class="ph ph-heart-fill" style="color: #D32F2F;"></i>';
    btnCorazonFav.style.background = 'transparent';
    btnCorazonFav.style.border = 'none';
    btnCorazonFav.style.fontSize = '1.2rem';
    btnCorazonFav.style.cursor = 'pointer';
    btnCorazonFav.style.padding = '4px 8px';
    btnCorazonFav.style.width = 'auto';
    btnCorazonFav.style.transition = 'transform 0.2s ease';
    btnCorazonFav.style.borderRadius = '50%';

    btnCorazonFav.onmouseenter = () => { btnCorazonFav.style.transform = 'scale(1.12)'; };
    btnCorazonFav.onmouseleave = () => { btnCorazonFav.style.transform = 'scale(1)'; };

    btnCorazonFav.onclick = (e) => {
        e.stopPropagation();
        alternarFavorito(idFav);
    };

    return btnCorazonFav;
}

function actualizarListaFavoritosUI() {
    const listaFavEl = document.getElementById('lista-favoritos');
    if (!listaFavEl) return;

    listaFavEl.innerHTML = '';

    if (favoritosIds.length === 0) {
        listaFavEl.innerHTML = `<li style="color: #2E7D32; font-style: italic; text-align: center;">${traducciones[idiomaActual].sinFavoritos}</li>`;
        return;
    }

    favoritosIds.forEach(idFav => {
        const itemLugar = lugares.find(l => l.id === idFav);
        if (itemLugar) {
            const datos = itemLugar[idiomaActual];
            const li = document.createElement('li');
            li.className = 'cancion-item';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.gap = '10px';

            const spanTexto = document.createElement('span');
            spanTexto.innerHTML = `<i class="ph ph-map-pin"></i> ${datos.nombre}`;
            spanTexto.style.cursor = 'pointer';
            spanTexto.style.flexGrow = '1';
            spanTexto.onclick = () => {
                const encontrado = marcadores.find(m => m.lugarObj.id === idFav);
                if (encontrado) {
                    encontrado.marcador.fire('click');
                }
            };

            const btnCorazonFav = crearBotonDesmarcarFavorito(idFav);

            li.appendChild(spanTexto);
            li.appendChild(btnCorazonFav);
            listaFavEl.appendChild(li);
        }
    });
}

const contenedorFavoritos = document.getElementById('lista-destinos-favoritos');

function renderizarFavoritos() {
    if (!contenedorFavoritos) return;
    contenedorFavoritos.innerHTML = '';

    if (!favoritosIds || favoritosIds.length === 0) {
        contenedorFavoritos.innerHTML = `<li class="list-group-item text-muted text-center py-3 border-0">
                <i class="ph ph-mask-sad fs-4 d-block mb-2"></i>
                ${traducciones[idiomaActual].sinFavoritos}
            </li>`;
        return;
    }

    favoritosIds.forEach(idFav => {
        const lugar = lugares.find(l => l.id === idFav);
        if (!lugar) return;
        const datos = lugar[idiomaActual];

        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center border-bottom-0 py-2';

        li.innerHTML = `
            <div class="d-flex align-items-center" style="gap:12px;">
                <img src="${lugar.imagenes && lugar.imagenes[0] ? lugar.imagenes[0] : 'Images/fondo.avif'}" alt="${datos.nombre}" class="fav-thumb" />
                <div>
                    <div class="fw-semibold text-dark">${datos.nombre}</div>
                    <small class="text-muted">${datos.ciudad || ''}</small>
                </div>
            </div>
            <div class="d-flex fav-actions" style="gap:8px;">
                <button class="btn btn-sm btn-light btn-view" title="${idiomaActual==='es'?'Ver':'View'}"><i class="ph ph-eye"></i></button>
                ${ (lugar.canciones && lugar.canciones.length) ? `<button class="btn btn-sm btn-light btn-play" title="${idiomaActual==='es'?'Reproducir':'Play'}"><i class="ph ph-play"></i></button>` : '' }
                <button class="btn btn-sm btn-light btn-share" title="${idiomaActual==='es'?'Compartir':'Share'}"><i class="ph ph-share-network"></i></button>
                <button class="btn btn-sm btn-light text-danger btn-remove" title="${idiomaActual==='es'?'Quitar':'Remove'}"><i class="ph-fill ph-trash"></i></button>
            </div>
        `;

        contenedorFavoritos.appendChild(li);

        const btnView = li.querySelector('.btn-view');
        const btnPlay = li.querySelector('.btn-play');
        const btnShare = li.querySelector('.btn-share');
        const btnRemove = li.querySelector('.btn-remove');

        if (btnView) btnView.addEventListener('click', () => {
            const encontrado = marcadores.find(m => m.lugarObj.id === idFav);
            if (encontrado) {
                encontrado.marcador.fire('click');
                document.querySelectorAll('.acordeon').forEach(acc => acc.classList.add('activo'));
            }
        });

        if (btnPlay) btnPlay.addEventListener('click', () => {
            if (lugar.canciones && lugar.canciones.length) {
                const can = lugar.canciones[0];
                if (reproductorContenedor) reproductorContenedor.style.display = 'block';
                if (infoCancionSonando) infoCancionSonando.innerText = `▶ ${can.nombre}`;
                if (reproductorAudio) { reproductorAudio.src = can.audioUrl; reproductorAudio.play(); }
            }
        });

        if (btnShare) btnShare.addEventListener('click', async () => {
            const href = window.location.href.split('#')[0] + '#' + idFav;
            try {
                await navigator.clipboard.writeText(href);
                alert(idiomaActual === 'es' ? 'Enlace copiado al portapapeles' : 'Link copied to clipboard');
            } catch (err) {
                prompt(idiomaActual === 'es' ? 'Copiar enlace' : 'Copy link', href);
            }
        });

        if (btnRemove) btnRemove.addEventListener('click', (e) => {
            e.stopPropagation();
            alternarFavorito(idFav);
        });
    });
}

document.addEventListener('DOMContentLoaded', renderizarFavoritos);

const imgActiva = document.getElementById('galeria-imagen-activa');

function mostrarImagenGaleria(nuevaIndice) {
    if (!lugarActual || !lugarActual.imagenes || lugarActual.imagenes.length === 0) return;
    indiceImagenActual = (nuevaIndice + lugarActual.imagenes.length) % lugarActual.imagenes.length;
    if (!imgActiva) return;
    imgActiva.style.opacity = 0;
    setTimeout(() => {
        imgActiva.src = lugarActual.imagenes[indiceImagenActual];
        imgActiva.style.opacity = 1;
    }, 200);
}

function iniciarRotacionGaleria() {
    if (intervaloGaleria) clearInterval(intervaloGaleria);
    if (!lugarActual || !lugarActual.imagenes || lugarActual.imagenes.length < 2) return;

    intervaloGaleria = setInterval(() => {
        mostrarImagenGaleria(indiceImagenActual + 1);
    }, 3500);
}

const galNext = el('galeria-btn-next');
const galPrev = el('galeria-btn-prev');
safeOn(galNext, 'click', () => {
    if (!lugarActual || !lugarActual.imagenes) return;
    mostrarImagenGaleria(indiceImagenActual + 1);
    iniciarRotacionGaleria();
});
safeOn(galPrev, 'click', () => {
    if (!lugarActual || !lugarActual.imagenes) return;
    mostrarImagenGaleria(indiceImagenActual - 1);
    iniciarRotacionGaleria();
});

function poblarDatosLugar(lugar) {
    const t = traducciones[idiomaActual];
    const datosLugar = lugar[idiomaActual];

    lugarActual = lugar;
    const nombreHtml = datosLugar.nombre + (datosLugar.ciudad ? ` <span class="lugar-ciudad">${datosLugar.ciudad}</span>` : '');
    setHTML('nombre-sitio', nombreHtml);
    setText('desc-sitio', datosLugar.descripcion);
    const controlesPrincipal = el('controles-principal'); if (controlesPrincipal) controlesPrincipal.style.display = 'block';

    if (lugar.imagenes && lugar.imagenes.length > 0) {
        indiceImagenActual = 0;
        const galCont = el('galeria-sitio-container'); if (galCont) galCont.style.display = 'block';
        if (imgActiva) imgActiva.src = lugar.imagenes[0];
        iniciarRotacionGaleria();
    } else {
        if (intervaloGaleria) clearInterval(intervaloGaleria);
        const galCont = el('galeria-sitio-container'); if (galCont) galCont.style.display = 'none';
    }

    actualizarBotonFavoritoUI();
    
    setText('sec-historia', datosLugar.historia);
    setText('sec-historia-extensa', datosLugar.historiaExtensa);
    const controlesHistoria = el('controles-historia'); if (controlesHistoria) controlesHistoria.style.display = 'block';
    if (contenedorHistoriaExtensa) contenedorHistoriaExtensa.style.display = 'none';
    if (btnToggleTextoHistoria) btnToggleTextoHistoria.innerText = t.btnLeerMas;

    setText('sec-precaucion', datosLugar.precaucion);
    setText('info-clima', datosLugar.clima);
    setText('info-general', datosLugar.datosGenerales);

    iniciarRotacionCuriosidades(datosLugar.curiosidades);
    detenerTodaMusicaYVoz();

    const listaCanciones = el('lista-canciones');
    if (listaCanciones) listaCanciones.innerHTML = ''; 
    if (lugar.canciones) {
        lugar.canciones.forEach(cancion => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="ph ph-play-circle"></i> ${cancion.nombre}`;
            li.className = 'cancion-item';
            li.onclick = () => {
                if (reproductorContenedor) reproductorContenedor.style.display = 'block';
                if (infoCancionSonando) infoCancionSonando.innerText = `▶ ${cancion.nombre}`;
                if (reproductorAudio) { reproductorAudio.src = cancion.audioUrl; reproductorAudio.play(); }
            };
            listaCanciones.appendChild(li);
        });
    }

    const textoIntro = `${datosLugar.introCiudad} Estás viendo ${datosLugar.nombre}. ${datosLugar.descripcion}.`;
    const mensajeIntro = hablarTexto(textoIntro);

    if (mensajeIntro) {
        window.speechSynthesis.speak(mensajeIntro);
        estadoVozPrincipal = true;
        if (btnVozPrincipal) { btnVozPrincipal.innerHTML = t.btnDetenerIntro; btnVozPrincipal.classList.add('btn-stop-dinamico'); }

        mensajeIntro.onend = () => {
            estadoVozPrincipal = false;
            if (btnVozPrincipal) { btnVozPrincipal.innerHTML = t.btnEscucharIntro; btnVozPrincipal.classList.remove('btn-stop-dinamico'); }
        };
    }
}

lugares.forEach((lugarObj) => {
    const marcador = L.marker(lugarObj.coordenadas, { icon: createCustomIcon(false) }).addTo(map);
    marcadores.push({ marcador, lugarObj });
    marcador.bindPopup(`<b>${lugarObj.es.nombre}</b><br>Haz clic para explorar.`);

    marcador.on('click', () => {
        marcadores.forEach(m => m.marcador.setIcon(createCustomIcon(false)));
        marcador.setIcon(createCustomIcon(true));
        
        map.flyTo(lugarObj.coordenadas, 16, { duration: 2.2, easeLinearity: 0.25 });

        if(panelLateral.classList.contains('colapsado')) {
            panelLateral.classList.remove('colapsado');
            if (btnToggleMenu) btnToggleMenu.innerHTML = '<i class="ph ph-caret-right"></i>'; 
        }

        document.querySelectorAll('.acordeon').forEach(acc => acc.classList.add('activo'));
        poblarDatosLugar(lugarObj);
    });
});

const inputBuscador = el('input-buscador');
const cajaSugerencias = el('sugerencias-buscador');

if (inputBuscador && cajaSugerencias) {
    safeOn(inputBuscador, 'input', (e) => {
        const texto = e.target.value.toLowerCase().trim();
        cajaSugerencias.innerHTML = '';
        
        if (texto.length === 0) {
            cajaSugerencias.style.display = 'none';
            marcadores.forEach(m => m.marcador.addTo(map));
            return;
        }

        let coincidencias = [];

        marcadores.forEach(m => {
            const nombreEs = m.lugarObj.es.nombre.toLowerCase();
            const ciudad = m.lugarObj.es.ciudad.toLowerCase();
            const desc = m.lugarObj.es.descripcion.toLowerCase();
            
            if (nombreEs.includes(texto) || ciudad.includes(texto) || desc.includes(texto)) {
                coincidencias.push(m);
                m.marcador.addTo(map);
            } else {
                m.marcador.remove();
            }
        });

        if (coincidencias.length > 0) {
            cajaSugerencias.style.display = 'block';
            coincidencias.forEach(m => {
                const item = document.createElement('div');
                item.className = 'sugerencia-item';
                item.innerHTML = `<i class="ph ph-map-pin"></i> 
                                  <div>
                                    <strong>${m.lugarObj.es.nombre}</strong><br>
                                    <small style="font-size:0.85rem; color:#558B2F;">${m.lugarObj.es.ciudad}</small>
                                  </div>`;
                
                item.addEventListener('click', () => {
                    inputBuscador.value = m.lugarObj.es.nombre;
                    cajaSugerencias.style.display = 'none';
                    m.marcador.fire('click');
                });
                
                cajaSugerencias.appendChild(item);
            });
        } else {
            cajaSugerencias.style.display = 'block';
            cajaSugerencias.innerHTML = `<div class="sugerencia-item" style="color: #D32F2F;">
                                            <i class="ph ph-warning-circle"></i> No se encontraron destinos
                                         </div>`;
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.buscador-wrapper')) {
            cajaSugerencias.style.display = 'none';
        }
    });
}

document.querySelectorAll('.btn-filtro').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('activo'));
        e.target.classList.add('activo');
        const categoria = e.target.getAttribute('data-categoria');

        marcadores.forEach(m => {
            if (categoria === 'todos' || m.lugarObj.categoria === categoria) {
                m.marcador.addTo(map);
            } else {
                m.marcador.remove();
            }
        });
    });
});

actualizarListaFavoritosUI();