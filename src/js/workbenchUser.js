angular.module('workbenchUser', ['ngRoute', 'ngStorage'])
	.value('version', '0.2.0')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/user/:tab', {
				templateUrl: 'partials/profile.html',
				controller: 'wbProfileCtrl' });
	}])
	.controller('wbProfileCtrl', function($scope, $routeParams, tmOrganization,
			tmOrganizationUsers) {
		$scope.organizations = tmOrganization.list();
		$scope.activetab = $routeParams.tab;

		$scope.updateUser = function(passa, passb) {
			if (passa && passa === passb) {
				$scope.user.password = passa;
			} else if ((passa || passb)) {
				// if either field is non null, it might be previously
				// synced to user object resulting in a updated
				// password when the user may not have intended so.
				return;
			}

			return $scope.user.$update();
		};
	});
