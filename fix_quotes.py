import re

with open('C:/Users/VIKK/Downloads/Upendo/src/lib/i18n.ts', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
fixed = 0
for i, line in enumerate(lines):
    # Match lines like: key: 'value',  (single-quoted string values)
    m = re.match(r"^(\s*(?:[\w.'-]+\s*:\s*)?)'(.*)'(,?\s*)$", line)
    if m:
        prefix = m.group(1)
        value = m.group(2)
        suffix = m.group(3)
        # Check if value contains unescaped apostrophes
        if "'" in value:
            # Escape all apostrophes in the value that aren't already escaped
            new_value = re.sub(r"(?<!\\)'", "\\'", value)
            if new_value != value:
                lines[i] = f"{prefix}'{new_value}'{suffix}"
                fixed += 1

with open('C:/Users/VIKK/Downloads/Upendo/src/lib/i18n.ts', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"Fixed {fixed} lines")
