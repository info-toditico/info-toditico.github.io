# Guia de configuracion - energia-limpia3

Edita un solo archivo para personalizar el sitio:

- data/site-settings.json

## Que puedes cambiar

- Branding: nombre, subtitulos, imagen del hero, texto footer y logo.
- Descargas: textos y enlaces de los 4 botones principales.
- Redes: Instagram, Facebook, X/Twitter, LinkedIn, YouTube.
- Contacto: enlaces y textos de tarjetas de contacto.
- Productos: listado de fichas tecnicas, especificaciones e imagen.

## Regla de recursos locales

Para no depender de URLs externas:

- Imagen hero en assets/hero-bg.jpg
- Imagen de producto en assets/product-placeholder.jpg
- Catalogo y archivos descargables en downloads/
- Fichas tecnicas en downloads/fichas/

## Estructura recomendada

- assets/
- downloads/
- downloads/fichas/
- data/site-settings.json

## Nota de funcionamiento

Si data/site-settings.json no carga, la pagina usa configuracion por defecto definida en index.html.
