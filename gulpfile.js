import { rm } from 'node:fs/promises';

import browserSyncLib from 'browser-sync';
import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';

const { src, dest, watch, series, parallel } = gulp;
const sass = gulpSass(dartSass);
const browserSync = browserSyncLib.create();

const paths = {
  styles: {
    entry: 'src/scss/main.scss',
    watch: 'src/scss/**/*.scss',
    dest: 'dist/css',
  },
  markup: {
    src: 'src/*.html',
    dest: 'dist',
  },
  images: {
    src: 'src/img/**/*',
    dest: 'dist/img',
  },
};

export function clean() {
  return rm('dist', { recursive: true, force: true });
}

export function styles() {
  return src(paths.styles.entry, { sourcemaps: true })
    // gulp-sass 6 usa la API moderna de Dart Sass (compileString): la opción
    // es `style`, no `outputStyle` (el nombre legacy se ignora en silencio y
    // el CSS sale sin comprimir).
    .pipe(sass.sync({ style: 'compressed' }).on('error', sass.logError))
    .pipe(dest(paths.styles.dest, { sourcemaps: '.' }))
    .pipe(browserSync.stream({ match: '**/*.css' }));
}

export function markup() {
  return src(paths.markup.src).pipe(dest(paths.markup.dest));
}

export function images() {
  // encoding: false — sin él, Gulp 5 decodifica los binarios como UTF-8
  // y corrompe las imágenes.
  return src(paths.images.src, { encoding: false }).pipe(dest(paths.images.dest));
}

function reload(done) {
  browserSync.reload();
  done();
}

function serve() {
  browserSync.init({
    server: { baseDir: 'dist' },
    open: false,
    notify: false,
  });

  watch(paths.styles.watch, styles);
  watch(paths.markup.src, series(markup, reload));
  watch(paths.images.src, series(images, reload));
}

export const build = series(clean, parallel(styles, markup, images));

export default series(build, serve);
