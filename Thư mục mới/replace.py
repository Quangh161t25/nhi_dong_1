import os, glob

for f in glob.glob('*.html'):
    if not os.path.isfile(f): continue
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            
        old_content = content
        
        content = content.replace('setAttribute("stroke", "blue")', 'setAttribute("stroke", "red")')
        content = content.replace('--line: #0000ff;', '--line: red;')
        content = content.replace('--line: #d64d4d;', '--line: red;')
        
        if old_content != content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(content)
            # print safe ascii only
            print('Updated a file')
    except Exception as e:
        print('Error reading a file')
