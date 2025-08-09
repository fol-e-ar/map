// js/buscador.js
// Contrato: initBuscador({ pezasListId, coplasListId, cestaCountId })
//           applyFiltersFromUI({ scope, ritmo, q }) -> retorna o mesmo (ou normalizado)

const cache = {};
const CESTA_KEY = 'fol-ear-cesta';

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

function pertenceAoScopeFactory(mapeo){
  return function pertenceAoScope(location, scope){
    if (!scope) return true;
    const [tipo, codigo] = String(scope).split(':'); // prov/com/con/par
    // buscar parroquia (id) ou calquera parroquia do concello (codigo_concello)
    let par = mapeo.find(p => String(p.id) === String(location));
    if (!par) par = mapeo.find(p => String(p.codigo_concello) === String(location));
    if (!par) return false;

    if (tipo === 'par')  return String(par.id) === codigo;
    if (tipo === 'con')  return String(par.codigo_concello) === codigo;
    if (tipo === 'com')  return String(par.codigo_comarca)  === codigo;
    if (tipo === 'prov') return String(par.codigo_provincia)=== codigo;
    return false;
  };
}

function renderList(ul, rows, toHTML){
  ul.innerHTML = rows.map(toHTML).join('') || '<li style="opacity:.7">Sen resultados</li>';
}

export function applyFiltersFromUI({ scope, ritmo, q }){
  // lugar ideal para normalizar (p.ex. uppercase nos códigos, trim, etc.)
  return { scope: scope?.trim() || '', ritmo: ritmo?.trim() || '', q: q?.trim() || '' };
}

export async function initBuscador({ pezasListId='pezas-list', coplasListId='coplas-list', cestaCountId='cesta-count' } = {}){
  const pezasUL  = document.getElementById(pezasListId);
  const coplasUL = document.getElementById(coplasListId);
  const cestaCount = document.getElementById(cestaCountId);

  // carga datos (cachea)
  const [mapeo, pezas, coplas] = await Promise.all([
    fetchJSON('assets/parroquias.geojson').then(g => {
      // mapeo rápido a partir das propiedades do GeoJSON (se tes un mapeo.json propio, cámbiao aquí)
      const feats = g.features || [];
      return feats.map(f => {
        const p = f.properties || {};
        return {
          id: String(p.CODPARRO),
          name: p.PARROQUIA,
          concello: p.CONCELLO,
          codigo_concello: String(p.CODCONC),
          comarca: p.COMARCA,
          codigo_comarca: String(p.CODCOM),
          provincia: p.PROVINCIA,
          codigo_provincia: String(p.CODPROV)
        };
      });
    }),
    fetchJSON('assets/pezas.json'),
    fetchJSON('assets/coplas.json'),
  ]);

  const pertenceAoScope = pertenceAoScopeFactory(mapeo);

  // estado cesta
  let cesta = getCesta();
  const updateCestaCount = () => { if (cestaCount) cestaCount.textContent = String(cesta.length); };
  updateCestaCount();

  // Render inicial (sen filtros)
  renderPezas({ pezas, pertenceAoScope, pezasUL, scope:'', ritmo:'' });
  renderCoplas({ coplas, pertenceAoScope, coplasUL, scope:'', q:'', onAdd: (item) => {
    cesta.push(item);
    setCesta(cesta);
    updateCestaCount();
  }});

  // Reaccionar a filtros globais
  document.addEventListener('filters:change', (e) => {
    const { scope, ritmo, q } = e.detail || {};
    renderPezas({ pezas, pertenceAoScope, pezasUL, scope, ritmo });
    renderCoplas({ coplas, pertenceAoScope, coplasUL, scope, q, onAdd: (item) => {
      cesta.push(item);
      setCesta(cesta);
      updateCestaCount();
    }});
  });

  // Botóns da cesta (se existen)
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
    // Integración futura con jsPDF: cargar lib e xerar
    alert('PDF: pendente de implementar con jsPDF.');
  });
}

/* --------- helpers de render --------- */
function renderPezas({ pezas, pertenceAoScope, pezasUL, scope, ritmo }){
  if (!pezasUL) return;
  const filtered = pezas.filter(p =>
    (!ritmo || p.ritmo === ritmo) &&
    pertenceAoScope(String(p.location), scope)
  );
  renderList(pezasUL, filtered, (row) => `
    <li>
      <div>
        <div><strong>${escapeHtml(row.title || '')}</strong></div>
        <div class="tag">Ritmo: ${escapeHtml(row.ritmo || '')}</div>
        <div style="font-size:12px;color:var(--muted)">Localización: ${escapeHtml(String(row.location||''))}</div>
      </div>
      <div class="actions">
        <a href="templates/parroquia.html?id=${encodeURIComponent(row.location)}">Ver parroquia</a>
      </div>
    </li>
  `);
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
        <div>${escapeHtml(String(row.texto || '')).replace(/\\n/g,'<br>')}</div>
        <div style="font-size:12px;color:var(--muted)">Localización: ${escapeHtml(String(row.location||''))}</div>
      </div>
      <div class="actions">
        <button class="tag" data-id="${escapeAttr(row.id)}">+ Engadir</button>
      </div>
    </li>
  `);

  // Delegación para botóns "+ Engadir"
  coplasUL.onclick = (ev) => {
    const btn = ev.target.closest('button[data-id]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const item = filtered.find(x => String(x.id) === String(id));
    if (item && typeof onAdd === 'function') onAdd(item);
  };
}

/* --------- utils --------- */
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function escapeAttr(s){ return escapeHtml(s).replace(/"/g, '&quot;'); }
