angular.module('workbenchDevice', ['ngRoute'])
	.value('version', '0.2.0')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/device/:network/:device/:activetab?/:subtab?', {
				templateUrl: 'partials/device.html',
				controller: 'wbDeviceCtrl' });
	}])
	.controller('wbDeviceCtrl', function($scope, $location, $route, $routeParams,
			loadbar, errorModal,
			tmNet, tmDevice, tmMsg) {

		var evCallback;


		$scope._ = _;
		$scope.route = $routeParams;
		$scope.message = new tmMsg({});
		$scope.activetab = $routeParams.activetab || "view";
		$scope.subtab = $routeParams.subtab;

		$scope.net = tmNet.get({}, {key: $routeParams.network});
		$scope.device = tmDevice.get({
			network: $routeParams.network
		}, {
			key: $routeParams.device
		});

		loadbar($scope.net.$promise);
		loadbar($scope.device.$promise);

		$scope.device.$promise.then(function(dev) {
			$scope.message = new tmMsg({
				type: 'command',
				command: 'get_status',
				cmd_number: 0
			});
		});

		$scope.sendMessage = function(msg) {
			var message = new tmMsg(msg);
			var p = message.$create({network: $routeParams.network, device: $routeParams.device})
				.catch(function(err) {
					errorModal.set('Failed to publish message',
						JSON.stringify(err));
				});

			loadbar(p.$promise);
			$scope.message.cmd_number = ($scope.message.cmd_number + 1) % 255;
		};

		$scope.filterMsg = function(cmd, msg_in) {
			if (undefined === msg_in) {
				return {};
			}

			var msg = new tmMsg({
				uid: msg_in.uid,
				type: "command",
				cmd_number: msg_in.cmd_number,
				command: msg_in.command
			});

			switch (cmd) {
				case "set_output": msg.output = msg_in.output; break;
				case "set_pwm":    msg.pwm = msg_in.pwm; break;
				case "serial":     msg.data = msg_in.data; break;
			}

			return msg;
		};
	})
	.controller('wbDeviceMsgCtrl', function($scope, $routeParams, $location, tmMsgList) {
		$scope.date = {
			to:   $location.$$search['date.to'],
			from: $location.$$search['date.from']
		};
		$scope.messages = [];

		$scope.fetchMessages = function(from, to) {
			$scope.querySubmitted = true;
			var q = {
				'date.from': from,
				'date.to':   to,
				'device':    $scope.device.key,
				'network':   $scope.net.key
			};

			$location.search('to', to);
			$location.search('from', from);

			tmMsgList.list(q).$promise
				.then(function(msgs) {
					_.each(msgs, function(m) { $scope.messages.push(m); });
				});
		};

		$scope.getFromOffset = function(n) {
			var a = $scope.device.updated ? new Date($scope.device.updated) : new Date();
			var b = new Date(a - (n * 1000));

			return b.toISOString().replace(/:..\..+Z$/, '');
		};

		$scope.getToMsgDateTime = function() {
			return ($scope.device.updated ? new Date($scope.device.updated) : new Date())
				.toISOString().replace(/:..\..+Z$/, '');
		};

		$scope.device.$promise.then(function(dev) {
			// Always set query for the last 2 hours since last
			// received message
			$scope.date.from = $scope.date.from || $scope.getFromOffset(7200);
			$scope.date.to   = $scope.date.to   || $scope.getToMsgDateTime();
		});
	})
	.controller('wbDeviceCfgCtrl', function($scope) {
	});
