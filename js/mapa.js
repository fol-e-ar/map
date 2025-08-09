// js/mapa.js
// Multicapa + popups con info superior + "Explorar aquí" (descenso de nivel y resalte)
// Contrato: initMapa({ mapContainerId }), onFiltersChange({ scope, ritmo, q })

let map;
const layers = { prov:null, com:null, con:null, par:null };
let active = 'par';
let lastHighlightScopes = [];

// Índices de relación/nombres (rellenos en loadCatalogs)
const provNameById = new Map();        // CODPROV -> PROVINCIA
const comNameById  = new Map();        // CODCOM -> COMARCA
const comProvById  = new Map();        // CODCOM -> CODPROV
const conNameById  = new Map();        // CODCONC -> CONCELLO
const conComById   = new Map();        // CODCONC -> CODCOM
const conProvById  = new Map();        // CODCONC -> CODPROV
const parConById   = new Map();        // CODPARRO -> CODCONC
const parComById   = new Map();        // CODPARRO -> CODCOM
const parProvById  = new Map();        // CODPARRO -> CODPROV

// Geo auxiliar (para fallbacks de pertenencia)
let geoParroquias = null;

const defaultStyle   = { color:'#444', weight:0.25, fillColor:'#2a7b9b', fillOpacity:0.01 };
const hoverStyle     = { fillColor:'#66d9e8', fillOpacity:0.4 };
const highlightStyle = { color:'#444', weight:0.6, fillColor:'#f8c102', fillOpacity:0.6 };

function safe(v){ return (v==null?'':String(v)).replace(/[&<>]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s])); }

async function fetchJSON(path){ const r=await fetch(path); if(!r.ok) throw new Error('Erro '+path); return r.json(); }

async function loadParroquiasAsGeoJSON() {
  try {
    const topo = await fetchJSON('assets/parroquias.topo.json');
    const name = (topo.objects && Object.keys(topo.objects)[0]) || 'parroquias';
    if (!window.topojson) throw 0;
    return window.topojson.feature(topo, topo.objects[name]);
  } catch {
    return fetchJSON('assets/parroquias.geojson');
  }
}

function featureMatchesScope(p, scope){
  if (!scope) return false;
  const [tipo, codigo] = String(scope).split(':');
  if (tipo === 'prov') return String(p.CODPROV)  === String(codigo);
  if (tipo === 'com')  return String(p.CODCOM)   === String(codigo);
  if (tipo === 'con')  return String(p.CODCONC)  === String(codigo);
  if (tipo === 'par')  return String(p.CODPARRO) === String(codigo);
  return false;
}

function applyStyleByScopes(layer, scopes){
  if (!layer) return;
  if (!scopes || !scopes.length){
    layer.eachLayer(l => l.setStyle(defaultStyle));
    return;
  }
  layer.eachLayer(l => {
    const p = l.feature?.properties || {};
    const match = scopes.some(s => featureMatchesScope(p, s));
    l.setStyle(match ? highlightStyle : defaultStyle);
  });
}

function boundsForScopes(layer, scopes){
  if (!layer || !scopes || !scopes.length) return null;
  const bs = [];
  layer.eachLayer(l => {
    const p = l.feature?.properties || {};
    if (scopes.some(s => featureMatchesScope(p,s)) && l.getBounds) bs.push(l.getBounds());
  });
  if (!bs.length) return null;
  return bs.reduce((acc, b) => acc ? acc.extend(b) : b);
}

