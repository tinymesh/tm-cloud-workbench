'using strict';

angular.module('workbench.container.controllers', [])
	.value('version', '0.1.0')
	.controller('Workbench.Containers', function($rootScope, $scope, $location, Container, Containers) {
		$scope.containers = [];

		Containers.list()
			.$promise.then(function(res) {
				$scope.containers = res;
				$scope.containers = _.map($scope.containers, function(i) {
					i.connected = _.reduce(i.channel, function(acc, c) {
						if (c[1]) {
							acc[0]++;
						} else {
							acc[1]++;
						}
						return acc;
					}, [0, 0]);
					return i;
				});
			});

		$scope.createContainer = function(name) {
			var res = new Container({name: name});
			res.$save()
				.then(function(res) {
					$scope.containers.push(res);
				});
		};

		$rootScope.breadcrumb = [["Networks", "/containers"]];
	})
	.controller('Workbench.Container', function($rootScope, $scope, $route, $location, Container) {
		$scope.container = $route.current.params.container;
		$scope._changed  = false;

		$rootScope.breadcrumb = [
			[$scope.container, "/container/" + $scope.container]
		];
		$rootScope.path = $location.$$path;

		Container.read({container: $scope.container, device: "expand"})
			.$promise.then(function(res) {
				res.devices = _.sortBy(res.devices, "key");
				$scope.res = res;
				$rootScope.breadcrumb[0][0] = $scope.res.name;
			});

		$scope.updateResource = function(obj) {
			obj.$update({container: $scope.container, device: "expand"})
				.then(function(res) {
						$scope._changed = false;
						$scope.alertClass = 'success';
						$scope.alertBody= 'Container \'' + $scope.res.name + '\' was updated.';
				},
				function(err) {
						$scope.alertClass = 'danger';
						$scope.alertBody  = "<b>Error:</b> Failed to save container resource";
			});
		};
	});
