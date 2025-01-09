import { generateBreadcrumb } from './utils.js';

const urlParams = new URLSearchParams(window.location.search);
const piezaId = urlParams.get('id');

const piezasJsonUrl = '../assets/piezas.json'; // Rutas relativas
const mapeoJsonUrl = '../assets/mapeo.json'; // Rutas relativas

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

    const piezaMarkdownUrl = `../piezas/${pieza.id}.md`; // Ruta relativa para el Markdown
    console.log('URL Markdown:', piezaMarkdownUrl);

    return Promise.all([fetch(piezaMarkdownUrl).then((res) => res.text()), pieza]);
  })
  .then(([markdown, pieza]) => {
    console.log('Contenido Markdown:', markdown);
    const html = marked.parse(markdown);
    document.querySelector('#pieza-content').innerHTML = html;

    return fetch(mapeoJsonUrl)
      .then((response) => response.json())
      .then((mapeo) => ({ mapeo, pieza }));
  })
  .then(({ mapeo, pieza }) => {
    const parroquia = mapeo.find((p) => p.id === pieza.location);
    if (!parroquia) {
      throw new Error(`Parroquia con ID ${pieza.location} no encontrada`);
    }

    // Construir breadcrumb con rutas relativas
    generateBreadcrumb('#breadcrumb', [
      { name: parroquia.provincia, url: `../templates/provincia.html?id=${parroquia.codigo_provincia}` },
      { name: parroquia.comarca, url: `../templates/comarca.html?id=${parroquia.codigo_comarca}` },
      { name: parroquia.concello, url: `../templates/concello.html?id=${parroquia.codigo_concello}` },
      { name: parroquia.name, url: `../templates/parroquia.html?id=${parroquia.id}` },
      { name: pieza.title, url: '#' },
    ]);
  })
  .catch((error) => {
    console.error('Error al cargar la pieza:', error);
    document.querySelector('#pieza-content').innerText = 'Ocurrió un error al cargar la pieza.';
  });
