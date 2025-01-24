### generate_indices.py
```python
import os
import json
import frontmatter

def generar_indices():
    piezas = []
    coplas = []

    # Procesar piezas musicales
    for filename in os.listdir('piezas'):
        if filename.endswith('.md'):
            with open(f'piezas/{filename}', 'r') as f:
                md = frontmatter.load(f)
                piezas.append({
                    "id": str(md['id']),  # Convertir a string
                    "title": md['title'],
                    "location": str(md['location']),  # Convertir a string
                    "ritmo": md['ritmo'],
                    "content": md.content.strip()
                })

    # Procesar coplas
    for filename in os.listdir('coplas'):
        if filename.endswith('.md'):
            with open(f'coplas/{filename}', 'r') as f:
                md = frontmatter.load(f)
                coplas.append({
                    "id": str(md['id']),  # Convertir a string
                    "location": str(md['location']),  # Convertir a string
                    "content": md.content.strip()
                })

    # Guardar índices
    with open('assets/piezas.json', 'w') as f:
        json.dump(piezas, f, ensure_ascii=False, indent=2)

    with open('assets/coplas.json', 'w') as f:
        json.dump(coplas, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    generar_indices()

```

### index.html
```html
<!DOCTYPE html>
<html lang="gl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>mapa - fol e ar</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</head>
<body>
  <header>
    <div class="logo">
      <img src="assets/logo.png" alt="fol e ar" onclick="window.location.href='index.html'">
      <h1>fol e ar</h1>
    </div>
    <nav>
      <a href="about.html">Sobre Nós</a>
    </nav>
  </header>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    // Inicializa el mapa
    const map = L.map('map').setView([42.88, -8.54], 8); // Galicia

    const baseMaps = {
      'Plano minimalista': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' }),
      'Físico': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' }),
      'Só Galiza': L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', { attribution: '&copy; Stamen Design' }),
      'Callejero clásico': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }),
      'Satélite': L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }),
      'Relevo': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenTopoMap contributors' }),
      'Escuro': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' }),
      'Xeolóxico': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenTopoMap contributors' }),
    };

    const defaultBase = baseMaps['Escuro'];
    defaultBase.addTo(map);

    // Añade control de capas
    L.control.layers(baseMaps).addTo(map);

    // Define los estilos
    const defaultStyle = {
      color: '#444',
      weight: 0.25,
      fillColor: '#2a7b9b',
      fillOpacity: 0.01,
    };

    const hoverStyle = {
      fillColor: '#66d9e8',
      fillOpacity: 0.4,
    };

    // Cargar GeoJSON y añadir popups con enlaces
    fetch('assets/parroquias.geojson')
      .then((response) => response.json())
      .then((geoData) => {
        L.geoJSON(geoData, {
          style: defaultStyle,
          onEachFeature: (feature, layer) => {
            const props = feature.properties;

            // Añadir un popup con enlaces dinámicos
            layer.bindPopup(`
              <strong>Parroquia:</strong> <a href="templates/parroquia.html?id=${props.CODPARRO}">${props.PARROQUIA}</a><br>
              <strong>Concello:</strong> <a href="templates/concello.html?id=${props.CODCONC}">${props.CONCELLO}</a><br>
              <strong>Comarca:</strong> <a href="templates/comarca.html?id=${props.CODCOM}">${props.COMARCA}</a><br>
              <strong>Provincia:</strong> <a href="templates/provincia.html?id=${props.CODPROV}">${props.PROVINCIA}</a>
            `);

            // Estilo on-hover
            layer.on('mouseover', () => layer.setStyle(hoverStyle));
            layer.on('mouseout', () => layer.setStyle(defaultStyle));
          },
        }).addTo(map);
      })
      .catch((error) => console.error('Error al cargar GeoJSON:', error));
  </script>
</body>
</html>

```

