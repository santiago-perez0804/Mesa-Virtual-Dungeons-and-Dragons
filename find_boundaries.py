import os

path = 'src/renderer/components/GestorPersonajes.tsx'
try:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
except UnicodeDecodeError:
    with open(path, 'r', encoding='utf-16') as f:
        content = f.read()

idx_return = content.find("  return (\n    <div style={{")
if idx_return == -1:
    idx_return = content.find("  return (")

idx_forja_start = content.find("{/* MODAL DE FORJA / EDICIÓN */}")
idx_crop_modal_start = content.find("{/* MODAL CROP PARA RECORTAR IMAGEN */}")
if idx_crop_modal_start == -1:
    idx_crop_modal_start = content.find("showCropModal") - 100 # Approx

idx_sheet_detailed_start = content.find("{/* MODAL HOJA DE PERSONAJE DETALLADA */}")

print(f"return: {idx_return}")
print(f"forja: {idx_forja_start}")
print(f"crop: {idx_crop_modal_start}")
print(f"sheet: {idx_sheet_detailed_start}")
