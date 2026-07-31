const map = L.map('mapa').setView([8.0, -75.5812], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const lugares = [
    {
        nombre: "Castillo de San Felipe de Barajas (Cartagena)",
        coordenadas: [10.4224, -75.5398],
        descripcion: "Una imponente y mágica fortaleza militar del siglo XVII situada en Cartagena, perfecta para sentir la brisa del Caribe.",
        historia: "Cartagena de Indias guarda entre sus murallas los secretos de los puertos más importantes de la historia americana.",
        precaucion: "¡El sol del Caribe brilla fuerte! No olvides llevar una buena botella de agua y protector solar.",
        clima: "Cálido y muy alegre, con unos 30°C de puro sabor caribeño.",
        datosGenerales: "Joyita histórica de la costa colombiana y orgullosamente Patrimonio de la Humanidad.",
        canciones: [
            { nombre: "🌊 El Mapalé (Tradicional Caribe)", ytId: "PNkQlNCARTw" },
            { nombre: "🎶 Rebelión - Joe Arroyo (Local)", tipo: "local" },
            { nombre: "🛶 El Pescador (Folclor Caribe)", ytId: "3wN5YcDTx0Y" }
        ]
    },
    {
        nombre: "Pueblito Paisa (Medellín)",
        coordenadas: [6.2366, -75.5804],
        descripcion: "Un rincón tradicional que recrea los hermosos pueblos antioqueños en lo alto del Cerro Nutibara.",
        historia: "Diseñado para mantener vivo el legado de los arrieros, su arquitectura nos conecta con las raíces de la montaña.",
        precaucion: "Es un plan excelente para caminar sin afán al atardecer y disfrutar de una vista panorámica única.",
        clima: "Clima templado y primaveral, rondando los agradables 22°C.",
        datosGenerales: "Medellín brilla en el corazón del Valle de Aburrá como un centro de innovación y cultura.",
        canciones: [
            { nombre: "🤠 Trova Paisa Tradicional", ytId: "dQw4w9WgXcQ" },
            { nombre: "🪗 Música Guasca y Carrilera", ytId: "dQw4w9WgXcQ" }
        ]
    },
    {
        nombre: "Monumento al Banano (Apartadó)",
        coordenadas: [7.8833, -76.6333],
        descripcion: "El gran homenaje a la pujanza agrícola y la alegría inigualable de nuestra hermosa región de Urabá.",
        historia: "Apartadó late con fuerza como la capital bananera, uniendo la sabrosura afrocaribeña con la calidez andina.",
        precaucion: "Prepárate para un clima tropical de selva; usa ropa fresca y un toque de repelente.",
        clima: "Tropical húmedo y cálido, con temperaturas cercanas a los 29°C.",
        datosGenerales: "Urabá es la gran puerta de oro que conecta las montañas de Antioquia directamente con el mar Caribe.",
        canciones: [
            { nombre: "🪘 Bullerengue del Urabá", ytId: "dQw4w9WgXcQ" },
            { nombre: "🪗 Vallenato Clásico de Acordeón", ytId: "dQw4w9WgXcQ" }
        ]
    }
];

// CONFIGURACIÓN DE REPRODUCTOR DE YOUTUBE INTERNO
let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player-oculto', {
        height: '0',
        width: '0',
        events: {
            'onReady': () => {
                console.log("Reproductor de YouTube listo y acoplado.");
            }
        }
    });
}

// RELOJ EN TIEMPO REAL
function actualizarHora() {
    const elementoHora = document.getElementById('info-hora');
    const ahora = new Date();
    elementoHora.innerText = ahora.toLocaleTimeString('es-CO'); 
}
setInterval(actualizarHora, 1000); 
actualizarHora();

// MENÚ MINIMALISTA
const panelLateral = document.getElementById('panel-lateral');
const btnToggleMenu = document.getElementById('btn-toggle-menu');

btnToggleMenu.addEventListener('click', () => {
    panelLateral.classList.toggle('colapsado');
    btnToggleMenu.innerText = panelLateral.classList.contains('colapsado') ? "☰ Mostrar Menú" : "✖ Ocultar Menú";
});

// INFORMACIÓN DINÁMICA AMIGABLE
const datosCuriosos = [
    "💡 ¿Sabías que? Cada región de nuestra patria suena diferente gracias a su geografía y su gente.",
    "🌴 Dato curioso: El Urabá antioqueño es un punto mágico donde la montaña abraza al mar Caribe.",
    "⛰️ Entorno: Medellín descansa tranquilamente sobre un hermoso valle rodeado de verdes montañas."
];
let indiceDato = 0;
const elementoInfoDinamica = document.getElementById('info-dinamica');

setInterval(() => {
    elementoInfoDinamica.style.opacity = 0; 
    setTimeout(() => {
        elementoInfoDinamica.innerText = datosCuriosos[indiceDato];
        elementoInfoDinamica.style.color = "#fbbf24"; 
        elementoInfoDinamica.style.opacity = 1; 
        indiceDato = (indiceDato + 1) % datosCuriosos.length; 
    }, 500); 
}, 6000);

