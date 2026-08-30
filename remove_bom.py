import os

def remove_bom(filepath):
    with open(filepath, 'rb') as f:
        content = f.read()
    if content.startswith(b'\xef\xbb\xbf'):
        content = content[3:]
        with open(filepath, 'wb') as f:
            f.write(content)
            print(f"Removed BOM from {filepath}")
    else:
        print(f"No BOM in {filepath}")

remove_bom("src/messages/en.json")
remove_bom("src/messages/ne.json")
