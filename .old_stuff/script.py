import os

# Ruta raíz del proyecto
root_dir = os.getcwd()

# Archivo de salida
output_file = "project_structure.md"
script_name = "script.py"

# Extensiones conocidas para el formato en Markdown
language_map = {
    ".py": "python",
    ".html": "html",
    ".css": "css",
    ".js": "javascript",
    ".json": "json",
    ".md": "markdown",
    ".geojson": "json"
}

def detect_language(filename):
    """Detecta el lenguaje basado en la extensión del archivo."""
    _, ext = os.path.splitext(filename)
    return language_map.get(ext, "")  # Devuelve cadena vacía si no está en el mapa

# Recorrer el directorio
with open(output_file, "w", encoding="utf-8") as markdown_file:
    for root, _, files in os.walk(root_dir):
        for file in files:
            if file == output_file or file == script_name:  # Ignorar el archivo generado y el script
                continue
            if file.startswith("."):  # Ignorar archivos ocultos
                continue

            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, root_dir)

            # Leer contenido del archivo
            with open(file_path, "r", encoding="utf-8") as f:
                if file.endswith(".geojson") or file == "mapeo.json":
                    content = f.read(100)  # Leer solo los primeros 100 caracteres
                else:
                    content = f.read()

            # Detectar lenguaje
            language = detect_language(file)

            # Escribir en Markdown
            markdown_file.write(f"### {relative_path}\n")
            markdown_file.write(f"```{language}\n")
            markdown_file.write(content)
            markdown_file.write("\n```\n\n")

print(f"Archivo Markdown generado: {output_file}")
