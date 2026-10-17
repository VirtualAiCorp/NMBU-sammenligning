import sys, pypdf
r = pypdf.PdfReader(sys.argv[1])
for i, p in enumerate(r.pages):
    print(f'--- side {i+1}')
    print(p.extract_text())
