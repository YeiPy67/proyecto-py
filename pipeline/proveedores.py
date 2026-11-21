"""Proyecto Py: proveedores de datos intercambiables.

Cada proveedor es una función con la misma forma de entrada y salida. Para usar otro
(por ejemplo una API de noticias de pago), escribe su función aquí, regístrala en
PRECIOS o NOTICIAS y pon su nombre en pipeline/config.json.

Precios -> función(símbolo) devuelve:
  {"nombre", "precio", "cambio", "max52", "min52", "serie": [[fecha, cierre], ...], "div12": suma de dividendos 12 meses}
Noticias -> función(consulta, clave) devuelve:
  [{"t": título, "u": enlace, "f": fuente, "l": idioma, "d": "AAAAMMDDTHHMM"}, ...]
"""
import json
import os
import re
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone

UA = "Mozilla/5.0 (X11; Linux x86_64) proyecto-py"
DIARIOS = 260  # último año: un punto por día; antes: uno por semana


def pedir(url, intentos=3, espera=6):
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            return urllib.request.urlopen(req, timeout=30).read()
        except Exception:
            if i == intentos - 1:
                raise
            time.sleep(espera)


# ---------------- Precios ----------------

def _serie(fechas, cierres):
    p = [(datetime.fromtimestamp(t, timezone.utc).strftime("%Y-%m-%d"), round(c, 4 if c < 10 else 2))
         for t, c in zip(fechas, cierres) if c is not None]
    return [list(x) for x in p[:-DIARIOS][::5] + p[-DIARIOS:]]


def precios_yahoo(s):
    """Gratis, pero no oficial: sirve para el prototipo, no para lanzar."""
    r = json.loads(pedir("https://query1.finance.yahoo.com/v8/finance/chart/" + urllib.parse.quote(s)
                         + "?range=5y&interval=1d&events=div"))["chart"]["result"][0]
    m = r["meta"]
    sr = _serie(r["timestamp"], r["indicators"]["quote"][0]["close"])
    hoy = datetime.fromtimestamp(m.get("regularMarketTime", r["timestamp"][-1]), timezone.utc).strftime("%Y-%m-%d")
    px = round(m["regularMarketPrice"], 4 if m["regularMarketPrice"] < 10 else 2)
    if sr and sr[-1][0] == hoy:
        sr[-1][1] = px
    elif sr and sr[-1][0] < hoy:
        sr.append([hoy, px])
    hace_un_ano = time.time() - 365 * 86400
    divs = (r.get("events") or {}).get("dividends") or {}
    div12 = round(sum(d["amount"] for d in divs.values() if d["date"] >= hace_un_ano), 4)
    return {"nombre": m.get("longName") or m.get("shortName") or s, "precio": m["regularMarketPrice"],
            "cambio": round(m.get("regularMarketChangePercent") or 0, 2), "max52": m.get("fiftyTwoWeekHigh"),
            "min52": m.get("fiftyTwoWeekLow"), "serie": sr, "div12": div12}


PRECIOS = {"yahoo": precios_yahoo}


# ---------------- Noticias ----------------

def limpiar(t):
    """GDELT separa la puntuación con espacios ("S & P 500 , cae"): se arregla."""
    t = re.sub(r"\s+([,.;:!?%)])", r"\1", t)
    t = re.sub(r"([(])\s+", r"\1", t)
    t = re.sub(r"\b([A-Z]) & ([A-Z])\b", r"\1&\2", t)
    t = re.sub(r"\s+-\s+", " - ", t)
    t = re.sub(r"(\w) ' (\w)", r"\1'\2", t)
    return re.sub(r"\s{2,}", " ", t).strip()


def noticias_gdelt(q, clave=None):
    """Gratis y de uso libre. Limita a una consulta cada 5 s (mejor ir más despacio)."""
    url = ("https://api.gdeltproject.org/api/v2/doc/doc?query=" + urllib.parse.quote(q)
           + "&mode=artlist&maxrecords=75&format=json&timespan=3d&sort=datedesc")
    texto = pedir(url, espera=30).decode("utf-8", "replace")
    if not texto.lstrip().startswith("{"):
        raise RuntimeError(texto[:80])
    vistos, out = set(), []
    for a in json.loads(texto).get("articles", []):
        t = limpiar(a.get("title") or "")
        k = t.lower()[:60]
        if len(t) < 25 or k in vistos or not a.get("url", "").startswith("http"):
            continue
        vistos.add(k)
        out.append({"t": t, "u": a["url"], "f": a.get("domain", ""), "l": a.get("language", ""),
                    "d": a.get("seendate", "")[:13]})
    return out


def noticias_api_futura(q, clave=None):
    """Lugar para una API de noticias de pago. La clave se lee de la variable de entorno
    que diga config.json ("noticias_api_clave_env"). Hoy no está conectada."""
    if not os.environ.get("NOTICIAS_API_KEY"):
        raise RuntimeError("No hay NOTICIAS_API_KEY: este proveedor aún no está activo")
    raise NotImplementedError("Conectar aquí la API elegida")


NOTICIAS = {"gdelt": noticias_gdelt, "api_futura": noticias_api_futura}
