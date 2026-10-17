"""Felles hjelper for DBH-API (hentJSONTabellData) med cache i ../kilder/. Høflig: ett kall om gangen + pause."""
import gzip, json, os, ssl, time, urllib.request
API = "https://dbh-data.dataporten-api.no/Tabeller/hentJSONTabellData"
KILDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "kilder")

def _ctx():
    try:
        return ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    except Exception:
        return ssl.create_default_context()

def hent(body, navn, refresh=False):
    """Henter og cacher DBH-svar gzip-komprimert i kilder/dbh/<navn>.json.gz."""
    path = os.path.join(KILDER, "dbh", navn + ".json.gz")
    if os.path.exists(path) and not refresh:
        return json.load(gzip.open(path, "rt", encoding="utf-8"))["data"]
    os.makedirs(os.path.dirname(path), exist_ok=True)
    req = urllib.request.Request(API, data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
                                 headers={"Content-Type": "application/json"})
    for forsok in range(3):
        try:
            with urllib.request.urlopen(req, timeout=300, context=_ctx()) as r:
                raw = r.read().decode("utf-8").strip()
            break
        except Exception as e:
            if forsok == 2:
                raise
            time.sleep(5)
    data = json.loads(raw) if raw else []
    with gzip.open(path, "wt", encoding="utf-8") as f:
        json.dump({"hentet": time.strftime("%Y-%m-%d"), "api": API, "sporring": body, "data": data}, f, ensure_ascii=False)
    time.sleep(1.0)
    return data

def body(tid, filters, group_by=None, variabler=None):
    b = {"tabell_id": tid, "api_versjon": 1, "statuslinje": "N", "kodetekst": "J", "desimal_separator": ".", "filter": filters}
    if group_by:
        b["groupBy"] = group_by
    if variabler:
        b["variabler"] = variabler
    return b

def item(var, values):
    return {"variabel": var, "selection": {"filter": "item", "values": list(values)}}

def like(var, values):
    return {"variabel": var, "selection": {"filter": "like", "values": list(values)}}
