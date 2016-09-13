var gulp        = require('gulp'),
    watch       = require('gulp-watch'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    rename      = require('gulp-rename'),
    moment      = require('moment'),
    notify      = require('gulp-notify'),
    serve       = require('gulp-serve'),
    clean       = require('gulp-clean'),
    cleanCSS    = require('gulp-clean-css');

    require('gulp-help')(gulp, {
        description: 'Help listing.'
    });

gulp.task('serve', 'A simple web server.', serve('build'));

gulp.task('clean', function () {
    return gulp.src('build', {read: false})
        .pipe(clean());
});

gulp.task('copy-js', 'Copy files', function() {
    gulp.src('src/assets/scripts/**/*')
        .pipe(gulp.dest('build/assets/scripts/'));
});

gulp.task('copy', 'Copy files', function() {
    gulp.src('src/*.html')
        .pipe(gulp.dest('build'));

    gulp.src('src/assets/styles/*')
        .pipe(gulp.dest('build/assets/styles/'));

    gulp.src('src/assets/media/*')
        .pipe(gulp.dest('build/assets/media/'));
});

gulp.task('uglify-js', 'Concat, Ng-Annotate, Uglify JavaScript into a single app.min.js.', function() {
    gulp.src(['src/assets/scripts/**/*.js'])
        .pipe(concat('app'))
        .pipe(uglify())
        .on('error', notify.onError("Error: <%= error.message %>"))
        .pipe(rename({
            extname: ".min.js"
         }))
        .pipe(gulp.dest('build/assets/scripts/'))
        .pipe(notify('Uglified JavaScript (' + moment().format('MMM Do h:mm:ss A') + ')'));
});

gulp.task('watch', 'Watch for changes', function() {
    watch({
        glob: 'src/assets/scripts/**/*.js'
    }, function() {
        gulp.start('copy-js');
    });

    watch({
        glob: 'src/**/*',
    }, function() {
        gulp.start('copy');
    });
});

gulp.task('minify-css', function() {
  return gulp.src('src/assets/styles/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('build/assets/styles/'));
});

gulp.task('default', ['clean', 'watch', 'serve']);

gulp.task('prod', ['clean', 'copy', 'uglify-js', 'minify-css']);
