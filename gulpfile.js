var gulp = require('gulp'),
    sass = require('gulp-sass'),
    $    = require('gulp-load-plugins')(),
    minifyCSS = require('gulp-minify-css'),
    cleanCSS = require('gulp-clean-css'),
    sassPaths = [
      'bower_components/foundation-sites/scss',
      'bower_components/motion-ui/src'
    ];

// Defines path to source and assets
var project = {
    src: 'client/src',
    dest: 'client/assets'
}

gulp.task('build-css', function(){
    return gulp.src(project.src + '/scss/**/*.scss')
        .pipe($.sass({
          includePaths: sassPaths,
          outputStyle: 'compressed' // if css compressed **file size**
        })
          .on('error', $.sass.logError))
        .pipe($.autoprefixer({
          browsers: ['last 2 versions', 'ie >= 9']
        }))
        .pipe(cleanCSS())
        .pipe(minifyCSS())
        .pipe(gulp.dest(project.dest + '/css'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch([project.src + '/scss/**/*.scss'], ['build-css']);
});