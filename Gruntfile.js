/*jshint node:true*/
'use strict';

var CONFIG = {
  pages: 'pages/',
  source: 'static/',
  static: 'deploy/static/',
  deploy: 'deploy/'
};

module.exports = function (grunt) {
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.loadTasks('grunt/tasks');

  [
    'autoprefixer',
    'clean',
    'connect',
    'copy',
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
    'neuter:libsDevelop',
    'neuter:app',

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
    'neuter:libsBuild',
    'neuter:app',
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
