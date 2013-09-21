'using strict';

angular.module('workbench.device.controllers', [])
	.value('version', '0.1.0')
	.controller('Workbench.Device', function($route, $rootScope, $scope, $location, AuthHelper, Device, Container, Message, MessageStream) {
		$scope.container    = $route.current.params.container;
		$scope.device       = $route.current.params.device;
		$scope.res = {
			'name' : 'Unamed device (' + $scope.device + ')',
			'type' : "device",
			'tm/config' : {
				fw: '',
				hw: ''
			}
		};

		$scope.msg = [];
		$scope.last_msg = false;

		$scope._changed     = false;
		$scope.alertClass   = '';
		$scope.alertBody    = '';

		$rootScope.breadcrumb = [
			[$scope.container, '/container/' + $scope.container],
			[$scope.device, '/device/' + $scope.container + '/' + $scope.device]
		];

		$rootScope.path = $location.$$path;

		Device.get({container: $scope.container, device: $scope.device})
			.$promise.then(function(res) {
				var fw = res.firmware, hw = res.hardware;

				$scope.res = _.defaults(res, $scope.res);
				$rootScope.breadcrumb[1][0] = res.name;

				$scope.$broadcast('sync:device');
			});

		Container.get({container: $scope.container})
			.$promise.then(function(res) {
				$scope.container_res = res;
				$scope.connected = _.some(res.channel, function(i) {
					return i[1];
				});

				$scope.know_connections = _.keys(res.channel);

				$rootScope.breadcrumb[0][0] = res.name;
			});

		$scope.tab = function(t) {
			if (undefined !== t) {
				$location.search('tab', t);
			} else {
				return $route.current.params.tab || 'overview';
			}
		};

		$scope.updateResource = function(res) {
			var obj = new Device({name: res.name,
				type: res.type});
			obj.$update({device: $scope.device, container: $scope.container})
				.then(function(res) {
						$scope._changed = false;
						$scope.alertClass = 'success';
						$scope.alertBody= 'Device ' + $scope.device + ' was updated.';
				},
				function(err) {
						$scope.alertClass = 'danger';
						$scope.alertBody  = "<b>Error:</b> Failed to save device resource";
			});
		};

		$scope.sendMessage = function(msg) {
			msg = $scope.filterMsg(msg.command, msg);
			msg.$create({container: $scope.container, device: $scope.device})
				.then(function(res) {
				}, function(err) {
					$scope.alertClass = 'danger';
					$scope.alertBody = "Failed to publish message" + JSON.stringify(err);
				});
		};

		$scope.filterMsg = function(cmd, msg_in) {
			if (undefined === msg_in) {
				return {};
			}

			var msg = new Message({
				uid: msg_in.uid,
				type: "command",
				cmd_number: msg_in.cmd_number,
				command: msg_in.command
			});

			switch (cmd) {
				case "set_output": msg.output = msg_in.output; break;
				case "set_pwm": msg.pwm = msg_in.pwm; break;
				case "serial": msg.data = msg_in.data; break;
			}

			return msg;
		};

		var evCallback = function (resp) {
            $scope.$apply(function () {
				var msg = JSON.parse(resp.data).message;
				if ($scope.msg.length > 1) {
					$scope.msg.shift();
				}

				if ('event' === msg['proto/tm'].type) {
					$scope.res.counters.msg_event++;
				} else if ('command' === msg['proto/tm'].type) {
					$scope.res.counters.msg_command++;
				}

                $scope.msg.push(msg);
				setTimeout(function(){
					$scope.$apply(function() {
						var i = $scope.msg.indexOf(msg);
						if (0 === i) {
							$scope.msg.shift();
						} else if (1 === i) {
							$scope.msg.pop();
						}
					});
				}, 7500);
            });
        };

		AuthHelper.tryAuth
			.then(function() {
				new MessageStream().addEventListener('message', evCallback, false);
			});
	})
	.controller('Workbench.Device.MessageList', function($scope, $location, Message, MessageList) {
		$scope.date = {
			from: $location.$$search.from,
			to:   $location.$$search.to
		};

		$scope.messages = [];

		$scope.getToMsgDateTime = function() {
			return $scope.res.updated.replace(/:..\..+Z$/, '');
		};

		$scope.getFromOffset = function(n) {
			var a = new Date($scope.res.updated.replace(/:..\..+Z$/, ''));
			var b = new Date(a - (n * 1000));

			return b.toISOString().replace(/:..\..+Z$/, '');
		};

		$scope.querySubmitted = false;
		$scope.fetchMessages = function(from, to) {
			$scope.querySubmitted = true;
			var q = {
				'date.to':   to,
				'date.from': from,
				'device':    $scope.device,
				'container': $scope.container
			};

			$location.search('to', to);
			$location.search('from', from);

			MessageList.list(q).$promise
				.then(function(res) {
					$scope.messages = res;
				}, function(fail) {
					alert("Failed to fetch messagess");
					console.log("err: ", fail);
				});
		};

		$scope.$on('sync:device', function() {
			$scope.date.from = $scope.date.from || $scope.getFromOffset(7200);
			$scope.date.to   = $scope.date.to   || $scope.getToMsgDateTime();

			$scope.message = new Message({
				uid: $scope.res['tm/state']['proto/tm'].uid,
				type: "command",
				cmd_number: 1,
				command: "serial",
				data: "Hello World!",
				pwm: $scope.pwm || 0,
				output: {
					0 : 1 === $scope.res['tm/state']['proto/tm'].digital_io_0,
					1 : 1 === $scope.res['tm/state']['proto/tm'].digital_io_1,
					2 : 1 === $scope.res['tm/state']['proto/tm'].digital_io_2,
					3 : 1 === $scope.res['tm/state']['proto/tm'].digital_io_3,
					4 : 1 === $scope.res['tm/state']['proto/tm'].digital_io_4,
					5 : 1 === $scope.res['tm/state']['proto/tm'].digital_io_5,
					6 : 1 === $scope.res['tm/state']['proto/tm'].digital_io_6,
					7 : 1 === $scope.res['tm/state']['proto/tm'].digital_io_7
				}
			});
		});

	})
	.controller('Workbench.Device.Config', function($scope) {
		$scope.$on('sync:device', function() {
			if (undefined !== $scope.res['tm/state']['proto/tm'].config) {
				_.defaults(
					$scope.res['tm/state']['proto/tm'].config,
					$scope.cfgDefaults($scope.res['tm/config'].fw, $scope.res['tm/config'].hw));
				$scope.res['tm/config'] = $scope.res['tm/state']['proto/tm'].config;

				$scope.conf = $scope.groupParams();
			} else {
				$scope.conf = {};
			}
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

			return {
				dev:  _.pick($scope.res['tm/config'], dev),
				net: _.pick($scope.res['tm/config'], net),
				net_cluster: _.pick($scope.res['tm/config'], net_cluster),
				gpio: _.pick($scope.res['tm/config'], gpio),
				uart: _.pick($scope.res['tm/config'], uart),
				misc: _.omit($scope.res['tm/config'], _.flatten([dev, net, gpio, uart, net_cluster]))
			};
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
