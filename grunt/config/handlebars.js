/*jshint node:true*/
'use strict';

// https://github.com/gruntjs/grunt-contrib-handlebars

// Precompile Handlebars templates to JST file.

module.exports = function (config) {
  return {
    options : {
      processName : function (path) {
        var name = path.split('/').pop();
        return name.split('.')[0];
      }
    },

    shaders : {
      options : {
        namespace : 'App.shaders'
      },
      src : config.source + 'glsl/shaders/{,*/}*',
      dest : config.static + 'js/shaders.develop.js'
    }
  };
};
