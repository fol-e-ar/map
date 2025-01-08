// Espera a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const mapContainer = document.getElementById("map-container");
  const info = document.getElementById("info");
  const searchInput = document.getElementById("concellos-search");
  const viewSelector = document.getElementById("view-selector");

  // Cargar el SVG en el contenedor
  fetch("assets/parroquias_def.svg")
    .then((response) => response.text())
    .then((svgContent) => {
      // Inserta el contenido del SVG en el contenedor
      mapContainer.innerHTML = svgContent;

      // Seleccionar todos los paths dentro del mapa
      const paths = mapContainer.querySelectorAll("path");

      // Evento para mostrar info al pasar el ratón
      paths.forEach((path) => {
        path.addEventListener("mouseenter", () => {
          const nomeParroquia = path.getAttribute("data-parroquia");
          const nomeConcello = path.getAttribute("data-nomeconcel");
          const nomeComarca = path.getAttribute("data-comarca");
          info.textContent = `Parroquia: ${nomeParroquia} | Concello: ${nomeConcello} | Comarca: ${nomeComarca}`;
          path.classList.add("selected");
        });

        path.addEventListener("mouseleave", () => {
          info.textContent = "Pasa o rato sobre unha parroquia...";
          path.classList.remove("selected");
        });
      });

      // Evento de búsqueda dinámica según la vista seleccionada
      searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const view = viewSelector.value; // parroquia, concello, comarca
        const attributeMap = {
          parroquia: "data-parroquia",
          concello: "data-nomeconcel",
          comarca: "data-comarca",
        };
        const attribute = attributeMap[view];

        // Reiniciar todas las selecciones
        paths.forEach((path) => path.classList.remove("selected"));

        // Aplicar selección basada en la búsqueda
        paths.forEach((path) => {
          const name = path.getAttribute(attribute)?.toLowerCase();
          if (name && name.includes(query)) {
            if (view === "comarca") {
              // Seleccionar todos los elementos de la misma comarca
              const targetComarca = path.getAttribute("data-comarca");
              paths.forEach((p) => {
                if (p.getAttribute("data-comarca") === targetComarca) {
                  p.classList.add("selected");
                }
              });
            } else if (view === "concello") {
              // Seleccionar todos los elementos del mismo concello
              const targetConcello = path.getAttribute("data-nomeconcel");
              paths.forEach((p) => {
                if (p.getAttribute("data-nomeconcel") === targetConcello) {
                  p.classList.add("selected");
                }
              });
            } else {
              // Seleccionar elementos específicos (parroquia)
              path.classList.add("selected");
            }
          }
        });
      });

      // Evento para cambiar la vista (Parroquias, Concellos, Comarcas)
      viewSelector.addEventListener("change", () => {
        // Resetear selección al cambiar de vista
        searchInput.value = "";
        info.textContent = "Pasa o rato sobre unha parroquia...";
        paths.forEach((path) => {
          path.classList.remove("selected");
        });
      });
    })
    .catch((error) => console.error("Error al cargar el SVG:", error));
});
