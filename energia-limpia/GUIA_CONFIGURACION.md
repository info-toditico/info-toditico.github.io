# Guia de configuracion - energia-limpia2

## 1) Como correr el sitio en local (evitar error CORS)

No abras el proyecto con `file://` (doble clic al HTML), porque `fetch()` no puede leer JSON local por politicas del navegador.

### Opcion recomendada (Node.js)

Desde la carpeta raiz del proyecto ejecuta:

```powershell
npx --yes http-server -p 5500
```

Luego abre:

- `http://127.0.0.1:5500/index.html`
- `http://127.0.0.1:5500/manuales.html`

Para detener el servidor: `Ctrl + C`.

### Opcion alternativa (Python)

Si tienes Python instalado:

```powershell
python -m http.server 5500
```

## 2) Archivo principal de configuracion

Edita este archivo:

- `data/site-settings.json`

Desde ahi puedes cambiar:

- Titulos principales
- Logo (ruta local)
- Texto de footer
- Botones de descargas (texto, enlace y si descarga o no)
- Redes sociales
- Correos de contacto

## 3) Regla importante de rutas

Para imagenes, logos y archivos usa rutas locales del proyecto, por ejemplo:

- `assets/logo.png`
- `assets/images/mi-logo-nuevo.png`
- `assets/downloads/archivo.pdf`

## 4) Campos clave de `site-settings.json`

### `branding`

- `mainTitle`
- `subTitle`
- `logoPath`
- `logoAlt`
- `footerText`

### `downloads`

Cada elemento controla un boton ya existente en el home:

- `id`: id del enlace en HTML
- `textId`: id del texto del boton
- `label`: texto visible
- `href`: archivo local o ruta interna
- `download`: true/false

Nota: este JSON actualiza botones existentes. Para agregar un boton nuevo tambien debes crearlo en `index.html` con un `id` y `textId` nuevos.

### `social`

URLs de redes:

- `instagram`
- `facebook`
- `youtube`
- `linkedin`
- `whatsapp`

### `contact`

- `admin.email`, `admin.label`
- `store.email`, `store.label`

## 5) Como editar/agregar/eliminar botones

### Editar boton existente

1. Cambia `label`, `href` y `download` en `data/site-settings.json` -> `downloads`.
2. Si quieres cambiar el icono del boton, edita la etiqueta `<i>` del boton en `index.html`.

### Eliminar boton

1. Borra el bloque `<a ...>` del boton en `index.html`.
2. Elimina su objeto correspondiente en `data/site-settings.json` -> `downloads`.

### Agregar boton

1. Duplica un bloque de boton en `index.html`.
2. Asigna ids nuevos (ejemplo: `downloadBtn5` y `downloadBtn5Text`).
3. Agrega un objeto nuevo en `data/site-settings.json` -> `downloads` con esos mismos ids.

## 6) Como editar/agregar/eliminar categorias (fichas/manuales)

Las categorias se conectan entre 3 archivos:

1. `manuales.html`: botones de filtro (`data-category`).
2. `data/productos.json`: campo `categoria` de cada producto.
3. `js/main.js`: mapa de iconos/nombres de categoria y reglas de especificaciones.

### Editar categoria

1. Cambia `data-category` y texto en el boton de `manuales.html`.
2. Usa ese mismo valor en `data/productos.json` -> `categoria`.
3. Actualiza icono/nombre en `js/main.js` (funciones `getCategoryIcon` y `getCategoryName`).

### Eliminar categoria

1. Borra su boton en `manuales.html`.
2. Elimina o recategoriza productos en `data/productos.json`.
3. Quita su configuracion en `js/main.js`.

### Agregar categoria

1. Agrega boton nuevo en `manuales.html` con `data-category` unico.
2. Crea o edita productos en `data/productos.json` usando esa categoria.
3. Agrega icono/nombre en `js/main.js`.
4. Si necesitas datos tecnicos distintos, agrega un `case` en `getProductSpecs`.

## 7) Iconos para botones: cuales usar y de donde salen

El proyecto usa **Font Awesome** por CDN (ya cargado en `index.html` y `manuales.html`).

### Fuente oficial de iconos

- Sitio oficial: https://fontawesome.com/icons
- Version en el proyecto: 6.4.0 (CDN)

### Clases mas usadas en este proyecto

- `fas fa-file-excel` -> Excel
- `fas fa-file-pdf` -> PDF
- `fas fa-download` -> Descargar
- `fas fa-book` -> Manual
- `fas fa-solar-panel` -> Solar
- `fas fa-wind` -> Eolico
- `fas fa-bolt` -> Inversores/Energia
- `fas fa-leaf` -> Ambiental
- `fas fa-tools` -> Mantenimiento
- `fas fa-cog` -> Configuracion
- `fas fa-eye` -> Ver
- `fas fa-arrow-left` -> Volver

### Como cambiar un icono

En el boton, reemplaza la clase de `<i>`:

```html
<i class="fas fa-file-excel"></i>
```

Por ejemplo, para PDF:

```html
<i class="fas fa-file-pdf"></i>
```

## 8) Checklist rapido antes de publicar

1. Verificar que `logoPath` existe fisicamente.
2. Verificar que cada `href` de `downloads` existe si es archivo.
3. Revisar que `categoria` en productos coincide con filtros.
4. Revisar iconos de botones en `index.html` y `manuales.html`.
5. Probar siempre desde `http://127.0.0.1:5500`.
