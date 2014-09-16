/*jshint node:true*/
'use strict';

// https://github.com/nDmitry/grunt-autoprefixer

// Parses CSS and add vendor-prefixed properties using the Can I Use database.

module.exports = function (config) {
  return {
    options: {
      browsers: ['> 1%', 'last 2 versions', 'ie 9']
    },
    build: {
      files : [{
        expand: true,
        cwd: '.temp/css/',
        src: '*.css',
        dest: config.static + 'css/'
      }]
    },
    develop: {
      files : '<%= autoprefixer.build.files %>',
      options: {
        map: true
      }
    }
  };
};
