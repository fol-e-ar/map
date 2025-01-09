import { generateBreadcrumb, renderTable } from './utils.js';

const urlParams = new URLSearchParams(window.location.search);
const concelloId = urlParams.get('id');

// Cargar los datos del concello
fetch('../assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const concello = data.find((c) => c.codigo_concello === concelloId);
    if (concello) {
      generateBreadcrumb('#breadcrumb', [
        { name: concello.provincia, url: `provincia.html?id=${concello.codigo_provincia}` },
        { name: concello.comarca, url: `comarca.html?id=${concello.codigo_comarca}` },
        { name: concello.concello, url: '#' },
      ]);
      document.querySelector('#concello-name').innerText = `Parroquias en ${concello.concello}`;
    } else {
      document.querySelector('#concello-name').innerText = 'Concello non atopado';
    }
  })
  .catch((error) => {
    console.error('Error ao cargar os datos do concello:', error);
    document.querySelector('#concello-name').innerText = 'Erro ao cargar o concello';
  });

// Mostrar parroquias en el concello
fetch('../assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const parroquias = data.filter((p) => p.codigo_concello === concelloId);

    const list = document.querySelector('#parroquias-list');
    if (parroquias.length > 0) {
      list.innerHTML = parroquias
        .map((p) => `<li><a href="parroquia.html?id=${p.id}">${p.name}</a></li>`)
        .join('');
    } else {
      list.innerHTML = '<li>Non hai parroquias rexistradas neste concello.</li>';
    }
  })
  .catch((error) => {
    console.error('Error ao cargar as parroquias:', error);
    document.querySelector('#parroquias-list').innerHTML = '<li>Erro ao cargar as parroquias.</li>';
  });

// Mostrar piezas asociadas al concello
fetch('../assets/piezas.json')
  .then((response) => response.json())
  .then((data) => {
    const piezas = data.filter((pieza) => pieza.location.startsWith(concelloId));

    if (piezas.length > 0) {
      renderTable('#piezas-table', piezas, ['title', 'ritmo', 'id'], {
        id: (id) => `<a href="pieza.html?id=${id}">Ver</a>`,
      });
    } else {
      document.querySelector('#piezas-table tbody').innerHTML = '<tr><td colspan="3">Non hai pezas rexistradas neste concello.</td></tr>';
    }

    // Filtro de ritmos
    document.querySelector('#filter-ritmo').addEventListener('change', (e) => {
      const selectedRitmo = e.target.value;
      const filtered = piezas.filter((pieza) => selectedRitmo === 'all' || pieza.ritmo === selectedRitmo);
      renderTable('#piezas-table', filtered, ['title', 'ritmo', 'id'], {
        id: (id) => `<a href="pieza.html?id=${id}">Ver</a>`,
      });
    });
  })
  .catch((error) => {
    console.error('Error ao cargar as pezas:', error);
    document.querySelector('#piezas-table tbody').innerHTML = '<tr><td colspan="3">Erro ao cargar as pezas.</td></tr>';
  });