### about.html
```html
<!DOCTYPE html>
<html lang="gl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sobre Nós - Tradición Oral Galega</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f5f5f7;
            color: #1d1d1f;
            line-height: 1.6;
        }

        header {
            background: #ffffff;
            border-bottom: 1px solid #d2d2d7;
            padding: 20px 0;
            text-align: center;
        }

        header h1 {
            font-size: 2rem;
            font-weight: 600;
            margin: 0;
        }

        header p {
            font-size: 1.1rem;
            color: #86868b;
            margin: 0;
            margin-top: 8px;
        }

        main {
            max-width: 700px;
            margin: 40px auto;
            padding: 0 20px;
            text-align: center;
        }

        main h2 {
            font-size: 1.8rem;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 20px;
        }

        main p {
            font-size: 1.2rem;
            margin-bottom: 20px;
            color: #424245;
        }

        footer {
            background: #f5f5f7;
            border-top: 1px solid #d2d2d7;
            padding: 20px 0;
            text-align: center;
            margin-top: 40px;
        }

        footer p {
            font-size: 1rem;
            color: #86868b;
            margin: 0;
        }

        footer a {
            color: #0071e3;
            text-decoration: none;
        }

        footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <header>
        <h1>Lorem Ipsum</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </header>

    <main>
        <h2>Lorem ipsum?</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. In condimentum facilisis porta.</p>

        <h2>Lorem ipsum</h2>
        <p>Maecenas faucibus mollis interdum. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Curabitur blandit tempus porttitor.</p>

        <h2>Lorem ipsum?</h2>
        <p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Nullam id dolor id nibh ultricies vehicula ut id elit. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>
    </main>

    <footer>
        <p>&copy; 2025 Lorem Ipsum | <a href="#">Contactus</a></p>
    </footer>
</body>


```

### coplas/001.md
```markdown
---
id: "001"
location: "1504303"
---

Copla:
Malpica ten no seu porto  
barquiños de velas brancas.

```

### coplas/002.md
```markdown
---
id: "002"
location: "1504303"
---

Copla:
AAAA Malpica ten no seu porto  
barquiños de velas brancas.

```

### css/markdown.css
```css
/* Reset básico */
body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    background-color: #ffffff;
    color: #333;
  }
  
  /* Cabecera */
  header {
    padding: 15px 20px;
    background-color: #1e293b; /* Azul oscuro */
    color: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #334155;
  }
  
  header h1 {
    margin: 0;
    font-size: 1.8rem;
    color: #e2e8f0; /* Gris claro */
  }
  
  header .logo {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  header .logo img {
    height: 50px;
    cursor: pointer;
  }
  
  header nav {
    display: flex;
    gap: 15px;
  }
  
  header nav a {
    color: #94a3b8; /* Gris medio */
    text-decoration: none;
    font-size: 1rem;
    transition: color 0.3s;
  }
  
  header nav a:hover {
    color: #f1f5f9; /* Blanco claro */
  }
  
  /* Breadcrumb */
  .breadcrumb {
    font-size: 1rem;
    margin: 15px 20px;
    color: #475569; /* Gris oscuro */
  }
  
  .breadcrumb a {
    color: #2563eb; /* Azul vibrante */
    text-decoration: none;
    transition: color 0.3s;
  }
  
  .breadcrumb a:hover {
    color: #1d4ed8; /* Azul más oscuro */
    text-decoration: underline;
  }
  
  /* Filtros */
  .filters {
    margin: 20px 20px;
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .filters label {
    font-weight: bold;
    font-size: 1rem;
    color: #1e293b; /* Azul oscuro */
  }
  
  .filters select {
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #94a3b8;
    border-radius: 5px;
    background-color: #f1f5f9;
    color: #1e293b;
  }
  
  /* Tablas */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    background-color: #f8fafc;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
  }
  
  table th, table td {
    border: none;
    padding: 15px;
    text-align: left;
  }
  
  table th {
    background-color: #1e293b; /* Azul oscuro */
    color: #ffffff;
    text-transform: uppercase;
  }
  
  table tr:nth-child(even) {
    background-color: #e2e8f0; /* Gris claro */
  }
  
  table tr:hover {
    background-color: #cbd5e1; /* Gris más claro */
  }
  
  /* Listas */
  ul {
    list-style: none;
    padding: 0;
    margin: 20px 20px;
  }
  
  ul li {
    margin: 10px 0;
    font-size: 1rem;
  }
  
  ul li a {
    color: #2563eb; /* Azul vibrante */
    text-decoration: none;
    transition: color 0.3s;
  }
  
  ul li a:hover {
    color: #1d4ed8; /* Azul más oscuro */
  }
  
  /* Footer */
  footer {
    text-align: center;
    padding: 15px 20px;
    background-color: #1e293b;
    color: #f1f5f9; /* Blanco claro */
    font-size: 0.9rem;
    position: fixed;
    bottom: 0;
    width: 100%;
  }
  
  /* Mapa */
  #map {
    width: 100%;
    height: calc(100vh - 80px); /* Ajuste para dejar espacio para la cabecera */
    margin-top: 10px;
    border: 2px solid #94a3b8; /* Borde gris */
    border-radius: 10px;
  }
  
```

