const map = L.map('mapa').setView([8.5, -75.5], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const lugares = [
    {
        nombre: "Castillo de San Felipe de Barajas",
        coordenadas: [10.4224, -75.5398],
        descripcion: "Esta imponente fortaleza militar del siglo XVII fue erigida en la colina de San Lázaro en Cartagena. Es considerada una obra maestra de la ingeniería militar española en las Américas.",
        historia: "Cartagena de Indias es uno de los puertos estratégicos más importantes de la historia americana.",
        precaucion: "El clima es muy cálido. Lleva agua y protégete del sol durante el recorrido."
    },
    {
        nombre: "Torre del Reloj",
        coordenadas: [10.4236, -75.5488],
        descripcion: "La puerta de entrada principal al centro histórico de Cartagena. Un símbolo arquitectónico que conecta la ciudad antigua con la moderna.",
        historia: "Originalmente conocida como la Boca del Puente, conectaba la ciudad amurallada con el barrio Getsemaní.",
        precaucion: "Es una zona de alto tráfico turístico, mantén tus pertenencias a la vista."
    },
    {
        nombre: "Pueblito Paisa",
        coordenadas: [6.2366, -75.5804],
        descripcion: "Ubicado en la cima del Cerro Nutibara, es una réplica exacta de un pueblo tradicional antioqueño de principios del siglo XX, con hermosas vistas de Medellín.",
        historia: "Construido en 1978, representa la arquitectura tradicional paisa con su plaza empedrada, la fuente, la iglesia y la alcaldía.",
        precaucion: "Ideal para visitar al atardecer, pero hay que tener precaución al subir las escaleras del cerro si vas a pie."
    },
    {
        nombre: "Plaza Botero",
        coordenadas: [6.2520, -75.5683],
        descripcion: "Un museo al aire libre en el centro de Medellín que alberga 23 esculturas monumentales de bronce donadas por el maestro Fernando Botero.",
        historia: "Inaugurada en 2002, esta plaza impulsó la recuperación cultural del centro histórico de la ciudad junto al Museo de Antioquia.",
        precaucion: "Zona céntrica muy concurrida. Disfruta el arte pero mantente atento a tu entorno."
    }
];

const btnDetener = document.getElementById('btn-detener-voz');

lugares.forEach(lugar => {
    const marcador = L.marker(lugar.coordenadas).addTo(map);
    marcador.bindPopup(`<b>${lugar.nombre}</b><br>Haz clic para conocer más.`);

    marcador.on('click', () => {
        map.flyTo(lugar.coordenadas, 15, { duration: 1.5 });

        document.getElementById('nombre-sitio').innerText = lugar.nombre;
        document.getElementById('desc-sitio').innerText = lugar.descripcion;
        document.getElementById('sec-historia').innerText = lugar.historia;
        document.getElementById('sec-precaucion').innerText = lugar.precaucion;

        leerEnVozAlta(lugar.nombre + ". " + lugar.descripcion);
    });
});

function leerEnVozAlta(texto) {
    window.speechSynthesis.cancel();

    const mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = 'es-ES'; 
    mensaje.rate = 0.9; 

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

function agregarCancion() {
    const input = document.getElementById('nueva-cancion');
    const textoCancion = input.value.trim();
    
    if (textoCancion !== "") {
        const ul = document.getElementById('lista-canciones');
        const li = document.createElement('li');
        li.innerText = "🎵 " + textoCancion;
        ul.appendChild(li);
        input.value = "";
    } else {
        alert("Por favor escribe el nombre de una canción.");
    }
}