# Guia de configuracion - energia-limpia

Este sitio ahora usa un archivo central de configuracion:

- `data/site-settings.json`

Con este archivo puedes cambiar logo, textos, botones, redes, contacto y productos sin editar el `index.html`.

## 1) Branding

Ruta: `branding`

Campos importantes:

- `brandName`: nombre corto de marca.
- `brandTagline`: subtitulo de marca.
- `mainTitle`: titulo principal en Home.
- `subTitle`: subtitulo grande en Home.
- `footerText`: texto del footer.
- `useImageLogo`: `true` para usar imagen, `false` para usar letra.
- `logoPath`: ruta local del logo (ejemplo: `./assets/logo.png`).
- `logoAlt`: texto alternativo del logo.
- `logoLetter`: letra si no usas imagen.

## 2) Botones de descargas

Ruta: `downloads` (array)

Cada boton incluye:

- `id`: id del boton en HTML (`downloadBtn1`, `downloadBtn2`, etc.).
- `textId`: id del texto interno del boton.
- `label`: texto visible.
- `href`: enlace local o URL.
- `download`: `true` para descarga directa.
- `toast`: texto opcional del aviso.

Nota: si `href` no existe fisicamente en el proyecto publicado, la descarga fallara.

## 3) Redes sociales

Ruta: `social`

Campos soportados:

- `instagram`
- `facebook`
- `whatsapp`
- `tiktok`

## 4) Contacto

Ruta: `contact`

Campos:

- `adminEmail`
- `adminLabel`
- `storeUrl`
- `storeLabel`

## 5) Productos/fichas tecnicas

Ruta: `products` (array)

Cada producto:

- `id`
- `nombre`
- `cat`
- `pot`
- `eff`
- `file` (nombre del archivo dentro de `downloads/fichas/`)
- `icon` (clase de Font Awesome, por ejemplo `fa-solar-panel`)

## 6) Recomendacion para recursos locales

Para cumplir la regla de trabajar con archivos locales:

- logo en `assets/`
- documentos generales en `downloads/`
- fichas tecnicas en `downloads/fichas/`

Asi evitas depender de URLs externas para imagenes y descargas.
