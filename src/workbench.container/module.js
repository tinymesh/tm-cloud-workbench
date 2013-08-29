'using strict';

angular.module('workbench.container', [
		'ngRoute',
		'workbench.container.controllers'
	])
	.value('version', '0.1.0')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/',
				{templateUrl: 'partials/containers.html', controller: 'Workbench.Containers'});

		$routeProvider
			.when('/containers',
				{templateUrl: 'partials/containers.html', controller: 'Workbench.Containers'});

		$routeProvider
			.when('/container/:container',
				{templateUrl: 'partials/container.html', controller: 'Workbench.Container'});
	}])
	.factory('Containers', function($resource, $location) {
		var Res = $resource('http://' + $location.$$host + '\\:8080/container', {}, {
			list: {method: "GET", isArray: true}
		});

		return Res;
	})
	.factory('Container', function($resource, $location) {
		var Res = $resource('http://' + $location.$$host + '\\:8080/container/:key', {}, {
			read: {method: "GET"}
		});

		return Res;
	});
