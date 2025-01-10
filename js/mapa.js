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

// Cargar los datos de piezas para identificar ubicaciones registradas
let highlightedLocations = [];
fetch('assets/piezas.json')
  .then((response) => response.json())
  .then((data) => {
    highlightedLocations = data.map((pieza) => pieza.location);
    return fetch('assets/parroquias.geojson');
  })
  .then((response) => response.json())
  .then((geoData) => {
    L.geoJSON(geoData, {
      style: (feature) => {
        const isHighlighted = highlightedLocations.some((loc) =>
          feature.properties.CODPARRO.startsWith(loc) || feature.properties.CODCONC.startsWith(loc)
        );
        return isHighlighted ? highlightedStyle : defaultStyle;
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;

        // Añadir un popup con enlaces a las páginas de las entidades
        layer.bindPopup(`
          <strong>Parroquia:</strong> <a href="templates/parroquia.html?id=${props.CODPARRO}">${props.PARROQUIA}</a><br>
          <strong>Concello:</strong> <a href="templates/concello.html?id=${props.CODCONC}">${props.CONCELLO}</a><br>
          <strong>Comarca:</strong> <a href="templates/comarca.html?id=${props.CODCOM}">${props.COMARCA}</a><br>
          <strong>Provincia:</strong> <a href="templates/provincia.html?id=${props.CODPROV}">${props.PROVINCIA}</a>
        `);

        layer.on('mouseover', () => layer.setStyle(hoverStyle));
        layer.on('mouseout', () => layer.setStyle((feature) => {
          const isHighlighted = highlightedLocations.some((loc) =>
            feature.properties.CODPARRO.startsWith(loc) || feature.properties.CODCONC.startsWith(loc)
          );
          return isHighlighted ? highlightedStyle : defaultStyle;
        }));
      },
    }).addTo(map);
  })
  .catch((error) => console.error('Error al cargar datos o GeoJSON:', error));