### css/style.css
```css
/* Reset básico */
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  background-color: #ffffff;
  color: #333;
}

/* Cabecera */
header {
  padding: 15px 20px;
  background-color: #1e293b; /* Azul oscuro */
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #334155;
}

header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #e2e8f0; /* Gris claro */
}

header .logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

header .logo img {
  height: 50px;
  cursor: pointer;
}

header nav {
  display: flex;
  gap: 15px;
}

header nav a {
  color: #94a3b8; /* Gris medio */
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s;
}

header nav a:hover {
  color: #f1f5f9; /* Blanco claro */
}

/* Breadcrumb */
.breadcrumb {
  font-size: 1rem;
  margin: 15px 20px;
  color: #475569; /* Gris oscuro */
}

.breadcrumb a {
  color: #2563eb; /* Azul vibrante */
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb a:hover {
  color: #1d4ed8; /* Azul más oscuro */
  text-decoration: underline;
}

/* Filtros */
.filters {
  margin: 20px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.filters label {
  font-weight: bold;
  font-size: 1rem;
  color: #1e293b; /* Azul oscuro */
}

.filters select {
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #94a3b8;
  border-radius: 5px;
  background-color: #f1f5f9;
  color: #1e293b;
}

/* Tablas */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background-color: #f8fafc;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
}

table th, table td {
  border: none;
  padding: 15px;
  text-align: left;
}

table th {
  background-color: #1e293b; /* Azul oscuro */
  color: #ffffff;
  text-transform: uppercase;
}

table tr:nth-child(even) {
  background-color: #e2e8f0; /* Gris claro */
}

table tr:hover {
  background-color: #cbd5e1; /* Gris más claro */
}

/* Listas */
ul {
  list-style: none;
  padding: 0;
  margin: 20px 20px;
}

ul li {
  margin: 10px 0;
  font-size: 1rem;
}

ul li a {
  color: #2563eb; /* Azul vibrante */
  text-decoration: none;
  transition: color 0.3s;
}

ul li a:hover {
  color: #1d4ed8; /* Azul más oscuro */
}

/* Footer */
footer {
  text-align: center;
  padding: 15px 20px;
  background-color: #1e293b;
  color: #f1f5f9; /* Blanco claro */
  font-size: 0.9rem;
  position: fixed;
  bottom: 0;
  width: 100%;
}

/* Mapa */
#map {
  width: 100%;
  height: calc(100vh - 80px); /* Ajuste para dejar espacio para la cabecera */
  margin-top: 10px;
  border: 2px solid #94a3b8; /* Borde gris */
  border-radius: 10px;
}

```

### js/comarca.js
```javascript
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

```

