const gulp = require('gulp')
const del = require('del')
const sass = require('gulp-sass')(require('sass'))
const rename = require('gulp-rename')
const cleanCSS = require('gulp-clean-css')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const size = require('gulp-size')
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const htmlmin = require('gulp-htmlmin')
const newer = require('gulp-newer')
const browsersync = require('browser-sync').create()
const gulppug = require('gulp-pug')
const webp = require('gulp-webp')
const gulpWebpHtml = require('gulp-webp-html-nosvg')
const fs = require('fs')
const fonter = require('gulp-fonter')
const ttf2woff2 = require('gulp-ttf2woff2')
const path = require('path')





const paths = {
    html: {
      src: ['src/*.html', 'src/*.pug'],
      dest: 'dist/'
    },
    styles: {
      src: ['src/styles/**/*.sass', 'src/styles/**/*.scss', 'src/styles/**/*.css'],
      dest: 'dist/css/'
    },
    scripts: {
      src: 'src/scripts/**/*.js',
      dest: 'dist/js/'
    },
    images: {
      src: 'src/img/**/*.{jpg,jpeg,png,gif,webp,svg}',
      dest: 'dist/img/'
    }, 
    fonts: {
      src: 'src/fonts/',
      dest: 'dist/fonts/'
    }, 
  }


// Очистити качалог dist, видалити все окрім зображень
function clean() {
    return del(['dist/*', '!dist/img'])
  }

function html() {
  return gulp.src(paths.html.src)
  .pipe(gulppug())
  .pipe(gulpWebpHtml())
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(size({
    showFiles:true
  }))
  .pipe(gulp.dest(paths.html.dest))
  .pipe(browsersync.stream())

}

function styles() {
  return gulp.src(paths.styles.src)
  .pipe(sourcemaps.init()) //щоб в браузері показувало в якій стрічці коду
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer({
    cascade: false
  }))
  .pipe(cleanCSS({level:2}))
  .pipe(rename({
    basename: 'style',
    suffix: '.min'
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(size())
  .pipe(gulp.dest(paths.styles.dest))
  .pipe(browsersync.stream())

}
function scripts() {
  return gulp.src(paths.scripts.src, {sourcemaps:true})
  .pipe(sourcemaps.init())
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(uglify())
  .pipe(concat('main.min.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(size())
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(browsersync.stream())

} 
function img() {
  return gulp.src(paths.images.src)
  .pipe(newer(paths.images.dest))
  .pipe(webp())
  .pipe(gulp.dest(paths.images.dest))
  .pipe(gulp.src(paths.images.src))
  .pipe(newer(paths.images.dest))
  .pipe(imagemin({
    progressive: true
  }))
  .pipe(size())
  .pipe(gulp.dest(paths.images.dest))
}
/*Шрифти*/
function fontsCopy() {
  return gulp.src(`src/fonts/*.{woff,woff2}`) //шукаємо otf тільки
  .pipe(gulp.dest(paths.fonts.dest)) // вивантажуємо назад в робочу папку
}

function otfToTtf() {
  return gulp.src(`src/fonts/*.otf`) //шукаємо otf тільки
  .pipe(fonter({
    formats: ['ttf'] // форматуємо їх в ttf
  }))
  .pipe(gulp.dest(paths.fonts.src)) // вивантажуємо назад в робочу папку
}
function ttfToWoff() {
  return gulp.src(`src/fonts/*.ttf`) //беремо ttf (або якийсь новий файл, або той що ми щойно створили з otf) 
  .pipe(fonter({
    formats: ['woff'] // форматуємо в woff
  }))
  .pipe(gulp.dest(paths.fonts.dest)) // вивантажуємо готовий файл в фінальну папку
  .pipe(gulp.src(`src/fonts/*.ttf`)) // знову беремо ttf
  .pipe(ttf2woff2()) //конвертуємо його в woff2
  .pipe(gulp.dest(paths.fonts.dest)) // додаємо його туди ж в фінальну папку, що і woff
}

/*Кінець шрифтів*/


function watch() {
  browsersync.init({
    server: {
        baseDir: "./dist"
    }
  })
    gulp.watch(paths.html.dest).on('change', browsersync.reload)
    gulp.watch(paths.html.src, html)
    gulp.watch(paths.scripts.src, scripts)
    gulp.watch(paths.styles.src, styles)
    gulp.watch(paths.images.src, img)
  }

const build = gulp.series(clean, html, gulp.parallel(styles, scripts, img), watch)
const fonts = gulp.series(fontsCopy, otfToTtf, ttfToWoff)

exports.fonts = fonts 
exports.clean = clean
exports.scripts = scripts
exports.styles = styles
exports.watch = watch
exports.build = build
exports.default = build

