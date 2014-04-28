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
	.controller('wbNetworkCtrl', function($scope, $routeParams, tmNet, tmDevice) {
		$scope.activetab = $routeParams.tab || "view";
		$scope.net = tmNet.get({id: $routeParams.network});

		$scope.provisionDevice = function(name, addr) {
			$scope.provisionMsg = {body: "loading ..."};
			var dev = tmDevice.create({network: $scope.net.key}, {
				name:        name,
				address:     parseInt(addr, 10),
				type:        'gateway',
				provisioned: 'active',
			});

			dev.$promise.then(function(device) {
				$scope.provisionMsg = undefined;
				net.$get();
			}, function(err) {
				$scope.provisionMsg = {
					title: "Failed to provision device",
					body: "HTTP " + err.status + ": " + err.data.error
				};
			});
		};

		//var extendDeep = function extendDeep(target, source) {
		//	for (var prop in source) {
		//		if (_.isObject(prop) && prop in target) {
		//			extendDeep(target[prop], source[prop]);
		//		} else {
		//			target[prop] = source[prop];
		//		}

		//		return target;
		//	}
		//};

		// Stringify for serializing functions
		//$scope.stringify = function(net) {
		//	var omit = ['devices', 'addr', 'counters', 'meta', ''];
		//	var patterns = [[/\\n/g, "\n"], [/\\r/g, "\r"], [/\\t/g, "\t"], 
		//		[/"\\u0002/g, ""], [/\\u0003"/g, ""]];
		//	return _.reduce(patterns,
		//		function(acc, r) {
		//			return acc.replace(r[0], r[1]);
		//		},
		//		JSON.stringify(_.omit(net, omit), function(k, v) {
		//				if (k.match(/\$/)) {
		//					return undefined;
		//				} else if (typeof v === 'function') {
		//					return "\02" + v.toString + "\03";
		//				} else if (typeof v === 'string' && v.substr(0,8) === "function") {
		//					return "\02" + v + "\03";
		//				}

		//				return v;
		//			}, '\t'));
		//};
	});