### js/mapa.js
```javascript
// Inicializa el mapa
const map = L.map('map').setView([42.88, -8.54], 8); // Galicia

// Añade las capas base
const baseMaps = {
  'Plano minimalista': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' }),
  'Físico': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' }),
  'Só Galiza': L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', { attribution: '&copy; Stamen Design' }),
};

// Establece un basemap inicial
const defaultBase = baseMaps['Físico'];
defaultBase.addTo(map);

// Añade control de capas
L.control.layers(baseMaps).addTo(map);

// Define los estilos
const defaultStyle = {
  color: '#444',
  weight: 0.25,
  fillColor: '#2a7b9b',
  fillOpacity: 0.01,
};

const highlightedStyle = {
  color: '#444',
  weight: 0.5,
  fillColor: '#f8c102',
  fillOpacity: 0.6,
};

const hoverStyle = {
  fillColor: '#66d9e8',
  fillOpacity: 0.4,
};

// Cargar los datos de piezas para identificar ubicaciones registradas
let highlightedLocations = [];
fetch('assets/piezas.json')
  .then((response) => response.json())
  .then((data) => {
    highlightedLocations = data.map((pieza) => pieza.location);
    return fetch('assets/parroquias.geojson');
  })
  .then((response) => response.json())
  .then((geoData) => {
    L.geoJSON(geoData, {
      style: (feature) => {
        const isHighlighted = highlightedLocations.some((loc) =>
          feature.properties.CODPARRO.startsWith(loc) || feature.properties.CODCONC.startsWith(loc)
        );
        return isHighlighted ? highlightedStyle : defaultStyle;
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;

        // Añadir un popup con enlaces a las páginas de las entidades
        layer.bindPopup(`
          <strong>Parroquia:</strong> <a href="templates/parroquia.html?id=${props.CODPARRO}">${props.PARROQUIA}</a><br>
          <strong>Concello:</strong> <a href="templates/concello.html?id=${props.CODCONC}">${props.CONCELLO}</a><br>
          <strong>Comarca:</strong> <a href="templates/comarca.html?id=${props.CODCOM}">${props.COMARCA}</a><br>
          <strong>Provincia:</strong> <a href="templates/provincia.html?id=${props.CODPROV}">${props.PROVINCIA}</a>
        `);

        layer.on('mouseover', () => layer.setStyle(hoverStyle));
        layer.on('mouseout', () => layer.setStyle((feature) => {
          const isHighlighted = highlightedLocations.some((loc) =>
            feature.properties.CODPARRO.startsWith(loc) || feature.properties.CODCONC.startsWith(loc)
          );
          return isHighlighted ? highlightedStyle : defaultStyle;
        }));
      },
    }).addTo(map);
  })
  .catch((error) => console.error('Error al cargar datos o GeoJSON:', error));

```

### js/parroquia.js
```javascript
import { generateBreadcrumb, renderTable } from './utils.js';

const urlParams = new URLSearchParams(window.location.search);
const parroquiaId = urlParams.get('id');

// Cargar los datos de la parroquia
fetch('../assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const parroquia = data.find((p) => p.id === parroquiaId);
    if (parroquia) {
      generateBreadcrumb('#breadcrumb', [
        { name: parroquia.provincia, url: '../templates/provincia.html?id=' + parroquia.codigo_provincia },
        { name: parroquia.comarca, url: '../templates/comarca.html?id=' + parroquia.codigo_comarca },
        { name: parroquia.concello, url: '../templates/concello.html?id=' + parroquia.codigo_concello },
        { name: parroquia.name, url: '#' },
      ]);
      
    }
  });

// Cargar las piezas musicales asociadas
fetch('../assets/piezas.json')
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

```

### js/pieza.js
```javascript
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
        { name: parroquia.provincia, url: `../templates/provincia.html?id=${parroquia.codigo_provincia}` },
        { name: parroquia.comarca, url: `../templates/comarca.html?id=${parroquia.codigo_comarca}` },
        { name: parroquia.concello, url: `../templates/concello.html?id=${parroquia.codigo_concello}` },
        { name: parroquia.name, url: `../templates/parroquia.html?id=${parroquia.id}` },
        { name: pieza.title, url: '#' },
      ]);
    } else if (isConcello) {
      const parroquiasDelConcello = mapeo.filter((p) => p.codigo_concello === pieza.location);
      const unParroquia = parroquiasDelConcello[0]; // Usamos cualquier parroquia para obtener la información común del concello

      generateBreadcrumb('#breadcrumb', [
        { name: unParroquia.provincia, url: `../templates/provincia.html?id=${unParroquia.codigo_provincia}` },
        { name: unParroquia.comarca, url: `../templates/comarca.html?id=${unParroquia.codigo_comarca}` },
        { name: unParroquia.concello, url: `../templates/concello.html?id=${unParroquia.codigo_concello}` },
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

```

### js/utils.js
```javascript
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
  
  
```

### js/provincia.js
```javascript
import { generateBreadcrumb, renderTable } from './utils.js';

const urlParams = new URLSearchParams(window.location.search);
const provinciaId = urlParams.get('id');

// Cargar los datos de la provincia
fetch('../assets/mapeo.json')
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
fetch('../assets/mapeo.json')
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
fetch('../assets/piezas.json')
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

```

