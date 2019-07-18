'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const combineMq = require('gulp-combine-mq');
const concat = require("gulp-concat");
const http = require('http');
const st = require('st');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const notify = require("gulp-notify");
const htmlmin = require('gulp-htmlmin');

// Error notifications with notify
// Shows a banner on macOs
const reportError = function(error) {
  notify({
    title: 'Gulp Task Error',
    message: 'Check the console.'
  }).write(error);
  console.log(error.toString());
  this.emit('end');
};

const paths = {
    sass: './src/sass/**/*.scss',
    js: './src/js/*.js',
    html: './index.html',
};

// Sass compilation
gulp.task('sass', function () {
  gulp.src(paths.sass)
    .pipe(sass({
      sourceComments: true,
      precision: 3,
      includePaths: [].concat(
        'node_modules/normalize-scss/sass'
      )
    }))
    .pipe(gulp.dest('./assets/css'))
    .on('error', reportError)
    .pipe(livereload());
});

// Sass production build
gulp.task('sass:build', function () {
  var processors = [
    autoprefixer({browsers: ['last 2 versions']}),
  ];
  return gulp.src(paths.sass)
    .pipe(sass({
      outputStyle: 'compressed',
      precision: 3,
      includePaths: [].concat(
        'node_modules/normalize-scss/sass'
      )
    }))
    .pipe(combineMq({
      beautify: false // false will inline css
    }))
    .pipe(postcss(processors))
    .pipe(gulp.dest('./assets/css'));
});

gulp.task('html', function() {
  return gulp.src(paths.html)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./'));
});

// Lint.

gulp.task('lint', function () {
  return gulp.src(paths.js)
    .pipe(eslint({
      'rules':{
        'quotes': [1, 'single'],
        'semi': [1, 'always']
      }
    }))
    .pipe(eslint.formatEach('compact', process.stderr))
    .pipe(uglify())
    .on('error', reportError)
    .pipe(gulp.dest('./assets/js')
  );
});


/**
 * Build tasks
 */

// Set defaut task
gulp.task('default', ['watch']);

// Build sass files & styleguide
// @todo html minify routine
gulp.task('build', ['sass:build', 'lint']);

// Watch sass files & generate styleguide
gulp.task('watch', ['server'], function() {
  livereload.listen();
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['lint']);
  gulp.watch(paths.html, function (files){
      livereload.changed(files)
  });
});

gulp.task('server', function(done) {
  http.createServer(
    st({ path: __dirname, index: 'index.html', cache: false })
  ).listen(8080, done);
});
