# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Galería de imágenes CSS-only: una cuadrícula de 64 cubos 3D rotatorios, sin JavaScript. Toda la interactividad se resuelve con radios ocultos + `:has()`, y la geometría de la cuadrícula se calcula en CSS con `sibling-index()`, `sibling-count()`, `sqrt()`, `round()` y `mod()` (requiere navegador muy moderno; hay fallback vía `@supports not`).

## Comandos

```bash
npm run dev     # build + BrowserSync en dist/ con watch y live reload
npm run build   # build limpio a dist/ (clean + styles + markup)
npm run clean   # elimina dist/
```

No hay tests ni linter. Para verificar un cambio: `npm run build` debe compilar sin errores de Sass, y comprobar el resultado en el navegador servido por `npm run dev`.

## Stack y arquitectura

- **Gulp 5 (ESM)** — `gulpfile.js` usa `import`/`export` (`"type": "module"`). Sourcemaps con la API nativa de Gulp 5 (`src(..., { sourcemaps: true })`), no gulp-sourcemaps. Sass comprimido vía gulp-sass + dart-sass.
- **SCSS con BEM**, arquitectura 7-1 simplificada bajo `src/scss/`:
  - `abstracts/_variables.scss` — mapas Sass que parametrizan todo el componente: `$face-images` (rutas base de las 6 caras, sin extensión), `$face-formats` (formatos por preferencia para `image-set()`), `$face-rotations`, `$face-transforms`, `$button-face`, `$cube-count`, `$cube-easing`.
  - `base/` — reset y estilos globales del `body`.
  - `components/_image-cube-grid-gallery.scss` — el único bloque BEM. Un bloque por archivo.
  - `main.scss` — punto de entrada; solo `@use` (nunca `@import`, está deprecado).
- El HTML vive en `src/index.html` y se copia tal cual a `dist/`. `dist/` es generado: no editarlo nunca.

## Registro de problemas resueltos

Cada problema solucionado se registra aquí (síntoma → causa → regla) para no reintroducirlo. **Al arreglar cualquier bug, añade su entrada antes de dar el trabajo por terminado.**

- **Botones top/bottom mostraban la cara contraria (2026-07-08).** Síntoma: el botón "Cara superior" enseñaba la cara inferior, y con `prefers-reduced-motion` cada botón mostraba una foto distinta que en modo 3D. Causa: `rotateX` positivo inclina la parte superior hacia atrás, así que ver la cara superior exige `rx: -90deg`; el original de CodePen traía los signos invertidos y `$button-face` decía lo contrario que `$face-rotations`. Regla: cada entrada de `$face-rotations` debe traer al frente la cara que `$button-face` le asigna; al tocar rotaciones, comprobar los 6 botones también con reduced-motion activado.
- **Gulp 5 corrompe binarios al copiarlos (2026-07-08).** Síntoma: riesgo de imágenes rotas en `dist/img/`. Causa: desde Gulp 5, `src()` decodifica los ficheros como UTF-8 por defecto. Regla: toda tarea que copie binarios debe usar `src(..., { encoding: false })` (ya aplicado en la tarea `images`).
- **`100vh` tapa la navegación en móvil (2026-07-08).** Síntoma: con la barra dinámica del navegador móvil, el `body` de `100vh` era más alto que lo visible y (con `overflow: hidden`) ocultaba la navegación inferior. Regla: usar `100dvh` para dimensiones de viewport; no reintroducir `vh` en alturas de página completa.
- **Rutas de imágenes relativas distintas en SCSS y HTML (2026-07-08).** Síntoma: imágenes 404 si se copia la misma ruta en ambos sitios. Causa: en CSS las URLs se resuelven relativas al CSS compilado (`dist/css/`), en HTML relativas a `dist/`. Regla: `$face-images` lleva `../img/...` y los `<link rel="preload">` llevan `img/...`; al cambiar imágenes, actualizar los dos sitios con su forma correspondiente. (Nota: `$face-images` ahora son rutas **base sin extensión** — el formato lo añade `image-set()` —; los preload apuntan al `.avif` con `type="image/avif"`.)
- **Idioma incoherente (2026-07-08).** Síntoma: `lang="es"` con textos visibles y `aria-label` en inglés. Regla: todo texto visible o accesible nuevo va en español, coherente con el `lang` del documento.
- **`<picture>` no sirve para las caras (2026-07-08).** Síntoma: se pidió `<picture>`/`<source>` para servir AVIF → WebP → JPG. Causa: las caras no son `<img>`, son fondos CSS (sprite sheets con `background-image`), y `<picture>` solo controla `<img>`. Regla: para elegir formato en imágenes de fondo se usa `image-set(url(...) type('image/avif'), ... type('image/webp'), ... type('image/jpeg'))` — el navegador toma el primer formato soportado. El orden de `$face-formats` es el orden de preferencia; no reintroducir `<picture>` para los cubos.
- **Gulp no comprimía el CSS (2026-07-08).** Síntoma: `dist/css/main.css` salía expandido pese a `outputStyle: 'compressed'` en el gulpfile. Causa: gulp-sass 6 usa la API moderna de Dart Sass (`compileString`), cuya opción de estilo es `style`, no el nombre legacy `outputStyle` (que se ignora en silencio). Regla: en la tarea `styles` usar `sass.sync({ style: 'compressed' })`; verificar tras un build que el CSS queda minificado (una sola línea).
- **Navegación demasiado separada de la cuadrícula en móvil (2026-07-08).** Síntoma: en pantallas `< 769px` los puntos de navegación quedaban pegados al fondo de la pantalla, muy lejos de las imágenes. Causa: `__navigation` está anclada a `bottom: 3.2rem` (al viewport de la página, porque el bloque raíz no tiene `position: relative`), pero la cuadrícula está centrada en `50dvh`; al encoger los cubos aparece un hueco grande. Regla: en `@media (max-width: 768px)` recolocar la navegación con `top: calc(50dvh + (filas/2) * <clamp del tamaño de cubo> + margen); bottom: auto;`. El clamp del tamaño de cubo (`clamp(3.2rem, min(100dvw,100dvh)/10, 7.5rem)`) se repite a propósito porque `--_size` se define dentro de `__cube` y no se hereda; `filas` sale de `$grid-rows`. Ese media query va al final del bloque para ganar en cascada al `bottom` del estado base.

