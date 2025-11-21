import codecs

# Read the CSS file
with codecs.open(r'f:\MEGA\UNNE\Licenciatura en Sistemas\Materias\Quinto Año\IA\Tema1\tp1_prototipo\frontend\style.css', 'r', 'utf-8-sig') as f:
    lines = f.readlines()

# Find and fix the section
output_lines = []
skip_empty_braces = False

for i, line in enumerate(lines):
    # Skip lines 186-187 and 199 (0-indexed: 185-186, 198)
    if i in [185, 186, 198]:
        continue
    
    # After .stat-label closing brace (line 184, index 183), insert .stat-value
    if i == 184:
        output_lines.append(line)
        output_lines.append('\r\n')
        output_lines.append('.stat-value {\r\n')
        output_lines.append('    font-size: 1.25rem;\r\n')
        output_lines.append('    font-weight: 700;\r\n')
        output_lines.append('}\r\n')
        continue
    
    output_lines.append(line)

# Write back
with codecs.open(r'f:\MEGA\UNNE\Licenciatura en Sistemas\Materias\Quinto Año\IA\Tema1\tp1_prototipo\frontend\style.css', 'w', 'utf-8-sig') as f:
    f.writelines(output_lines)

print("CSS fixed!")
