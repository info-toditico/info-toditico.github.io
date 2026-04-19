# Guia de configuracion - energia-limpia2

## Archivo principal de configuracion

Edita este archivo:
- `data/site-settings.json`

Desde ahi puedes cambiar:
- Titulos principales
- Logo (ruta local)
- Texto de footer
- Botones de descargas
- Redes sociales
- Correos de contacto

## Regla importante de archivos

Para imagenes y logos usa rutas locales del proyecto, por ejemplo:
- `assets/logo.png`
- `assets/images/mi-logo-nuevo.png`

No uses URL externas para imagenes por ahora.

## Campos clave

### branding
- `mainTitle`
- `subTitle`
- `logoPath`
- `logoAlt`
- `footerText`

### downloads
Cada elemento controla un boton del home:
- `id`: id del enlace en HTML
- `textId`: id del texto del boton
- `label`: texto visible
- `href`: archivo local o ruta interna
- `download`: true/false

### social
URLs de redes:
- `instagram`
- `facebook`
- `youtube`
- `linkedin`
- `whatsapp`

### contact
- `admin.email`, `admin.label`
- `store.email`, `store.label`

## Checklist antes de publicar

1. Verificar que `logoPath` existe fisicamente.
2. Verificar que cada `href` de `downloads` existe si es archivo.
3. Revisar correos de `contact`.
4. Probar el sitio en navegador.

## Siguiente paso recomendado

Crear tambien los archivos reales en:
- `assets/downloads/`
- `assets/downloads/fichas/`
para que todas las descargas funcionen en produccion.
