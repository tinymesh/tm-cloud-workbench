'using strict';

angular.module('user.auth.controllers', [])
	.value('version', '0.1.0')
	.controller('User.Auth', function($rootScope, $route, $scope, $location, AuthService, AuthHelper) {
		$scope.authError = "";
		$scope.user          = {
			email:   "",
			client:  "",
			clients: ""
		};

		/*jshint -W024 */
		// This will resolve failed authentication on page refresh
		AuthHelper.tryAuth
			.catch(AuthHelper.redirectToLogin);

		$rootScope.$on('user:authenticated', function(obj,res) {
			$rootScope.authenticated = true;
			if (undefined !== res) {
				AuthHelper.setUser($scope, res);
			}
		});

		$rootScope.$on('user:logout', function() {
			$rootScope.authenticated = false;
			$scope.user = {email: '', client: '', clients: []};
			$location.path('/user/login');
		});

	})
	.controller('User.Auth.Toolbar', function($rootScope, $scope, $location, AuthService) {
		$scope.selectClient = function(client) {
			AuthService.$select({client: client})
				.then(function(res) {
					console.log("auth-context: move -> " + client);
					$scope.user.client   = res.client;
					$scope.user.clients  = res.authentications;
					$rootScope.$broadcast('user:switch', res);
				});
		};

		$scope.logout = function() {
			AuthService.$logout()
				.then(function(res) {
					$rootScope.$broadcast('user:logout');
				});
		};
	})
	.controller('User.Auth.LoginPage', function($rootScope, $scope, $location, AuthService) {
		$rootScope.$on('user:authenticated', function() {
			$location.path('/');
		});

		$scope.submit = function(email, password) {
			var user = AuthService;
			user.email = email;
			user.password = password;

			user.$login()
				.then(function(res)  {
					$rootScope.$broadcast('user:authenticated', res);
					$location.path('/');
				},
				function(req) {
					$rootScope.$broadcast('user:logout');
				});
		};
	});
