/*jshint node:true*/
'use strict';

// https://github.com/sindresorhus/grunt-sass

// Compile Sass to CSS using node-sass.

module.exports = function (config) {
  return {
    options: {
      includePaths: [
        config.source + 'lib'
      ]
    },
    build: {
      files : [{
        expand: true,
        cwd : config.source + 'scss/',
        src: '*.scss',
        dest: '.temp/css/',
        ext: '.css'
      }],
      options : {
        outputStyle : 'compressed'
      }
    },
    develop: {
      files : '<%= sass.build.files %>',
      options : {
        sourceComments : 'map'
      }
    }
  };
};
