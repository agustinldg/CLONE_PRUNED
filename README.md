# CLONE_PRUNED · Paneles PULSI

Páginas HTML estáticas para ver los datos del pulsioxímetro (SpO2, pulso y perfusión) y del ambiente (NETAMO) que están en una base de datos Oracle Autonomous a través de ORDS. No hay paso de compilación: cada página es un único `.html` que carga Highcharts desde unpkg y llama a la API REST directamente desde el navegador.

El sitio se publica en GitHub Pages: <https://agustinldg.github.io/CLONE_PRUNED/>

## Páginas

| Archivo | Qué es |
|---|---|
| [`dash2.html`](dash2.html) | **Panel principal.** Gráfico Highstock de SpO2 y BPM (velas con media ± desviación media), cuadro *Resumen* según los límites del navegador, histogramas de SpO2 y BPM, y gráficos NETAMO de temperatura, humedad, presión, ruido y CO2 (día actual frente al día anterior). |
| [`pulsi_live.html`](pulsi_live.html) | **Vista en directo.** Se actualiza sola con las lecturas recientes (guarda 60 minutos) y los últimos valores NETAMO. **No se edita aquí**: llega por copia desde el repositorio `PULSI_LIVE` (ver más abajo). Con `?demo=1` funciona con datos simulados, sin conexión. |
| [`index.html`](index.html) | Versión original "Pruned view" (jQuery + Highstock). Es la página de inicio de GitHub Pages. |
| [`dash.html`](dash.html) | Primera versión del panel, antecesora de `dash2.html`. |

## API (Oracle ORDS)

URL base: `https://dxj025rr2cyvhje-db202003221648.adb.eu-frankfurt-1.oraclecloudapps.com/ords/PULSI/pulsi/`

| Endpoint | Lo usa | Devuelve |
|---|---|---|
| `v6/lecturas?start_date=YYYY-MM-DD HH:MM:SS` | `index`, `dash`, `dash2` | `{status, data: [[fecha, spo2, bpm, pi], …]}` |
| `v6/netamodata?end_date_utc=YYYY-MM-DD HH:MM:SS` | `dash2` | `{D: [...], B: [...]}`: últimas 24 h (`D`) y las 24 h anteriores (`B`). Cada fila: `MEASURE_UTC`, temperatura/humedad/CO2/ruido/presión interior y presión/temperatura/humedad exterior. |
| `live/v1/lecturas/live`, `live/v1/netamo/last` | `pulsi_live` | Lecturas recientes y últimos valores NETAMO. |

> `netamodata` antepone a veces un texto `Content-type: application/json` al JSON (seguramente un `HTP.P` olvidado en el PL/SQL). `dash2.html` lee el cuerpo como texto y quita esa cabecera antes de interpretarlo. Si se arregla en Oracle, esa limpieza deja de hacer falta.

Las fechas se envían y se reciben en UTC.

## Abrir en local

Las páginas solo necesitan un servidor estático (si se abren con `file://`, algunos navegadores bloquean las peticiones):

```sh
python3 -m http.server 8000
# http://localhost:8000/dash2.html
# http://localhost:8000/pulsi_live.html?demo=1
```

`index.html` carga `public/css/main.css`, pero `public/` está en `.gitignore`, así que en Pages y en un clon nuevo se ve sin esos estilos.

## Despliegue y automatización

- **[`static.yml`](.github/workflows/static.yml)**: cada push a `main` publica la raíz del repositorio en GitHub Pages.
- **[`copiar-pulsi-live.yml`](.github/workflows/copiar-pulsi-live.yml)**: se lanza a mano (*Actions → Copiar PULSI LIVE → Run workflow*). Copia `outputs/pulsi_live.html` de `agustinldg/PULSI_LIVE` a este repositorio y crea el commit "Actualizar pulsi_live.html desde PULSI_LIVE", solo si el archivo ha cambiado. Necesita el secreto `PULSI_LIVE_READ_TOKEN` con permiso de lectura sobre `PULSI_LIVE`.

Los cambios en `pulsi_live.html` se hacen en `PULSI_LIVE` y se traen con este workflow; si se edita aquí, la siguiente copia lo sobrescribe.

## Otros archivos

- `prompt.txt`, `leeme.txt`: notas de trabajo y prompts usados para diseñar `dash2.html` (gráficos NETAMO, histogramas, aproximación de velas por media ± desviación media).
- `test_browser.js`: prueba rápida con Puppeteer que abre una página en `localhost:8000` y muestra en consola los errores y las peticiones fallidas. Apunta a `pruned.html`, el nombre antiguo de `index.html`; hay que cambiar la URL antes de usarla (`npm i puppeteer && node test_browser.js`).
