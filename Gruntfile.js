/* globals module, require */

module.exports = function (grunt) {
	'use strict';
	// Project configuration
	grunt.initConfig({
		// Metadata
		pkg: grunt.file.readJSON('package.json'),
		// Task configuration
		uglify: {
			dist: {
				src     : [
					'bower_components/fuse.js/src/fuse.js',
					'scientific-monitoring/src/str-to-date.js',
					'<%= copy.zapi.files[0].dest %>',
				],
				dest    : 'scientific-monitoring/zapi.js',
				options : {
					sourceMap               : true,
					sourceMapIncludeSources : true
				}
			}
		},
		jshint: {
			options   : {
				ignores: [
					'bower_components/fuse.js/src/fuse.js',
				]
			},
			gruntfile : {
				src: 'Gruntfile.js'
			},
			zapi: {
				src: '<%= uglify.dist.src %>',
			}
		},
		cssmin: {
			monitoring: {
				src  : 'scientific-monitoring/src/monitoring.css',
				dest : 'scientific-monitoring/monitoring.min.css'
			}
		},
		copy: {
			zapi: {
				files: [
					{
						src    : 'scientific-monitoring/src/zapi.js',
						dest   : 'scientific-monitoring/zapi-compiled.js',
						filter : 'isFile'
					}
				],
				options : {
					process: function(content) {
						var // Get nodejs FileSystem module
							fs = require('fs'),
							// Get the contents of the minified CSS
							monitoring_css = fs.readFileSync(grunt.config.get('cssmin.monitoring.dest')).toString(),
							template_data = {
								'monitoring_css': monitoring_css
							};

						// Run the file through grunt's template engine
						return grunt.template.process(content, {data: template_data});
					}
				}
			}
		},
		concat: {
			uglify_alternative: {
				src  : '<%= uglify.dist.src %>',
				dest : '<%= uglify.dist.dest %>'
			}
		},
		// Start a web server
		connect: {
			server: {
				options: {
					port             : '1111',
					useAvailablePort : true
				}
			}
		},
		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile']
			},
			zapi: {
				files: [
					'<%= copy.zapi.files[0].src %>',
					'scientific-monitoring/src/str-to-date.js',
					'<%= cssmin.monitoring.src %>'
				],
				tasks: ['cssmin', 'copy', 'jshint:zapi', 'uglify:dist', 'clean']
			}
		},
		clean: {
			transients: {
				src: [
					'<%= copy.zapi.files[0].dest %>',
					'<%= cssmin.monitoring.dest %>'
				]
			}
		}
	});

	// These plugins provide necessary tasks
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Default task
	grunt.registerTask('default', ['cssmin', 'copy:zapi', 'jshint', 'uglify', 'clean', 'connect', 'watch']);

	// Debug task (no uglification)
	grunt.registerTask('debug', 'Run build tasks sans uglification for easier debugging', function() {
		var watch_tasks = grunt.config('watch.zapi.tasks');
		watch_tasks.splice(watch_tasks.indexOf('uglify:dist'), 1, 'concat:uglify_alternative');
		grunt.config('watch.zapi.tasks', watch_tasks);
		grunt.task.run(['cssmin', 'copy:zapi', 'jshint', 'concat:uglify_alternative', 'clean', 'connect', 'watch']);
	});
};
