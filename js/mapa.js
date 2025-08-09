// js/mapa.js
// Contrato co index: initMapa({ mapContainerId }), onFiltersChange({ scope, ritmo, q })

let map;
let geoLayer;
let allFeatures = []; // gardamos para re-aplicar estilos con filtros

const defaultStyle   = { color:'#444', weight:0.25, fillColor:'#2a7b9b', fillOpacity:0.01 };
const hoverStyle     = { fillColor:'#66d9e8', fillOpacity:0.4 };
const highlightStyle = { color:'#444', weight:0.5, fillColor:'#f8c102', fillOpacity:0.6 };

export async function initMapa({ mapContainerId = 'map' } = {}) {
  if (!window.L) return console.warn('Leaflet non cargado.');
  if (map) return; // xa inicializado

  // ⚡ Canvas para render máis rápido
  map = L.map(mapContainerId, { preferCanvas: true }).setView([42.88, -8.54], 8);

  const baseMaps = {
    'Plano':  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' }),
    'Físico': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' }),
    'Toner':  L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', { attribution: '&copy; Stamen' }),
  };
  baseMaps['Físico'].addTo(map);
  L.control.layers(baseMaps).addTo(map);

  // 🔁 Carga TopoJSON e convérteo a GeoJSON
  const topo = await fetch('assets/parroquias.topo.json').then(r => r.json());
  // O obxecto no teu ficheiro chámase "parroquias"
  const geo  = topojson.feature(topo, topo.objects.parroquias);

  // Gardamos todas as features (para filtros/zoom)
  allFeatures = geo.features;

  // Capa baleira; imos enchendo en anacos para non bloquear a UI
  geoLayer = L.geoJSON(null, {
    style: defaultStyle,
    onEachFeature
  }).addTo(map);

  const CHUNK = 300;
  for (let i = 0; i < allFeatures.length; i += CHUNK) {
    geoLayer.addData({
      type: 'FeatureCollection',
      features: allFeatures.slice(i, i + CHUNK)
    });
    // cede o fío ao navegador para manter a UI fluída
    // eslint-disable-next-line no-await-in-loop
    await new Promise(r => requestAnimationFrame(r));
  }
}

function onEachFeature(feature, layer) {
  const p = feature.properties || {};
  // Popup simple; podes enlazar a templates/ se queres
  layer.bindPopup(`
    <strong>${safe(p.PARROQUIA)}</strong><br>
    Concello: ${safe(p.CONCELLO)}<br>
    Comarca: ${safe(p.COMARCA)}<br>
    Provincia: ${safe(p.PROVINCIA)}<br>
    <button class="open-par-btn" data-id="${safeAttr(p.CODPARRO)}" style="margin-top:6px">Ver pezas desta parroquia</button>
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

export function onFiltersChange({ scope }) {
  if (!geoLayer) return;
  // Sen filtro → reset estilo
  if (!scope) {
    geoLayer.eachLayer(l => l.setStyle(defaultStyle));
    return;
  }

  const [tipo, codigo] = String(scope).split(':'); // prov/com/con/par

  geoLayer.eachLayer((layer) => {
    const p = layer.feature?.properties || {};
    let match = false;
    if (tipo === 'prov') match = String(p.CODPROV)  === String(codigo);
    if (tipo === 'com')  match = String(p.CODCOM)   === String(codigo);
    if (tipo === 'con')  match = String(p.CODCONC)  === String(codigo);
    if (tipo === 'par')  match = String(p.CODPARRO) === String(codigo);
    layer.setStyle(match ? highlightStyle : defaultStyle);
  });

  // Zoom aproximado ao ámbito
  try {
    const bounds = [];
    geoLayer.eachLayer((layer) => {
      const p = layer.feature?.properties || {};
      let ok = false;
      if (tipo === 'prov') ok = String(p.CODPROV)  === String(codigo);
      if (tipo === 'com')  ok = String(p.CODCOM)   === String(codigo);
      if (tipo === 'con')  ok = String(p.CODCONC)  === String(codigo);
      if (tipo === 'par')  ok = String(p.CODPARRO) === String(codigo);
      if (ok && layer.getBounds) bounds.push(layer.getBounds());
    });
    if (bounds.length) {
      const g = bounds.reduce((acc, b) => acc ? acc.extend(b) : b);
      map.fitBounds(g.pad(0.2));
    }
  } catch (e) {
    // non pasa nada se non hai getBounds nalgunha feición
  }
}

// ---- utilidades simples ----
function safe(v){ return (v==null?'':String(v)).replace(/[&<>]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s])); }
function safeAttr(v){ return (v==null?'':String(v)).replace(/"/g,'&quot;'); }
