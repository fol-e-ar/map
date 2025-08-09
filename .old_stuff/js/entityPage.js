import { generateBreadcrumb, renderTable } from './utils.js';

// Identificar tipo de entidad (provincia, comarca, concello, parroquia)
const ENTITY_TYPE = document.body.dataset.entityType; // "provincia", "comarca", etc.
const ENTITY_ID = new URLSearchParams(window.location.search).get('id');

// Configuración según el tipo de entidad
const ENTITY_CONFIG = {
  provincia: {
    titleKey: 'provincia',
    childKey: 'codigo_comarca',
    childName: 'Comarcas',
    listUrl: '/map/templates/comarca.html',
  },
  comarca: {
    titleKey: 'comarca',
    childKey: 'codigo_concello',
    childName: 'Concellos',
    listUrl: '/map/templates/concello.html',
  },
  concello: {
    titleKey: 'concello',
    childKey: 'id',
    childName: 'Parroquias',
    listUrl: '/map/templates/parroquia.html',
  },
  parroquia: {
    titleKey: 'name',
    childKey: null,
    childName: 'Piezas',
  },
};

// Verificar que la configuración existe para el tipo actual
const config = ENTITY_CONFIG[ENTITY_TYPE];
if (!config) {
  console.error(`Tipo de entidad desconocido: ${ENTITY_TYPE}`);
}

// Cargar datos y renderizar
fetch('/map/assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const entity = data.find((item) => item[config.titleKey] === ENTITY_ID);
    if (!entity) {
      throw new Error(`Entidad no encontrada para ID: ${ENTITY_ID}`);
    }

    // Generar breadcrumb
    generateBreadcrumb('#breadcrumb', buildBreadcrumb(entity));

    // Actualizar el título
    document.querySelector('#entity-name').innerText = `${config.childName} en ${entity[config.titleKey]}`;

    // Cargar lista de entidades hijas (o piezas si es parroquia)
    if (config.childKey) {
      const children = data.filter((item) => item[config.childKey] === ENTITY_ID);
      renderList(children, config.listUrl);
    } else {
      // Caso de parroquias: cargar piezas
      fetch('/map/assets/piezas.json')
        .then((response) => response.json())
        .then((piezas) => {
          const filteredPiezas = piezas.filter((pieza) => pieza.location === ENTITY_ID);
          renderTable('#piezas-table', filteredPiezas, ['title', 'ritmo', 'id'], {
            id: (id) => `<a href="/map/templates/pieza.html?id=${id}">Ver</a>`,
          });
        });
    }
  })
  .catch((error) => {
    console.error('Error al cargar datos:', error);
    document.querySelector('#entity-name').innerText = 'Error ao cargar os datos.';
  });

// Generar breadcrumb dinámico
function buildBreadcrumb(entity) {
  const breadcrumb = [];
  if (entity.codigo_provincia) {
    breadcrumb.push({ name: entity.provincia, url: `/map/templates/provincia.html?id=${entity.codigo_provincia}` });
  }
  if (entity.codigo_comarca) {
    breadcrumb.push({ name: entity.comarca, url: `/map/templates/comarca.html?id=${entity.codigo_comarca}` });
  }
  if (entity.codigo_concello) {
    breadcrumb.push({ name: entity.concello, url: `/map/templates/concello.html?id=${entity.codigo_concello}` });
  }
  breadcrumb.push({ name: entity[config.titleKey], url: '#' });
  return breadcrumb;
}

// Renderizar lista de entidades hijas
function renderList(items, baseUrl) {
  const listContainer = document.querySelector('#data-list');
  if (items.length > 0) {
    listContainer.innerHTML = items
      .map((item) => `<li><a href="${baseUrl}?id=${item.codigo_comarca || item.codigo_concello || item.id}">${item.name || item.comarca || item.concello}</a></li>`)
      .join('');
  } else {
    listContainer.innerHTML = '<li>Non hai elementos rexistrados nesta entidade.</li>';
  }
}
