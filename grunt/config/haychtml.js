/*jshint node:true*/
'use strict';

// https://github.com/timrwood/haychtml

// Compiles html templates.

module.exports = function (config) {
  return {
    develop : {
      engine: 'swig',
      src: config.pages,
      dest: './',
      data : {
        TEMPLATE_DEBUG : true,
        STATIC_URL : config.static
      }
    },
    build : {
      engine: 'swig',
      src: config.pages,
      dest: './',
      data : {
        TEMPLATE_DEBUG : false,
        STATIC_URL : config.static
      }
    }
  };
};
