'using strict';

angular.module('workbench.message.controllers', [])
	.value('version', '0.1.0')
	.controller('Workbench.Message', function($route, $rootScope, $scope, $location, Message, Device, Container) {
		$scope.container = $route.current.params.container;
		$scope.device    = $route.current.params.device;
		$scope.message   = $route.current.params.message;

		$rootScope.breadcrumb = [
			[$scope.container, '/container/' + $scope.container],
			[$scope.device, '/device/' + $scope.container + '/' + $scope.device],
			[$scope.message, '/message/' + $scope.container + '/' + $scope.device + '/' + $scope.message]
		];

		$rootScope.path = $location.$$path;

		Device.get({container: $scope.container, device: $scope.device})
			.$promise.then(function(res) {
				$scope.device_res = res;
				$rootScope.breadcrumb[1][0] = res.name || 'Unamed device (' + res.key + ')';
			});

		Container.read({container: $scope.container})
			.$promise.then(function(res) {
				$scope.container_res = res;
				$rootScope.breadcrumb[0][0] = $scope.container_res.name;
			});

		Message.get({container: $scope.container, device: $scope.device, message: $scope.message})
			.$promise.then(function(res) {
				_.extend($scope, res);
				$scope.$broadcast('sync:message');
			});
	});
