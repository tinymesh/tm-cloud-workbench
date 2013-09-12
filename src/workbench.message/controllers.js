'using strict';

angular.module('workbench.message.controllers', [])
	.value('version', '0.1.0')
	.controller('Workbench.Message', function($route, $rootScope, $scope, $location, Message) {
		$scope.container = $route.current.params.container;
		$scope.device    = $route.current.params.device;
		$scope.message   = $route.current.params.message;

		$rootScope.breadcrumb = [
			['Containers', '/containers'],
			[$scope.container, '/container/' + $scope.container],
			[$scope.device, '/device/' + $scope.container + '/' + $scope.device],
			[$scope.message, '/message/' + $scope.container + '/' + $scope.device + '/' + $scope.message]
		];

		$rootScope.path = $location.$$path;

		Message.get({container: $scope.container, device: $scope.device, message: $scope.message})
			.$promise.then(function(res) {
				_.extend($scope, res);
				$scope.$broadcast('sync:message');
			});
	});
