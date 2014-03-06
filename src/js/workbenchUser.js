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
	});