/* ---------- Cargar catálogos e índices ---------- */
async function loadCatalogs(){
  const [prov, com, con] = await Promise.all([
    fetchJSON('assets/provincias.geojson'),
    fetchJSON('assets/comarcas.geojson'),
    fetchJSON('assets/concellos.geojson')
  ]);

  // Provincias
  (prov.features||[]).forEach(f=>{
    const p=f.properties||{};
    if (p.CODPROV!=null) provNameById.set(String(p.CODPROV), String(p.PROVINCIA||''));
  });

  // Comarcas (idealmente traen CODPROV; si no, lo inferiremos desde parroquias más abajo)
  (com.features||[]).forEach(f=>{
    const p=f.properties||{};
    if (p.CODCOM!=null){
      comNameById.set(String(p.CODCOM), String(p.COMARCA||''));
      if (p.CODPROV!=null) comProvById.set(String(p.CODCOM), String(p.CODPROV));
    }
  });

  // Concellos (idealmente traen CODCOM y CODPROV)
  (con.features||[]).forEach(f=>{
    const p=f.properties||{};
    if (p.CODCONC!=null){
      conNameById.set(String(p.CODCONC), String(p.CONCELLO||''));
      if (p.CODCOM!=null)  conComById.set(String(p.CODCONC), String(p.CODCOM));
      if (p.CODPROV!=null) conProvById.set(String(p.CODCONC), String(p.CODPROV));
    }
  });

  // Parroquias (para completar relaciones se faltan en concellos/comarcas)
  geoParroquias = await loadParroquiasAsGeoJSON();
  (geoParroquias.features||[]).forEach(f=>{
    const p=f.properties||{};
    if (p.CODPARRO!=null){
      const par = String(p.CODPARRO);
      if (p.CODCONC!=null) parConById.set(par, String(p.CODCONC));
      if (p.CODCOM!=null)  parComById.set(par, String(p.CODCOM));
      if (p.CODPROV!=null) parProvById.set(par, String(p.CODPROV));
      // Aprovechamos para inferir com->prov si faltaba (por mayoría/primera coincidencia)
      if (p.CODCOM!=null && p.CODPROV!=null && !comProvById.has(String(p.CODCOM))){
        comProvById.set(String(p.CODCOM), String(p.CODPROV));
      }
    }
  });

  // Si algún concello no tiene CODCOM/CODPROV lo inferimos por parroquias
  conNameById.forEach((_, conId)=>{
    if (!conComById.has(conId) || !conProvById.has(conId)){
      // busca parroquias de este concello
      const pars = (geoParroquias.features||[]).map(f=>f.properties||{})
        .filter(p => String(p.CODCONC||'') === conId);
      if (pars.length){
        if (!conComById.has(conId)  && pars[0].CODCOM!=null)  conComById.set(conId,  String(pars[0].CODCOM));
        if (!conProvById.has(conId) && pars[0].CODPROV!=null) conProvById.set(conId, String(pars[0].CODPROV));
      }
    }
  });
}

/* ---------- Descenso de nivel (explorar fillas) ---------- */
function childTypeOf(parentType){
  if (parentType === 'prov') return 'com';
  if (parentType === 'com')  return 'con';
  if (parentType === 'con')  return 'par';
  return null; // par non ten fillas
}

