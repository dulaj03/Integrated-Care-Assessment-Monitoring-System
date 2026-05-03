import os
import re

def refactor_urls(directory, config_path_relative):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if 'http://localhost:5000' in content:
                    print(f"Refactoring: {filepath}")
                    
                    # 1. Replace hardcoded URLs
                    # Case 1: 'http://localhost:5000' -> `${API_URL}`
                    content = content.replace("'http://localhost:5000", "`${API_URL}")
                    # Case 2: "http://localhost:5000" -> `${API_URL}`
                    content = content.replace('"http://localhost:5000', "`${API_URL}")
                    
                    # Fix potential mess up with existing template literals
                    content = content.replace("`${API_URL}/", "`${API_URL}/") # Ensure correct slash
                    
                    # 2. Add import if not present
                    if 'API_URL' in content and 'import { API_URL }' not in content:
                        # Find the last import line
                        lines = content.split('\n')
                        last_import_idx = -1
                        for i, line in enumerate(lines):
                            if line.strip().startswith('import '):
                                last_import_idx = i
                        
                        if last_import_idx != -1:
                            lines.insert(last_import_idx + 1, f"import {{ API_URL }} from '{config_path_relative}';")
                            content = '\n'.join(lines)
                        else:
                            content = f"import {{ API_URL }} from '{config_path_relative}';\n" + content
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)

# Refactor Frontend
refactor_urls('frontend/src', '@/app/config')
# Refactor Admin
refactor_urls('admin/src', '@/config')
