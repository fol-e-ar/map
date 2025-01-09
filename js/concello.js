import { generateBreadcrumb, renderTable } from './utils.js';

const urlParams = new URLSearchParams(window.location.search);
const concelloId = urlParams.get('id');

// Cargar los datos del concello
fetch('/map/assets/mapeo.json')
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
    }
  });

// Mostrar parroquias en el concello
fetch('/map/assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const parroquias = data.filter((p) => p.codigo_concello === concelloId);

    const list = document.querySelector('#parroquias-list');
    list.innerHTML = parroquias
      .map((p) => `<li><a href="parroquia.html?id=${p.id}">${p.name}</a></li>`)
      .join('');
  });

// Mostrar piezas asociadas al concello
fetch('assets/piezas.json')
  .then((response) => response.json())
  .then((data) => {
    const piezas = data.filter((pieza) => pieza.location.startsWith(concelloId));

    // Renderizar la tabla con un override para la columna "id"
    renderTable('#piezas-table', piezas, ['title', 'ritmo', 'id'], {
      id: (id) => `<a href="pieza.html?id=${id}">Ver</a>`, // Personaliza la columna "id"
    });

    // Filtro de ritmos
    document.querySelector('#filter-ritmo').addEventListener('change', (e) => {
      const selectedRitmo = e.target.value;
      const filtered = piezas.filter((pieza) => selectedRitmo === 'all' || pieza.ritmo === selectedRitmo);
      renderTable('#piezas-table', filtered, ['title', 'ritmo', 'id'], {
        id: (id) => `<a href="pieza.html?id=${id}">Ver</a>`,
      });
    });
  });

