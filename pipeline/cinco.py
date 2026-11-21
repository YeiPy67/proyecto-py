#!/usr/bin/env python3
"""Proyecto Py: datos del video "Cinco personas" (sale de app/data/historia.json, S&P 500 con dividendos).

Cada persona recibe 2.000 US$ el 1 de enero de cada año durante 20 años y los usa así:
perfecta = el mes más barato del año · inmediata = en enero · constante = 1/12 cada mes ·
peor = el mes más caro del año · nunca = lo guarda sin invertir. Uso: cinco.py
"""
import json
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "app" / "data"
A, Y0, N = 2000, 2006, 20

s = json.loads((DATA / "historia.json").read_text())["series"]["VOO"]
m = [(d, v) for d, v in s if d >= f"{Y0}-01"]
plan = {"perfect": {}, "now": {}, "monthly": {}, "worst": {}}
for y in range(Y0, Y0 + N):
    ms = [(d, v) for d, v in m if d.startswith(str(y))]
    plan["perfect"][min(ms, key=lambda x: x[1])[0]] = A
    plan["worst"][max(ms, key=lambda x: x[1])[0]] = A
    plan["now"][ms[0][0]] = A
    for d, _ in ms:
        plan["monthly"][d] = A / 12
out = {"desde": Y0, "anios": N, "anual": A, "meses": [d for d, _ in m], "sp": [v for _, v in m], "p": {}, "compras": {}}
for k, pl in plan.items():
    units = cash = 0.0
    vals = []
    for d, v in m:
        if d.endswith("-01") and int(d[:4]) < Y0 + N:
            cash += A
        if d in pl:
            units += pl[d] / v
            cash -= pl[d]
        vals.append(round(units * v + cash))
    out["p"][k] = vals
    out["compras"][k] = sorted(pl) if k != "monthly" else []
cash, vals = 0, []
for d, _ in m:
    if d.endswith("-01") and int(d[:4]) < Y0 + N:
        cash += A
    vals.append(cash)
out["p"]["cash"] = vals
(DATA / "cinco.json").write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
print({k: v[-1] for k, v in out["p"].items()})
