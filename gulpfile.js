var gulp = require('gulp');
var babel = require("gulp-babel");
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var less = require('gulp-less');
var rename = require('gulp-rename');

gulp.task( 'hello', function() {
  console.log('Hello gulp!');
});

gulp.task( 'babel', function() {
  gulp.src('./src/js/*.js')
  	.pipe(plumber())
    .pipe(babel({
      presets: ['es2015']
    }))
	.pipe(gulp.dest('./public/js'))
});

gulp.task( 'babel2', function() {
  gulp.src('./mod/d3m.js')
  	.pipe(plumber())
	.pipe(rename('d3m_.js'))
    .pipe(babel({
      presets: ['es2015']
    }))
	.pipe(gulp.dest('./public/js'))
});

gulp.task( 'sass', function() {
	gulp.src('./src/scss/*.scss')
	.pipe(plumber())
	.pipe(sass())
	.pipe(gulp.dest('./public/style'));
});

gulp.task( 'less', function() {
	gulp.src('./src/*.less')
	.pipe(less())
	.pipe(gulp.dest('./dist'))
});

gulp.task( 'watch', function() {
  gulp.watch('./src/js/*.js', ['babel'])
  gulp.watch('./src/scss/*.scss', ['sass'])
});


gulp.task('default', ['babel', 'babel2', 'watch', 'sass']);
//gulp.task('default', ['babel','babel2', 'sass', 'watch']);
