'using strict';

angular.module('user.auth.controllers', [])
	.value('version', '0.1.0')
	.controller('User.Auth.Login', function($rootScope, $scope, $location, AuthService) {
		$scope.authError     = "";
		$scope.authenticated = false;
		$scope.user          = {
			email:   "",
			client:  "",
			clients: ""
		};

		if (!AuthService.remoteCall) {
			// Force login
			AuthService.$get()
				.then(function(res) {
					AuthService.onAuthentication($scope, res);
				});

			AuthService.remoteCall = true;
		}

		$scope.submit = function(email, password) {
			var user = AuthService;
			user.email = email;
			user.password = password;

			user.$login()
				.then(function(res)  {
					AuthService.onAuthentication($scope, res);
				},
				function(req) {
					$scope.authenticated = false;
					$scope.authError = "Incorrect username and/or password";
				});
		};

		$scope.logout = function() {
			AuthService.$logout()
				.then(function(res) {
					AuthService.onLogout($scope, res);
				});
		};

		$scope.selectClient = function(client) {
			AuthService.$select({client: client})
				.then(function(res) {
					console.log("auth-context: move -> " + client);
					$scope.user.email    = res.email;
					$scope.user.client   = res.client;
					$scope.user.clients  = res.authentications;
				});
		};

		$scope.loginPage = function() {
			$location.path("/user/login");
		};
	});
