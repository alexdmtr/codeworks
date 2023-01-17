var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  mocha = require('gulp-mocha')
var app = require('./app').default

const PORT = process.env.PORT || 3000;

gulp.task('default', function () {
  nodemon({
    script: 'bin/www.js',
    ext: 'js',
    env: {
      PORT
    },
    ignore: ['./node_modules/**'],
    // tasks: ['test'],
    quiet: true,
  })
})