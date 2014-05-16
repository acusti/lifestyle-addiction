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
				src     : '<%= copy.zapi.files[0].dest %>',
				dest    : 'scientific-monitoring/zapi.js',
				options : {
					sourceMap               : true,
					sourceMapIncludeSources : true/*,
					// For development mode
					beautify                : true,
					mangle                  : false*/
				}
			}
		},
		jshint: {
			options: {
				// To keep building even if the file fails jshint:
				// force: true,
				// Assume browser globals
				browser  : true,
				// What to be strict about
				// === and !==
				eqeqeq   : true,
				// IE7 compatibility
				es3      : true,
				newcap   : true,
				noempty  : true,
				quotmark : 'single',
				undef    : true,
				unused   : true,
				trailing : true
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			zapi: {
				src: '<%= copy.zapi.files[0].dest %>'
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
			},
			uglify_alternative: {
				files: [
					{
						src    : '<%= copy.zapi.files[0].dest %>',
						dest   : '<%= uglify.dist.dest %>',
						filter : 'isFile'
					}
				]
			}
		},
		// Sart a web server
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
					'<%= cssmin.monitoring.src %>'
				],
				tasks: ['cssmin', 'copy', 'jshint:zapi', 'uglify:dist', 'clean']
			}
		},
		clean: {
			transients: {
				src: [
					'<%= uglify.dist.src %>',
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
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Default task
	grunt.registerTask('default', ['cssmin', 'copy:zapi', 'jshint', 'uglify', 'clean', 'connect', 'watch']);
	
	// Debug task (no uglification)
	grunt.registerTask('debug', 'Run build tasks sans ugification for easier debugging', function() {
		var watch_tasks = grunt.config('watch.zapi.tasks');
		watch_tasks.splice(watch_tasks.indexOf('uglify:dist'), 1, 'copy:uglify_alternative');
		grunt.config('watch.zapi.tasks', watch_tasks);
		grunt.task.run(['cssmin', 'copy:zapi', 'jshint', 'copy:uglify_alternative', 'clean', 'connect', 'watch']);
	});
};

