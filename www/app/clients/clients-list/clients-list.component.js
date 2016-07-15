'use strict';

angular.module('kexApp.clients', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/clients', {
    templateUrl: 'clients/clients.html',
    controller: 'ClientsCtrl'
  });
}])

.controller('ClientsCtrl', [function() {

}]);
