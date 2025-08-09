// js/mapa.js
// Contrato: initMapa({ mapContainerId }), onFiltersChange({ scope, ritmo, q })

let map;
let geoLayer;
const cache = {};
const defaultStyle   = { color:'#444', weight:0.25, fillColor:'#2a7b9b', fillOpacity:0.01 };
const hoverStyle     = { fillColor:'#66d9e8', fillOpacity:0.4 };
const highlightStyle = { color:'#444', weight:0.5, fillColor:'#f8c102', fillOpacity:0.6 };

async function fetchJSON(path){
  if (cache[path]) return cache[path];
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Erro cargando ${path}`);
  const json = await res.json();
  cache[path] = json;
  return json;
}

export async function initMapa({ mapContainerId = 'map' } = {}){
  if (!window.L) return console.warn('Leaflet non cargado.');
  if (map) return; // init unha vez

  map = L.map(mapContainerId).setView([42.88, -8.54], 8);

  const baseMaps = {
    'Plano': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' }),
    'Físico': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' }),
    'Toner': L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', { attribution: '&copy; Stamen' }),
  };
  baseMaps['Físico'].addTo(map);
  L.control.layers(baseMaps).addTo(map);

  const parroquias = await fetchJSON('assets/parroquias.geojson');

  geoLayer = L.geoJSON(parroquias, {
    style: defaultStyle,
    onEachFeature: (feature, layer) => {
      const p = feature.properties || {};
      // Popup simple (+ podes cambiar por HTML con vínculos a templates/)
      layer.bindPopup(`
        <strong>${p.PARROQUIA ?? ''}</strong><br>
        Concello: ${p.CONCELLO ?? ''}<br>
        Comarca: ${p.COMARCA ?? ''}<br>
        Provincia: ${p.PROVINCIA ?? ''}<br>
        <button class="open-par-btn" data-id="${p.CODPARRO}">Ver pezas desta parroquia</button>
      `);

      layer.on('mouseover', () => layer.setStyle(hoverStyle));
      layer.on('mouseout',  () => layer.setStyle(defaultStyle));
      layer.on('popupopen', (e) => {
        const btn = e.popup.getElement().querySelector('.open-par-btn');
        if (btn) {
          btn.addEventListener('click', () => {
            const parroquiaId = btn.getAttribute('data-id');
            document.dispatchEvent(new CustomEvent('map:open-parroquia', { detail: { parroquiaId } }));
            map.closePopup();
          });
        }
      });
    }
  }).addTo(map);
}

export function onFiltersChange({ scope }) {
  if (!geoLayer) return;
  // Quitar realce se non hai scope
  if (!scope) {
    geoLayer.eachLayer((layer) => layer.setStyle(defaultStyle));
    return;
  }
  const [tipo, codigo] = String(scope).split(':'); // prov/com/con/par

  geoLayer.eachLayer((layer) => {
    const p = layer.feature?.properties || {};
    let match = false;
    if (tipo === 'prov') match = String(p.CODPROV) === codigo;
    if (tipo === 'com')  match = String(p.CODCOM)  === codigo;
    if (tipo === 'con')  match = String(p.CODCONC) === codigo;
    if (tipo === 'par')  match = String(p.CODPARRO)=== codigo;
    layer.setStyle(match ? highlightStyle : defaultStyle);
  });

  // Zoom aproximado ao ámbito (moi básico)
  try {
    const bounds = [];
    geoLayer.eachLayer((layer) => {
      const p = layer.feature?.properties || {};
      const [tipo2, codigo2] = [tipo, codigo];
      let ok = false;
      if (tipo2 === 'prov') ok = String(p.CODPROV) === codigo2;
      if (tipo2 === 'com')  ok = String(p.CODCOM)  === codigo2;
      if (tipo2 === 'con')  ok = String(p.CODCONC) === codigo2;
      if (tipo2 === 'par')  ok = String(p.CODPARRO)=== codigo2;
      if (ok && layer.getBounds) bounds.push(layer.getBounds());
    });
    if (bounds.length) {
      const group = bounds.reduce((acc, b) => acc ? acc.extend(b) : b);
      map.fitBounds(group.pad(0.2));
    }
  } catch(e) { /* non pasa nada se non pode */ }
}