## Cómo está construido el componente (no obvio)

- El CSS repetitivo se **genera con bucles**: los estados de navegación (`:has(...:nth-child(N) input:checked)`), los 6 keyframes `cube-z-push-N-animation` y las caras del cubo salen de `@each`/`@for` sobre los mapas de `_variables.scss`. Para cambiar imágenes, rotaciones o breakpoints, edita los mapas — no añadas selectores a mano.
- Dentro del bloque se usa `$self: &;` para componer los selectores `:has()` que referencian elementos del propio bloque (`#{$self}__cube`, etc.).
- Los 6 keyframes `cube-z-push-1..6` son **idénticos a propósito**: cambiar el `animation-name` es lo que reinicia la animación al cambiar de cara. No los consolides en uno.
- Las variables CSS animadas (`--_rx`, `--_ry`, `--_tz`, `--_intro-*`, `--_nav-index`) están registradas con `@property` y sintaxis tipada — imprescindible para poder transicionarlas/animarlas. Si añades una variable animada, regístrala.
- La rotación se propaga como una **onda radial desde el centro**: el retardo de cada cubo es su distancia Manhattan al centro (`abs(--_x - --_cx) + abs(--_y - --_cy)`) por `--_wave-delay`, no el índice lineal. Las variables de tiempo compartidas (`--_cube-transition-duration`, `--_wave-delay`, `--_wave-max`) viven en el bloque raíz y llegan por herencia a `__cube` y `__navigation` — así el punto móvil dura exactamente lo mismo que el barrido. `$wave-max` se calcula en Sass desde `$cube-count`.
- El tamaño del cubo es **fluido** (`clamp()` sobre `min(100dvw, 100dvh)`), no hay media queries de tamaño.
- **Unidades: 1rem = 10px** (`html { font-size: 62.5% }` en `base/_global.scss`). Todas las distancias van en rem con esa equivalencia (p. ej. `2.2rem` = 22px); no reintroducir px salvo en los tests de `@supports` y en los `initial-value` de `@property`, que son valores cero.
- Cada cara usa una única imagen grande repartida entre los 64 cubos como sprite sheet (vía `background-size`/`background-position` calculados por cubo).
- Cada cara existe en **tres formatos** (`.avif`, `.webp`, `.jpg`) y se sirve con **`image-set()`** (el equivalente de `<picture>` para fondos): el bucle `@each` de `_image-cube-grid-gallery.scss` recorre `$face-formats` y compone `image-set(url(...) type('image/avif'), ... type('image/webp'), ... type('image/jpeg'))`; el navegador elige el primer formato que soporta. Por eso `$face-images` son rutas base **sin extensión**. Para regenerar formatos desde los JPG: `cwebp -q 72 -m 6 face-N.jpg -o face-N.webp` y `avifenc -q 60 -s 4 face-N.jpg face-N.avif`.
- Las imágenes viven en `src/img/` y Gulp las copia a `dist/img/` (tarea `images`, con `encoding: false` — sin él Gulp 5 corrompe los binarios; copia todos los formatos con `src/img/**/*`). Las rutas de `$face-images` están **duplicadas** en los `<link rel="preload">` de `src/index.html`: en SCSS son base sin extensión y con `../img/...` (relativo al CSS compilado); en HTML apuntan al `.avif` con `img/...` y `type="image/avif"` — si se cambian las imágenes hay que actualizar los dos sitios.
- Signos de rotación en `$face-rotations`: `rotateX` positivo inclina la parte superior del cubo hacia atrás, así que ver la cara superior exige `rx: -90deg` (y la inferior `rx: 90deg`). Cada entrada debe traer al frente la cara que `$button-face` le asigna — si divergen, con `prefers-reduced-motion` se muestra una foto distinta que en modo 3D.
- El bloque raíz **no tiene `position: relative` a propósito**: `__navigation` (absolute) se ancla al viewport de la página y `__viewport` mide 0×0 (los cubos se despliegan por transform desde su esquina). Vale para esta página standalone; si el componente se integrara en otra página habría que replantear el posicionamiento.
- Los 64 `<div class="...__cube">` del HTML están repetidos literalmente porque no hay JS; `$cube-count` en las variables debe coincidir con ese número. Las caras y el punto móvil son `<span>` vacíos (no `<i>`).
- Accesibilidad: no reintroducir `outline: none` global; el foco de teclado usa `:focus-visible` en los radios de navegación. Con `prefers-reduced-motion: reduce` no hay 3D: las caras se aplanan y el cambio es un crossfade de opacidad; el mapa `$button-face` (botón → cara `nth-child`) debe mantenerse coherente con `$face-rotations`/`$face-transforms`. Ese bloque `@media` va al final del componente a propósito: gana por orden en cascada a reglas de igual especificidad (p. ej. `> span:nth-child(n)` anula los transforms por cara).
