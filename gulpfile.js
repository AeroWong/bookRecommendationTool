var gulp = require('gulp'),
    sass = require('gulp-sass'),
    minifyCSS = require('gulp-minify-css'),
    cleanCSS = require('gulp-clean-css');

// Defines path to source and assets
var project = {
    src: 'client/src',
    dest: 'client/assets'
}

gulp.task('build-css', function(){
    return gulp.src(project.src + '/scss/**/*.scss')
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(minifyCSS())
        .pipe(gulp.dest(project.dest + '/css'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch([project.src + '/scss/**/*.scss'], ['build-css']);
});