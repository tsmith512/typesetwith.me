/**
 * @file gulpfile.js
 *
 * Build tasks and generator tools for www.tsmith512.com
 * By Taylor Smith @tsmith512
 *
 * Run `gulp help` to for a list of suggested tasks.
 */

/* eslint strict: ["error", "global"] */
/* global require */
'use strict';

/*
     _
  __| | ___ _ __  ___
 / _` |/ _ \ '_ \/ __|
| (_| |  __/ |_) \__ \
 \__,_|\___| .__/|___/
           |_|
*/

const gulp = require('gulp-help')(require('gulp'), {
  description: false,
  hideDepsMessage: true,
  hideEmpty: true
});
const gutil = require('gulp-util');

const autoprefixer = require('gulp-autoprefixer');
const awspublish = require('gulp-awspublish');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const fs = require('fs');
const glob = require('glob');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const inlinesource = require('gulp-inline-source');
const rename = require("gulp-rename");
const resize = require('gulp-image-resize');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');

/*
                    _
  __ _ ___ ___  ___| |_ ___
 / _` / __/ __|/ _ \ __/ __|
| (_| \__ \__ \  __/ |_\__ \
 \__,_|___/___/\___|\__|___/

*/

// CSS
gulp.task('sass', 'Compile Sass to CSS', () => {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    // Run CleanCSS, but mostly just for minification. Starting light here.
    .pipe(cleanCSS({
      advanced: false,
      mediaMerging: false,
      rebase: false,
      restructuring: false,
      shorthandCompacting: false
    }))
    .pipe(concat('all.css'))
    .pipe(gulp.dest('./dist/css'));
});

/* @TODO: We had critical CSS before; let's get that back */

// IMAGES
gulp.task('favicons', 'Copy favicons into position', () => {
  return gulp.src(['./favicon/**/*.*'])
  .pipe(gulp.dest('./dist/'));
});

gulp.task('graphics', 'Compress site graphics and aggregate icons', ['favicons'], () => {
  return gulp.src(['./gfx/**/*.*'])
  .pipe(imagemin())
  .pipe(gulp.dest('./dist/gfx/'));
});

// JAVASCRIPT
gulp.task('js', 'Aggregate JavaScript', () => {
  return gulp.src(['js/vendor/jquery-1.10.2.min.js', 'js/vendor/dragdealer.js', 'js/main.js'])
  .pipe(concat('lib.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./dist/js/'));
});


// HTML & COPY SAMPLES

gulp.task('copy', 'Move the copy samples into position', () => {
  return gulp.src(['./copy/**/*.*'])
  .pipe(gulp.dest('./dist/copy/'));
});


gulp.task('html', 'Aggregate and minify HTML', ['copy'], () => {
  return gulp.src('index.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      conservativeCollapse: true,
    }))
    // .pipe(inlinesource({
    //   compress: false,
    //   rootpath: 'dist/',
    // }))
    .pipe(gulp.dest('dist'));
});

/*
     _ _         _           _ _     _
 ___(_) |_ ___  | |__  _   _(_) | __| |
/ __| | __/ _ \ | '_ \| | | | | |/ _` |
\__ \ | ||  __/ | |_) | |_| | | | (_| |
|___/_|\__\___| |_.__/ \__,_|_|_|\__,_|

*/

gulp.task('build', 'Run all site-generating tasks: sass, js, graphics, icons, then html', (cb) => {
  runSequence(['sass', 'graphics', 'js'], 'html', cb);
});

gulp.task('publish-s3', 'Sync the site to S3', (cb) => {
  // create a new publisher using S3 options
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
  var publisher = awspublish.create({
    region: 'us-west-1',
    params: {
      Bucket: 'typesetwithme'
    },
  });

  // define custom headers
  var headers = {
    'Cache-Control': 'max-age=2592000, no-transform, public'
  };

  return gulp.src('./dist/**/*.*')
    // publisher will add Content-Length, Content-Type and headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers))

    .pipe(publisher.sync())

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

     // print upload updates to console
    .pipe(awspublish.reporter());
});

gulp.task('publish', 'Build the site and publish to S3', (cb) => {
  runSequence(['build'], 'publish-s3', cb);
});

/*
             _             _          __  __
  __ _ _   _| |_ __    ___| |_ _   _ / _|/ _|
 / _` | | | | | '_ \  / __| __| | | | |_| |_
| (_| | |_| | | |_) | \__ \ |_| |_| |  _|  _|
 \__, |\__,_|_| .__/  |___/\__|\__,_|_| |_|
 |___/        |_|
*/

gulp.task('default', false, ['help']);

gulp.task('watch', 'Watch everything and rebuild', () => {
  gulp.watch(['./*.*', './**/*.*', '!./node_modules/**', '!./dist/**'], ['build']);
});
