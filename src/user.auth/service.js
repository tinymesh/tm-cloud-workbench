'using strict';

angular.module('user.auth.service', ['ngResource'])
	.value('version', '0.1.0')
	.factory('AuthService', function($resource, $location) {
		var Res = $resource('http://' + $location.$$host + '\\:8080/auth/:client', {}, {
			select: {method: "POST"},
			login: {method: "POST"},
			logout: {method: "DELETE"}
		});

		Res.prototype.onAuthentication = function($scope, obj) {
			console.log("auth-context: authenticated -> ", obj);

			$scope.user.email   = obj.email;
			$scope.user.client  = obj.client;
			$scope.user.clients = obj.authentications;

			$scope.authenticated = true;
			$scope.authError     = "";
		};

		Res.prototype.onLogout = function($scope, obj) {
			console.log("auth-context: destructing local session ", $scope.user.email);

			$scope.user.email   = "";
			$scope.user.client  = "";
			$scope.user.clients = "";

			$scope.authenticated = false;
			$location.path("/user/login");
		};

		Res.prototype.removeDefaultRoute = function($routeProvider) {
			console.log($routeProvider);
		};

		return new Res();
	})
	.config(['$httpProvider', function($httpProvider) {
		$httpProvider.defaults.withCredentials = true;
	}]);
