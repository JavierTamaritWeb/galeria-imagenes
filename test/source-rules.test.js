// Tests estáticos sobre src/ y gulpfile.js: no requieren build previo.
//
// Cada bloque referencia, cuando aplica, la entrada correspondiente del
// "Registro de problemas resueltos" de CLAUDE.md — codifican esas reglas
// como aserciones para que una regresión futura falle aquí, no en producción.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (relPath) => readFileSync(join(root, relPath), 'utf8');

const stripHtmlComments = (s) => s.replace(/<!--[\s\S]*?-->/g, '');
const stripScssComments = (s) =>
  s.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

const gulpfile = read('gulpfile.js');
const variables = read('src/scss/abstracts/_variables.scss');
const globalScss = stripScssComments(read('src/scss/base/_global.scss'));
const component = stripScssComments(
  read('src/scss/components/_image-cube-grid-gallery.scss'),
);
const html = stripHtmlComments(read('src/index.html'));

// ---------------------------------------------------------------------------
// gulpfile.js
// ---------------------------------------------------------------------------

describe('gulpfile.js', () => {
  test('la tarea styles usa la opción moderna `style`, no el nombre legacy `outputStyle` (gulp-sass 6 la ignora en silencio)', () => {
    assert.match(gulpfile, /sass\.sync\(\s*\{\s*style:\s*['"]compressed['"]/);
  });

  test('la tarea images copia binarios con encoding:false (si no, Gulp 5 los corrompe)', () => {
    const imagesTask = gulpfile.match(/export function images[\s\S]*?\n}/)?.[0];
    assert.ok(imagesTask, 'no se encontró la función images() en gulpfile.js');
    assert.match(imagesTask, /encoding:\s*false/);
  });
});

// ---------------------------------------------------------------------------
// base/_global.scss
// ---------------------------------------------------------------------------

describe('src/scss/base/_global.scss', () => {
  test('el body usa 100dvh (no 100vh) para no tapar la navegación en móvil con la barra dinámica', () => {
    assert.match(globalScss, /height:\s*100dvh/);
    assert.doesNotMatch(globalScss, /:\s*100vh\b/);
  });
});

// ---------------------------------------------------------------------------
// abstracts/_variables.scss
// ---------------------------------------------------------------------------

describe('src/scss/abstracts/_variables.scss', () => {
  const extractMapBody = (mapName) => {
    const re = new RegExp(`\\$${mapName}:\\s*\\(([\\s\\S]*?)\\n\\);`);
    const match = variables.match(re);
    assert.ok(match, `no se encontró el mapa $${mapName}`);
    return match[1];
  };
  const countEntries = (mapName) =>
    [...extractMapBody(mapName).matchAll(/^\s*\d+:/gm)].length;

  test('$face-rotations, $face-images, $face-transforms y $button-face tienen 6 entradas (una por cara)', () => {
    for (const map of ['face-rotations', 'face-images', 'face-transforms', 'button-face']) {
      assert.equal(countEntries(map), 6, `$${map} debería tener 6 entradas`);
    }
  });

  test('las caras superior/inferior llevan los signos de rx documentados (rotateX positivo inclina la parte superior hacia atrás)', () => {
    const rotations = extractMapBody('face-rotations');
    assert.match(rotations, /5:\s*\(rx:\s*-90deg,\s*ry:\s*0deg\)/, 'cara superior: rx debe ser -90deg');
    assert.match(rotations, /6:\s*\(rx:\s*90deg,\s*ry:\s*0deg\)/, 'cara inferior: rx debe ser 90deg');
  });

  test('$face-images usa rutas base sin extensión, relativas al CSS compilado (../img/face-N)', () => {
    const paths = [...extractMapBody('face-images').matchAll(/'([^']+)'/g)].map((m) => m[1]);
    assert.equal(paths.length, 6);
    for (const p of paths) {
      assert.match(p, /^\.\.\/img\/face-\d$/, `${p} no es una ruta base ../img/face-N sin extensión`);
    }
  });

  test('$face-formats mantiene el orden de preferencia AVIF → WebP → JPG', () => {
    const formats = extractMapBody('face-formats');
    const order = [...formats.matchAll(/'(avif|webp|jpg)':/g)].map((m) => m[1]);
    assert.deepEqual(order, ['avif', 'webp', 'jpg']);
  });

  test('$color-accent es el coral #ff7f50 usado en el indicador de cara activa', () => {
    assert.match(variables, /\$color-accent:\s*#ff7f50/);
  });
});

// ---------------------------------------------------------------------------
// components/_image-cube-grid-gallery.scss
// ---------------------------------------------------------------------------

describe('src/scss/components/_image-cube-grid-gallery.scss', () => {
  test('las caras se sirven con image-set(), no con <picture> (las caras son fondos CSS, no <img>)', () => {
    assert.match(component, /background-image:\s*image-set\(#\{\$sources\}\)/);
    assert.doesNotMatch(component, /<picture>/);
  });

  test('los colores viven en _variables.scss, no como literales rgb()/hex sueltos en el componente', () => {
    assert.doesNotMatch(component, /#(fff|000|ff7f50)\b/i);
    assert.doesNotMatch(component, /rgb\(\s*\d+\s+\d+\s+\d+/);
  });

  test('el elemento __active-indicator existe y ya no se llama __moving-dot', () => {
    assert.match(component, /&__active-indicator\s*\{/);
    assert.doesNotMatch(component, /moving-dot/);
  });

  test('la media query móvil (≤768px) recoloca __navigation debajo de la cuadrícula', () => {
    assert.match(component, /@media \(max-width:\s*768px\)/);
    assert.match(component, /50dvh/);
  });

  test('las 6 propiedades de rotación/onda/intro están registradas con @property (requisito para transicionarlas)', () => {
    const registered = [...component.matchAll(/@property\s+(--_[\w-]+)/g)].map((m) => m[1]);
    for (const name of ['--_rx', '--_ry', '--_tz', '--_intro-ry', '--_intro-tz', '--_nav-index']) {
      assert.ok(registered.includes(name), `${name} no está registrada con @property`);
    }
  });
});

// ---------------------------------------------------------------------------
// src/index.html
// ---------------------------------------------------------------------------

describe('src/index.html', () => {
  test('$cube-count coincide con el número de <div>.__cube en el HTML', () => {
    const cubeCount = Number(variables.match(/\$cube-count:\s*(\d+)/)[1]);
    const cubesInHtml = [...html.matchAll(/class="image-cube-grid-gallery__cube"/g)].length;
    assert.equal(cubesInHtml, cubeCount, '$cube-count debe coincidir con los <div> repetidos en el HTML');
  });

  test('cada cubo tiene exactamente 6 <span> vacíos (una por cara)', () => {
    const cubes = [...html.matchAll(/<div class="image-cube-grid-gallery__cube">([\s\S]*?)<\/div>/g)];
    assert.ok(cubes.length > 0, 'no se encontró ningún cubo');
    for (const [, inner] of cubes) {
      const spans = [...inner.matchAll(/<span><\/span>/g)].length;
      assert.equal(spans, 6);
    }
  });

  test('hay exactamente 6 botones de navegación (radio name="face") y uno solo marcado', () => {
    const radios = [...html.matchAll(/type="radio"[^>]*name="face"/g)];
    assert.equal(radios.length, 6);
    const checked = [...html.matchAll(/name="face"[^>]*checked/g)];
    assert.equal(checked.length, 1);
  });

  test('lang="es" y sin <img> (las caras son fondos CSS, no imágenes)', () => {
    assert.match(html, /<html lang="es">/);
    assert.doesNotMatch(html, /<img\b/);
  });

  test('landmark <main> y <h1 class="visually-hidden"> presentes', () => {
    assert.match(html, /<main class="image-cube-grid-gallery/);
    assert.match(html, /<h1 class="visually-hidden">[^<]+<\/h1>/);
  });

  test('metadatos: charset, viewport, color-scheme y description', () => {
    assert.match(html, /<meta charset="UTF-8">/);
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1\.0">/);
    assert.match(html, /<meta name="color-scheme" content="light">/);
    assert.match(html, /<meta name="description" content="[^"]+">/);
  });

  test('componente autocontenido: sin <link rel="preload"> ni favicon en el <head>', () => {
    assert.doesNotMatch(html, /<link rel="preload"/);
    assert.doesNotMatch(html, /<link rel="icon"/);
  });

  test('sin restos del texto __info ni del elemento __moving-dot', () => {
    assert.doesNotMatch(html, /__info\b/);
    assert.doesNotMatch(html, /__moving-dot/);
  });
});

// ---------------------------------------------------------------------------
// Versionado
// ---------------------------------------------------------------------------

describe('Versionado', () => {
  test('la versión de package.json tiene su entrada en CHANGELOG.md', () => {
    const pkg = JSON.parse(read('package.json'));
    const changelog = read('CHANGELOG.md');
    const escaped = pkg.version.replace(/\./g, '\\.');
    assert.match(
      changelog,
      new RegExp(`## \\[${escaped}\\]`),
      `CHANGELOG.md no tiene entrada "## [${pkg.version}]" para la versión de package.json`,
    );
  });
});
