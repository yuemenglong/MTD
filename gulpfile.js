var fs = require("fs");
var gulp = require("gulp");
var jadeJsx = require("gulp-jade-jsx");
var addsrc = require('gulp-add-src');
var rename = require("gulp-rename");
// var merge = require("gulp-merge");
var merge = require('merge-stream');
var babel = require("gulp-babel");
var _ = require("lodash");
var Build = require("yy-build");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

function getApp() {
    return fs.readdirSync("src").filter(function(name) {
        return _.upperFirst(name) == name;
    })
}

function build(done) {
    return gulp.src("src/**/*.jsx")
        .pipe(jadeJsx())
        .pipe(rename({ extname: ".js" }))
        .pipe(addsrc(["src/**/*.js", "src/**/*.less"]))
        .pipe(babel({ presets: ['react'] }))
        .pipe(gulp.dest("build"));
}

function pack(done) {
    var tasks = getApp().map(function(app) {
        var b = browserify(`build/${app}/index.js`);
        var build = new Build.Browserify(b);
        build.plugin(new Build.ExcludePlugin(["react", "react-dom", "lodash"]));
        return b.bundle()
            .pipe(source("bundle.js"))
            .pipe(buffer())
            .pipe(gulp.dest(`bundle/${app}`));
    });
    return merge(tasks);
}

gulp.task(build);
gulp.task(pack);
gulp.task("default", gulp.series(build, pack));
