### concello.html
```html
<!DOCTYPE html>
<html lang="gl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Concello</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="assets/logo.png" alt="Fol e Ar" onclick="window.location.href=''">
      <h1>Fol e Ar</h1>
    </div>
    <nav>
      <a href="index.html">Mapa</a>
      <a href="about.html">Sobre Nós</a>
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
  <script src="/js/concello.js"></script>
</body>
</html>

```

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
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cancionero Tradicional Gallego</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</head>
<body>
  <header>
    <h1>Cancionero Tradicional Gallego</h1>
    <nav>
      <input type="search" id="search-bar" placeholder="Busca una parroquia, concello o comarca...">
      <select id="view-mode">
        <option value="parroquias">Modo Parroquias</option>
        <option value="concellos">Modo Concellos</option>
        <option value="comarcas">Modo Comarcas</option>
      </select>
    </nav>
  </header>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="/js/mapa.js"></script>
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
        <h1>Sobre Nós</h1>
        <p>A nosa paixón pola tradición oral galega</p>
    </header>

    <main>
        <h2>Quen somos?</h2>
        <p>Somos un grupo de persoas apaixonadas pola riqueza cultural de Galicia. Apreciamos as coplas, lendas e contos que forman parte da nosa tradición oral e queremos axudar a preservalos.</p>

        <h2>O noso obxectivo</h2>
        <p>Construír un repositorio único que recolla e documente a distribución xeográfica das pezas tradicionais galegas. Queremos que este espazo sexa útil para toda a comunidade e promova o coñecemento e a valoración do noso patrimonio cultural.</p>

        <h2>Por que o facemos?</h2>
        <p>A tradición oral é un tesouro que merece ser coidado e transmitido. Ao rexistrarmos estas pezas, non só honramos o pasado, senón que tamén aseguramos que futuras xeracións poidan desfrutar e aprender delas.</p>
    </main>

    <footer>
        <p>&copy; 2025 Tradición Oral Galega | <a href="#">Contacta connosco</a></p>
    </footer>
</body>
</html>

```

### comarca.html
```html

```

### parroquia.html
```html
<!DOCTYPE html>
<html lang="gl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parroquia</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header>
    <div class="logo">
      <img src="assets/logo.png" alt="Fol e Ar" onclick="window.location.href='index.html'">
      <h1>Fol e Ar</h1>
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
  <script src="/js/parroquia.js"></script>
</body>
</html>

```

### provincia.html
```html

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

const hoverStyle = {
  fillColor: '#66d9e8',
  fillOpacity: 0.4,
};

// Cargar el GeoJSON reproyectado
fetch('/assets/parroquias.geojson')
  .then((response) => response.json())
  .then((geoData) => {
    L.geoJSON(geoData, {
      style: defaultStyle,
      onEachFeature: (feature, layer) => {
        const props = feature.properties;

        // Añadir un popup con enlaces a las páginas de las entidades
        layer.bindPopup(`
          <strong>Parroquia:</strong> <a href="parroquia.html?id=${props.CODPARRO}">${props.PARROQUIA}</a><br>
          <strong>Concello:</strong> <a href="concello.html?id=${props.CODCONC}">${props.CONCELLO}</a><br>
          <strong>Comarca:</strong> <a href="comarca.html?id=${props.CODCOM}">${props.COMARCA}</a><br>
          <strong>Provincia:</strong> <a href="provincia.html?id=${props.CODPROV}">${props.PROVINCIA}</a>
        `);

        layer.on('mouseover', () => layer.setStyle(hoverStyle));
        layer.on('mouseout', () => layer.setStyle(defaultStyle));
      },
    }).addTo(map);
  })
  .catch((error) => console.error('Error al cargar GeoJSON:', error));

```

### js/parroquia.js
```javascript
const urlParams = new URLSearchParams(window.location.search);
const parroquiaId = urlParams.get('id');

fetch('/assets/mapeo.json')
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
fetch('/assets/piezas.json')
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

```

### js/script.js
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
  color: '#444',          // Color de las líneas de las fronteras
  weight: 0.25,           // Grosor de las líneas
  fillColor: '#2a7b9b',   // Color de relleno
  fillOpacity: 0.01,      // Transparencia del relleno
};

const hoverStyle = {
  fillColor: '#66d9e8',   // Color de relleno en hover
  fillOpacity: 0.4,       // Transparencia en hover
};

// Cargar el GeoJSON reproyectado
fetch('/assets/parroquias.geojson')
  .then((response) => response.json())
  .then((geoData) => {
    // Añadir las parroquias al mapa
    L.geoJSON(geoData, {
      style: defaultStyle, // Aplica el estilo inicial a todas las parroquias
      onEachFeature: (feature, layer) => {
        const props = feature.properties;

        // Añadir un popup con información
        layer.bindPopup(`
          <strong>Parroquia:</strong> ${props.PARROQUIA}<br>
          <strong>Concello:</strong> ${props.CONCELLO}<br>
          <strong>Comarca:</strong> ${props.COMARCA}<br>
          <strong>Provincia:</strong> ${props.PROVINCIA}
        `);

        // Cambiar el estilo al pasar el ratón
        layer.on('mouseover', () => layer.setStyle(hoverStyle));

        // Restaurar el estilo original al salir el ratón
        layer.on('mouseout', () => layer.setStyle(defaultStyle));
      },
    }).addTo(map);
  })
  .catch((error) => console.error('Error al cargar GeoJSON:', error));

```

### js/concello.js
```javascript
const urlParams = new URLSearchParams(window.location.search);
const concelloId = urlParams.get('id');

// Generar breadcrumb dinámico y el nombre del concello
fetch('/assets/mapeo.json')
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
fetch('/assets/mapeo.json')
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
fetch('/assets/piezas.json')
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

```

### templates/concello.html
```html

```

### templates/comarca.html
```html

```

### templates/parroquia.html
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parroquia</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <div id="contenido"></div>

  <script>
    const urlParams = new URLSearchParams(window.location.search);
    const parroquiaId = urlParams.get('id');

    fetch('/assets/mapeo.json')
      .then((response) => response.json())
      .then((data) => {
        const parroquia = data.find((p) => p.id === parroquiaId);
        if (parroquia) {
          document.getElementById('contenido').innerHTML = `
            <h1>${parroquia.name}</h1>
            <p><strong>Concello:</strong> <a href="concello.html?id=${parroquia.codigo_concello}">${parroquia.concello}</a></p>
            <p><strong>Comarca:</strong> <a href="comarca.html?id=${parroquia.codigo_comarca}">${parroquia.comarca}</a></p>
            <p><strong>Provincia:</strong> <a href="provincia.html?id=${parroquia.codigo_provincia}">${parroquia.provincia}</a></p>
          `;
        } else {
          document.getElementById('contenido').innerHTML = '<p>Parroquia no encontrada.</p>';
        }
      })
      .catch((error) => console.error('Error al cargar mapeo.json:', error));
  </script>
</body>
</html>

```

### templates/provincia.html
```html

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

