#!/usr/bin/env bash
# Kjører hele datakjeden for ett fakultet (landsam, realtek, ...):
#   opptak (SO) -> emnekarakterer (DBH) -> emnekobling -> studieplaner
# Bruk: scripts/build-faculty.sh <fakultet> [--refresh]
set -euo pipefail
FAK="${1:?fakultet mangler (landsam|realtek)}"; shift || true
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
D="$ROOT/data/$FAK"
OUT="$ROOT/kilde/src/app/data"
PY=python3

if [[ " $* " == *" --refresh "* ]] && [ -f "$D/dbh-programkart.json" ]; then
  echo "== $FAK: lokale opptak fra DBH 379 =="
  $PY "$ROOT/scripts/fill-local-admissions.py" "$FAK" | tail -1
fi
echo "== $FAK: opptak =="
$PY "$ROOT/scripts/build-landsam-data.py" \
  --programkart "$D/programkart.json" \
  --sokertall "$D/kilder/so_sokertall_programnivaa_2021-2026_hentet_2026-09-22.json" \
  --poenggrenser "$D/kilder/so_poenggrenser_2020-2026_hentet_2026-09-22.csv" \
  --out "$OUT/${FAK}AdmissionData.ts" | tail -3
$PY "$ROOT/scripts/check-landsam-data.py" "$OUT/${FAK}AdmissionData.json" | tail -1

if [ -f "$D/dbh-programkart.json" ]; then
  echo "== $FAK: emnekarakterer (DBH) =="
  $PY "$ROOT/scripts/build-landsam-courses.py" \
    --programkart "$D/programkart.json" \
    --dbh-programkart "$D/dbh-programkart.json" \
    --out "$OUT/${FAK}CourseData.ts" \
    --cache "$D/kilder/dbh-cache" "$@" | grep -E "Totalt|Skrev|ADVARSEL" || true
else
  echo "-- hopper over emnekarakterer: $D/dbh-programkart.json finnes ikke"
fi

if [ -d "$D/emnekobling" ] && ls "$D/emnekobling"/*.json >/dev/null 2>&1; then
  echo "== $FAK: emnekobling =="
  $PY "$ROOT/scripts/build-landsam-course-mapping.py" \
    --in-dir "$D/emnekobling" \
    --courses "$OUT/${FAK}CourseData.json" \
    --out "$OUT/${FAK}CourseMapping.ts" | tail -2
else
  echo "-- hopper over emnekobling: ingen filer i $D/emnekobling"
fi

if [ -d "$D/studieplaner" ] && ls "$D/studieplaner"/*.json >/dev/null 2>&1; then
  echo "== $FAK: studieplaner =="
  $PY "$ROOT/scripts/build-landsam-studyplans.py" \
    --programkart "$D/programkart.json" \
    --plans "$D/studieplaner" \
    --courses "$OUT/${FAK}CourseData.json" \
    --out "$OUT/${FAK}StudyPlanData.ts" | tail -1
else
  echo "-- hopper over studieplaner: ingen filer i $D/studieplaner"
fi
echo "== ferdig: $FAK =="
