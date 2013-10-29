angular.module('workbenchNetwork', ['ngRoute'])
	.value('version', '0.2.0')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/:resource/network', {
				templateUrl: 'partials/networks.html',
				controller: 'wbNetworksCtrl' })
			.when('/:resource/network/:network', {
				templateUrl: 'partials/network.html',
				controller: 'wbNetworkCtrl' });
	}])
	.controller('wbNetworksCtrl', function($scope, $routeParams,
			breadcrumbs, tmAuth, tmNet) {
		if ($routeParams.resource !== tmAuth.resource) {
			$scope.setResource($routeParams.resource);
		}

		$scope.net = new tmNet();

		$scope.networks = [];
		tmNet.list({device: "expand"}).$promise
			.then(function(networks) {
				$scope.networks = _.map(networks, function(i) {
					i.connected = _.reduce(i.channel, function(acc, c) {
						acc[c[1] ? 0 : 1]++;
						return acc;
					}, [0, 0]);
					return i;
				});
			});

		$scope.createNew = function(net) {
			if (!net.name || 0 === net.name.length) {
				return;
			}

			net.$create()
				.then(function(resp) {
					$scope.networks.push(resp);
				}, function(err) {
					console.log('err', err);
				});
		};

		breadcrumbs.assign([
			{name: tmAuth.resources[$routeParams.resource].name,
				path: "/" + $routeParams.resource + '/network'}
		]);
	})
	.controller('wbNetworkCtrl', function($scope, $routeParams, breadcrumbs,
			tmAuth, tmNet) {
		if ($routeParams.resource !== tmAuth.resource) {
			$scope.setResource($routeParams.resource);
		}

		$scope.net = tmNet.get({id: $routeParams.network, device: "expand"});
		$scope.net.$promise.then(function(net) {
			breadcrumbs.setName(1, net.name || net.key);
		});

		$scope.update = function(net) {
			net.$update()
				.then(function(newnet) {
					$scope.alertBody  = "Network '" + net.name || net.key + "' was updated";
					$scope.alertClass = "success";
				});
		};

		breadcrumbs.assign([
			{name: tmAuth.resources[$routeParams.resource].name,
				path: "/" + $routeParams.resource + '/network'},
			{name: $routeParams.network,
			path: "/" + $routeParams.resource + '/network/' + $routeParams.network}
		]);
	});
