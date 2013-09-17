'using strict';

angular.module('user.auth.service', ['ngResource'])
	.value('version', '0.1.0')
	.factory('AuthService', function($rootScope, $resource, $location, Cfg) {
		var Res = $resource('http://' + Cfg.api.host + '\\:' + Cfg.api.port + '/auth/:client', {}, {
			select: {method: "POST"},
			login: {method: "POST"},
			logout: {method: "DELETE"}
		});

		$rootScope.$on('user:authenticated', function() {
			$rootScope.authenticated = true;
			$rootScope.authError     = "";
		});

		$rootScope.$on('user:logout', function() {
			$rootScope.authenticated = false;
		});

		return new Res();
	})
	.factory('AuthHelper', function($rootScope, $location, AuthService) {
		var promise, res = {};

		// Perform authcheck
		res.tryAuth = AuthService.$get()
			.then(function(res) {
				$rootScope.$broadcast('user:authenticated', res);
			});

		res.redirectToLogin = function() {
			console.log("redirect to User.Auth.LoginPage");
			$rootScope.$broadcast('user:logout');
			$rootScope.breadcrumb = [];
			$location.path("/user/login");
		};

		res.setUser = function(scope, obj) {
			scope.user.email   = obj.email;
			scope.user.client  = obj.client;
			scope.user.clients = obj.authentications;
		};

		return res;
	})
	.config(['$httpProvider', function($httpProvider) {
		$httpProvider.defaults.withCredentials = true;
	}]);
