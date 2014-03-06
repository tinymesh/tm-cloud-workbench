angular.module('workbenchOrganization', ['ngRoute'])
	.value('version', '0.2.0')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/organization/:org/:tab?', {
				templateUrl: 'partials/organization.html',
				controller: 'wbOrganizationCtrl' });
	}])
	.controller('wbOrganizationCtrl', function($scope, $routeParams, tmOrganization,
			tmOrganizationUsers) {
		$scope.activetab = $scope.activetab || $routeParams.tab;

		if (!$scope.org) {
			$scope.org = tmOrganization.get({key: $routeParams.org});
		}

		$scope.assignUserOrg = function(email, org) {
			var p = tmOrganizationUsers.add({organization: org.key, user: email});


			p.$promise.then(function() {
				org.users.push(email);
			});

			return p;
		};

		$scope.revokeUserOrg = function(email, org) {
			var p = tmOrganizationUsers.remove({user: email, org: org.key});

			p.$promise.then(function() {
				org.users.splice(org.users.indexOf(email), 1);
			});

			return p;
		};
	});
