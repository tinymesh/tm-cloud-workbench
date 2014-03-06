'using strict';

angular.module('workbench', ['ngRoute',
                             'utils',
                             'tmCloudClient',
                             'workbenchDirectives',
                             'workbenchAuth',
                             'workbenchUser',
                             'workbenchOrganization',
                             'workbenchNetwork',
                             'workbenchDevice',
                             'workbenchMessage',
                             'workbenchQuery',
                             'bootstrap-tagsinput'
	], function($provide) {
		//$provide.value('endpoint', 'http://localhost:8080');
		$provide.value('endpoint', 'https://cloud.tiny-mesh.com/api');
	})
	.value('version', '0.3.0')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'partials/dashboard.html',
				controller: 'wbDashboardCtrl' })
			.otherwise({
				templateUrl: 'partials/404.html',
				controller: 'wb404Ctrl' });
	}])
	.controller('wbDashboardCtrl', function($rootScope, $scope, tmNet) {
		$scope._ = _;
		$scope.channels = {};
		$scope.activeChans = [];
		$scope.inactiveChans = [];
		$scope.queueLength = 0;
		$scope.minDeliveryTime = -1;
		$scope.networks = tmNet.list();
		$scope.net = new tmNet({parents: []});


		$scope.networks.$promise.then(function(data) {
			_.each(data, function(net) {
				_.each(net.channels, function(chan) {
					$scope.queueLength += (parseInt(chan.meta.queue_length, 10) || 0);

					if (-1 === $scope.minDeliveryTime || $scope.minDeliveryTime > chan.meta.socket_rtt) {
						$scope.minDeliveryTime = chan.meta.socket_rtt;
					}

					if (chan.active) {
						$scope.activeChans.push(chan);
					} else {
						$scope.inactiveChans.push(chan);
					}
				});
			});

		});

		$scope.createNet = function(net) {
			net.parents = [net.parents];

			net.$create().then(function(newnet) {
				$scope.networks.push(newnet);
			});

			return new tmNet({});
		};

	})
	.controller('wb404Ctrl', function($scope, $window) {
		$scope.$window = $window;
	});
