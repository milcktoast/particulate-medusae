/*jshint node:true*/
'use strict';

// https://github.com/gruntjs/grunt-contrib-connect

// Start a connect web server.

module.exports = function (config) {
  return {
    options: {
      port: 8000,
      hostname: '*',
      base: './',
      livereload: 38000,
      open: true
    },
    develop: {}
  };
};
