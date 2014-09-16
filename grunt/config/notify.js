/*jshint node:true*/
'use strict';

// https://github.com/dylang/grunt-notify

// Desktop notifications for grunt errors and warnings.

module.exports = function () {
  return {
    build: {
      options: {
        message: 'Build complete.'
      }
    }
  };
};
