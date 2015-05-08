/* jshint node: true */
'use strict';

var path = require('path');

module.exports = function (grunt) {
	grunt.config('shaderChunks', {
		develop : {
			src : 'static/glsl/shader-chunks/*',
			dest : 'build/static/js/shader-chunks.develop.js'
		}
	});

	grunt.registerMultiTask('shaderChunks', 'Concatenate shader chunks', function () {
		function handleFile(file) {
			var out = '';
			var src = path.resolve(file);
			var name = file.split('/').pop().split('.')[0];
			var source = grunt.file.read(src);
			var sourceLines = source.split('\n');

			out += 'THREE.ShaderChunk[\'' + name + '\'] = [\n';

			sourceLines.forEach(function (line) {
				line = line.trim();
				if (line.length && line.indexOf('//') !== 0) {
					out += '\'' + line.trim() + '\',\n';
				}
			});

			out += '].join(\'\\n\');';
			return out;
		}

		this.files.forEach(function (files) {
			var contents = files.src.map(handleFile).join('\n');
			grunt.file.write(path.resolve(files.dest), contents, { encoding : 'utf8' });
		});
	});
};
