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
				src: 'scientific-monitoring/zapi-compiled.js',
				dest: 'scientific-monitoring/zapi.js'
			}
		},
		jshint: {
			options: {
				// To keep building even if the file fails jshint:
				// force: true,
				// Assume browser globals
				browser: true,
				// What to be strict about
				// === and !==
				eqeqeq: true,
				// IE7 compatibility
				es3: true,
				newcap: true,
				noempty: true,
				quotmark: 'single',
				undef: true,
				unused: true,
				trailing: true
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			zapi: {
				src: '<%= uglify.dist.src %>'
			}
		},
		cssmin: {
			filternav: {
				src: 'scientific-monitoring/src/year-filter-nav.css',
				dest: 'scientific-monitoring/year-filter-nav.min.css'
			}
		},
		copy: {
			zapi: {
				files: [
					{
						src: 'scientific-monitoring/src/zapi.js',
						dest: 'scientific-monitoring/zapi-compiled.js',
						filter: 'isFile'
					}
				],
				options : {
					process: function(content) {
						var // Get nodejs FileSystem module
							fs = require('fs'),
							// Get the contents of the minified CSS
							filter_nav_css = fs.readFileSync(grunt.config.get('cssmin.filternav.dest')).toString(),
							template_data = {
								'filter_nav_css': filter_nav_css
							};
						
						// Run the file through grunt's template engine
						return grunt.template.process(content, {data: template_data});
					}
				}
			}
		},
		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile']
			},
			zapi: {
				files: '<%= jshint.zapi.src %>',
				tasks: ['cssmin', 'jshint:zapi', 'uglify:dist']
			}
		},
		clean: {
			transients: {
				src: [
					'<%= uglify.dist.src %>',
					'<%= cssmin.filternav.dest %>'
				]
			}
		}
	});

	// These plugins provide necessary tasks
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Default task
	grunt.registerTask('default', ['cssmin', 'copy', 'jshint', 'uglify', 'clean']);
};

