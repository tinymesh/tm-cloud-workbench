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
	})
	.factory('MessageStream', function($route, $location, Cfg, AuthService) {
		var cid, dev, url, source;
		cid = $route.current.params.container;
		dev = $route.current.params.device;

		var token = AuthService.authentications[AuthService.client];

		url = 'http://' + Cfg.api.host + ':' + Cfg.api.port +
			'/stream/' + cid + "/" + dev + "?auth=" +  window.escape(token);

		return new EventSource(url, {withCredentials: false});
	});
