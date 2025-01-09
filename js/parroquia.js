import { generateBreadcrumb, renderTable } from './utils.js';

const urlParams = new URLSearchParams(window.location.search);
const parroquiaId = urlParams.get('id');

// Cargar los datos de la parroquia
fetch('/assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const parroquia = data.find((p) => p.id === parroquiaId);
    if (parroquia) {
      generateBreadcrumb('#breadcrumb', [
        { name: parroquia.provincia, url: `/templates/provincia.html?id=${parroquia.codigo_provincia}` },
        { name: parroquia.comarca, url: `/templates/comarca.html?id=${parroquia.codigo_comarca}` },
        { name: parroquia.concello, url: `/templates/concello.html?id=${parroquia.codigo_concello}` },
        { name: parroquia.name, url: '#' },
      ]);
    }
  });

// Cargar las piezas musicales asociadas
fetch('/assets/piezas.json')
  .then((response) => response.json())
  .then((data) => {
    const piezas = data.filter((pieza) => pieza.location === parroquiaId);

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
