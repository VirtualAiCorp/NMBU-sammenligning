#!/bin/sh
# Gjenskaper hele den nasjonale programkatalogen (B1). Bruk --refresh for å hente alt på nytt fra kildene.
set -e
D="$(cd "$(dirname "$0")" && pwd)"
python3 "$D/hent-samordna.py" "$@"
python3 "$D/hent-dbh.py" "$@"
python3 "$D/hent-nus.py" "$@"
python3 "$D/bygg-katalog.py"
