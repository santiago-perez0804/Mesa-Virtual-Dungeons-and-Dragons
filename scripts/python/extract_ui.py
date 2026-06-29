import os

path = 'src/renderer/components/GrillaCombate.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def get_chunk(start_str, end_str):
    start = -1
    end = -1
    for i, line in enumerate(lines):
        if start_str in line and start == -1:
            start = i
        if start != -1 and end_str in line:
            end = i
            break
    if end == -1 and start != -1:
        end = len(lines)
    if start == -1: return ""
    return "".join(lines[start:end])

toolbar = get_chunk("{/* TOOLBAR SUPERIOR */}", "{/* CONTENEDOR PRINCIPAL */}")
sidebar = get_chunk("{/* PANEL LATERAL (COMBATIENTES / OBJETOS) */}", "{/* ÁREA DE GRILLA (VIEWPORT) */}")
if not sidebar:
    sidebar = get_chunk("{/* Panel Combatientes */}", "{/* ÁREA DE GRILLA (VIEWPORT) */}")
    if not sidebar:
        sidebar = get_chunk("width: isSidebarOpen ? '320px' : '0px'", "{/* ÁREA DE GRILLA (VIEWPORT) */}")

board = get_chunk("{/* ÁREA DE GRILLA (VIEWPORT) */}", "{/* MODAL DETALLE DE COMBATIENTE */}")
modals = get_chunk("{/* MODAL DETALLE DE COMBATIENTE */}", "</div>\n  );\n};")

print(f"Toolbar: {len(toolbar.split(chr(10)))} lines")
print(f"Sidebar: {len(sidebar.split(chr(10)))} lines")
print(f"Board: {len(board.split(chr(10)))} lines")
print(f"Modals: {len(modals.split(chr(10)))} lines")
