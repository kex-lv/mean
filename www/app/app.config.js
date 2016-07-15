'use strict';

angular.
	module('kexApp').
	config(['$locationProvider', '$routeProvider',
		function($locationProvider, $routeProvider) {
			$locationProvider.hashPrefix('!');

			$routeProvider.
				when('/clients', {
					template: '<clients-list></clients-list>'
				}).
				when('/clients/:clientId', {
					template: '<client-details></client-details>'
				}).
				otherwise({redirectTo: '/clients'});
		}
	]);
