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
				          src:     '**/*.html',
				          expand:  true,
				          cwd:     'src/partials'} ]
			},
			vendor: {
				files: [ {dest:    '<%= distdir %>/dist/ace',
				          src:     [
				            'ace-builds-master/src-noconflict/*'
				          ],
				          expand:  true,
				          flatten: true,
				          cwd:     'vendor/'},

				         {dest: '<%= distdir %>/fonts',
				          src : 'bootstrap-3.1.1/dist/fonts/*',
				          expand: true,
				          flatten: true,
				          cwd: 'vendor/'}
				],
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
			js: {
				src: ['vendor/jquery-1.11.0.js',

				      'vendor/multiselect/bootstrap-multiselect.js',


				      'node_modules/underscore/underscore.js',
				      'node_modules/json3/lib/json3.js',

					  'vendor/angular-1.2.14/angular.js',
				      'vendor/angular-1.2.14/angular-route.js',
				      'vendor/angular-1.2.14/angular-resource.js',

				      'node_modules/ng-storage/ngStorage.min.js',
				      'node_modules/tm-cloud-client-angularjs/src/tm.cloud.client.js',

				      'vendor/tagsinput/bootstrap-tagsinput.js',
				      'vendor/tagsinput/bootstrap-tagsinput-angular.js',

				      'vendor/crypto-js-3.1.2/rollups/*.js',
				      'vendor/crypto-js-3.1.2/components/*.js' ],
				dest: '<%= distdir %>/dist/vendor.js'
			},
			css: {
				src: ["vendor/bootstrap-3.1.1/dist/css/bootstrap.css",
					"vendor/{multiselect,tagsinput}/*.css",
					"vendor/{multiselect,tagsinput}/*.css",
					"<%= src.css %>",
				],
				dest: '<%= distdir %>/dist/style.css',
			}
		},
		watch:{
			all: {
				files: ['<%= src.js %>', '<%= src.html %>', '<%= src.css %>', ['src/partials/**/*.html']],
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
