angular.module('workbenchUser', ['ngRoute', 'ngStorage'])
	.value('version', '0.2.0')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/user/login', {
				templateUrl: 'partials/login.html',
				controller: 'wbLoginCtrl' })
			.when('/user/logout', {
				templateUrl: 'partials/login.html',
				controller: 'wbLoginCtrl' })
			.when('/user/profile', {
				templateUrl: 'partials/profile.html',
				controller: 'wbProfileCtrl' });
	}])
	.controller('wbAuthCtrl', function($rootScope, $scope, $location,
			$sessionStorage, breadcrumbs, tmAuth, tmUser) {
		$scope.user = tmUser;
		$scope.session = $sessionStorage;
		$scope.breadcrumb = breadcrumbs;

		$rootScope.$on('session:new', function(ev, auth) {
			// wait for a session until we fetch user object
			$scope.setResource(auth.resource);
			$scope.user.$get()
				.then(function(user) {
					user.resources.tmc = {name: "User", token: auth.user_token};
					return user;
				});
		});

		$rootScope.$on('session:destroy', function(ev, auth) {
			$location.path('/user/logout');
		});

		$scope.setResource = function(resource) {
			tmAuth.setResource(resource);
			tmAuth.$getToken()
				.then(function(auth) {
					auth.resources.tmc = {name: "User", token: auth.user_token};
					$scope.token    = auth.resources[resource].token;
					$scope.resource = auth.resource;
					$rootScope.$broadcast('session:switch', auth);
					return auth;
				});
		};

		$scope.logout = function() {
			return tmAuth.logout(); // needs to called in the right context
		};

		if (!$sessionStorage.authenticated) {
			$location.path('/user/login');
		}
	})
	.controller('wbLoginCtrl', function($scope, $location, $sessionStorage, tmAuth) {
		if ($sessionStorage.authenticated && '/user/login' === $location.path()) {
			$location.path('/');
		}

		$scope.login = function(auth) {
			if (!auth || !auth.email) {
				$scope.authError = 'Please enter a valid email address';
				return false;
			} else if (!auth.password) {
				$scope.authError = 'Please enter a password, minimum 8 characters';
				return false;
			}

			/*jshint -W024 */ // for reserved keywords
			return tmAuth.login(auth)
				.then(function(resp) {
					if ($location.path().match(/\/user\/log(in|out)\/?/)) {
						$location.path('/');
					}
				})
				.catch(function(e) {
					if (401 === e.status) {
						$scope.authError = "Your credentials did not match";
					} else {
						$scope.authError = "An unknown error occured, login returned " + e.status;
					}
				});
		};
	})
	.controller('wbProfileCtrl', function($scope, $location, breadcrumbs, tmAuth, tmUser) {
		$scope.update = function() {
			var onUpdate, res = tmAuth.resource;

			onUpdate = function(a) {
				$scope.flash = ["success", "User updated"];
			};

			if ($scope.password && $scope.password.a && $scope.password.a === $scope.password.b) {
				tmUser.setPassword($scope.password.a);

				onUpdate = function() {
					tmAuth.login({
						email: $scope.user.email,
						password: tmUser.password
					}).then(function() {
						$scope.flash = ["success", "User updated"];
					}, function() {
						$scope.flash = ["danger", "Password update failed"];
					});
				};
			}

			tmAuth.setResource('tmc');
			return tmUser.$update(onUpdate, function() {
				$scope.flash = ["danger", "Failed to update user"];
				});
		};

		breadcrumbs.assign([{name: "Profile", path: $location.path()}]);
	});
