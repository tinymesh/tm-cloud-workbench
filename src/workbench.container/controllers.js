'using strict';

angular.module('workbench.container.controllers', [])
	.value('version', '0.1.0')
	.controller('Workbench.Containers', function($rootScope, $scope, $location, Container, Containers) {
		$scope.containers = [];

		Containers.list()
			.$promise.then(function(res) {
				$scope.containers = res;
			});

		$scope.createContainer = function(name) {
			var res = new Container({name: name});
			res.$save()
				.then(function(res) {
					$scope.containers.push(res);
				});
		};

		$rootScope.breadcrumb = [["Containers", "/containers"]];
	})
	.controller('Workbench.Container', function($rootScope, $scope, $route, $location, Container) {
		$scope.container = $route.current.params.container;
		$rootScope.breadcrumb = [
			["Containers", "/containers"],
			[$scope.container, "/container/" + $scope.container]
		];
		$rootScope.path = $location.$$path;

		Container.read({key: $scope.container, device: "expand"})
			.$promise.then(function(res) {
				_.extend($scope, res);
			});
	});
