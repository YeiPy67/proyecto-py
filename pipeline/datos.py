#!/usr/bin/env python3
"""Proyecto Py: baja precios (5 años, con dividendos) y noticias, y los deja en app/data/.

De dónde sale cada cosa se elige en pipeline/config.json; los proveedores están en
pipeline/proveedores.py. Uso: datos.py [--solo-precios | --solo-noticias]
"""
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from proveedores import NOTICIAS as PROV_NOTICIAS, PRECIOS as PROV_PRECIOS, limpiar  # noqa: F401

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "app" / "data"
CONFIG = json.loads((Path(__file__).resolve().parent / "config.json").read_text(encoding="utf-8"))

SIMBOLOS = [
    "VOO", "QQQ", "VT", "SCHD", "GLD", "^VIX", "BZ=F",
    "ANT", "NVDA", "GOOGL", "META", "AAPL", "MSFT", "AMZN", "TSLA", "NFLX",
    "AMD", "AVGO", "TSM", "ASML", "PLTR",
    "JPM", "V", "KO", "MELI", "NU", "EC", "CIB",
    "BTC-USD", "ETH-USD", "SOL-USD",
]
# Monedas locales: cuántas unidades de esa moneda vale 1 USD.
MONEDAS = {"EUR": "EUR=X", "GBP": "GBP=X", "MXN": "MXN=X", "BRL": "BRL=X", "COP": "COP=X",
           "ARS": "ARS=X", "CLP": "CLP=X", "PEN": "PEN=X", "CAD": "CAD=X", "JPY": "JPY=X"}
# Qué se busca para cada tema de noticias.
CONSULTAS = {
    "ANT": '"Anthropic"', "NVDA": "Nvidia", "GOOGL": "(Alphabet OR Google)", "META": '"Meta Platforms"',
    "AAPL": "Apple iPhone", "MSFT": "Microsoft", "AMZN": "Amazon", "TSLA": "Tesla", "AMD": '"Advanced Micro Devices"',
    "TSM": "TSMC", "MELI": "MercadoLibre", "NU": "Nubank", "BTC-USD": "bitcoin",
    "MERCADO": '("Wall Street" OR "S&P 500")', "MUNDO": '("Federal Reserve" OR "central bank" OR inflation) economy',
}
# El título tiene que mencionar el tema; si no, llegan cosas que solo lo nombran de pasada.
FILTRO = {
    "ANT": r"anthropic|claude", "NVDA": r"nvidia|huang", "GOOGL": r"google|alphabet|youtube|gemini",
    "META": r"\bmeta\b|zuckerberg|facebook|instagram|whatsapp", "AAPL": r"apple|iphone", "MSFT": r"microsoft|azure",
    "AMZN": r"amazon|\baws\b", "TSLA": r"tesla|musk", "AMD": r"\bamd\b", "TSM": r"tsmc|taiwan semi",
    "MELI": r"mercado ?libre", "NU": r"nubank|nu holdings", "BTC-USD": r"bitcoin|\bbtc\b|crypto|биткоин",
    "MERCADO": r"wall street|s&p|nasdaq|\bdow\b|stocks?\b|shares|market|bolsa|börse|bourse",
    "MUNDO": r"\bfed\b|federal reserve|central bank|inflation|econom|tariff|interest rate|recession|gdp|jobs",
}


def filtrar(clave, lista):
    patron = FILTRO.get(clave)
    return [n for n in lista if not patron or re.search(patron, n["t"], re.I)][:15]


def precios():
    fuente = PROV_PRECIOS[CONFIG["precios"]]
    out = {"generado": datetime.now(timezone.utc).isoformat(timespec="minutes"), "fuente": CONFIG["precios"],
           "precios": {}, "fx": {}}
    for s in SIMBOLOS:
        try:
            out["precios"][s] = fuente(s)
        except Exception as e:
            print("precio", s, e, flush=True)
        time.sleep(0.7)
    for cod, s in MONEDAS.items():
        try:
            d = fuente(s)
            out["fx"][cod] = {"precio": d["precio"], "cambio": d["cambio"], "serie": d["serie"]}
        except Exception as e:
            print("fx", cod, e, flush=True)
        time.sleep(0.7)
    (SALIDA / "mercado.json").write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
    print(len(out["precios"]), "símbolos,", len(out["fx"]), "monedas", flush=True)
    return out["generado"]


def noticias(generado):
    """Pregunta despacio y con tope de tiempo; guarda después de cada tema; empieza por los más atrasados."""
    fuente = PROV_NOTICIAS[CONFIG["noticias"]]
    pausa = CONFIG.get("gdelt_pausa_segundos", 30) if CONFIG["noticias"] == "gdelt" else 1
    limite = time.time() + CONFIG.get("noticias_max_minutos", 15) * 60
    ruta = SALIDA / "noticias.json"
    try:
        previo = json.loads(ruta.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        previo = {}
    out = {"generado": generado, "fuente": CONFIG["noticias"], "temas": dict(previo.get("temas", {})),
           "act": dict(previo.get("act", {}))}
    orden = sorted(CONSULTAS, key=lambda k: (bool(out["temas"].get(k)), out["act"].get(k, "")))
    hechas = 0
    for clave in orden:
        if time.time() > limite:
            print("tope de tiempo: sigue en la próxima ronda", flush=True)
            break
        for intento in range(2):
            time.sleep(pausa * (intento + 1))
            try:
                nuevas = filtrar(clave, fuente(CONSULTAS[clave], clave))
                if nuevas or clave not in out["temas"]:
                    out["temas"][clave] = nuevas
                out["act"][clave] = generado
                hechas += 1
                break
            except Exception as e:
                print("noticias", clave, "intento", intento + 1, e, flush=True)
        ruta.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(hechas, "temas actualizados;", sum(len(v) for v in out["temas"].values()), "noticias en total", flush=True)


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)
    ahora = datetime.now(timezone.utc).isoformat(timespec="minutes")
    if "--solo-noticias" in sys.argv:
        return noticias(ahora)
    generado = precios()
    if "--solo-precios" not in sys.argv:
        noticias(generado)


if __name__ == "__main__":
    main()
