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
      src: 'src/img/**',
      dest: 'dist/img/'
    }
  }


// Очистити качалог dist, видалити все окрім зображень
function clean() {
    return del(['dist/*', '!dist/img'])
  }

function styles() {
    return gulp.src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(rename({
      basename: 'style',
      suffix: '.min'
    }))
    .pipe(size({
      showFiles:true
    }))
    .pipe(gulp.dest(paths.styles.dest))

  }
function scripts() {
  return gulp.src(paths.scripts.src, {sourcemaps:true})

  .pipe(babel())
  .pipe(uglify())
  .pipe(concat('main.min.js'))

  .pipe(size({
    showFiles:true
  }))
  .pipe(gulp.dest(paths.scripts.dest))

} 

function watch() {

    gulp.watch(paths.scripts.src, scripts)
    gulp.watch(paths.styles.src, styles)

  }

const build = gulp.series(clean, gulp.parallel(styles, scripts), watch)


exports.clean = clean
exports.scripts = scripts
exports.styles = styles
exports.watch = watch
exports.build = build
exports.default = build

