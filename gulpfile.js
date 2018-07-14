// load in the modules
var gulp = require('gulp');
// use the exact module name
var concat = require('gulp-concat');
var minify = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var zip = require('gulp-zip');
var declare = require('gulp-declare'); // lets you create new variables inside of gulp
var wrap = require('gulp-wrap') // wrap your files in a set of code

// Image compression plugins
var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');

// File paths
var DIST_PATH = 'public/img';
var CSS_PATH = 'public/css/**/*.css';
var IMAGES_PATH = './img/**/*.{png,jpeg,jpg,svg,gif}';

// styles task
gulp.task('styles', function () {
    console.log('starting style task');

    // instead of passing a string as an argument, pass an array to specify which file should be loaded first. in this case, reset.css should load first because otherwise it overrides all the other settings for margin & padding in home.css
    return gulp.src(['public/css/reset.css', CSS_PATH])
        .pipe(plumber(function (err) {
            console.log('Styles Task Error');
            console.log(err.toString());
            this.emit('end'); // internal gulp method to stop running the rest of the processes where there is an error but still keep Gulp (specifically watch) up
        }))
        .pipe(sourcemaps.init()) // first specify to sourcemaps what the original css files looked like before processing them.
        .pipe(autoprefixer())
        // pipe the css files through the gulp-concat module and call it, providing a name for the final concatenated css file you can use for production
        .pipe(concat('styles.css'))
        .pipe(minify())
        .pipe(sourcemaps.write()) // writes the sourcemap in the new file given the information that was required when running sourcemaps.init(). i.e., what the file looks like after processing everything, so sourcemaps knows the difference and what to show you in the inspector.
        .pipe(gulp.dest(DIST_PATH))
});

// images task
gulp.task('images', function () {
    console.log('Image task started.');

    return gulp.src(IMAGES_PATH)
        // provide an array of plugins you want to use with imagemin 
        .pipe(imagemin(
            [
                imagemin.gifsicle(),
                imagemin.jpegtran(),
                imagemin.optipng(),
                imagemin.svgo(),
                imageminPngquant(),
                imageminJpegRecompress()
            ]
        ))
        .pipe(gulp.dest(DIST_PATH + '/img'));
});

// clean task
gulp.task('clean', function () {
    return del.sync([
        // remove the dist folder to always start with a clean slate
        DIST_PATH
    ]);
});

// default task
// include all the other tasks as dependencies and run default after these have been run
gulp.task('default', ['clean', 'images', 'styles'], function () {
    console.log('Starting default task.');
})

// export task, for zipping the content
gulp.task('export', function () {
    return gulp.src('public/**/*')
        // provide a name for the zip you want to create
        .pipe(zip('website.zip'))
        .pipe(gulp.dest('./'))
});
