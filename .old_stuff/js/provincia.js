import { generateBreadcrumb, renderTable } from './utils.js';

const urlParams = new URLSearchParams(window.location.search);
const provinciaId = urlParams.get('id');

// Cargar los datos de la provincia
fetch('/map/assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const provincia = data.find((p) => p.codigo_provincia === provinciaId);
    if (provincia) {
      generateBreadcrumb('#breadcrumb', [
        { name: provincia.provincia, url: '#' },
      ]);
      document.querySelector('#provincia-name').innerText = `Comarcas en ${provincia.provincia}`;
    } else {
      document.querySelector('#provincia-name').innerText = 'Provincia non atopada';
    }
  })
  .catch((error) => {
    console.error('Error ao cargar os datos da provincia:', error);
    document.querySelector('#provincia-name').innerText = 'Erro ao cargar a provincia.';
  });

// Mostrar comarcas en la provincia
fetch('/map/assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const comarcas = data
      .filter((p) => p.codigo_provincia === provinciaId)
      .map((p) => p.comarca)
      .filter((value, index, self) => self.indexOf(value) === index); // Eliminar duplicados

    const list = document.querySelector('#comarcas-list');
    if (comarcas.length > 0) {
      list.innerHTML = comarcas
        .map((comarca) => `<li><a href="comarca.html?id=${comarca.codigo_comarca}">${comarca}</a></li>`)
        .join('');
    } else {
      list.innerHTML = '<li>Non hai comarcas rexistradas nesta provincia.</li>';
    }
  })
  .catch((error) => {
    console.error('Error ao cargar as comarcas:', error);
    document.querySelector('#comarcas-list').innerHTML = '<li>Erro ao cargar as comarcas.</li>';
  });

// Mostrar piezas asociadas a la provincia
fetch('/map/assets/piezas.json')
  .then((response) => response.json())
  .then((data) => {
    const piezas = data.filter((pieza) => pieza.location.startsWith(provinciaId));
    if (piezas.length > 0) {
      renderTable('#piezas-table', piezas, ['title', 'ritmo', 'id'], {
        id: (id) => `<a href="pieza.html?id=${id}">Ver</a>`,
      });
    } else {
      document.querySelector('#piezas-table tbody').innerHTML = '<tr><td colspan="3">Non hai pezas rexistradas nesta provincia.</td></tr>';
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
