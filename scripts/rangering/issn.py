"""Felles ISSN-hjelper: normaliserer til NNNN-NNNX og sjekker kontrollsiffer."""
import re

def normaliser(verdi):
    """Returnerer ISSN på formen NNNN-NNNX, eller '' hvis ugyldig/tom."""
    if verdi is None:
        return ''
    s = re.sub(r'[^0-9Xx]', '', str(verdi)).upper()
    if len(s) == 7 and s.isdigit():
        s = '0' + s  # Excel kan ha spist en ledende null
    if len(s) != 8 or not s[:7].isdigit():
        return ''
    if not gyldig(s):
        return ''
    return f'{s[:4]}-{s[4:]}'

def gyldig(s8):
    sum_ = sum(int(c) * (8 - i) for i, c in enumerate(s8[:7]))
    kontroll = (11 - sum_ % 11) % 11
    k = 'X' if kontroll == 10 else str(kontroll)
    return s8[7] == k
