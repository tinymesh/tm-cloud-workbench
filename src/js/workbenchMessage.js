angular.module('workbenchMessage', ['ngRoute'])
	.value('version', '0.2.0')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/:resource/message/:network/:device/:message', {
				templateUrl: 'partials/message.html',
				controller: 'wbMessageCtrl' });
	}])
	.controller('wbMessageCtrl', function($scope, $routeParams, breadcrumbs,
			tmAuth, $location, tmNet, tmDevice, tmMsg) {

		$scope.net = tmNet.get({id: $routeParams.network});
		$scope.device = tmDevice.get({
			network: $routeParams.network,
			key: $routeParams.device
			});
		$scope.msg = tmMsg.get({
			network: $routeParams.network,
			device: $routeParams.device,
			message: $routeParams.message
		});

		$scope.net.$promise.then(function(net) {
				breadcrumbs.setName(1, net.name || net.key);
		});
		$scope.device.$promise.then(function(dev) {
				breadcrumbs.setName(2, dev.name || dev.key);
		});

		breadcrumbs.assign([
			{name: tmAuth.resources[$routeParams.resource].name,
				path: "/" + $routeParams.resource + '/network'},
			{name: $routeParams.network,
				path: "/" + $routeParams.resource + '/network/' + $routeParams.network},
			{name: $routeParams.device,
				path: "/" + $routeParams.resource + '/device/' + $routeParams.network + '/' + $routeParams.device},
			{name: 'Message',
				path: $location.path()}
		]);
	});
