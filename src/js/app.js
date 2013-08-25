'using strict';


// Declare app level module which depends on filters, and services
angular.module('workbench', ['ngRoute',
                             'workbench.filters',
                             'workbench.services',
                             'workbench.directives',
                             'workbench.controllers',

                             'user.auth'])
	.config(['$routeProvider', function($routeProvider) {
	}]);
