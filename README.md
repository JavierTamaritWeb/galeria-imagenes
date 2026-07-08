# Galería de Imágenes — Grid de Cubos 3D

> Una galería de imágenes **100% CSS, sin una sola línea de JavaScript**: 64 cubos 3D que rotan en onda para cambiar de imagen, sobre una cuadrícula cuya geometría se calcula íntegramente en CSS.

![CSS only](https://img.shields.io/badge/CSS-only%2C%20sin%20JS-1572B6?logo=css3&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-SCSS%20%2B%20BEM-CC6699?logo=sass&logoColor=white)
![Gulp](https://img.shields.io/badge/Gulp-5-CF4647?logo=gulp&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white)

---

## ✨ Características

- **Cero JavaScript** — la interactividad se resuelve con radio buttons ocultos y `:has()`; la geometría de la cuadrícula, con `sibling-index()`, `sibling-count()`, `sqrt()`, `round()` y `mod()`.
- **Transición en onda radial** — la rotación florece desde el centro de la cuadrícula hacia los bordes (retardo por distancia Manhattan), con un easing de desaceleración larga y sin sacudidas.
- **Sprite sheet por cara** — cada cara del conjunto usa una única imagen grande repartida entre los 64 cubos vía `background-size`/`background-position`, precargada con `<link rel="preload">`. Las imágenes se sirven en local (`src/img/`), sin dependencias de red en runtime.
- **Responsiva de verdad** — el tamaño de los cubos es fluido (`clamp()` sobre el lado más corto del viewport), sin breakpoints ni saltos.
- **Accesible** — con `prefers-reduced-motion: reduce` el 3D desaparece y el cambio de imagen es un fundido suave; el foco de teclado siempre es visible (`:focus-visible`) y los controles llevan `aria-label`.
- **Degradación elegante** — si el navegador no soporta las funciones CSS requeridas, un bloque `@supports` oculta la galería y muestra un aviso.

## 🚀 Inicio rápido

```bash
npm install
npm run dev
```

BrowserSync sirve `dist/` con watch y live reload.

| Script | Descripción |
| --- | --- |
| `npm run dev` | Build + servidor de desarrollo con watch y live reload |
| `npm run build` | Build de producción en `dist/` (limpia, compila SCSS comprimido con sourcemaps y copia el HTML) |
| `npm run clean` | Elimina `dist/` |

## 📁 Estructura

```text
├── src/
│   ├── index.html
│   ├── img/                    # imágenes de las 6 caras (face-1.jpg … face-6.jpg)
│   └── scss/                   # arquitectura 7-1 simplificada
│       ├── abstracts/
│       │   └── _variables.scss # toda la configuración del componente
│       ├── base/
│       │   ├── _reset.scss
│       │   └── _global.scss
│       ├── components/         # un bloque BEM por archivo
│       │   └── _image-cube-grid-gallery.scss
│       └── main.scss           # punto de entrada (solo @use)
├── dist/                       # build generado — no editar ni versionar
├── gulpfile.js                 # Gulp 5 (ESM)
└── package.json
```

## ⚙️ Cómo funciona

1. Cada cubo calcula su posición en la cuadrícula **en CSS puro**: `sibling-index()` y `sibling-count()` dan índice y total; `sqrt()` y `round()` derivan columnas y filas; `mod()` sitúa cada cubo en su celda.
2. Los seis radio buttons de navegación fijan las variables de rotación (`--_rx`, `--_ry`) en el bloque raíz mediante `:has()`, y los cubos las heredan y transicionan. Las variables animadas están registradas con `@property` (sintaxis tipada), requisito para poder transicionarlas.
3. El retardo de cada cubo es su distancia Manhattan al centro por `--_wave-delay`, de modo que la rotación se propaga como una onda. El punto móvil de la navegación dura exactamente lo mismo que el barrido completo gracias a la variable compartida `--_wave-max`.
4. El CSS repetitivo (estados de navegación, keyframes, caras) no se escribe a mano: se genera con bucles `@each`/`@for` de Sass a partir de los mapas de `_variables.scss`.

## 🎛️ Personalización

Todos los mandos están en `src/scss/abstracts/_variables.scss` y en las variables CSS del inicio del componente:

| Ajuste | Dónde | Efecto |
| --- | --- | --- |
| `$face-images` | `_variables.scss` | Rutas de las 6 imágenes, en `src/img/` (idealmente cuadradas, 600×600 o más). ⚠️ Duplicadas en los `<link rel="preload">` de `src/index.html` — actualizar ambos sitios |
| `$cube-easing` | `_variables.scss` | Curva de easing de la rotación |
| `$cube-count` | `_variables.scss` | Número de cubos — debe coincidir con los `<div>` del HTML |
| `--_cube-transition-duration` | `_image-cube-grid-gallery.scss` | Duración de la rotación de cada cubo |
| `--_wave-delay` | `_image-cube-grid-gallery.scss` | Paso de retardo de la onda entre anillos de cubos |
| `--_z-push-factor` | `_image-cube-grid-gallery.scss` | Profundidad del hundimiento en Z durante el giro |
| `--_size` (`clamp()`) | `_image-cube-grid-gallery.scss` | Tamaño fluido mínimo/máximo de los cubos |

Para desactivar la animación de entrada, elimina la clase `image-cube-grid-gallery--intro` del HTML.

## ♿ Accesibilidad

- `prefers-reduced-motion: reduce` desactiva la rotación 3D, el empuje en Z y la intro; el cambio de cara pasa a ser un crossfade de opacidad entre caras planas.
- Navegación completa por teclado con indicador de foco `:focus-visible`; los radios llevan `aria-label` descriptivo.
- Sin soporte CSS suficiente, se muestra un mensaje explicativo en lugar de una galería rota.

## 🌐 Compatibilidad

Requiere un navegador con soporte de `sibling-index()` / `sibling-count()`, `abs()` en `calc()`, `@property` y `:has()` — es deliberadamente un experimento de CSS de última generación. En navegadores sin soporte se muestra el aviso de degradación.

## 🖼️ Créditos

Fotografías de [Picsum Photos](https://picsum.photos/), incluidas en `src/img/`.