function childScopesFor(parentScope){
  const [ptype, pcode] = String(parentScope).split(':');
  const childType = childTypeOf(ptype);
  if (!childType) return { type:null, scopes:[], bounds:null };

  const layer = layers[childType];
  const scopes = [];
  const bs = [];

  if (layer){
    // Caso ideal: el child layer ya tiene las relaciones codificadas
    layer.eachLayer(l => {
      const p = l.feature?.properties || {};
      let belongs = false;
      if (ptype === 'prov') {
        // concellos y comarcas suelen llevar CODPROV; parroquias también
        if (childType === 'com') belongs = String(p.CODPROV||'')===pcode || String(comProvById.get(String(p.CODCOM)||''))===pcode;
        if (childType === 'con') belongs = String(p.CODPROV||'')===pcode || String(conProvById.get(String(p.CODCONC)||''))===pcode;
      }
      if (ptype === 'com') {
        if (childType === 'con') belongs = String(p.CODCOM||'')===pcode || String(conComById.get(String(p.CODCONC)||''))===pcode;
      }
      if (ptype === 'con') {
        if (childType === 'par') belongs = String(p.CODCONC||'')===pcode || String(parConById.get(String(p.CODPARRO)||''))===pcode;
      }

      if (belongs) {
        if (childType === 'com') scopes.push(`com:${String(p.CODCOM)}`);
        if (childType === 'con') scopes.push(`con:${String(p.CODCONC)}`);
        if (childType === 'par') scopes.push(`par:${String(p.CODPARRO)}`);
        if (l.getBounds) bs.push(l.getBounds());
      }
    });
  }

  // Fallback vía parroquias si no hay pertenencias claras en el child layer
  if (!scopes.length && geoParroquias){
    if (ptype === 'prov' && (childType === 'com' || childType === 'con')){
      const set = new Set();
      (geoParroquias.features||[]).forEach(f=>{
        const p=f.properties||{};
        if (String(p.CODPROV||'')===pcode){
          if (childType==='com' && p.CODCOM!=null) set.add(`com:${String(p.CODCOM)}`);
          if (childType==='con' && p.CODCONC!=null) set.add(`con:${String(p.CODCONC)}`);
        }
      });
      scopes.push(...set);
    }
    if (ptype === 'com' && childType === 'con'){
      const set = new Set();
      (geoParroquias.features||[]).forEach(f=>{
        const p=f.properties||{};
        if (String(p.CODCOM||'')===pcode && p.CODCONC!=null) set.add(`con:${String(p.CODCONC)}`);
      });
      scopes.push(...set);
    }
    if (ptype === 'con' && childType === 'par'){
      const set = new Set();
      (geoParroquias.features||[]).forEach(f=>{
        const p=f.properties||{};
        if (String(p.CODCONC||'')===pcode && p.CODPARRO!=null) set.add(`par:${String(p.CODPARRO)}`);
      });
      scopes.push(...set);
    }
  }

  // Bounds juntando las features que coincidan en la capa hija
  let bounds = null;
  if (layers[childType]) {
    const bs = [];
    layers[childType].eachLayer(l=>{
      const p=l.feature?.properties||{};
      const hit = scopes.some(s=>featureMatchesScope(p,s));
      if (hit && l.getBounds) bs.push(l.getBounds());
    });
    if (bs.length) bounds = bs.reduce((acc,b)=>acc?acc.extend(b):b);
  }
  return { type: childType, scopes, bounds };
}

/* ---------- Popups (tarxeta) con info superior robusta ---------- */
function lookupForPar(p){ // parroquia -> nombres superiores
  const con = parConById.get(String(p.CODPARRO||'')) || String(p.CODCONC||'');
  const com = parComById.get(String(p.CODPARRO||'')) || String(p.CODCOM||'');
  const prv = parProvById.get(String(p.CODPARRO||'')) || String(p.CODPROV||'');
  return {
    concello: conNameById.get(con) || String(p.CONCELLO||''),
    comarca:  comNameById.get(com) || String(p.COMARCA||''),
    provincia:provNameById.get(prv) || String(p.PROVINCIA||'')
  };
}
function lookupForCon(p){ // concello -> comarca/provincia
  const conId = String(p.CODCONC||'');
  const comId = conComById.get(conId) || String(p.CODCOM||'');
  const prvId = conProvById.get(conId) || String(p.CODPROV||'');
  return {
    comarca:   comNameById.get(comId) || String(p.COMARCA||''),
    provincia: provNameById.get(prvId) || String(p.PROVINCIA||'')
  };
}
function lookupForCom(p){ // comarca -> provincia
  const comId = String(p.CODCOM||'');
  const prvId = comProvById.get(comId) || String(p.CODPROV||'');
  return { provincia: provNameById.get(prvId) || String(p.PROVINCIA||'') };
}

