'using strict';

angular.module('workbench', ['ngRoute',
                             'utils',
                             'tmCloudClient',
                             'workbenchDirectives',
                             'workbenchFilters',
                             'workbenchAuth',
                             'workbenchUser',
                             'workbenchOrganization',
                             'workbenchNetwork',
                             'workbenchDevice',
                             'workbenchMessage',
                             'workbenchQuery',
                             'angularSpinner',
                             'bootstrap-tagsinput'
	], function($provide) {
		//$provide.value('endpoint', 'http://localhost:8080');
		$provide.value('endpoint', 'https://cloud.tiny-mesh.com/api');
	})
	.value('version', '0.3.1')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'partials/dashboard.html',
				controller: 'wbDashboardCtrl' })
			.when('/dashboard/:entity', {
				templateUrl: 'partials/dashboard.html',
				controller: 'wbDashboardCtrl' })
			.otherwise({
				templateUrl: 'partials/404.html',
				controller: 'wb404Ctrl' });
	}])
	.controller('wbDashboardCtrl', function($routeParams, $scope,
			loadbar, errorModal,
			tmNet, tmOrganization) {
		$scope._ = _;
		$scope.net = new tmNet({parents: []});
		$scope.entity = ($routeParams.entity || "").split(/:/);
		$scope.networks = tmNet.list();
		$scope.organizations = tmOrganization.list();
		$scope.orgnets = {};

		$scope.net = new tmNet({parents: []});
		$scope.createNet = function(net, parents) {
			net.parents = parents;

			net.$create().then(function(newnet) {
				$scope.networks.push(newnet);
				_.each(parents, function(p) { $scope.orgnets[p].push(newnet); });
			});

			return new tmNet({});
		};

		$scope.networks.$promise.then(function(data) {
			_.each(data, function(net) {
				_.each(net.parents, function(parent) {
					if (!$scope.orgnets[parent]) {
						$scope.orgnets[parent] = [];
					}

					$scope.orgnets[parent].push(net);
				});
			});
		});

		loadbar($scope.networks.$promise);

		$scope.netstats = function(net) {
			var gws, active = [], inactive = [];

			var groups = _.groupBy(net.devicemap, function(d, k) {
				var chan, ret = d.provisioned + ':' + d.type;
				if ('active:gateway' === ret) {
					chan = net.channels['app/' + net.key + '/' + k] || {};
					chan.key = chan.key || 'app/' + net.key + '/' + k;
					(chan.active ? active : inactive).push(chan);
				}

				return ret;
			});

			return {
				gateways: groups['active:gateway'],
				channels: {
					active: active,
					inactive: inactive,
				},
			};
		};

		$scope.organizations.$promise.then(function(data) {
			_.each(data, function(v) {
				$scope.orgnets['organization/' + v.key] = $scope.orgnets[v.key] || [];
			});
		});

		loadbar($scope.organizations.$promise);

		$scope.ready.then(function() {
			$scope.orgnets['user/' + $scope.user.email] = [];

			if (!$scope.entity[0]) {
				$scope.entity = angular.copy(['user', $scope.user.email]);
			}
		});

	})
	.controller('wb404Ctrl', function($scope, $window) {
		$scope.$window = $window;
	});
