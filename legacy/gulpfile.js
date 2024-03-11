var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var streamify = require("streamify");
var uglify = require("gulp-uglify");
var paths = {
    pages: ['src/*.html']
};

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task("release", ["copy-html"], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/RenGlobal.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(gulp.src('rensport.js'))
		.pipe(uglify())
        .pipe(gulp.dest("."));
});

gulp.task("debug", ["copy-html"], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/RenGlobal.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('rensport.js'))
        .pipe(gulp.dest("."));
});

gulp.task("logosearch:debug", ["copy-html"], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/logosearch/LogoSearch.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('logosearch.js'))
        .pipe(gulp.dest("."));
});