function popupHtml(kind, p){
  if (kind === 'par'){
    const sup = lookupForPar(p);
    return `
      <div style="min-width:240px">
        <div style="font-weight:700">${safe(p.PARROQUIA)}</div>
        <div style="font-size:12px;opacity:.8">Concello: ${safe(sup.concello)}</div>
        <div style="font-size:12px;opacity:.8">Comarca: ${safe(sup.comarca)}</div>
        <div style="font-size:12px;opacity:.8">Provincia: ${safe(sup.provincia)}</div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          <button data-act="explorar" data-scope="par:${p.CODPARRO}" disabled title="A parroquia non ten unidades menores">Explorar aquí</button>
          <button data-act="pezas" data-scope="par:${p.CODPARRO}">Ver pezas (parroquia)</button>
          <button data-act="pezas-asc" data-scope="con:${parConById.get(String(p.CODPARRO))||p.CODCONC}">Ver pezas (concello)</button>
        </div>
      </div>`;
  }
  if (kind === 'con'){
    const sup = lookupForCon(p);
    return `
      <div style="min-width:240px">
        <div style="font-weight:700">${safe(conNameById.get(String(p.CODCONC)) || p.CONCELLO)}</div>
        <div style="font-size:12px;opacity:.8">Comarca: ${safe(sup.comarca)}</div>
        <div style="font-size:12px;opacity:.8">Provincia: ${safe(sup.provincia)}</div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          <button data-act="explorar" data-scope="con:${p.CODCONC}">Explorar aquí</button>
          <button data-act="pezas" data-scope="con:${p.CODCONC}">Ver pezas</button>
        </div>
      </div>`;
  }
  if (kind === 'com'){
    const sup = lookupForCom(p);
    return `
      <div style="min-width:240px">
        <div style="font-weight:700">${safe(comNameById.get(String(p.CODCOM)) || p.COMARCA)}</div>
        <div style="font-size:12px;opacity:.8">Provincia: ${safe(sup.provincia)}</div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          <button data-act="explorar" data-scope="com:${p.CODCOM}">Explorar aquí</button>
          <button data-act="pezas" data-scope="com:${p.CODCOM}">Ver pezas</button>
        </div>
      </div>`;
  }
  // prov
  return `
    <div style="min-width:240px">
      <div style="font-weight:700">${safe(provNameById.get(String(p.CODPROV)) || p.PROVINCIA)}</div>
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
        <button data-act="explorar" data-scope="prov:${p.CODPROV}">Explorar aquí</button>
        <button data-act="pezas" data-scope="prov:${p.CODPROV}">Ver pezas</button>
      </div>
    </div>`;
}

/* ---------- Handlers capa ---------- */
function attachCommonHandlers(kind){
  const layer = layers[kind];
  if (!layer) return;
  layer.eachLayer(l => {
    l.on('mouseover', () => l.setStyle(hoverStyle));
    l.on('mouseout',  () => {
      if (lastHighlightScopes.length) {
        const p = l.feature?.properties || {};
        const match = lastHighlightScopes.some(s => featureMatchesScope(p, s));
        l.setStyle(match ? highlightStyle : defaultStyle);
      } else {
        l.setStyle(defaultStyle);
      }
    });
    l.on('click', (e) => {
      const p = l.feature?.properties || {};
      l.bindPopup(popupHtml(kind, p)).openPopup(e.latlng);

      // Delegación de botóns do popup
      setTimeout(() => {
        const pop = l.getPopup()?.getElement();
        if (!pop) return;

        pop.addEventListener('click', async (ev) => {
          const btn = ev.target.closest('button[data-act][data-scope]');
          if (!btn) return;
          const act = btn.getAttribute('data-act');
          const scope = btn.getAttribute('data-scope');

          if (act === 'explorar'){
            // Descender un nivel e resaltar fillas
            const [ptype] = scope.split(':');
            const ctype = childTypeOf(ptype);
            if (!ctype) return; // parroquia non ten fillas
            await setActiveLayer(ctype);

            const { scopes, bounds } = childScopesFor(scope);
            lastHighlightScopes = scopes.slice();
            applyStyleByScopes(layers[ctype], scopes);
            if (bounds) map.fitBounds(bounds.pad(0.2));

            const sel = document.getElementById('map-layer');
            if (sel) sel.value = ctype;
          }

          if (act === 'pezas' || act === 'pezas-asc'){
            // Filtro global + zoom ao ámbito + abrir Pezas
            document.dispatchEvent(new CustomEvent('filters:change', { detail: { scope, ritmo:'', q:'' } }));
            document.dispatchEvent(new CustomEvent('map:zoom-to-scope', { detail: { scope } }));
            document.dispatchEvent(new CustomEvent('ui:switch-view', { detail: { view: 'pezas' }}));
          }
        }, { once:false });
      }, 0);
    });
  });
}

