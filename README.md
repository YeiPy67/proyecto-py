# Proyecto Py

App web instalable para seguir tu plata: mercado, listas, cartera, simulador, noticias, análisis y fechas, en español, inglés, portugués, francés y alemán.

- `app/`: la app (HTML, CSS y JS sin dependencias). `app/data/` lo llenan los programas de `pipeline/`.
- `pipeline/datos.py`: precios (Yahoo, solo prototipo) y noticias (GDELT). `--solo-precios` / `--solo-noticias`.
- `pipeline/armar.py`: copia `contenido/` (análisis, resúmenes por activo, fechas) a la app y genera los calendarios `.ics` por idioma.
- Anuncios, pagos y enlaces de afiliado son marcadores (67).
- Vista previa para capturas: `?shot=1&lang=es&cur=COP#market` (salta la bienvenida y usa compras de ejemplo).

Para probar: `cd app && python3 -m http.server 8067`.

No es consejo de inversión.
