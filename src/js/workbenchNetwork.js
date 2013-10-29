/*jshint -W054 */

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

		$scope.jsonErr = true;
		$scope.net = tmNet.get({id: $routeParams.network, device: "expand"});
		$scope.net.$promise.then(function(net) {
			breadcrumbs.setName(1, net.name || net.key);

			$scope.editor = ace.edit("editor");
			$scope.editor.setTheme("ace/theme/github");
			$scope.editor.getSession().setMode("ace/mode/javascript");
			$scope.editor.setValue("return " + $scope.stringify(net));
			$scope.editor.getSession().setUseSoftTabs(false);
			$scope.editor.getSession().on("changeAnnotation", function(){
				var annot = $scope.editor.getSession().getAnnotations();
				$scope.$apply(function() {
					$scope.jsonErr = false;
					for (var key in annot) {
						if (annot.hasOwnProperty(key)) {
							$scope.jsonErr = $scope.jsonErr || annot[key].type === 'error';
						}
					}
				});
			});
		});

		var extendDeep = function extendDeep(target, source) {
			for (var prop in source) {
				if (_.isObject(prop) && prop in target) {
					extendDeep(target[prop], source[prop]);
				} else {
					target[prop] = source[prop];
				}

				return target;
			}
		};

		$scope.stringify = function(net) {
			var omit = ['devices', 'addr', 'counters', 'meta', ''];
			var patterns = [[/\\n/g, "\n"], [/\\r/g, "\r"], [/\\t/g, "\t"], 
				[/"\\u0002/g, ""], [/\\u0003"/g, ""]];
			return _.reduce(patterns,
				function(acc, r) {
					return acc.replace(r[0], r[1]);
				},
				JSON.stringify(_.omit(net, omit), function(k, v) {
						if (k.match(/\$/)) {
							return undefined;
						} else if (typeof v === 'function') {
							return "\02" + v.toString + "\03";
						} else if (typeof v === 'string' && v.substr(0,8) === "function") {
							return "\02" + v + "\03";
						}

						return v;
					}, '\t'));
		};

		$scope.update = function(net) {
			var newnet = new Function($scope.editor.getValue())();
			net = _.extend(net, extendDeep(newnet, net));

			_.each(net.types, function(v, t) {
				if (v.parser && typeof v.parser === 'function') {
					net.types[t].parser = v.parser.toString();
				}
			});

			net.$update()
				.then(function(net) {
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
