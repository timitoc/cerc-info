const gulp = require("gulp");
const apidoc = require("gulp-apidoc");

gulp.task("apidoc", (done) => {
  apidoc({
    src: "./api/routes",
    dest: "./docs"
  }, done);
});

gulp.task("watch", () => {
  gulp.watch(["./api/routes/**"], ["apidoc"]);
});