/* ---------- Build de capas ---------- */
async function buildLayer(kind){
  if (layers[kind]) return layers[kind];

  let geo;
  if (kind === 'par')  geo = geoParroquias || await loadParroquiasAsGeoJSON();
  if (kind === 'con')  geo = await fetchJSON('assets/concellos.geojson');
  if (kind === 'com')  geo = await fetchJSON('assets/comarcas.geojson');
  if (kind === 'prov') geo = await fetchJSON('assets/provincias.geojson');

  const layer = L.geoJSON(null, { style: defaultStyle, onEachFeature: () => {} });

  const feats = (geo && geo.features) ? geo.features : [];
  const CHUNK = 400;
  for (let i = 0; i < feats.length; i += CHUNK) {
    layer.addData({ type:'FeatureCollection', features: feats.slice(i, i+CHUNK) });
    // eslint-disable-next-line no-await-in-loop
    await new Promise(r => requestAnimationFrame(r));
  }

  layers[kind] = layer;
  attachCommonHandlers(kind);
  return layer;
}

async function setActiveLayer(kind){
  if (!map) return;
  if (layers[active]) map.removeLayer(layers[active]);
  active = kind;
  const layer = await buildLayer(kind);
  layer.addTo(map);

  // Re-aplicar resaltado (filtrado polo tipo activo)
  const filtered = lastHighlightScopes.filter(s => s.startsWith(active+':'));
  applyStyleByScopes(layers[active], filtered);
}

/* ---------- API ---------- */
export async function initMapa({ mapContainerId = 'map' } = {}) {
  if (!window.L) return console.warn('Leaflet non cargado.');
  if (map) return;

  // 1) Cargar catálogos/índices primero (para popups robustos)
  await loadCatalogs();

  // 2) Mapa base
  map = L.map(mapContainerId, { preferCanvas: true }).setView([42.88, -8.54], 8);
  const baseMaps = {
    'Plano':  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' }),
    'Físico': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' }),
    'Toner':  L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', { attribution: '&copy; Stamen' }),
  };
  baseMaps['Físico'].addTo(map);
  L.control.layers(baseMaps).addTo(map);

  // 3) Capa inicial
  await setActiveLayer('par');

  // 4) Selector de capa
  const select = document.getElementById('map-layer');
  if (select){
    select.addEventListener('change', async () => {
      await setActiveLayer(select.value);
    });
  }

  // 5) Resaltado en tempo real dende autocompletado
  document.addEventListener('map:highlight-candidates', (e) => {
    lastHighlightScopes = e.detail?.scopes || [];
    const filtered = lastHighlightScopes.filter(s => s.startsWith(active+':'));
    applyStyleByScopes(layers[active], filtered);
  });

  // 6) Zoom e estilo ao ámbito (desde buscador / filtros)
  document.addEventListener('map:zoom-to-scope', async (e) => {
    const scope = e.detail?.scope;
    if (!scope) return;
    const tipo = scope.split(':')[0];
    if (tipo !== active) await setActiveLayer(tipo);
    applyStyleByScopes(layers[active], [scope]);
    const b = boundsForScopes(layers[active], [scope]);
    if (b) map.fitBounds(b.pad(0.2));
  });
}

export function onFiltersChange({ scope }){
  if (!scope) {
    if (layers[active]) applyStyleByScopes(layers[active], []);
    return;
  }
  const tipo = scope.split(':')[0];
  (async () => {
    if (tipo !== active) await setActiveLayer(tipo);
    applyStyleByScopes(layers[active], [scope]);
    const b = boundsForScopes(layers[active], [scope]);
    if (b) try { map.fitBounds(b.pad(0.2)); } catch {}
  })();
}