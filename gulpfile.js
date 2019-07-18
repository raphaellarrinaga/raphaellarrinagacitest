/**
 * @file
 */

(function () {
  // eslint-disable-next-line strict
  'use strict';

  const gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('autoprefixer'),
    combineMq = require('gulp-combine-mq'),
    livereload = require('gulp-livereload'),
    postcss = require('gulp-postcss'),
    htmlmin = require('gulp-htmlmin'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber');

  const processors = [
    autoprefixer(),
  ];

  const paths = {
    sass: './src/sass/**/*.scss',
    js: './src/js/*.js',
    html: './index.html',
  };

  // Error notifications with notify.
  const reportError = (error) => {
    notify.onError({
      title: 'Gulp error in ' + error.plugin,
      message: error.toString()
    })(error);
  };

  function compileHtml() {
    return gulp
      .src(paths.html)
      .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(gulp.dest('./'));
  }

  exports.compileHtml = compileHtml;

  // @todo group compile&watch css.
  // Maybe see package.json npm scripts.
  function compileCSS() {
    return gulp
      .src(paths.sass)
      .pipe(
        sass({
          outputStyle: 'compressed',
          sourceComments: false,
          precision: 3,
          includePaths: [].concat(
            'node_modules/normalize-scss/sass'
          ),
        })
      )
      .pipe(postcss(processors))
      .pipe(plumber(reportError))
      .pipe(gulp.dest('./assets/css'));
  }

  function watchCSS() {
    return gulp
      .src(paths.sass)
      .pipe(
        sass({
          outputStyle: 'nested',
          sourceComments: true,
          precision: 3,
          includePaths: [].concat(
            'node_modules/normalize-scss/sass'
          ),
        })
      )
      .pipe(postcss(processors))
      .pipe(plumber(reportError))
      .pipe(gulp.dest('./assets/css'))
      .pipe(livereload());
  }

  exports.watchCSS = watchCSS;

  function watchFiles() {
    livereload.listen();
    gulp.watch(paths.sass, watchCSS);
  }

  exports.watch = watchFiles;

  const build = gulp.series(compileHtml, compileCSS);
  exports.build = build;

}());