### js/concello.js
```javascript
import { generateBreadcrumb, renderTable } from './utils.js';

const urlParams = new URLSearchParams(window.location.search);
const concelloId = urlParams.get('id');

// Cargar los datos del concello
fetch('../assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const concello = data.find((c) => c.codigo_concello === concelloId);
    if (concello) {
      generateBreadcrumb('#breadcrumb', [
        { name: concello.provincia, url: `provincia.html?id=${concello.codigo_provincia}` },
        { name: concello.comarca, url: `comarca.html?id=${concello.codigo_comarca}` },
        { name: concello.concello, url: '#' },
      ]);
      document.querySelector('#concello-name').innerText = `Parroquias en ${concello.concello}`;
    } else {
      document.querySelector('#concello-name').innerText = 'Concello non atopado';
    }
  })
  .catch((error) => {
    console.error('Error ao cargar os datos do concello:', error);
    document.querySelector('#concello-name').innerText = 'Erro ao cargar o concello';
  });

// Mostrar parroquias en el concello
fetch('../assets/mapeo.json')
  .then((response) => response.json())
  .then((data) => {
    const parroquias = data.filter((p) => p.codigo_concello === concelloId);

    const list = document.querySelector('#parroquias-list');
    if (parroquias.length > 0) {
      list.innerHTML = parroquias
        .map((p) => `<li><a href="parroquia.html?id=${p.id}">${p.name}</a></li>`)
        .join('');
    } else {
      list.innerHTML = '<li>Non hai parroquias rexistradas neste concello.</li>';
    }
  })
  .catch((error) => {
    console.error('Error ao cargar as parroquias:', error);
    document.querySelector('#parroquias-list').innerHTML = '<li>Erro ao cargar as parroquias.</li>';
  });

// Mostrar piezas asociadas al concello
fetch('../assets/piezas.json')
  .then((response) => response.json())
  .then((data) => {
    const piezas = data.filter((pieza) => pieza.location.startsWith(concelloId));

    if (piezas.length > 0) {
      renderTable('#piezas-table', piezas, ['title', 'ritmo', 'id'], {
        id: (id) => `<a href="pieza.html?id=${id}">Ver</a>`,
      });
    } else {
      document.querySelector('#piezas-table tbody').innerHTML = '<tr><td colspan="3">Non hai pezas rexistradas neste concello.</td></tr>';
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

```

### templates/concello.html
```html
<!DOCTYPE html>
<html lang="gl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Concello</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="../assets/logo.png" alt="Fol e Ar" onclick="window.location.href='../index.html'">
      <h1>fol e ar</h1>
    </div>
    <nav>
      <a href="../index.html">Mapa</a>
      <a href="../about.html">Sobre Nós</a>
    </nav>
  </header>
  <nav class="breadcrumb" id="breadcrumb">
    <!-- Breadcrumb dinámico -->
  </nav>
  <section>
    <h2 id="concello-name">Parroquias en Concello</h2>
    <ul id="parroquias-list">
      <!-- As parroquias cargaranse dinámicamente -->
    </ul>
  </section>
  <section>
    <h2>Pezas Musicais</h2>
    <div class="filters">
      <label for="filter-ritmo">Filtrar por ritmo:</label>
      <select id="filter-ritmo">
        <option value="all">Todas as pezas</option>
        <option value="Muiñeira">Muiñeiras</option>
        <option value="Xota">Xotas</option>
        <!-- Engadir máis ritmos aquí -->
      </select>
    </div>
    <table id="piezas-table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Ritmo</th>
          <th>Accións</th>
        </tr>
      </thead>
      <tbody>
        <!-- Os datos cargaranse dinámicamente -->
      </tbody>
    </table>
  </section>
  <script type="module" src="../js/concello.js"></script>
</body>
</html>

```

