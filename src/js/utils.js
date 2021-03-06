angular.module('utils', [])
	.factory('loadbar', function($rootScope, $q) {
		$rootScope.loading = $rootScope.loading || 0;
		return function(promise) {
			++$rootScope.loading;
			$rootScope.promise = ($rootScope.promise) ?
				$q.all($rootScope.promise, promise) :
				promise;

			return $rootScope.promise.then(function() {
				--$rootScope.loading;
			}, function(err) {
				--$rootScope.loading;
			});
		};
	})
	.factory('errorModal', function($rootScope) {
		$rootScope.clearError = function() { $rootScope.error = undefined; };
		return {
			set: function(title, body) {
				$rootScope.error = {title: title, body: body};
			},
			clear: $rootScope.clearError
		};
	})
	.factory('breadcrumbs', function($rootScope, $location) {

		var breadcrumbs = [];
		var breadcrumbsService = {};

//		//we want to update breadcrumbs only when a route is actually changed
//		//as $location.path() will get updated imediatelly (even if route change fails!)
//		$rootScope.$on('$routeChangeSuccess', function(event, current) {
//			var pathElements = $location.path().split('/'), result = [], i;
//			var breadcrumbPath = function (index) {
//				return '/' + (pathElements.slice(0, index + 1)).join('/');
//			};
//
//			pathElements.shift();
//			for (i=0; i<pathElements.length; i++) {
//				result.push({name: pathElements[i], path: breadcrumbPath(i)});
//			}
//
//			breadcrumbs = result;
//		});

		breadcrumbsService.getAll = function() {
			return breadcrumbs;
		};

		breadcrumbsService.head = function() {
			return breadcrumbsService.nth(0) || {};
		};

		breadcrumbsService.last = function() {
			return breadcrumbsService.nth(breadcrumbs.length) || {};
		};

		breadcrumbsService.nth  = function() {
			return breadcrumbs[nth];
		};

		breadcrumbsService.setName = function(p, val) {
			return breadcrumbs[p].name = val;
		};

		breadcrumbsService.assign = function(vals) {
			return breadcrumbs = vals;
		};

		return breadcrumbsService;
	});
