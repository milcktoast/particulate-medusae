/*jshint node:true*/
'use strict';

// https://github.com/gruntjs/grunt-contrib-jshint

// Validate javascript files with JSHint.
// The jshint options should be set in the .jshintrc file.

module.exports = function (config) {
  return {
    options: {
      jshintrc: '.jshintrc'
    },
    all: [
      'Gruntfile.js',
      'grunt/{,**/}*.js',
      config.source + 'js/{,**/}*.js'
    ]
  };
};
