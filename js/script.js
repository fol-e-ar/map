// Inicializa el mapa
const map = L.map('map').setView([42.88, -8.54], 8); // Galicia

// Añade las capas base
const baseMaps = {
  'Plano minimalista': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' }),
  'Físico': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' }),
  'Só Galiza': L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', { attribution: '&copy; Stamen Design' }),
};

// Establece un basemap inicial
const defaultBase = baseMaps['Físico'];
defaultBase.addTo(map);

// Añade control de capas
L.control.layers(baseMaps).addTo(map);

// Define los estilos
const defaultStyle = {
  color: '#444',          // Color de las líneas de las fronteras
  weight: 0.25,           // Grosor de las líneas
  fillColor: '#2a7b9b',   // Color de relleno
  fillOpacity: 0.01,      // Transparencia del relleno
};

const hoverStyle = {
  fillColor: '#66d9e8',   // Color de relleno en hover
  fillOpacity: 0.4,       // Transparencia en hover
};

// Cargar el GeoJSON reproyectado
fetch('assets/parroquias.geojson')
  .then((response) => response.json())
  .then((geoData) => {
    // Añadir las parroquias al mapa
    L.geoJSON(geoData, {
      style: defaultStyle, // Aplica el estilo inicial a todas las parroquias
      onEachFeature: (feature, layer) => {
        const props = feature.properties;

        // Añadir un popup con información
        layer.bindPopup(`
          <strong>Parroquia:</strong> ${props.PARROQUIA}<br>
          <strong>Concello:</strong> ${props.CONCELLO}<br>
          <strong>Comarca:</strong> ${props.COMARCA}<br>
          <strong>Provincia:</strong> ${props.PROVINCIA}
        `);

        // Cambiar el estilo al pasar el ratón
        layer.on('mouseover', () => layer.setStyle(hoverStyle));

        // Restaurar el estilo original al salir el ratón
        layer.on('mouseout', () => layer.setStyle(defaultStyle));
      },
    }).addTo(map);
  })
  .catch((error) => console.error('Error al cargar GeoJSON:', error));
