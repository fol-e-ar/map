import { generateBreadcrumb, renderTable } from './utils.js';

const urlParams = new URLSearchParams(window.location.search);
const comarcaId = urlParams.get('id');

// Cargar los datos de la comarca
fetch('../assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const comarca = data.find((c) => c.codigo_comarca === comarcaId);
    if (comarca) {
      generateBreadcrumb('#breadcrumb', [
        { name: comarca.provincia, url: `provincia.html?id=${comarca.codigo_provincia}` },
        { name: comarca.comarca, url: '#' },
      ]);
      document.querySelector('#comarca-name').innerText = `Concellos en ${comarca.comarca}`;
    } else {
      document.querySelector('#comarca-name').innerText = 'Comarca non atopada';
    }
  })
  .catch((error) => {
    console.error('Error ao cargar os datos da comarca:', error);
    document.querySelector('#comarca-name').innerText = 'Erro ao cargar a comarca.';
  });

// Mostrar concellos en la comarca
fetch('../assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const concellos = data
      .filter((p) => p.codigo_comarca === comarcaId)
      .map((p) => p.concello)
      .filter((value, index, self) => self.indexOf(value) === index) // Eliminar duplicados
      .sort(); // Ordenar alfabéticamente

    const list = document.querySelector('#concellos-list');
    if (concellos.length > 0) {
      list.innerHTML = concellos
        .map((concello) => `<li><a href="concello.html?id=${concello.codigo_concello}">${concello}</a></li>`)
        .join('');
    } else {
      list.innerHTML = '<li>Non hai concellos rexistrados nesta comarca.</li>';
    }
  })
  .catch((error) => {
    console.error('Error ao cargar os concellos:', error);
    document.querySelector('#concellos-list').innerHTML = '<li>Erro ao cargar os concellos.</li>';
  });

// Mostrar piezas asociadas a la comarca
fetch('../assets/piezas.json')
  .then((response) => response.json())
  .then((data) => {
    const piezas = data.filter((pieza) => pieza.location.startsWith(comarcaId));
    if (piezas.length > 0) {
      renderTable('#piezas-table', piezas, ['title', 'ritmo', 'id'], {
        id: (id) => `<a href="pieza.html?id=${id}">Ver</a>`,
      });
    } else {
      document.querySelector('#piezas-table tbody').innerHTML = '<tr><td colspan="3">Non hai pezas rexistradas nesta comarca.</td></tr>';
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
