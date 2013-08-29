'using strict';

angular.module('workbench.container.controllers', [])
	.value('version', '0.1.0')
	.controller('Workbench.Containers', function($scope, $location, Container, Containers) {
		$scope.containers = [];

		Containers.list()
			.$promise.then(function(res) {
				$scope.containers = res;
			});

		$scope.openContainer = function(container) {
			$location.path('/container/' + container);
		};

		$scope.createContainer = function(name) {
			var res = new Container({name: name});
			res.$save()
				.then(function(res) {
					$scope.containers.push(res);
				});
		};
	})
	.controller('Workbench.Container', function($scope, $route, $location, Container) {
		$scope.key = $route.current.params.container;

		Container.read({key: $scope.key, device: "expand"})
			.$promise.then(function(res) {
				_.extend($scope, res);
			});

		$scope.openDevice = function(cnr, dev) {
			$location.path('/device/' + cnr + '/' + dev);
		};

		$scope.openMessage = function(cnr, dev, msg) {
			$location.path('/message/' + cnr + '/' + dev + '/' + msg);
		};
	});
