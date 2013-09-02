'using strict';


// Declare app level module which depends on filters, and services
angular.module('workbench', ['ngRoute',
                             'workbench.filters',
                             'workbench.services',
                             'workbench.directives',
                             'workbench.controllers',

                             'user.auth',
                             'workbench.container',
                             'workbench.device'])
	.value('version', '0.1.0')
	.factory('Cfg', function() {
		return {
			api: {
				host: "31.169.50.42",
				port: 8080 }
		};
	});
