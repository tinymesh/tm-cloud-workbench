angular.module('workbenchAuth', ['ngRoute', 'ngStorage'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/auth/login', {
				templateUrl: 'partials/login.html',
				controller:  'wbLoginCtrl'
			})
			.when('/auth/logout', {
				templateUrl: 'partials/login.html',
				controller:  'wbLoginCtrl'
			});
	}])
	.controller('wbAuthCtrl', function($rootScope, $scope, $q,
			$localStorage, $location, tmUser, tmAuthSession) {

		var promise = $q.defer();
		$scope.ready = promise.promise;
		$scope.user = new tmUser();
		$scope.auth = false;
		$scope.logout = function() {
			tmAuthSession.logout().then(function() {
				$location.path('/auth/logout');
			});
		};


		$rootScope.$on('session:new', function(ev, auth) {
			$scope.auth = auth;
			$scope.user.$get().then(function() {
				promise.resolve();
			});
		});

		$rootScope.$on('session:destroy', function(ev) {
			$scope.auth = false;
		});

		tmAuthSession.maybeAuthenticate(null, function() {
			$localStorage.authenticated = false;
			$location.path('/auth/login');
		});
	})
	.controller('wbLoginCtrl', function($rootScope, $scope, $location, tmAuthSession) {
		$scope.status = 0;

		if (tmAuthSession.authenticated() && '/auth/login' === $location.path()) {
			$location.path('/');
		}

		$scope.login = function(auth) {
			tmAuthSession.login(auth.email, auth.password)
				.then(function(resp, a, b, c) {
					if ($location.path().match(/\/auth\/log(in|out)\/?/)) {
						$location.path('/');
					}

					$scope.status = 200;
				}, function(resp) {
					$scope.status = resp.status;
				});
		};
	});
