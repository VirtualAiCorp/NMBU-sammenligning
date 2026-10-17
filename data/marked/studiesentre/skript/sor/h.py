import sys, re, os, hashlib, subprocess, html
K = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'kilder', 'sor')
os.makedirs(K, exist_ok=True)
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
def navn(u):
    s = re.sub(r'^https?://', '', u)
    s = re.sub(r'[^A-Za-z0-9._-]+', '_', s)[:120]
    return s + '_' + hashlib.md5(u.encode()).hexdigest()[:6] + '.html'
def hent(u):
    p = os.path.join(K, navn(u))
    if not os.path.exists(p) or os.path.getsize(p) == 0:
        subprocess.run(['curl', '-sL', '-A', UA, '-m', '30', '--compressed', u, '-o', p])
    return p
def tekst(raw, lenker=True):
    raw = re.sub(r'(?is)<(script|style|noscript|svg|head)[^>]*>.*?</\1>', ' ', raw)
    if lenker:
        raw = re.sub(r'(?is)<a [^>]*href="([^"]*)"[^>]*>', r' [\1] ', raw)
    raw = re.sub(r'(?i)<(br|p|div|li|h\d|tr|td|th)[^>]*>', '\n', raw)
    raw = re.sub(r'<[^>]+>', ' ', raw)
    raw = html.unescape(raw)
    raw = re.sub(r'[ \t\r\f\v\xa0]+', ' ', raw)
    raw = re.sub(r'\n\s*\n+', '\n', raw)
    return raw
if __name__ == '__main__':
    args = sys.argv[1:]
    grep = None; maks = 6000; lenker = False; fra = None
    while args and args[0].startswith('--'):
        a = args.pop(0)
        if a.startswith('--maks='): maks = int(a[7:])
        elif a.startswith('--grep='): grep = a[7:]
        elif a == '--lenker': lenker = True
        elif a.startswith('--fra='): fra = a[6:]
    for u in args:
        p = hent(u)
        raw = open(p, encoding='utf-8', errors='ignore').read()
        t = tekst(raw, lenker)
        t = '\n'.join(l.strip() for l in t.split('\n') if len(l.strip()) > 1 and not re.fullmatch(r'\[[^\]]*\]', l.strip()))
        if fra:
            i = t.find(fra); t = t[i:] if i >= 0 else t
        print(f'===== {u} ({len(raw)} b)')
        if grep:
            for l in t.split('\n'):
                if re.search(grep, l, re.I): print(l[:500])
        else:
            print(t[:maks])
