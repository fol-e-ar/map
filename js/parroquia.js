const urlParams = new URLSearchParams(window.location.search);
const parroquiaId = urlParams.get('id');

fetch('assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    // Encuentra la parroquia por el ID
    const parroquia = data.find((p) => p.id === parroquiaId);
    if (parroquia) {
      // Generar el breadcrumb
      document.querySelector('#breadcrumb').innerHTML = `
        <a href="provincia.html?id=${parroquia.codigo_provincia}">${parroquia.provincia}</a> >
        <a href="comarca.html?id=${parroquia.codigo_comarca}">${parroquia.comarca}</a> >
        <a href="concello.html?id=${parroquia.codigo_concello}">${parroquia.concello}</a> >
        ${parroquia.name}
      `;
    } else {
      document.querySelector('#breadcrumb').innerHTML = '<p>Parroquia non atopada.</p>';
    }
  });

// Mostrar piezas asociadas a la parroquia
fetch('assets/piezas.json')
  .then((response) => response.json())
  .then((data) => {
    const piezas = data.filter((pieza) => pieza.location === parroquiaId);

    const tableBody = document.querySelector('#piezas-table tbody');
    piezas.forEach((pieza) => {
      const row = `
        <tr>
          <td>${pieza.title}</td>
          <td>${pieza.ritmo}</td>
          <td><a href="pieza.html?id=${pieza.id}">Ver</a></td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });

    // Filtro por ritmo
    document.querySelector('#filter-ritmo').addEventListener('change', (e) => {
      const selectedRitmo = e.target.value;
      const filtered = selectedRitmo === 'all' ? piezas : piezas.filter((p) => p.ritmo === selectedRitmo);

      tableBody.innerHTML = '';
      filtered.forEach((pieza) => {
        const row = `
          <tr>
            <td>${pieza.title}</td>
            <td>${pieza.ritmo}</td>
            <td><a href="pieza.html?id=${pieza.id}">Ver</a></td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
    });
  });
