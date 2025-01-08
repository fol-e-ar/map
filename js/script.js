// Espera a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    const mapContainer = document.getElementById("map-container");
    const info = document.getElementById("info");
    const searchInput = document.getElementById("concellos-search");
  
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
  
        // Evento de búsqueda
        searchInput.addEventListener("input", () => {
          const query = searchInput.value.toLowerCase();
          paths.forEach((path) => {
            const nomeConcello = path.getAttribute("data-nomeconcel").toLowerCase();
            if (nomeConcello.includes(query)) {
              path.classList.add("selected");
            } else {
              path.classList.remove("selected");
            }
          });
        });
      })
      .catch((error) => console.error("Error al cargar el SVG:", error));
  });
  