// MAPA, VOZ Y MÚSICA INTERACTIVA
const btnDetener = document.getElementById('btn-detener-voz');
const btnMusica = document.getElementById('btn-reproducir-musica');
const audioLocal = document.getElementById('audio-local');

function detenerTodaMusica() {
    if (player && typeof player.stopVideo === 'function') {
        player.stopVideo();
    }
    audioLocal.pause();
    audioLocal.currentTime = 0;
}

lugares.forEach(lugar => {
    const marcador = L.marker(lugar.coordenadas).addTo(map);
    marcador.bindPopup(`<b>${lugar.nombre}</b><br>Haz clic para descubrir más.`);

    marcador.on('click', () => {
        map.flyTo(lugar.coordenadas, 14, { duration: 1.5 });

        if(panelLateral.classList.contains('colapsado')) {
            btnToggleMenu.click(); 
        }

        document.getElementById('nombre-sitio').innerText = lugar.nombre;
        document.getElementById('desc-sitio').innerText = lugar.descripcion;
        document.getElementById('sec-historia').innerText = lugar.historia;
        document.getElementById('sec-precaucion').innerText = lugar.precaucion;
        document.getElementById('info-clima').innerText = lugar.clima;
        document.getElementById('info-general').innerText = lugar.datosGenerales;

        detenerTodaMusica();
        btnMusica.style.display = 'none';

        const listaCanciones = document.getElementById('lista-canciones');
        listaCanciones.innerHTML = ''; 
        
        if (lugar.canciones) {
            lugar.canciones.forEach(cancion => {
                const li = document.createElement('li');
                li.innerText = cancion.nombre;
                li.className = 'cancion-item'; 
                li.onclick = () => reproducirCancion(cancion, li);
                listaCanciones.appendChild(li);
            });
        }

        leerEnVozAlta(lugar.nombre + ". " + lugar.descripcion);
    });
});

function reproducirCancion(cancion, elementoLi) {
    const todasLasCanciones = document.querySelectorAll('.cancion-item');
    todasLasCanciones.forEach(el => el.classList.remove('activa'));
    
    elementoLi.classList.add('activa');
    detenerTodaMusica();

    if (cancion.tipo === 'local') {
        audioLocal.play().then(() => {
            btnMusica.style.display = 'block';
            btnMusica.innerHTML = `⏸️ Pausar: ${cancion.nombre}`;
            btnMusica.style.background = '#ef4444'; 
        }).catch(error => {
            console.log("Error al reproducir audio local:", error);
        });

        btnMusica.onclick = () => {
            if (audioLocal.paused) {
                audioLocal.play();
                btnMusica.innerHTML = `⏸️ Pausar: ${cancion.nombre}`;
                btnMusica.style.background = '#ef4444'; // Rojo al reproducir
            } else {
                audioLocal.pause();
                btnMusica.innerHTML = `▶️ Reanudar: ${cancion.nombre}`;
                btnMusica.style.background = '#22c55e'; // Verde al pausar
            }
        };
    } else {
        if (player && typeof player.loadVideoById === 'function') {
            player.loadVideoById(cancion.ytId);
            player.playVideo();
        }

        btnMusica.style.display = 'block';
        btnMusica.innerHTML = `⏸️ Pausar: ${cancion.nombre}`;
        btnMusica.style.background = '#ef4444'; 

        btnMusica.onclick = () => {
            const estado = player.getPlayerState();
            if (estado === YT.PlayerState.PLAYING) {
                player.pauseVideo();
                btnMusica.innerHTML = `▶️ Reanudar: ${cancion.nombre}`;
                btnMusica.style.background = '#22c55e'; // Cambia a verde con play
            } else {
                player.playVideo();
                btnMusica.innerHTML = `⏸️ Pausar: ${cancion.nombre}`;
                btnMusica.style.background = '#ef4444'; // Cambia a rojo con pausa
            }
        };
    }
}

// Función de voz con tono amigable
function leerEnVozAlta(texto) {
    window.speechSynthesis.cancel();
    const mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = 'es-CO'; 
    mensaje.rate = 0.9; 
    mensaje.pitch = 1.05; 

    window.speechSynthesis.speak(mensaje);
    btnDetener.style.display = 'block';

    mensaje.onend = () => {
        btnDetener.style.display = 'none';
    };
}
    function leerEnVozAlta(texto) {
        window.speechSynthesis.cancel();
        const mensaje = new SpeechSynthesisUtterance(texto);
        mensaje.lang = 'es-CO'; 
        mensaje.rate = 0.9; 
        mensaje.pitch = 1.05; 

        window.speechSynthesis.speak(mensaje);
        btnDetener.style.display = 'block';

        mensaje.onend = () => {
            btnDetener.style.display = 'none';
        };
    }
btnDetener.addEventListener('click', () => {
    window.speechSynthesis.cancel();
    btnDetener.style.display = 'none';
});