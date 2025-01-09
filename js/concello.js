const urlParams = new URLSearchParams(window.location.search);
const concelloId = urlParams.get('id');

// Generar breadcrumb dinámico y el nombre del concello
fetch('assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const concello = data.find((p) => p.codigo_concello === concelloId);
    if (concello) {
      // Generar el breadcrumb
      document.querySelector('#breadcrumb').innerHTML = `
        <a href="provincia.html?id=${concello.codigo_provincia}">${concello.provincia}</a> >
        <a href="comarca.html?id=${concello.codigo_comarca}">${concello.comarca}</a> >
        ${concello.concello}
      `;

      // Actualizar el título del concello
      document.querySelector('#concello-name').innerText = `Parroquias en ${concello.concello}`;
    }
  });

// Mostrar parroquias en el concello
fetch('assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const parroquias = data.filter((p) => p.codigo_concello === concelloId);

    const list = document.querySelector('#parroquias-list');
    parroquias.forEach((p) => {
      const item = `<li><a href="parroquia.html?id=${p.id}">${p.name}</a></li>`;
      list.innerHTML += item;
    });
  });

// Mostrar piezas asociadas al concello o sus parroquias
fetch('assets/piezas.json')
  .then((response) => response.json())
  .then((data) => {
    const piezas = data.filter((pieza) => pieza.location.startsWith(concelloId));

    const tableBody = document.querySelector('#piezas-table tbody');
    piezas.forEach((pieza) => {
      // Usar el id para buscar y renderizar dinámicamente el contenido del archivo Markdown
      fetch(`piezas/${pieza.id}.md`)
        .then((response) => response.text())
        .then((markdown) => {
          // Obtener título y ritmo del frontmatter
          const titleMatch = markdown.match(/title:\s*(.+)/);
          const ritmoMatch = markdown.match(/ritmo:\s*(.+)/);

          const title = titleMatch ? titleMatch[1] : "Descoñecido";
          const ritmo = ritmoMatch ? ritmoMatch[1] : "Descoñecido";

          const row = `
            <tr>
              <td>${title}</td>
              <td>${ritmo}</td>
              <td><a href="pieza.html?id=${pieza.id}">Ver</a></td>
            </tr>
          `;
          tableBody.innerHTML += row;
        });
    });

    // Filtro por ritmo
    document.querySelector('#filter-ritmo').addEventListener('change', (e) => {
      const selectedRitmo = e.target.value;
      tableBody.innerHTML = ''; // Limpiar la tabla antes de aplicar el filtro

      const filtered = selectedRitmo === 'all'
        ? piezas
        : piezas.filter((pieza) => {
            // Volver a cargar el contenido Markdown para filtrar
            const markdown = fetch(`piezas/${pieza.id}.md`).then((response) => response.text());
            const ritmoMatch = markdown.match(/ritmo:\s*(.+)/);
            const ritmo = ritmoMatch ? ritmoMatch[1] : "Descoñecido";
            return ritmo === selectedRitmo;
          });

      // Renderizar las piezas filtradas
      filtered.forEach((pieza) => {
        fetch(`piezas/${pieza.id}.md`)
          .then((response) => response.text())
          .then((markdown) => {
            const titleMatch = markdown.match(/title:\s*(.+)/);
            const ritmoMatch = markdown.match(/ritmo:\s*(.+)/);

            const title = titleMatch ? titleMatch[1] : "Descoñecido";
            const ritmo = ritmoMatch ? ritmoMatch[1] : "Descoñecido";

            const row = `
              <tr>
                <td>${title}</td>
                <td>${ritmo}</td>
                <td><a href="pieza.html?id=${pieza.id}">Ver</a></td>
              </tr>
            `;
            tableBody.innerHTML += row;
          });
      });
    });
  });
