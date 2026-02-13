import os
import re

# Paths
CHAR_INFO_PATH = r"c:\Users\Dimka\Desktop\PGRBuilder\Char_Info.txt"
WEAPONS_DIR = r"c:\Users\Dimka\Desktop\PGRBuilder\Image\Weapons"

# 1. Parse Char_Info.txt to get official weapon names
official_names = []
try:
    with open(CHAR_INFO_PATH, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('/')
            if len(parts) >= 6: # Format: Name/Rank/Element/Class/Weapon/...
                weapon = parts[4].strip()
                official_names.append(weapon)
                # Split dual weapons if needed? (e.g. Illuminare / Plasma)
                # The user mapped these as keys, but file usually matches first one.
                # Let's keep it simple for now or split by slash if file search fails.
except Exception as e:
    print(f"Error reading Char_Info.txt: {e}")
    exit()

print(f"Found {len(official_names)} official weapon names.")

# 2. Scan Directory
existing_files = os.listdir(WEAPONS_DIR)
# Map normalized name (lowercase, no spaces, no special chars) to real filename
file_map = {}
for f in existing_files:
    if f.lower().endswith('.png'):
        # Create a "fingerprint" for the file: wolf_fang.png -> wolffang
        fingerprint = re.sub(r'[^a-z0-9]', '', f.lower().replace('.png', ''))
        file_map[fingerprint] = f

# 3. Rename and Generate Map
js_mapping = []
renamed_count = 0

for official in official_names:
    # Handle multiple weapons like "Illuminare / Plasma"
    # We treat them as separate keys in mapping, but link to the same file (usually the first one).
    
    sub_weapons = [w.strip() for w in official.split('/')]
    primary_weapon = sub_weapons[0] # The one determining the filename
    
    # Fingerprint for primary
    target_fingerprint = re.sub(r'[^a-z0-9]', '', primary_weapon.lower())
    
    # Find file
    found_file = file_map.get(target_fingerprint)
    
    if found_file:
        target_filename = f"{primary_weapon}.png"
        
        # Rename if case/spacing mismatches
        if found_file != target_filename:
            try:
                # src = os.path.join(WEAPONS_DIR, found_file)
                # dst = os.path.join(WEAPONS_DIR, target_filename)
                # os.rename(src, dst)
                # print(f"Renamed: {found_file} -> {target_filename}")
                # renamed_count += 1
                # found_file = target_filename # Update for mapping
                pass
            except Exception as e:
                print(f"Failed to rename {found_file}: {e}")
        
        # Generate Map Entry
        # For EACH sub-weapon in the string (e.g. "Aurorsa", "Light"), map to the primary file
        for sub in sub_weapons:
            key = sub.lower()
            # Escape quotes if any
            path = f"Image/Weapons/{found_file}"
            js_mapping.append(f'            "{key}": "{path}",')
            
    else:
        print(f"WARNING: File not found for {primary_weapon} (Expected fingerprint: {target_fingerprint})")

# 4. Output Code Block
print("\nJS MAPPING CODE:")
print("\n".join(js_mapping))
