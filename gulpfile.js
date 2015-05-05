var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('gulp-bower');
var connect = require('gulp-connect');
var less = require('gulp-less');
var jasmine = require('gulp-jasmine');

gulp.task('tests', function () {
  return gulp.src('tests/*.js')
    .pipe(jasmine());
});

gulp.task('bower', function() {
  return bower();
});

gulp.task('install', ['bower'], function() {
  var bc = 'bower_components',
    files = [
      bc + '/jquery/dist/jquery.js',
      bc + '/bootstrap/dist/js/bootstrap.js',
      bc + '/jssip/dist/jssip.js'
    ];

  return gulp.src(files)
    .pipe(gulp.dest('./build/js/'));
});

gulp.task('serve', ['default', 'watch'], function () {
  connect.server({
      port: process.env.PORT || 8080,
      root: ['./build', './src'],
      livereload: true
    });
});

gulp.task('html', function () {
  connect.reload();
});

gulp.task('less', function () {
  gulp.src(['./src/less/app.less', './src/less/bootstrap.less'])
    .pipe(less()) // should use paths: [ path.join(__dirname, 'src', 'includes') ]
    .pipe(gulp.dest('./build/css'))
    .pipe(connect.reload());
});

gulp.task('js', function () {
  gulp.src('./src/js/*.js')
    .pipe(gulp.dest('./build/js'))
    .pipe(connect.reload());
});

gulp.task('images', function () {
  gulp.src('./src/images/*')
    .pipe(gulp.dest('./build/images'))
    .pipe(connect.reload());
});

gulp.task('favicon', function() {
  gulp.src('./src/favicon.ico')
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function () {
  gulp.watch(['./src/**.html'], ['html']);
  gulp.watch(['./src/less/*.less'], ['less']);
  gulp.watch(['./src/js/*.js'], ['js']);
  gulp.watch(['./src/images/*'], ['images'])
});

gulp.task('default', ['less', 'html', 'js', 'images'], function(){

});
