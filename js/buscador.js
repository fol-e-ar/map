// js/buscador.js
// Contrato co index: initBuscador({ pezasListId, coplasListId, cestaCountId })
//                     applyFiltersFromUI({ scope, ritmo, q }) -> {scope,ritmo,q}

const cache = {};
const CESTA_KEY = 'fol-ear-cesta';

/* ------------------- UTILS ------------------- */
function getCesta(){ try { return JSON.parse(localStorage.getItem(CESTA_KEY)||'[]'); } catch { return []; } }
function setCesta(arr){ localStorage.setItem(CESTA_KEY, JSON.stringify(arr)); }

async function fetchJSON(path){
  if (cache[path]) return cache[path];
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Erro cargando ${path}`);
  const json = await res.json();
  cache[path] = json;
  return json;
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'&quot;'); }
function renderList(ul, rows, toHTML){ ul.innerHTML = rows.map(toHTML).join('') || '<li style="opacity:.7">Sen resultados</li>'; }

function normalize(s){ return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }

/* ------------------- MAPEO (PARA FILTRAR POR ÁMBITO) ------------------- */
function pertenceAoScopeFactory(mapeo){
  return function pertenceAoScope(location, scope){
    if (!scope) return true;
    const [tipo, codigo] = String(scope).split(':'); // prov/com/con/par

    // location pode ser CODPARRO (parroquia) OU CODCONC (concello)
    let par = mapeo.byParroquia.get(String(location));
    if (!par) {
      const cand = mapeo.byConcelloFirstParroquia.get(String(location));
      if (cand) par = cand;
    }
    if (!par) return false;

    if (tipo === 'par')  return String(par.id) === codigo;
    if (tipo === 'con')  return String(par.codigo_concello) === codigo;
    if (tipo === 'com')  return String(par.codigo_comarca)  === codigo;
    if (tipo === 'prov') return String(par.codigo_provincia)=== codigo;
    return false;
  };
}

async function buildMapeoFromParroquias(){
  let geo;
  try {
    const topo = await fetchJSON('assets/parroquias.topo.json');
    const name = (topo.objects && Object.keys(topo.objects)[0]) || 'parroquias';
    geo = (window.topojson) ? window.topojson.feature(topo, topo.objects[name]) : null;
  } catch { /* fallback abaixo */ }

  if (!geo){
    // ⚠️ Backup: se o Topo non existe
    geo = await fetchJSON('assets/parroquias.geojson');
  }

  const byParroquia = new Map();
  const byConcelloFirstParroquia = new Map();

  for (const f of (geo.features||[])){
    const p = f.properties || {};
    const item = {
      id: String(p.CODPARRO),
      codigo_concello: String(p.CODCONC),
      codigo_comarca:  String(p.CODCOM),
      codigo_provincia:String(p.CODPROV),
      name: p.PARROQUIA,
      concello: p.CONCELLO,
      comarca: p.COMARCA,
      provincia: p.PROVINCIA
    };
    if (item.id) byParroquia.set(item.id, item);
    if (item.codigo_concello && !byConcelloFirstParroquia.has(item.codigo_concello)){
      byConcelloFirstParroquia.set(item.codigo_concello, item);
    }
  }
  return { byParroquia, byConcelloFirstParroquia };
}

/* ------------------- AUTOCOMPLETADO (BUSCADOR GLOBAL) ------------------- */
async function buildIndexLugares(){
  const [provincias, comarcas, concellos] = await Promise.all([
    fetchJSON('assets/provincias.geojson'),
    fetchJSON('assets/comarcas.geojson'),
    fetchJSON('assets/concellos.geojson'),
  ]);

  let parroquiasGeo = null;
  try {
    const topo = await fetchJSON('assets/parroquias.topo.json');
    const name = (topo.objects && Object.keys(topo.objects)[0]) || 'parroquias';
    if (window.topojson) parroquiasGeo = window.topojson.feature(topo, topo.objects[name]);
  } catch(e){ /* opcional */ }

  const idx = [];
  for (const f of (provincias.features||[])) {
    const p = f.properties||{};
    idx.push({ label: `${p.PROVINCIA}`, type: 'prov', code: String(p.CODPROV), scope: `prov:${String(p.CODPROV)}` });
  }
  for (const f of (comarcas.features||[])) {
    const p = f.properties||{};
    idx.push({ label: `${p.COMARCA}`, type: 'com', code: String(p.CODCOM), scope: `com:${String(p.CODCOM)}` });
  }
  for (const f of (concellos.features||[])) {
    const p = f.properties||{};
    idx.push({ label: `${p.CONCELLO}`, type: 'con', code: String(p.CODCONC), scope: `con:${String(p.CODCONC)}` });
  }
  if (parroquiasGeo) {
    for (const f of (parroquiasGeo.features||[])) {
      const p = f.properties||{};
      idx.push({ label: `${p.PARROQUIA} — ${p.CONCELLO}`, type: 'par', code: String(p.CODPARRO), scope: `par:${String(p.CODPARRO)}` });
    }
  }
  return idx;
}

function rankCandidates(index, q){
  const qq = q.toLowerCase();
  const typeRank = { prov: 0, com: 1, con: 2, par: 3 };

  function score(item){
    const label = item.label.toLowerCase();
    if (label.startsWith(qq)) return 0;      // mellor
    if (label.includes(qq))  return 1;       // bo
    return 2;                                 // peor
  }
  // Orden: mellor score → typeRank → alfabético
  return index
    .filter(i => i.label.toLowerCase().includes(qq))
    .map(i => ({ ...i, _s: score(i) }))
    .sort((a,b) => (a._s - b._s) || (typeRank[a.type]-typeRank[b.type]) || a.label.localeCompare(b.label, 'gl'))
    .slice(0, 20);
}

function renderSuxest(ul, rows){
  ul.innerHTML = rows.map(r => `
    <li data-scope="${r.scope}" class="sux-item">
      <div>
        <strong>${escapeHtml(r.label)}</strong>
        <span class="tag" style="margin-left:6px">${r.type.toUpperCase()}</span>
      </div>
    </li>
  `).join('') || '<li style="opacity:.7">Sen resultados</li>';
}

// Cache do índice de lugares
let __lugaresIndex = null;
async function getLugaresIndex(){
  if (__lugaresIndex) return __lugaresIndex;
  __lugaresIndex = await buildIndexLugares();
  return __lugaresIndex;
}

// Export: resolver ámbito por texto libre (para botón Aplicar)
export async function findScopeByText(q){
  const idx = await getLugaresIndex();
  const nq = normalize(q||'');
  if (!nq) return null;

  // 1) comezo
  let out = idx.filter(i => normalize(i.label).startsWith(nq));
  // 2) inclusión
  if (out.length === 0) out = idx.filter(i => normalize(i.label).includes(nq));
  if (out.length === 0) return null;

  const best = out[0];
  return { scope: best.scope, label: best.label };
}

function attachAutocomplete({ inputId='lugar', listId='lugar-suxest', territorioSelectId='territorio' }){
  const inp = document.getElementById(inputId);
  const ul  = document.getElementById(listId);
  const territorioSel = document.getElementById(territorioSelectId);
  if (!inp || !ul) return;

  let index = [];
  let ready = false;

  (async () => {
    try{
      ul.innerHTML = '<li style="opacity:.6">Cargando índice…</li>';
      index = await buildIndexLugares();
      ready = true;
      ul.innerHTML = '';
    }catch(e){
      ready = false;
      ul.innerHTML = '<li style="opacity:.7;color:#f99">Erro ao cargar índices. Revisa os .geojson.</li>';
      console.error(e);
    }
  })();

  let lastQ = '';
  inp.addEventListener('input', () => {
    const q = (inp.value || '').trim();
    if (!ready || q === lastQ) return;
    lastQ = q;

    if (!q) {
      ul.innerHTML = '';
      document.dispatchEvent(new CustomEvent('map:highlight-candidates', { detail: { scopes: [] }}));
      return;
    }

    const out = rankCandidates(index, q);
    // render
    ul.innerHTML = out.map(r => `
      <li data-scope="${r.scope}" class="sux-item">
        <div><strong>${escapeHtml(r.label)}</strong> <span class="tag" style="margin-left:6px">${r.type.toUpperCase()}</span></div>
      </li>
    `).join('') || '<li style="opacity:.7">Sen resultados</li>';

    // pedir ó mapa que resalte candidatos
    const scopes = out.map(o => o.scope);
    document.dispatchEvent(new CustomEvent('map:highlight-candidates', { detail: { scopes }}));
  });

  ul.addEventListener('click', (ev) => {
    const li = ev.target.closest('li[data-scope]');
    if (!li) return;
    const scope = li.getAttribute('data-scope');

    // Aplicar ámbito ao select por consistencia
    if (territorioSel) territorioSel.value = scope;

    // Notificar filtros + centrar mapa e marcar selección
    document.dispatchEvent(new CustomEvent('filters:change', { detail: { scope, ritmo:'', q:'' } }));
    document.dispatchEvent(new CustomEvent('map:zoom-to-scope', { detail: { scope } }));

    // Limpar UI e saltar a Pezas
    ul.innerHTML = '';
    inp.value = '';
    document.dispatchEvent(new CustomEvent('ui:switch-view', { detail: { view: 'pezas' }}));
  });
}

/* ------------------- RENDER LISTAS ------------------- */
function renderPezas({ pezas, pertenceAoScope, pezasUL, scope, ritmo }){
  if (!pezasUL) return;
  const filtered = pezas.filter(p =>
    (!ritmo || p.ritmo === ritmo) &&
    pertenceAoScope(String(p.location), scope)
  );

  pezasUL.innerHTML = filtered.map(row => `
    <li data-open-peza="${encodeURIComponent(row.id)}" title="Ver peza">
      <div>
        <div><strong>${escapeHtml(row.title || '')}</strong></div>
        <div class="tag">Ritmo: ${escapeHtml(row.ritmo || '')}</div>
        <div style="font-size:12px;color:var(--muted)">Localización: ${escapeHtml(String(row.location||''))}</div>
      </div>
      <div class="actions">
        <span class="tag">Ver</span>
      </div>
    </li>
  `).join('') || '<li style="opacity:.7">Sen resultados</li>';

  pezasUL.onclick = (ev) => {
    const li = ev.target.closest('li[data-open-peza]');
    if (!li) return;
    const id = li.getAttribute('data-open-peza');
    location.href = `templates/peza.html?id=${id}`;
  };
}

function renderCoplas({ coplas, pertenceAoScope, coplasUL, scope, q, onAdd }){
  if (!coplasUL) return;
  const qlc = (q || '').toLowerCase();
  const filtered = coplas.filter(c =>
    (!qlc || String(c.texto || '').toLowerCase().includes(qlc)) &&
    pertenceAoScope(String(c.location), scope)
  );
  renderList(coplasUL, filtered, (row) => `
    <li>
      <div>
        <div>${escapeHtml(String(row.texto || '')).replace(/\n/g,'<br>')}</div>
        <div style="font-size:12px;color:var(--muted)">Localización: ${escapeHtml(String(row.location||''))}</div>
      </div>
      <div class="actions">
        <button class="tag" data-id="${escapeAttr(row.id)}">+ Engadir</button>
      </div>
    </li>
  `);
  coplasUL.onclick = (ev) => {
    const btn = ev.target.closest('button[data-id]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const item = filtered.find(x => String(x.id) === String(id));
    if (item && typeof onAdd === 'function') onAdd(item);
  };
}

/* ------------------- API EXPOSTA ------------------- */
export function applyFiltersFromUI({ scope, ritmo, q }){
  return { scope: scope?.trim() || '', ritmo: ritmo?.trim() || '', q: q?.trim() || '' };
}

export async function initBuscador({ pezasListId='pezas-list', coplasListId='coplas-list', cestaCountId='cesta-count' } = {}){
  const pezasUL  = document.getElementById(pezasListId);
  const coplasUL = document.getElementById(coplasListId);
  const cestaCount = document.getElementById(cestaCountId);

  // 1) Carga datos
  const [mapeo, pezas, coplas] = await Promise.all([
    buildMapeoFromParroquias(),
    fetchJSON('assets/pezas.json'),
    fetchJSON('assets/coplas.json'),
  ]);
  const pertenceAoScope = pertenceAoScopeFactory(mapeo);

  // 2) Estado cesta
  let cesta = getCesta();
  const updateCestaCount = () => { if (cestaCount) cestaCount.textContent = String(cesta.length); };
  updateCestaCount();

  // 3) Render inicial (sen filtros)
  renderPezas({ pezas, pertenceAoScope, pezasUL, scope:'', ritmo:'' });
  renderCoplas({ coplas, pertenceAoScope, coplasUL, scope:'', q:'', onAdd: (item) => {
    cesta.push(item);
    setCesta(cesta);
    updateCestaCount();
  }});

  // 4) Reaccionar a filtros globais
  document.addEventListener('filters:change', (e) => {
    const { scope, ritmo, q } = e.detail || {};
    renderPezas({ pezas, pertenceAoScope, pezasUL, scope, ritmo });
    renderCoplas({ coplas, pertenceAoScope, coplasUL, scope, q, onAdd: (item) => {
      cesta.push(item);
      setCesta(cesta);
      updateCestaCount();
    }});
  });

  // 5) Autocompletado global (buscador de lugares)
  attachAutocomplete({ inputId:'lugar', listId:'lugar-suxest' });

  // 6) Botóns da cesta
  const btnSave  = document.getElementById('cesta-save');
  const btnClear = document.getElementById('cesta-clear');
  const btnPdf   = document.getElementById('cesta-pdf');

  btnSave?.addEventListener('click', () => {
    setCesta(cesta);
    updateCestaCount();
    alert('Cesta gardada no navegador.');
  });
  btnClear?.addEventListener('click', () => {
    cesta = [];
    setCesta(cesta);
    updateCestaCount();
  });
  btnPdf?.addEventListener('click', async () => {
    alert('PDF: pendente de implementar con jsPDF.');
  });
}