'using strict';

angular.module('workbench.device', [
		'ngRoute',
		'workbench.device.controllers',
		'workbench.message'
	])
	.value('version', '0.1.0')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/device/:container/:device',
				{templateUrl: 'partials/device.html', controller: 'Workbench.Device'});
	}])
	.factory('Device', function($resource, $location, Cfg) {
		var Res = $resource('http://' + Cfg.api.host + '\\:' + Cfg.api.port + '/device/:container/:device', {}, {
			get: {method: "GET"},
			update: {method: "PUT"}
		});

		return Res;
	});
