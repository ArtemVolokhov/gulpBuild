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

function html() {
  return gulp.src(paths.html.src)
  .pipe(gulppug())
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
  .pipe(imagemin({
    progressive: true
  }))
  .pipe(size())
  .pipe(gulp.dest(paths.images.dest))
}


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

  }

const build = gulp.series(clean, html, gulp.parallel(styles, scripts, img), watch)


exports.clean = clean
exports.scripts = scripts
exports.styles = styles
exports.watch = watch
exports.build = build
exports.default = build

