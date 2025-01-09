// Generar breadcrumbs dinámicos
export function generateBreadcrumb(elementId, breadcrumbData) {
    const isLocal = location.hostname === 'localhost' || location.hostname === '[::]';
    const basePath = isLocal ? '' : '/map';
  
    const breadcrumb = breadcrumbData
      .map(({ name, url }) => `<a href="${basePath}/${url}">${name}</a>`)
      .join(' > ');
  
    document.querySelector(elementId).innerHTML = breadcrumb;
  }

  
  // Filtrar datos
  export function filterData(data, key, value) {
    return value === 'all' ? data : data.filter((item) => item[key] === value);
  }
  
  // Renderizar tabla
    export function renderTable(tableId, data, columns, columnOverrides = {}) {
        const tableBody = document.querySelector(`${tableId} tbody`);
        tableBody.innerHTML = '';
        data.forEach((row) => {
        const rowHtml = columns
            .map((col) =>
            columnOverrides[col]
                ? `<td>${columnOverrides[col](row[col], row)}</td>` // Usa el override si está definido
                : `<td>${row[col]}</td>` // Renderiza texto normal si no
            )
            .join('');
        tableBody.innerHTML += `<tr>${rowHtml}</tr>`;
        });
    }
  
  