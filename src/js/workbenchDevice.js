angular.module('workbenchDevice', ['ngRoute'])
	.value('version', '0.2.0')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/:resource/device/:network/:device', {
				templateUrl: 'partials/device.html',
				controller: 'wbDeviceCtrl' });
	}])
	.controller('wbDeviceCtrl', function($scope, $location, $route, $routeParams,
			$timeout, breadcrumbs, tmAuth, tmNet, tmDevice, tmMsg, tmStream) {
		var evCallback;

		if ($routeParams.resource !== tmAuth.resource) {
			tmAuth.setResource($routeParams.resource);
		}

		$scope.msg = [];

		breadcrumbs.assign([
			{name: tmAuth.resources[$routeParams.resource].name,
				path: "/" + $routeParams.resource + '/network'},
			{name: $routeParams.network,
				path: "/" + $routeParams.resource + '/network/' + $routeParams.network},
			{name: $routeParams.device,
				path: $location.path()}
		]);

		evCallback = function(resp) {
            $scope.$apply(function () {
				var msg = JSON.parse(resp.data).message;
				if ($scope.msg.length > 5) {
					$timeout.cancel($scope.msg.shift().timer);
				}

				if ('event' === msg['proto/tm'].type) {
					$scope.device.counters.msg_event++;
				} else if ('command' === msg['proto/tm'].type) {
					$scope.device.counters.msg_command++;
				}

				msg.timer = $timeout(function() {
					$scope.$apply(function() {
						$scope.msg.shift();
					});
				}, 5500);
                $scope.msg.push(msg);
			});
		};

		$scope.tab = function(t) {
			if (undefined !== t) {
				$location.search('tab', t);
			} else {
				return $route.current.params.tab || 'overview';
			}
		};

		$scope.updateDevice = function(dev) {
			dev.$update({network: $scope.net.key})
				.then(function(newdev) {
					$scope.alertBody  = 'Device ' + (newdev.name || newdev.key) + ' was successfully updated';
					$scope.alertClass = 'success';
				});
		};

		$scope.net = tmNet.get({id: $routeParams.network});
		$scope.net.$promise.then(function(net) {
				$scope.connected = _.some(net.channel, function(i) {
					return i[1];
				});

				$scope.known_konnections = _.keys(net.channel || {});

				if ($scope.esource) {
					$scope.esource.close();
				}

				$scope.esource = new tmStream({network: net.key, device: $routeParams.device});
				$scope.esource.addEventListener('message', evCallback, false);

				breadcrumbs.setName(1, net.name || net.key);
			});

		$scope.device = tmDevice.get({
			network: $routeParams.network,
			key: $routeParams.device
		});

		$scope.device.$promise.then(function(dev) {
			$scope.message = new tmMsg({
				type: 'command',
				command: 'get_status',
				cmd_number: 0
			});

			breadcrumbs.setName(2, dev.name || dev.key);
		});

		$scope.sendMessage = function(msg) {
			msg2 = $scope.filterMsg(msg.command, msg);
			msg2.$create({network: $scope.net.key, device: $scope.device.key})
				.catch(function(err) {
					$scope.alertClass = 'danger';
					$scope.alertBody = "Failed to publish message" + JSON.stringify(err);
				});
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
		$scope.device.$promise.then(function(dev) {
			var hw, fw;

			if ($scope.device['tm/state']) {
				hw = $scope.device['tm/state'].hw || undefined,
				fw = $scope.device['tm/state'].fw || undefined;

				_.defaults(
					$scope.device['tm/state']['proto/tm'].config || {},
					$scope.cfgDefaults(hw, fw));
				$scope.device['tm/config'] = $scope.device['tm/state']['proto/tm'].config;
			}


			$scope.conf = $scope.groupParams();
		});

		$scope.hasConfig = function() { return _.isEmpty($scope.conf); };

		$scope.cfgDefaults = function(fw, hw) {
			return _.foldr($scope.cfgParams, function(acc, key) {
				acc[key] = $scope.defaultVal(key, fw, hw);
				return acc;
			}, {});
		};

		$scope.groupParams = function() {
			var dev = [
				'system_id', 'node_id', 'locator', 'device_type',
				'model', 'fw_version', 'hw_version'];

			var net = [
				'rf_channel', 'rf_power', 'rf_data_rate', 'rf_retry_limit',
				'protocol_mode', 'rssi_threshold', 'rssi_assesment',
				'max_jump_count', 'max_jump_level', 'max_packet_latency',
				'connect_check_time', 'hiam_time'];

			var net_cluster = ['cluster_min_size', 'cluster_rssi_threshold'];

			var gpio = [
				'gpio_0_config', 'gpio_1_config', 'gpio_2_config',
				'gpio_3_config', 'gpio_4_config', 'gpio_5_config',
				'gpio_6_config', 'gpio_7_config', 'gpio_0_trigger',
				'gpio_1_trigger', 'gpio_2_trigger', 'gpio_3_trigger',
				'gpio_4_trigger', 'gpio_5_trigger', 'gpio_6_trigger',
				'gpio_7_trigger', 'gpio_0_hi_hi_triggerlevel',
				'gpio_0_hi_lo_triggerlevel', 'gpio_0_lo_hi_triggerlevel',
				'gpio_0_lo_lo_triggerlevel', 'gpio_0_sample_rate',
				'gpio_1_hi_hi_triggerlevel', 'gpio_1_hi_lo_triggerlevel',
				'gpio_1_lo_hi_triggerlevel', 'gpio_1_lo_lo_triggerlevel',
				'gpio_1_sample_rate', 'input_debounce', 'pwm_default'];

			var uart = [
				'cts_hold_time', 'baud_rate', 'uart_bits', 'uart_parity',
				'uart_stop_bits', 'uart_flow_control', 'serial_buffer_margin',
				'serial_timeout'];

			var cfg = {
				dev:  _.pick($scope.device['tm/config'] || {}, dev),
				net: _.pick($scope.device['tm/config'] || {}, net),
				net_cluster: _.pick($scope.device['tm/config'] || {}, net_cluster),
				gpio: _.pick($scope.device['tm/config'] || {}, gpio),
				uart: _.pick($scope.device['tm/config'] || {}, uart),
				misc: _.omit($scope.device['tm/config'] || {}, _.flatten([dev, net, gpio, uart, net_cluster]))
			};

			cfg._numKeys = _.flatten(_.map(_.values(cfg), _.keys)).length;

			return cfg;
		};

		$scope.cfgParams = ['rf_channel', 'rf_power', 'rf_data_rate',
			'protocol_mode', 'rssi_threshold', 'rssi_assesment',
			'hiam_time', 'ima_time', 'connect_check_time', 'max_jump_level',
			'max_jump_count', 'max_packet_latency', 'rf_retry_limit',
			'serial_timeout', 'device_type', 'gpio_0_config', 'gpio_1_config',
			'gpio_2_config', 'gpio_3_config', 'gpio_4_config', 'gpio_5_config',
			'gpio_6_config', 'gpio_7_config', 'gpio_0_trigger',
			'gpio_1_trigger', 'gpio_2_trigger', 'gpio_3_trigger',
			'gpio_4_trigger', 'gpio_5_trigger', 'gpio_6_trigger',
			'gpio_7_trigger', 'input_debounce', 'gpio_0_hi_hi_triggerlevel',
			'gpio_0_hi_lo_triggerlevel', 'gpio_0_lo_hi_triggerlevel',
			'gpio_0_lo_lo_triggerlevel', 'gpio_0_sample_rate',
			'gpio_1_hi_hi_triggerlevel', 'gpio_1_hi_lo_triggerlevel',
			'gpio_1_lo_hi_triggerlevel', 'gpio_1_lo_lo_triggerlevel',
			'gpio_1_sample_rate', 'cts_hold_time', 'locator', 'node_id',
			'system_id', 'baud_rate', 'uart_bits', 'uart_parity',
			'uart_stop_bits', 'uart_flow_control', 'serial_buffer_margin',
			'model', 'hw_version', 'fw_version', 'security_level', 'hiack',
			'ima_on_connect', 'pwm_default', 'cluster_min_size',
			'cluster_rssi_threshold', 'detect_network_busy', 'detect_rf_tamper',
			'__trigger'];

		$scope.defaultVal = function(key, fw, hw) {
			var ps = {
				'__trigger'                 : 'default',
				'rf_channel'                : {"_": 4},
				'rf_power'                  : {"_": 5},
				'rf_data_rate'              : {"_": 5},
				'protocol_mode'             : {"_": 1},
				'rssi_threshold'           : {"_": 190},
				'rssi_assesment'            : {"_": 190},
				'hiam_time'                 : {"_": 4},
				'ima_time'                  : {"_": 255},
				'connect_check_time'        : {"_": 4},
				'max_jump_level'            : {"_": 20},
				'max_jump_count'            : {"_": 30},
				'max_packet_latency'        : {"_": 5},
				'rf_retry_limit'            : {"_": 10},
				'serial_timeout'            : {"_": 20},
				'device_type'               : {"_": 2},
				'gpio_0_config'             : {"_": 1},
				'gpio_1_config'             : {"_": 1},
				'gpio_2_config'             : {"_": 1},
				'gpio_3_config'             : {"_": 1},
				'gpio_4_config'             : {"_": 1},
				'gpio_5_config'             : {"_": 1},
				'gpio_6_config'             : {"_": 1},
				'gpio_7_config'             : {"_": 1},
				'gpio_0_trigger'            : {"_": 0},
				'gpio_1_trigger'            : {"_": 0},
				'gpio_2_trigger'            : {"_": 0},
				'gpio_3_trigger'            : {"_": 0},
				'gpio_4_trigger'            : {"_": 0},
				'gpio_5_trigger'            : {"_": 0},
				'gpio_6_trigger'            : {"_": 0},
				'gpio_7_trigger'            : {"_": 0},
				'input_debounce'            : {"_": 10},
				'gpio_0_hi_hi_triggerlevel' : {"_": 7},
				'gpio_0_hi_lo_triggerlevel' : {"_": 255},
				'gpio_0_lo_hi_triggerlevel' : {"_": 0},
				'gpio_0_lo_lo_triggerlevel' : {"_": 0},
				'gpio_0_sample_rate'        : {"_": 10},
				'gpio_1_hi_hi_triggerlevel' : {"_": 7},
				'gpio_1_hi_lo_triggerlevel' : {"_": 255},
				'gpio_1_lo_hi_triggerlevel' : {"_": 0},
				'gpio_1_lo_lo_triggerlevel' : {"_": 0},
				'gpio_1_sample_rate'        : {"_": 10},
				'cts_hold_time'             : {"_": 6},
				'locator'                   : {"_": 0},
				'node_id'                   : {"_": -1},
				'system_id'                 : {"_": -1},
				'baud_rate'                 : {"_": 5},
				'uart_bits'                 : {"_": 8},
				'uart_parity'               : {"_": 0},
				'uart_stop_bits'            : {"_": 8},
				'uart_flow_control'         : {"_": 1},
				'serial_buffer_margin'      : {"_": 4},
				'model'                     : {"_": "undefined"},
				'hw_version'                : {"_": "x.yz"},
				'fw_version'                : {"_": "x.yz"},
				'security_level'            : {"_": 0},
				'hiack'                     : {"_": 1},
				'ima_on_connect'            : {"_": 0},
				'pwm_default'               : {"_": 0},
				'cluster_min_size'          : {"_": 10},
				'cluster_rssi_threshold'    : {"_": 60},
				'detect_network_busy'       : {"_": 60},
				'detect_rf_tamper'          : {"_": 0}
			};

			if (ps[key]) {
				if (_.isObject(ps[key])) {
					return ps[key][fw] || ps[key]._;
				} else {
					return ps[key];
				}
			} else {
				return undefined;
			}
		};
	});