'using strict';

/* Directives */

angular.module('workbenchDirectives', [])
	.directive('tmEditable', function() {
		var tpl = '<div class="click-to-edit">' +
			'<div ng-hide="view.enabled">' +
				'<a ng-model="value" class="editable" ng-click="toggle()">{{value}} <i class="glyphicon glyphicon-pencil"> </i></a>' +
			'</div>' +
			'<div ng-show="view.enabled" class="form-group row">' +
				'<div class="col-xs-9">' +
				'<input type="text" ng-model="view.editValue" class="form-control" />' +
				'</div>' +
				'<div style="padding-top:5px;">' +
				'<a ng-click="save()"   class="col-xs-1 glyphicon glyphicon-ok">&nbsp;</a>' +
				'<a ng-click="toggle()" class="col-xs-1 glyphicon glyphicon-remove">&nbsp;</a>' +
				'</div>' +
			'</div>' +
			'</div>';
		return {
			restrict: "A",
			template: tpl,
			scope: {
				value: "=tmEditable"
			},
			controller: function($scope) {
				$scope.view = {
					editValue: $scope.value,
					enabled: false
				};

				$scope.toggle = function() {
					$scope.view.editValue = $scope.value;
					$scope.view.enabled = !$scope.view.enabled;
				};

				$scope.save = function() {
					$scope.value = $scope.view.editValue;
					$scope.view.enabled = false;
					$scope.$parent._changed = true;
				};
			}
		};
	})
	.directive('workbenchAddressEncodingCtrl', function() {
		/*jshint multistr: true */
		var tpl = '<div class="btn-group"> \
			<span class="btn btn-sm input-group-addon">Address encoding</span> \
			<button ng-class="{active: opts.encoding == \'hex\' || !opts.encoding}" ng-click="opts.encoding = \'hex\'"   type="button" class="btn btn-sm btn-default">HEX</button> \
			<button ng-class="{active: opts.encoding == \'bytes\'}" ng-click="opts.encoding = \'bytes\'" type="button" class="btn btn-sm btn-default">Bytes</button> \
			<button ng-class="{active: opts.encoding == \'dec\'}" ng-click="opts.encoding = \'dec\'"   type="button" class="btn btn-sm btn-default">Decimal</button> \
		</div>';

		return {
			template: tpl,
		};
	});
