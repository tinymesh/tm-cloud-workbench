'using strict';

angular.module('workbench', ['ngRoute',
                             'utils',
                             'tmCloudClient',
                             'workbenchDirectives',
                             'workbenchUser',
                             'workbenchNetwork',
                             'workbenchDevice',
                             'workbenchMessage'
	], function($provide) {
		$provide.value('endpoint', 'http://localhost:8080');
		//$provide.value('endpoint', 'http://31.169.50.34:8080');
	})
	.value('version', '0.2.0')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'partials/resources.html',
				controller: 'wbResourceCtrl' })
			.otherwise({
				templateUrl: 'partials/404.html',
				controller: 'wb404Ctrl' });
	}])
	.controller('wbResourceCtrl', function($scope) {
		console.log('abc, easy like 126');
	})
	.controller('wb404Ctrl', function($scope, $window) {
		$scope.$window = $window;
		console.log($window.history);
	});
