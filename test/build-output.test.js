// Tests sobre dist/: requieren un build fresco. `npm test` ejecuta `npm run
// build` automáticamente antes (hook "pretest" en package.json).

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const distPath = (p) => join(root, 'dist', p);
const read = (relPath) => readFileSync(join(root, relPath), 'utf8');

before(() => {
  assert.ok(
    existsSync(distPath('index.html')),
    'falta dist/index.html — ejecuta `npm run build` antes de los tests (con `npm test` es automático)',
  );
});

describe('dist/index.html', () => {
  test('es una copia exacta de src/index.html (la tarea markup solo copia, no transforma)', () => {
    assert.equal(read('dist/index.html'), read('src/index.html'));
  });
});

describe('dist/css/main.css', () => {
  const css = () => readFileSync(distPath('css/main.css'), 'utf8');

  test('existe y está minificado en una sola línea', () => {
    const lines = css().trim().split('\n');
    assert.equal(
      lines.length,
      1,
      'el CSS no salió comprimido — revisar sass.sync({ style: "compressed" }) en gulpfile.js',
    );
  });

  test('existe el sourcemap', () => {
    assert.ok(existsSync(distPath('css/main.css.map')));
  });

  test('incluye image-set(), el coral del indicador activo y la media query móvil', () => {
    const c = css();
    assert.match(c, /image-set\(/);
    assert.match(c, /coral/);
    assert.match(c, /768px/);
    assert.match(c, /50dvh/);
  });

  test('registra las custom properties animadas con @property', () => {
    const c = css();
    assert.match(c, /@property\s+--_rx\{/);
    assert.match(c, /@property\s+--_nav-index\{/);
  });
});

describe('dist/img/', () => {
  test('cada una de las 6 caras tiene sus 3 formatos (avif, webp, jpg) y no están vacíos', () => {
    for (let i = 1; i <= 6; i += 1) {
      for (const ext of ['avif', 'webp', 'jpg']) {
        const file = distPath(`img/face-${i}.${ext}`);
        assert.ok(existsSync(file), `falta ${file}`);
        assert.ok(
          statSync(file).size > 0,
          `${file} está vacío (¿corrupción por decodificar binarios como UTF-8 en Gulp 5?)`,
        );
      }
    }
  });
});
