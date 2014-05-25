/*jshint -W054 */

angular.module('workbenchNetwork', ['ngRoute'])
	.value('version', '0.2.0')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/network', {
				templateUrl: 'partials/networks.html',
				controller: 'wbNetworksCtrl' })
			.when('/network/:network/:tab?', {
				templateUrl: 'partials/network.html',
				controller: 'wbNetworkCtrl'});
	}])
	.controller('wbNetworksCtrl', function($scope, $routeParams,
			breadcrumbs, tmNet) {
		$scope.net = new tmNet();

		$scope.networks = [];

		tmNet.list().$promise.then(function(r) {
			_.each(r.networks, function(n) {
				$scope.networks.push({name: n, key: n});
			});
		});

		$scope.createNew = function(net) {
			if (!net.name || 0 === net.name.length) {
				return;
			}

			net.$create()
				.then(function(resp) {
					$scope.networks.push(resp);
					$scope.net = new tmNet();
				}, function(err) {
					console.log('err', err);
				});
		};

		breadcrumbs.assign([
			{name: 'Networks', path: '/network'}
		]);
	})
	.controller('wbNetworkProvisionCtrl', function($scope, $q, $location) {
		$scope.type = $location.$$search.type || "all";
		$scope.cfg = [
			{key: "rf_channel", value: 4},
			{key: "sid", value: 1}
		];

		$scope.mapCfgPair = function(item) {
			return item.key + " := " + item.value;
		};

		$scope.setType = function(type) {
			$location.search('type', type);
		};
	})
	.controller('wbNetworkCtrl', function($scope, $routeParams,
			loadbar, errorModal,
			tmNet, tmDevice) {
		$scope.activetab = $routeParams.tab || "view";
		$scope.net = tmNet.get({id: $routeParams.network});
		$scope.todo = [];
		$scope.loadbar = loadbar;

		loadbar($scope.net.$promise);

		$scope.net.$promise.then(function(net) {
			var typecount = _.countBy(net.devicemap, "type");

			if (!typecount.gateway || 0 === typecount.gateway) {
				$scope.todo.push('partials/network/todo/provision-gateway.html');
			}

			if (0 === net.channels.length) {
				$scope.todo.push('partials/network/todo/network-connector.html');
			}
		});

		$scope.provisionDevice = function(name, addr, type) {
			var dev = tmDevice.create({network: $scope.net.key}, {
				name:        name,
				address:     parseInt(addr, 10),
				type:        type || 'gateway',
				provisioned: 'active',
			});

			loadbar(dev.$promise);

			dev.$promise.then(function(device) {
				$scope.provisionMsg = undefined;
				loadbar($scope.net.$get).then(function() {
					if ($scope.todo[0] === 'partials/network/todo/provision-gateway.html') {
						delete $scope.todo[0];
					}
				});
			}, function(err) {
				errorModal.set(
					"Failed to provision device",
					"HTTP " + err.status + ": " + JSON.stringify(err.data.error)
				);
			});

		};
	});
