#!/usr/bin/env python3
"""Lager det lette nordiske kartgrunnlaget til fanen «Kart» i rangeringen (07.10.2026).

Kilde: Natural Earth 1:50m Admin 0 – Countries (offentlig eiendom, https://www.naturalearthdata.com/about/terms-of-use/),
i TopoJSON-utgaven world-atlas 2.0.2 (ISC-lisens, Mike Bostock, https://github.com/topojson/world-atlas):
  https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json  (ca. 740 kB, lastes ned til en midlertidig mappe)

Skriptet dekoder TopoJSON, tar med Norge, Sverige, Danmark og Finland (med Åland) som fokusland og nabolandene som
bakgrunn, klipper til et rektangel rundt Norden (fokusland: lengde -2–40°, bredde 53–72°, så Svalbard og Jan Mayen faller ut; nabolandene i en større ramme),
forenkler med Douglas–Peucker og runder til to desimaler (ca. 1 km). Resultatet er en liten GeoJSON i lengde/bredde
(WGS84) som tegnes som innebygd SVG i nettleseren, uten kartfliser og uten kall til tredjeparter.

Bruk:
  curl -sSfL -o /tmp/countries-50m.json https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json
  python3 scripts/rangering/lag_nordenkart.py /tmp/countries-50m.json
  → kilde/src/app/components/rangering/norden-kart.json
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
UT = ROOT / "kilde" / "src" / "app" / "components" / "rangering" / "norden-kart.json"

FOKUS = {"Norway": "NO", "Sweden": "SE", "Denmark": "DK", "Finland": "FI", "Åland": "FI"}
NABO = {"Estonia": "EE", "Latvia": "LV", "Lithuania": "LT", "Russia": "RU", "Belarus": "BY", "Poland": "PL",
        "Germany": "DE", "Netherlands": "NL", "United Kingdom": "GB"}
BOKS = (-2.0, 53.0, 40.0, 72.0)  # lon0, lat0, lon1, lat1 (fokusland: Svalbard og Jan Mayen faller ut)
BOKS_NABO = (-12.0, 47.0, 62.0, 77.0)  # større, så klippekantene havner utenfor alle utsnittene
TOL = {"fokus": 0.02, "nabo": 0.06}
MIN_AREAL = {"fokus": 0.004, "nabo": 0.05}  # grader², små øyer faller ut


def dekod(topo):
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    arcs = []
    for a in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in a:
            x += dx; y += dy
            pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)

    def ring(ids):
        pts = []
        for i in ids:
            seg = arcs[i] if i >= 0 else arcs[~i][::-1]
            pts.extend(seg if not pts else seg[1:])
        return pts
    return ring


def klipp(pts, boks):
    """Sutherland–Hodgman mot et rektangel i lengde/bredde."""
    x0, y0, x1, y1 = boks
    kanter = [(lambda p: p[0] >= x0, lambda a, b: (x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / (b[0] - a[0]))),
              (lambda p: p[0] <= x1, lambda a, b: (x1, a[1] + (b[1] - a[1]) * (x1 - a[0]) / (b[0] - a[0]))),
              (lambda p: p[1] >= y0, lambda a, b: (a[0] + (b[0] - a[0]) * (y0 - a[1]) / (b[1] - a[1]), y0)),
              (lambda p: p[1] <= y1, lambda a, b: (a[0] + (b[0] - a[0]) * (y1 - a[1]) / (b[1] - a[1]), y1))]
    for inne, snitt in kanter:
        if not pts:
            break
        ut = []
        for i, b in enumerate(pts):
            a = pts[i - 1]
            if inne(b):
                if not inne(a):
                    ut.append(snitt(a, b))
                ut.append(b)
            elif inne(a):
                ut.append(snitt(a, b))
        pts = ut
    return pts


def dp(pts, tol):
    if len(pts) < 4:
        return pts
    def avst(p, a, b):
        (x, y), (x1, y1), (x2, y2) = p, a, b
        dx, dy = x2 - x1, y2 - y1
        if dx == dy == 0:
            return ((x - x1) ** 2 + (y - y1) ** 2) ** .5
        t = max(0, min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
        return ((x - x1 - t * dx) ** 2 + (y - y1 - t * dy) ** 2) ** .5
    behold = [False] * len(pts); behold[0] = behold[-1] = True
    stakk = [(0, len(pts) - 1)]
    while stakk:
        i, j = stakk.pop()
        m, dm = None, tol
        for k in range(i + 1, j):
            d = avst(pts[k], pts[i], pts[j])
            if d > dm:
                m, dm = k, d
        if m is not None:
            behold[m] = True
            stakk += [(i, m), (m, j)]
    return [p for p, b in zip(pts, behold) if b]


def areal(pts):
    return abs(sum(pts[i - 1][0] * p[1] - p[0] * pts[i - 1][1] for i, p in enumerate(pts))) / 2


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    topo = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    ring = dekod(topo)
    land = {}
    for g in topo["objects"]["countries"]["geometries"]:
        navn = g.get("properties", {}).get("name")
        kode = FOKUS.get(navn) or NABO.get(navn)
        if not kode:
            continue
        typ = "fokus" if navn in FOKUS else "nabo"
        polys = g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]
        for poly in polys:
            ringer = []
            for k, r in enumerate(poly):
                # Russland krysser datolinja: flytt vestlige lengdegrader til +360 før klipping
                pts = klipp([(x + 360 if x < -100 else x, y) for x, y in ring(r)], BOKS if typ == "fokus" else BOKS_NABO)
                if len(pts) < 3 or (k == 0 and areal(pts) < MIN_AREAL[typ]):
                    if k == 0:
                        break
                    continue
                pts = dp(pts + [pts[0]], TOL[typ])
                if len(pts) < 4:
                    continue
                ringer.append([[round(x, 2), round(y, 2)] for x, y in pts])
            if ringer:
                land.setdefault((kode, typ), []).append(ringer)
    features = [{"type": "Feature", "properties": {"land": k, "rolle": t}, "geometry": {"type": "MultiPolygon", "coordinates": p}}
                for (k, t), p in sorted(land.items(), key=lambda x: (x[0][1] != "nabo", x[0][0]))]
    gj = {"type": "FeatureCollection",
          "kilde": "Natural Earth 1:50m Admin 0 – Countries (offentlig eiendom) via world-atlas 2.0.2 (ISC, Mike Bostock); "
                   "klippet, forenklet og avrundet av scripts/rangering/lag_nordenkart.py",
          "features": features}
    UT.parent.mkdir(parents=True, exist_ok=True)
    UT.write_text(json.dumps(gj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    n = sum(len(r) for f in features for p in f["geometry"]["coordinates"] for r in p)
    print(f"Skrev {UT.relative_to(ROOT)}: {len(features)} land, {n} punkter, {UT.stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
