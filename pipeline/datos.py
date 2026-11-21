#!/usr/bin/env python3
"""Proyecto Py: baja precios (5 años) y noticias, y los deja en app/data/.

Precios: Yahoo Finance (solo para el prototipo; antes de lanzar hay que cambiarlo
por un proveedor con licencia). Noticias: GDELT (abierto y gratuito).
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "app" / "data"
UA = "Mozilla/5.0 (X11; Linux x86_64) proyecto-py"

SIMBOLOS = [
    "VOO", "QQQ", "VT", "SCHD", "GLD", "^VIX", "BZ=F",
    "ANT", "NVDA", "GOOGL", "META", "AAPL", "MSFT", "AMZN", "TSLA", "NFLX",
    "AMD", "AVGO", "TSM", "ASML", "PLTR",
    "JPM", "V", "KO", "MELI", "NU", "EC", "CIB",
    "BTC-USD", "ETH-USD", "SOL-USD",
]
# Monedas locales: cuántas unidades de esa moneda vale 1 USD.
MONEDAS = {"USD": None, "EUR": "EUR=X", "GBP": "GBP=X", "MXN": "MXN=X", "BRL": "BRL=X",
           "COP": "COP=X", "ARS": "ARS=X", "CLP": "CLP=X", "PEN": "PEN=X", "CAD": "CAD=X", "JPY": "JPY=X"}
# Búsquedas de noticias (GDELT) por símbolo.
NOTICIAS = {
    "ANT": '"Anthropic"', "NVDA": "Nvidia", "GOOGL": "(Alphabet OR Google)", "META": '"Meta Platforms"',
    "AAPL": "Apple iPhone", "MSFT": "Microsoft", "AMZN": "Amazon", "TSLA": "Tesla", "AMD": '"Advanced Micro Devices"',
    "TSM": "TSMC", "MELI": "MercadoLibre", "NU": '"Nu Holdings"', "BTC-USD": "bitcoin",
    "MERCADO": '("Wall Street" OR "S&P 500")', "MUNDO": '("Federal Reserve" OR "central bank" OR inflation) economy',
}
# El título tiene que mencionar el tema; si no, GDELT trae cosas que solo lo nombran de pasada.
FILTRO = {
    "ANT": r"anthropic|claude", "NVDA": r"nvidia|huang", "GOOGL": r"google|alphabet|youtube|gemini",
    "META": r"\bmeta\b|zuckerberg|facebook|instagram|whatsapp", "AAPL": r"apple|iphone", "MSFT": r"microsoft|azure",
    "AMZN": r"amazon|\baws\b", "TSLA": r"tesla|musk", "AMD": r"\bamd\b", "TSM": r"tsmc|taiwan semi",
    "MELI": r"mercado ?libre", "NU": r"nubank|nu holdings", "BTC-USD": r"bitcoin|\bbtc\b|crypto|биткоин",
    "MERCADO": r"wall street|s&p|nasdaq|\bdow\b|stocks?\b|shares|market|bolsa|börse|bourse",
    "MUNDO": r"\bfed\b|federal reserve|central bank|inflation|econom|tariff|interest rate|recession|gdp|jobs",
}
DIARIOS = 260


def pedir(url, intentos=3):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            return urllib.request.urlopen(req, timeout=30).read()
        except Exception:
            if i == intentos - 1:
                raise
            time.sleep(6)


def serie(fechas, cierres):
    p = [(datetime.fromtimestamp(t, timezone.utc).strftime("%Y-%m-%d"), round(c, 4 if c < 10 else 2))
         for t, c in zip(fechas, cierres) if c is not None]
    return [list(x) for x in p[:-DIARIOS][::5] + p[-DIARIOS:]]


def yahoo(s):
    r = json.loads(pedir("https://query1.finance.yahoo.com/v8/finance/chart/" + urllib.parse.quote(s)
                         + "?range=5y&interval=1d"))["chart"]["result"][0]
    m = r["meta"]
    sr = serie(r["timestamp"], r["indicators"]["quote"][0]["close"])
    # La serie diaria a veces no trae el día de hoy: se agrega (o corrige) con el precio actual.
    hoy = datetime.fromtimestamp(m.get("regularMarketTime", r["timestamp"][-1]), timezone.utc).strftime("%Y-%m-%d")
    px = round(m["regularMarketPrice"], 4 if m["regularMarketPrice"] < 10 else 2)
    if sr and sr[-1][0] == hoy:
        sr[-1][1] = px
    elif sr and sr[-1][0] < hoy:
        sr.append([hoy, px])
    return {"nombre": m.get("longName") or m.get("shortName") or s, "precio": m["regularMarketPrice"],
            "cambio": round(m.get("regularMarketChangePercent") or 0, 2), "max52": m.get("fiftyTwoWeekHigh"),
            "min52": m.get("fiftyTwoWeekLow"), "serie": sr}


def limpiar(t):
    """GDELT separa la puntuación con espacios ("S & P 500 , cae"): se arregla."""
    t = re.sub(r"\s+([,.;:!?%)])", r"\1", t)
    t = re.sub(r"([(])\s+", r"\1", t)
    t = re.sub(r"\b([A-Z]) & ([A-Z])\b", r"\1&\2", t)
    t = re.sub(r"\s+-\s+", " - ", t)
    t = re.sub(r"(\w) ' (\w)", r"\1'\2", t)
    return re.sub(r"\s{2,}", " ", t).strip()


def filtrar(clave, lista):
    patron = FILTRO.get(clave)
    return [n for n in lista if not patron or re.search(patron, n["t"], re.I)]


def gdelt(q):
    url = ("https://api.gdeltproject.org/api/v2/doc/doc?query=" + urllib.parse.quote(q)
           + "&mode=artlist&maxrecords=60&format=json&timespan=3d&sort=datedesc")
    texto = pedir(url).decode("utf-8", "replace")
    if not texto.lstrip().startswith("{"):
        raise RuntimeError(texto[:80])
    vistos, out = set(), []
    for a in json.loads(texto).get("articles", []):
        t = limpiar(a.get("title") or "")
        clave = t.lower()[:60]
        if len(t) < 25 or clave in vistos or not a.get("url", "").startswith("http"):
            continue
        vistos.add(clave)
        out.append({"t": t, "u": a["url"], "f": a.get("domain", ""), "l": a.get("language", ""),
                    "d": a.get("seendate", "")[:13]})
    return out[:15]


def noticias(generado):
    """GDELT corta si se le pregunta seguido: espera 10 s entre consultas, reintenta y conserva lo anterior."""
    ruta = SALIDA / "noticias.json"
    try:
        previo = json.loads(ruta.read_text(encoding="utf-8")).get("temas", {})
    except (OSError, ValueError):
        previo = {}
    out = {"generado": generado, "temas": dict(previo)}
    for clave, q in NOTICIAS.items():
        for intento in range(3):
            time.sleep(10 + intento * 15)
            try:
                out["temas"][clave] = filtrar(clave, gdelt(q))
                break
            except Exception as e:
                print("noticias", clave, "intento", intento + 1, e)
    ruta.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(sum(len(v) for v in out["temas"].values()), "noticias en", len(out["temas"]), "temas")


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)
    if "--solo-noticias" in sys.argv:
        return noticias(datetime.now(timezone.utc).isoformat(timespec="minutes"))
    mercado = {"generado": datetime.now(timezone.utc).isoformat(timespec="minutes"), "precios": {}, "fx": {}}
    for s in SIMBOLOS:
        try:
            mercado["precios"][s] = yahoo(s)
        except Exception as e:
            print("precio", s, e)
        time.sleep(0.7)
    for cod, s in MONEDAS.items():
        if not s:
            continue
        try:
            d = yahoo(s)
            mercado["fx"][cod] = {"precio": d["precio"], "cambio": d["cambio"], "serie": d["serie"]}
        except Exception as e:
            print("fx", cod, e)
        time.sleep(0.7)
    (SALIDA / "mercado.json").write_text(json.dumps(mercado, separators=(",", ":")), encoding="utf-8")
    print(len(mercado["precios"]), "símbolos,", len(mercado["fx"]), "monedas")

    if "--solo-precios" not in sys.argv:
        noticias(mercado["generado"])


if __name__ == "__main__":
    main()
