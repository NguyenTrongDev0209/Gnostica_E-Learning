import os
import glob
import re

files = glob.glob('src/pages/instructor/**/*.jsx', recursive=True)
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove unused imports
    content = re.sub(r'import\s*\{\s*useFormContext,\s*useWatch,\s*useFieldArray\s*\}\s*from\s*[\'"]react-hook-form[\'"];\n?', '', content)
    content = re.sub(r'import\s*\{\s*toast\s*\}\s*from\s*[\'"]sonner[\'"];\n?', '', content)
    content = re.sub(r'import\s*courseService\s*from\s*[\'"]@/services/course/courseService[\'"];\n?', '', content)
    content = re.sub(r'import\s*\{\s*useParams\s*\}\s*from\s*[\'"]react-router-dom[\'"];\n?', '', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done fixing simple unused imports via Python.")
