var gulp = require('gulp'),
    sass = require('gulp-sass');

// Defines path to source and assets
var project = {
    src: 'client/src',
    dest: 'client/assets'
}

gulp.task('build-dev-css', function(){
    return gulp.src(project.src + '/scss/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(project.dest + '/css'));
});