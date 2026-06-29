import os

path = 'src/renderer/components/GestorPersonajes.tsx'
try:
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
except UnicodeDecodeError:
    with open(path, 'r', encoding='utf-16') as f:
        lines = f.readlines()

for i, line in enumerate(lines):
    if "return (" in line and "styles.container" in lines[min(i+1, len(lines)-1)]:
        print(f"Main return starts at line {i+1}")
    if "{/* MODAL DE FORJA / EDICIÓN */}" in line:
        print(f"Forja starts at line {i+1}")
    if "{/* MODAL CROP PARA RECORTAR IMAGEN */}" in line or "showCropModal" in line and "ImageCropModal" in line:
        print(f"Crop starts at line {i+1}")
    if "{/* MODAL HOJA DE PERSONAJE DETALLADA */}" in line:
        print(f"Sheet starts at line {i+1}")
