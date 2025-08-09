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
  color: '#444',
  weight: 0.25,
  fillColor: '#2a7b9b',
  fillOpacity: 0.01,
};

const highlightedStyle = {
  color: '#444',
  weight: 0.5,
  fillColor: '#f8c102',
  fillOpacity: 0.6,
};

const hoverStyle = {
  fillColor: '#66d9e8',
  fillOpacity: 0.4,
};

let geoLayer = null;

// Cargar los datos de parroquias y renderizar el mapa
fetch('assets/parroquias.geojson')
  .then((response) => response.json())
  .then((geoData) => {
    geoLayer = L.geoJSON(geoData, {
      style: defaultStyle,
      onEachFeature: (feature, layer) => {
        const props = layer.properties;
        layer.bindPopup(`
          <strong>Parroquia:</strong> <a href="templates/parroquia.html?id=${props.CODPARRO}">${props.PARROQUIA}</a><br>
          <strong>Concello:</strong> <a href="templates/concello.html?id=${props.CODCONC}">${props.CONCELLO}</a><br>
          <strong>Comarca:</strong> <a href="templates/comarca.html?id=${props.CODCOM}">${props.COMARCA}</a><br>
          <strong>Provincia:</strong> <a href="templates/provincia.html?id=${props.CODPROV}">${props.PROVINCIA}</a>
        `);

        layer.on('mouseover', () => layer.setStyle(hoverStyle));
        layer.on('mouseout', () => layer.setStyle(defaultStyle));
      },
    }).addTo(map);
  })
  .catch((error) => console.error('Error al cargar GeoJSON:', error));

// Función para buscar y resaltar parroquias por concello
function searchConcello(concelloName) {
  fetch('assets/mapeo.json')
    .then((response) => response.json())
    .then((data) => {
      // Filtrar IDs de parroquias que pertenecen al concello
      const matchingParroquias = data
        .filter((entry) => entry.concello.toLowerCase() === concelloName.toLowerCase())
        .map((entry) => entry.id);

      if (geoLayer) {
        geoLayer.eachLayer((layer) => {
          const props = layer.feature.properties;
          if (matchingParroquias.includes(props.CODPARRO)) {
            layer.setStyle(highlightedStyle);
          } else {
            layer.setStyle(defaultStyle);
          }
        });
      }
    })
    .catch((error) => console.error('Error al buscar concello:', error));
}

// Añadir evento al botón del buscador
document.getElementById('search-btn').addEventListener('click', () => {
  const concelloName = document.getElementById('search-concello').value.trim();
  if (concelloName) {
    searchConcello(concelloName);
  }
});
