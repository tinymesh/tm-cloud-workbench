'using strict';

angular.module('workbench.message', [
		'ngRoute',
		'workbench.message.controllers'
	])
	.value('version', '0.1.0')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/message/:container/:device/:message*',
			{templateUrl: 'partials/message.html', controller: 'Workbench.Message'});
	}])
	.factory('Message', function($resource, $location, Cfg) {
		var Res = $resource('http://' + Cfg.api.host + '\\:' + Cfg.api.port + '/message/:container/:device/:message', {}, {
			get: {method: "GET"},
			create: {method: "POST"}
		});

		return Res;
	})
	.factory('MessageList', function($resource, Cfg) {
		var Res = $resource('http://' + Cfg.api.host + '\\:' + Cfg.api.port + '/message/:container/:device', {}, {
			list: {method: "GET", isArray: true}
		});

		return Res;
	});
