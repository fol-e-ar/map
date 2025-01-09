import { generateBreadcrumb } from './utils.js';

const urlParams = new URLSearchParams(window.location.search);
const piezaId = urlParams.get('id');

console.log('Pieza ID:', piezaId); // Verifica si la URL tiene el ID correcto

fetch('/assets/piezas.json')
  .then((response) => response.json())
  .then((data) => {
    const pieza = data.find((p) => p.id === piezaId);
    console.log('Pieza encontrada:', pieza); // Asegúrate de que se encuentra la pieza correcta

    if (pieza) {
      // Cargar el archivo Markdown correspondiente
      return fetch(`/piezas/${pieza.id}.md`)
        .then((response) => response.text())
        .then((markdown) => {
          console.log('Contenido Markdown:', markdown); // Verifica si se carga el contenido del archivo
          
          // Usa marked para convertir a HTML
          const html = marked.parse(markdown);
          document.querySelector('#pieza-content').innerHTML = html;

          // Generar breadcrumb
          generateBreadcrumb('#breadcrumb', [
            { name: 'Provincia', url: `/templates/provincia.html?id=15` },
            { name: 'Comarca', url: `/templates/comarca.html?id=1501` },
            { name: 'Concello', url: `/templates/concello.html?id=150101` },
            { name: 'Parroquia', url: `/templates/parroquia.html?id=15010101` },
            { name: pieza.title, url: '#' },
          ]);
        });
    } else {
      document.querySelector('#pieza-content').innerText = 'Pieza no encontrada.';
    }
  })
  .catch((error) => {
    console.error('Error al cargar la pieza:', error);
    document.querySelector('#pieza-content').innerText = 'Ocurrió un error al cargar la pieza.';
  });
