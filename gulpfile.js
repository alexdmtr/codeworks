var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  mocha = require('gulp-mocha')
var app = require('./app')

gulp.task('seed', function () {
  var db = require('./models')

  return db
    .sync({
      force: true
    })
    .then(() => {
      return db.seed();
    });
})


gulp.task('test', ['seed'], function () {
  return gulp.src('./test/**')
    .pipe(mocha({
      bail: true
    }))

})

gulp.task('default', function () {
  nodemon({
    script: 'bin/www.js',
    ext: 'js',
    env: {
      PORT: 3000
    },
    ignore: ['./node_modules/**'],
    // tasks: ['test'],
    quiet: true
  })
})