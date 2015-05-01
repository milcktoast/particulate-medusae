/*jshint node:true*/
'use strict';

var CONFIG = {
  pages: 'pages/',
  source: 'static/',
  static: './build/static/',
  deploy: './build/'
};

module.exports = function (grunt) {
  require('time-grunt')(grunt);
  require('jit-grunt')(grunt)({
    loadTasks : 'grunt/tasks'
  });

  [
    'autoprefixer',
    'clean',
    'connect',
    'copy',
    'handlebars',
    'haychtml',
    'jshint',
    'neuter',
    'notify',
    'sass',
    'uglify',
    'watch'
  ].forEach(function (key) {
    grunt.config(key, require('./grunt/config/' + key)(CONFIG));
  });

  grunt.registerTask('server', function (port) {
    var livereloadPort = Math.round(port) + 30000;
    if (port) {
      grunt.config('watch.livereload.options.livereload', livereloadPort);
      grunt.config('connect.options.livereload', livereloadPort);
      grunt.config('connect.options.port', port);
    }

    grunt.task.run([
      // Run tasks once before starting watchers
      'develop',

      // Start server
      'connect',

      // Watch files for changes
      'watch'
    ]);
  });

  // Build unminified files during development
  grunt.registerTask('develop', [
    'clean',

    // JS
    'handlebars',
    'neuter',
    'shaderChunks',

    // CSS
    'sass:develop',
    'autoprefixer:develop',

    // HTML
    'haychtml:develop',

    // OTHER FILES
    'copy:develop',
    'copy:build'
  ]);

  // Build minified files for deployment
  grunt.registerTask('build', [
    'clean',

    // JS
    'jshint',
    'handlebars',
    'neuter',
    'shaderChunks',
    'uglify',

    // CSS
    'sass:build',
    'autoprefixer:build',

    // HTML
    'haychtml:build',

    // OTHER FILES
    'copy:build',

    // TEMP FOLDER
    'clean:temp',

    // NOTIFICATION
    'notify:build'
  ]);

  grunt.registerTask('default', ['build']);
};
