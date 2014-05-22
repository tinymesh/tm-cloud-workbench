angular.module('utils', [])
	.factory('loadbar', function($rootScope, $q) {
		return function(promise, text) {
				$rootScope.loading = promise || $q.deffer();
				$rootScope.loading.then(function() {
					$rootScope.loading = undefined;
				}, function() { $rootScope.loading = undefined; });

		};
	})
	.factory('errorModal', function($rootScope) {
		return {
			set: function(title, body) {
				$rootScope.error = {title: title, body: body};
			},
			clear: function() {
				$rootScope.error = undefined;
			}
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
