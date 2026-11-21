#!/usr/bin/env python3
"""Proyecto Py: copia el contenido a app/data/ y genera un calendario .ics por idioma."""
import json
import re
import shutil
from datetime import datetime, timedelta, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DATA = RAIZ / "app" / "data"
LANGS = ["es", "en", "pt", "fr", "de"]
NOMBRE = {"es": "Proyecto Py · fechas", "en": "Proyecto Py · dates", "pt": "Proyecto Py · datas",
          "fr": "Proyecto Py · dates", "de": "Proyecto Py · Termine"}
APROX = {"es": "fecha aprox.", "en": "approx. date", "pt": "data aprox.", "fr": "date approx.", "de": "ca.-Datum"}


def esc(t):
    return t.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


def doblar(linea):
    b, partes = linea.encode("utf-8"), []
    while len(b) > 75:
        corte = 75 if not partes else 74
        while corte > 0 and (b[corte] & 0xC0) == 0x80:
            corte -= 1
        partes.append(b[:corte].decode("utf-8"))
        b = b[corte:]
    partes.append(b.decode("utf-8"))
    return "\r\n ".join(partes)


def ics(eventos, lang):
    ahora = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//proyecto-py//" + lang, "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
         "X-WR-CALNAME:" + esc(NOMBRE[lang]), "REFRESH-INTERVAL;VALUE=DURATION:PT12H", "X-PUBLISHED-TTL:PT12H"]
    for e in eventos:
        d = datetime.strptime(e["f"], "%Y-%m-%d")
        slug = re.sub(r"[^a-z0-9]+", "-", e["t"]["en"].lower())[:40]
        titulo = ("⭐ " if e.get("imp") else "") + e["t"][lang] + (f" ({APROX[lang]})" if e.get("aprox") else "")
        L += ["BEGIN:VEVENT", f"UID:{e['f']}-{slug}@proyecto-py", f"DTSTAMP:{ahora}"]
        if e.get("h"):
            h, m = map(int, e["h"].split(":"))
            ini = d + timedelta(hours=h + 5, minutes=m)  # hora de Nueva York en invierno (UTC-5)
            L += [f"DTSTART:{ini:%Y%m%dT%H%M%SZ}", f"DTEND:{ini + timedelta(hours=1):%Y%m%dT%H%M%SZ}"]
        else:
            L += [f"DTSTART;VALUE=DATE:{d:%Y%m%d}", f"DTEND;VALUE=DATE:{d + timedelta(days=1):%Y%m%d}"]
        L += ["SUMMARY:" + esc(titulo), "DESCRIPTION:" + esc(e["d"][lang]), "TRANSP:TRANSPARENT"]
        if e.get("imp"):
            L += ["BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + esc(e["t"][lang]), "TRIGGER:-P1D", "END:VALARM"]
        L.append("END:VEVENT")
    L.append("END:VCALENDAR")
    return "\r\n".join(doblar(x) for x in L) + "\r\n"


def main():
    DATA.mkdir(parents=True, exist_ok=True)
    for f in ("analisis.json", "resumenes.json", "eventos.json"):
        shutil.copy(RAIZ / "contenido" / f, DATA / f)
    eventos = json.loads((RAIZ / "contenido" / "eventos.json").read_text(encoding="utf-8"))
    for lang in LANGS:
        (DATA / f"fechas-{lang}.ics").write_text(ics(eventos, lang), encoding="utf-8", newline="")
    print("contenido copiado y", len(LANGS), "calendarios")


if __name__ == "__main__":
    main()
