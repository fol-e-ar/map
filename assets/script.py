import json
import csv

# Archivos de entrada y salida
input_file = "mapeo.json"
output_file = "mapeo.csv"

# Leer el archivo JSON
with open(input_file, "r", encoding="utf-8") as json_file:
    mapeo = json.load(json_file)

# Preparar los datos para el CSV
rows = []
for comarca, comarca_data in mapeo.items():
    codigo_comarca = comarca_data["codigo"]
    for concello, concello_data in comarca_data["concellos"].items():
        codigo_concello = concello_data["codigo"]
        for parroquia, codigo_parroquia in concello_data["parroquias"].items():
            rows.append([comarca, codigo_comarca, concello, codigo_concello, parroquia, codigo_parroquia])

# Escribir los datos en un archivo CSV
with open(output_file, "w", encoding="utf-8", newline="") as csv_file:
    writer = csv.writer(csv_file)
    # Escribir la cabecera
    writer.writerow(["Comarca", "Código Comarca", "Concello", "Código Concello", "Parroquia", "Código Parroquia"])
    # Escribir las filas
    writer.writerows(rows)

print(f"Archivo '{output_file}' generado con éxito.")
