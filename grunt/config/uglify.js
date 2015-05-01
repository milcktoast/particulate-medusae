/*jshint node:true*/
'use strict';

// https://github.com/gruntjs/grunt-contrib-uglify

// Minify files with UglifyJS.

module.exports = function (config) {
  return {
    app: {
      src: [
        config.static + 'js/libs.develop.js',
        config.static + 'js/shader-chunks.develop.js',
        config.static + 'js/shaders.develop.js',
        config.static + 'js/app.develop.js'
      ],
      dest: config.static + 'js/app.min.js'
    }
  };
};
