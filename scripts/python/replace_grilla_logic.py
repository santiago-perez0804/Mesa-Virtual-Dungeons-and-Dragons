import os

path = 'src/renderer/components/GrillaCombate.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# We want to replace everything between:
# "export const CombatGrid = ({ socket, userRole, currentUser, boardTokens, characters, monsters, chatMessages, compendium = [], onOpenCharacterSheet, onOpenMonsterSheet }: any) => {\n"
# and
# "  return (\n    <div style={{ display: 'flex'"

start_marker = "export const CombatGrid = ({ socket, userRole, currentUser, boardTokens, characters, monsters, chatMessages, compendium = [], onOpenCharacterSheet, onOpenMonsterSheet }: any) => {\n"
end_marker = "  return (\n    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)', position: 'relative' }}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers")
    exit(1)

with open(r'C:\Users\Sapo\.gemini\antigravity-ide\brain\c0bb6948-16d6-458c-ab91-76fb651c38a1\scratch\hooks.txt', 'r', encoding='utf-8') as f:
    hooks_content = f.read()

new_content = content[:start_idx + len(start_marker)] + hooks_content + "\n" + content[end_idx:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replaced logic in GrillaCombate.tsx")
