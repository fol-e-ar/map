import { generateBreadcrumb } from './utils.js';

const urlParams = new URLSearchParams(window.location.search);
const piezaId = urlParams.get('id');

const piezasJsonUrl = '/map/assets/piezas.json'; // Rutas relativas
const mapeoJsonUrl = '/map/assets/mapeo.json'; // Rutas relativas

console.log('Pieza ID:', piezaId);
console.log('Piezas JSON URL:', piezasJsonUrl);

fetch(piezasJsonUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }
    return response.json();
  })
  .then((piezas) => {
    const pieza = piezas.find((p) => p.id === piezaId);
    console.log('Pieza encontrada:', pieza);

    if (!pieza) {
      throw new Error(`Pieza con ID ${piezaId} no encontrada`);
    }

    const piezaMarkdownUrl = `/map/piezas/${pieza.id}.md`; // Ruta relativa para el Markdown
    console.log('URL Markdown:', piezaMarkdownUrl);

    return Promise.all([fetch(piezaMarkdownUrl).then((res) => res.text()), pieza]);
  })
  .then(([markdown, pieza]) => {
    console.log('Contenido Markdown antes de procesar:', markdown);

    // Eliminar encabezado YAML
    const markdownSinEncabezado = markdown.replace(/^---[\s\S]*?---\n/, '');
    console.log('Contenido Markdown sin encabezado:', markdownSinEncabezado);

    // Convertir Markdown a HTML
    const html = marked.parse(markdownSinEncabezado);
    document.querySelector('#pieza-content').innerHTML = html;

    return fetch(mapeoJsonUrl)
      .then((response) => response.json())
      .then((mapeo) => ({ mapeo, pieza }));
  })
  .then(({ mapeo, pieza }) => {
    const isParroquia = mapeo.some((p) => p.id === pieza.location);
    const isConcello = mapeo.some((p) => p.codigo_concello === pieza.location);

    if (isParroquia) {
      const parroquia = mapeo.find((p) => p.id === pieza.location);
      generateBreadcrumb('#breadcrumb', [
        { name: parroquia.provincia, url: `/map/templates/provincia.html?id=${parroquia.codigo_provincia}` },
        { name: parroquia.comarca, url: `/map/templates/comarca.html?id=${parroquia.codigo_comarca}` },
        { name: parroquia.concello, url: `/map/templates/concello.html?id=${parroquia.codigo_concello}` },
        { name: parroquia.name, url: `/map/templates/parroquia.html?id=${parroquia.id}` },
        { name: pieza.title, url: '#' },
      ]);
    } else if (isConcello) {
      const parroquiasDelConcello = mapeo.filter((p) => p.codigo_concello === pieza.location);
      const unParroquia = parroquiasDelConcello[0]; // Usamos cualquier parroquia para obtener la información común del concello

      generateBreadcrumb('#breadcrumb', [
        { name: unParroquia.provincia, url: `/map/templates/provincia.html?id=${unParroquia.codigo_provincia}` },
        { name: unParroquia.comarca, url: `/map/templates/comarca.html?id=${unParroquia.codigo_comarca}` },
        { name: unParroquia.concello, url: `/map/templates/concello.html?id=${unParroquia.codigo_concello}` },
        { name: pieza.title, url: '#' },
      ]);
    } else {
      throw new Error(`Ubicación con ID ${pieza.location} no encontrada en el mapeo.`);
    }
  })
  .catch((error) => {
    console.error('Error al cargar la pieza:', error);
    document.querySelector('#pieza-content').innerText =
      'Ocurrió un error al cargar la pieza o su ubicación. Por favor, intenta nuevamente.';
  });
