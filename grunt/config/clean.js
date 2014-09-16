/*jshint node:true*/
'use strict';

// https://github.com/gruntjs/grunt-contrib-clean

// Cleans folders and files.

module.exports = function (config) {
  return {
    build: config.deploy + '*',
    temp: '.temp'
  };
};
