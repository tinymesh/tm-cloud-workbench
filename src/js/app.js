'using strict';


// Declare app level module which depends on filters, and services
angular.module('workbench', ['ngRoute',
                             'workbench.filters',
                             'workbench.services',
                             'workbench.directives',
                             'workbench.controllers',

                             'user.auth',
                             'workbench.container'])
	.config(['$routeProvider', function($routeProvider) {
	}]);
