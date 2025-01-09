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
