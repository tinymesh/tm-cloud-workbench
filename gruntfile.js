module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task.
	grunt.registerTask('default', ['jshint','build']);
	grunt.registerTask('dev', ['default', 'connect', 'watch']);
	grunt.registerTask('build', ['clean','concat','local-copy']);
	grunt.registerTask('local-copy',['copy:assets', 'copy:partials', 'copy:npm']); 

	grunt.registerTask('timestamp', function() {
		grunt.log.subhead(Date());
	});

	grunt.initConfig({
		distdir: 'target',
		pkg: grunt.file.readJSON('package.json'),
		banner:
			'/*! <%= pkg.title || pkg.name %>-<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n' +
			'<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
			' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
			' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */\n',
		src: {
			js: ['src/**/*.js'],
			html: ['src/index-sync.html'],
			css: ['src/css/*.css'],
		},
		clean: ['<%= distdir %>/*'],
		copy: {
			assets: {
				files: [ {dest: '<%= distdir %>',
				          src : '**',
				          expand: true,
				          cwd: 'src/assets/'}]
			},
			partials: {
				files: [ {dest:    '<%= distdir %>/partials/',
				          src:     '*.html',
				          expand:  true,
				          cwd:     'src/partials'} ]
			},
			npm: {
				files: [ {dest:    '<%= distdir %>/dist/',
				          src:     [
				            'underscore/underscore.js',
				            'json3/lib/json3.js',
				          ],
				          expand:  true,
				          flatten: true,
				          cwd:     'node_modules/'}]
			}
		},
		concat:{
			dist:{
				options: { banner: "<%= banner %>" },
				src: ['<%= src.js %>'],
				dest:'<%= distdir %>/dist/<%= pkg.name %>.js'
			},
			index: {
				src: ['src/index-sync.html'],
				dest: '<%= distdir %>/index.html',
				options: { process: true }
			},
			angular: {
				src: ['vendor/angular/angular.js',
				      'vendor/angular/angular-route.js',
				      'vendor/angular/angular-resource.js',
				      'vendor/angular/angular-underscore.js'],
				dest: '<%= distdir %>/dist/angular.js'
			},
			css: {
				src: ['<%= src.css %>'],
				dest: '<%= distdir %>/dist/style.css',
			}
		},
		watch:{
			all: {
				files: ['<%= src.js %>', '<%= src.html %>', '<%= src.css %>', ['src/partials/*.html']],
				tasks: ['default','timestamp']
			},
		},
		jshint:{
			files: ['gruntFile.js', '<%= src.js %>'],
			options:{
				curly:   true,
				eqeqeq:  true,
				immed:   true,
				latedef: true,
				newcap:  true,
				noarg:   true,
				sub:     true,
				boss:    true,
				eqnull:  true,
				es5:     false,
				globals: {"angular": false}
			}
		},
		connect: {
			server: {
				options: {
					port: 8000,
					base: ".",
					hostname: "0.0.0.0"
				}
			}
		},
	});
};
