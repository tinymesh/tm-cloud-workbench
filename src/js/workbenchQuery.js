angular.module('workbenchQuery', ['ngRoute'])
	.value('version', '0.0.1')
	.controller('wbQueryCtrl', function($scope, $location, tmMsgQuery) {
		$scope.date = {
			from: $location.$$search['date.from'] || new Date().toISOString().substr(0, 11) + "00:00",
			to:   $location.$$search['date.to'] || new Date().toISOString().substr(0, 16)
		};
		$scope.sort = {
			by: ($location.$$search['sort.by'] || "datetime").split(','),
			reverse: "true" === $location.$$search['sort.reverse'] || "false",
		};

		$scope.filter = {
			omit: ($location.$$search['filter.omit'] || "").split(","),
			pick: ($location.$$search['filter.pick'] || "").split(",")
		};

		$scope.q = ["type:event"];
		$scope.query = ($location.$$search['query'] || "type:event").split(",");
		$scope.result = undefined;

		console.log($location);
		var updateURL = function(q) {
			var update = function(k) {
				if($location.$$search[k] !== q[k]) {
					$location.search(k, q[k]);
				}
			};

			update('date.from');
			update('date.to');
			update('filter.pick');
			update('filter.omit');
			update('sort.by');
			update('sort.reverse');
			update('query');
		};

		$scope.run = function(sel) {
			var network = sel[0] || "",
				device = sel[1] || "",
				sanetize = function(d) { return d.replace(/(?:^,|,$)/, ''); },
				q;

			$scope.q = {
				'network': network,
				'device': device,
				'date.from': $scope.date.from,
				'date.to': $scope.date.to,
				'filter.omit': sanetize($scope.filter.omit.toString()),
				'filter.pick': sanetize($scope.filter.pick.toString()),
				'query':       sanetize($scope.query.toString()),
				'sort.by':     sanetize($scope.sort.by.toString()),
				'sort.reverse': $scope.sort.reverse ? "true" : "false"
			};

			updateURL($scope.q);
			$scope.result = tmMsgQuery.query($scope.q);
		};

		$scope.next = function() {
			$scope.q = _.extend($scope.q, $scope.result.meta.query.next);

			updateURL($scope.q);
			$scope.result = tmMsgQuery.query($scope.q);
		};

		$scope.prev = function() {
			$scope.q = _.extend($scope.q, $scope.result.meta.query.prev);

			updateURL($scope.q);
			$scope.result = tmMsgQuery.query($scope.q);
		};
	});
