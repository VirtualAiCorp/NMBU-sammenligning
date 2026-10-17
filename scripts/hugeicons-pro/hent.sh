#!/bin/zsh
# Spør etter Hugeicons-nøkkelen (vises ikke på skjermen), installerer Pro-pakkene her i mappa og skriver de valgte
# ikonene til kilde/src/app/ikoner-pro.ts. Nøkkelen lagres ingen steder; .npmrc leser den fra miljøet.
#   ./hent.sh            henter ikonene i valg.mjs
#   ./hent.sh sok hjem   lister Pro-ikoner som matcher «hjem»/«home» og lager forhåndsvisning
cd "$(dirname "$0")"
if [[ -z "$HUGEICONS_LICENSE_KEY" ]]; then
  read -rs "HUGEICONS_LICENSE_KEY?Lim inn Hugeicons-nøkkelen (Tokens-fanen på hugeicons.com) og trykk Enter: "
  echo
fi
export HUGEICONS_LICENSE_KEY
npm install --no-audit --no-fund --silent || exit 1
if [[ "$1" == "sok" ]]; then shift; node hent-ikoner.mjs --sok "$@"; else node hent-ikoner.mjs; fi
