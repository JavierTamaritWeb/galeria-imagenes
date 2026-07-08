# Changelog

Todos los cambios notables de este proyecto se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/)
y el versionado sigue [SemVer](https://semver.org/lang/es/).

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