### templates/comarca.html
```html
<!DOCTYPE html>
<html lang="gl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comarca</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="../assets/logo.png" alt="Fol e Ar" onclick="window.location.href='../index.html'">
      <h1>fol e ar</h1>
    </div>
    <nav>
      <a href="../index.html">Mapa</a>
      <a href="../about.html">Sobre Nós</a>
    </nav>
  </header>
  <nav class="breadcrumb" id="breadcrumb">
    <!-- Breadcrumb dinámico -->
  </nav>
  <section>
    <h2 id="comarca-name">Concellos en Comarca</h2>
    <ul id="concellos-list">
      <!-- Os concellos cargaranse dinámicamente -->
    </ul>
  </section>
  <section>
    <h2>Pezas Musicais</h2>
    <div class="filters">
      <label for="filter-ritmo">Filtrar por ritmo:</label>
      <select id="filter-ritmo">
        <option value="all">Todas as pezas</option>
        <option value="Muiñeira">Muiñeiras</option>
        <option value="Xota">Xotas</option>
      </select>
    </div>
    <table id="piezas-table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Ritmo</th>
          <th>Accións</th>
        </tr>
      </thead>
      <tbody>
        <!-- Os datos cargaranse dinámicamente -->
      </tbody>
    </table>
  </section>
  <script type="module" src="../js/comarca.js"></script>
</body>
</html>

```

### templates/pieza.html
```html
<!DOCTYPE html>
<html lang="gl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pieza Musical</title>
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/markdown.css"> <!-- Estilos específicos para Markdown -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script type="module" src="../js/pieza.js"></script>
</head>
<body>
  <header>
    <div class="logo">
      <img src="../assets/logo.png" alt="Fol e Ar" onclick="window.location.href='index.html'">
      <h1>fol e ar</h1>
    </div>
  </header>
  <nav class="breadcrumb" id="breadcrumb"></nav>
  <main>
    <div id="pieza-content"></div> <!-- Contenedor para el contenido de la pieza -->
  </main>
</body>
</html>

```

### templates/parroquia.html
```html
<!DOCTYPE html>
<html lang="gl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parroquia</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="../assets/logo.png" alt="Fol e Ar" onclick="window.location.href='../index.html'">
      <h1>fol e ar</h1>
    </div>
  </header>
  <nav class="breadcrumb" id="breadcrumb">
    <!-- Breadcrumb dinámico -->
  </nav>
  <section>
    <h2>Pezas Musicais</h2>
    <div class="filters">
      <label for="filter-ritmo">Filtrar por ritmo:</label>
      <select id="filter-ritmo">
        <option value="all">Todos os ritmos</option>
        <option value="muiñeira">Muiñeiras</option>
        <option value="xota">Xotas</option>
        <!-- Engadir máis ritmos aquí -->
      </select>
    </div>
    <table id="piezas-table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Ritmo</th>
          <th>Accións</th>
        </tr>
      </thead>
      <tbody>
        <!-- Os datos cargaranse dinámicamente -->
      </tbody>
    </table>
  </section>
  <script type="module" src="../js/parroquia.js"></script>
</body>
</html>

```

### templates/provincia.html
```html
<!DOCTYPE html>
<html lang="gl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Provincia</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="../assets/logo.png" alt="Fol e Ar" onclick="window.location.href='../index.html'">
      <h1>fol e ar</h1>
    </div>
    <nav>
      <a href="../index.html">Mapa</a>
      <a href="../about.html">Sobre Nós</a>
    </nav>
  </header>
  <nav class="breadcrumb" id="breadcrumb">
    <!-- Breadcrumb dinámico -->
  </nav>
  <section>
    <h2 id="provincia-name">Comarcas en Provincia</h2>
    <ul id="comarcas-list">
      <!-- As comarcas cargaranse dinámicamente -->
    </ul>
  </section>
  <section>
    <h2>Pezas Musicais</h2>
    <div class="filters">
      <label for="filter-ritmo">Filtrar por ritmo:</label>
      <select id="filter-ritmo">
        <option value="all">Todas as pezas</option>
        <option value="Muiñeira">Muiñeiras</option>
        <option value="Xota">Xotas</option>
      </select>
    </div>
    <table id="piezas-table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Ritmo</th>
          <th>Accións</th>
        </tr>
      </thead>
      <tbody>
        <!-- Os datos cargaranse dinámicamente -->
      </tbody>
    </table>
  </section>
  <script type="module" src="../js/provincia.js"></script>
</body>
</html>

```

### .git/config
```
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
	ignorecase = true
	precomposeunicode = true
[remote "origin"]
	url = git@github.com-personal:fol-e-ar/map.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main

```

### .git/HEAD
```
ref: refs/heads/main

```

### .git/description
```
Unnamed repository; edit this file 'description' to name the repository.

```

