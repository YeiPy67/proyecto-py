#!/usr/bin/env python3
"""Proyecto Py: historia larga y mensual para la máquina del tiempo y el video de las cinco personas.

Cada serie es un índice de "retorno total": cuánto vale lo invertido si los dividendos se reinvierten.
- VOO (S&P 500): datos de Robert Shiller desde 1871 (precio + dividendos), y desde 2023 el propio VOO.
- QQQ: antes de 1999 se usa el índice Nasdaq-100 (^NDX).
- El resto: Yahoo mensual ajustado por dividendos, desde 1985 o desde que existe.
No hace falta correrlo seguido: la app completa los últimos días con mercado.json.
Uso: historia.py
"""
import csv
import io
import json
import time
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

from datos import SIMBOLOS
from proveedores import pedir

SALIDA = Path(__file__).resolve().parent.parent / "app" / "data" / "historia.json"
SHILLER = "https://datahub.io/core/s-and-p-500/_r/-/data/data.csv"
SALTAR = {"^VIX", "BZ=F"}


def r4(x):
    return float(f"{x:.5g}")


def yahoo_mensual(s):
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/" + urllib.parse.quote(s)
           + "?period1=0&period2=9999999999&interval=1mo&events=div")
    r = json.loads(pedir(url))["chart"]["result"][0]
    ind = r["indicators"]
    adj = (ind.get("adjclose") or [{}])[0].get("adjclose") or ind["quote"][0]["close"]
    out = {}
    for t, v in zip(r["timestamp"], adj):
        if v:
            out[datetime.fromtimestamp(t, timezone.utc).strftime("%Y-%m")] = v
    return out


def shiller():
    """Índice de retorno total del S&P 500: cada mes crece por precio y por 1/12 del dividendo anual."""
    filas = list(csv.DictReader(io.StringIO(pedir(SHILLER).decode())))
    out, idx, prev = {}, 1.0, None
    for f in filas:
        p, d = float(f["SP500"]), float(f["Dividend"])
        if d <= 0:
            break
        if prev:
            idx *= (p + d / 12) / prev
        out[f["Date"][:7]] = idx
        prev = p
    return out


def empalmar(viejo, nuevo):
    """Une dos series: la vieja se escala para que coincida con la nueva en el primer mes en común."""
    comun = sorted(set(viejo) & set(nuevo))
    if not comun:
        return nuevo
    m = comun[0]
    k = nuevo[m] / viejo[m]
    res = {f: v * k for f, v in viejo.items() if f < m}
    res.update(nuevo)
    return res


def main():
    out = {"generado": datetime.now(timezone.utc).isoformat(timespec="minutes"), "series": {}}
    for s in SIMBOLOS:
        if s in SALTAR:
            continue
        try:
            serie = yahoo_mensual(s)
            if s == "VOO":
                serie = empalmar(shiller(), {f: v for f, v in serie.items() if f >= "2023-06"})
            elif s == "QQQ":
                serie = empalmar(yahoo_mensual("^NDX"), serie)
            out["series"][s] = [[f, r4(v)] for f, v in sorted(serie.items())]
            print(s, len(serie), min(serie), flush=True)
        except Exception as e:
            print("historia", s, e, flush=True)
        time.sleep(0.7)
    SALIDA.write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    main()
