'using strict';

angular.module('user.auth', [
		'ngRoute',
		'user.auth.controllers',
		'user.auth.service'
	])
	.value('version', '0.1.0')
	.config(['$routeProvider', function($routeProvider, AuthService) {
		$routeProvider
			.when('/user/login',
				{templateUrl: 'partials/login.html', controller: 'User.Auth.LoginPage'});

	}]);
