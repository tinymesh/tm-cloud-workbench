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
	grunt.registerTask('build', ['clean','concat','copy']);

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
			html: ['src/index.html'],
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
				            'ngStorage/ngStorage.js',
				            'underscore/underscore.js',
				            'json3/lib/json3.js',
				            'tm-cloud-client-angularjs/src/tm.cloud.client.js'
				          ],
				          expand:  true,
				          flatten: true,
				          cwd:     'node_modules/'}]
			},
			vendor: {
				files: [ {dest:    '<%= distdir %>/dist/ace',
				          src:     [
				            'ace/src-noconflict/*'
				          ],
				          expand:  true,
				          flatten: true,
				          cwd:     'vendor/'} ],
			}
		},
		concat:{
			dist:{
				options: { banner: "<%= banner %>" },
				src: ['<%= src.js %>'],
				dest:'<%= distdir %>/dist/<%= pkg.name %>.js'
			},
			index: {
				src: ['src/index.html'],
				dest: '<%= distdir %>/index.html',
				options: { process: true }
			},
			angular: {
				src: ['node_modules/angularjs/build/angular.js',
				      'node_modules/angularjs/build/angular-route.js',
				      'node_modules/angularjs/build/angular-resource.js',
				      'node_modules/angularjs/build/angular-underscore.js'],
				dest: '<%= distdir %>/dist/angular.js'
			},
			css: {
				src: ['<%= src.css %>'],
				dest: '<%= distdir %>/dist/style.css',
			},
			cryptojs: {
				src: [ 'vendor/crypto-js-3.1.2/rollups/sha256.js',
				       'vendor/crypto-js-3.1.2/components/enc-base64.js' ],
				dest: '<%= distdir %>/dist/CryptoJS.js'
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
				noarg:   true,
				sub:     true,
				boss:    true,
				eqnull:  true,
				es5:     true,
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
