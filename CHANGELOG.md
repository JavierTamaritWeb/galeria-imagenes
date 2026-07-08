# Changelog

Todos los cambios notables de este proyecto se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/)
y el versionado sigue [SemVer](https://semver.org/lang/es/).

## [1.1.6] - 2026-07-08

### Cambiado
- Renombrado el elemento BEM `__moving-dot` a `__active-indicator`: nunca
  fue un punto relleno (no tiene `background-color`, solo `border` +
  `outline`), es un aro que rodea el botón de la cara activa y se
  desplaza al cambiar de cara. El nuevo nombre describe su función en vez
  de una forma que no tiene. Actualizado en `src/index.html`,
  `_image-cube-grid-gallery.scss` y el comentario de `_variables.scss`.

## [1.1.5] - 2026-07-08

### Cambiado
- Movimiento del aro de navegación (`__moving-dot`) más fluido y elegante:
  nuevo easing `cubic-bezier(.22, 1, .36, 1)` (quint ease-out) en vez del
  `ease-in-out` genérico — arranque decidido y asentamiento suave al llegar
  a la cara seleccionada. Nueva variable `$nav-dot-easing` en
  `_variables.scss`. La duración no cambia: sigue sincronizada con el
  barrido radial de los cubos.

## [1.1.4] - 2026-07-08

### Cambiado
- El indicador de la cara seleccionada pasa de negro a **rojo coral**
  (`#ff7f50`): el punto central del botón activo y el aro móvil
  (`__moving-dot`) — borde, outline y sombra.

## [1.1.3] - 2026-07-08

### Cambiado
- El componente pasa a ser **autocontenido**: se eliminan los 6
  `<link rel="preload">` de las caras del `<head>`. Las imágenes ya se declaran
  con `image-set()` en el CSS (única fuente de carga), así que dejan de acoplar
  el `<head>` del sitio anfitrión a los nombres de archivo internos. Un sitio
  que quiera el arranque temprano puede añadir su propio preload o cabecera
  HTTP `Link:`.

### Eliminado
- Favicon SVG inline del `<head>` (no necesario de momento).

## [1.1.2] - 2026-07-08

### Añadido
- Landmark `<main>` (antes un `<div>` genérico) y `<h1>` visualmente oculto
  (utilidad `.visually-hidden`): dan región principal y encabezado/outline al
  documento sin alterar el diseño sin texto.
- `<meta name="description">` para buscadores y `<meta name="color-scheme"
  content="light">` coherente con el fondo claro (evita el flash inicial y
  ajusta controles/scrollbars nativos).

### Notas
- Auditoría de accesibilidad/HTML. Las caras del cubo se mantienen sin `alt`
  a propósito: son fondos CSS decorativos (arte generativo), no imágenes con
  valor informativo.

## [1.1.1] - 2026-07-08

### Cambiado
- Reordenado el `<head>` por prioridad de recursos: los `<link rel="preload">`
  de las caras AVIF pasan **antes** de la hoja de estilos, para que el preload
  scanner los descubra y descargue en paralelo con el CSS (antes esperaban a
  que el CSS se parseara y aplicara `image-set()`). El favicon SVG baja al
  final del `<head>` por ser de baja prioridad.

## [1.1.0] - 2026-07-08

### Añadido
- **Formatos de imagen modernos con fallback**: cada cara se ofrece en AVIF,
  WebP y JPG, servidos con CSS `image-set()` (el equivalente de `<picture>`
  para fondos). El navegador carga el primer formato que soporta:
  AVIF → WebP → JPG.
- Mapa `$face-formats` en `_variables.scss` con el orden de preferencia de
  formatos y sus tipos MIME.

### Cambiado
- `$face-images` pasa a ser rutas **base sin extensión**; el formato lo añade
  `image-set()` en el bucle `@each` del componente.
- Los `<link rel="preload">` apuntan al `.avif` con `type="image/avif"`.
- En pantallas `< 769px` la navegación se sitúa justo debajo de la cuadrícula
  (antes quedaba anclada al fondo de la pantalla, muy separada de las imágenes).

### Corregido
- Gulp no comprimía el CSS: gulp-sass 6 usa la API moderna de Dart Sass, cuya
  opción es `style` y no el nombre legacy `outputStyle`. Ahora `dist/css` sale
  minificado.

## [1.0.0] - 2026-07-08

### Añadido
- Galería de imágenes CSS-only: 64 cubos 3D rotatorios sin JavaScript.
- Geometría de la cuadrícula calculada en CSS con `sibling-index()`,
  `sibling-count()`, `sqrt()`, `round()` y `mod()`.
- Interactividad con radios ocultos + `:has()`; onda radial de rotación.
- Modo `prefers-reduced-motion` (crossfade plano) y fallback `@supports not`.
- Build con Gulp 5 (ESM), Dart Sass y BrowserSync.
