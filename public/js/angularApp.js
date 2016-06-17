var app = angular.module('kex', ['ui.router']);

app.factory('clients', ['$http', 'auth', function($http, auth) {
	var o = {
		clients: []
	};

	o.getAll = function() {
		return $http.get('/clients').success(function(data) {
			angular.copy(data, o.clients);
		});
	};

	o.create = function(client) {
		return $http.post('/clients', client, {
			headers: { Authorization: 'Bearer ' + auth.getToken() }
		}).success(function(data) {
			o.clients.push(data);
		});
	};

	return o;
}]);


app.controller('DashboardCtrl', [
	'$scope',
	'clients',
	function($scope, clients){
		$scope.clients = clients.clients;
	}
]);


app.controller('ClientsCtrl', [
	'$scope',
	'$stateParams',
	'clients',
	'auth',
	function($scope, $stateParams, clients, auth) {
		$scope.clients = clients.clients;
		//$scope.clients = clients.clients[$stateParams.id];
		$scope.isLoggedIn = auth.isLoggedIn;

		$scope.addClient = function() {
			if (!$scope.name || $scope.name == '') {
				return;
			}

			clients.create({
				name: $scope.name,
				email: $scope.email
			});

			$scope.name = '';
			$scope.email = '';
		};
	}
]);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('dashboard', {
				url: '/dashboard',
				templateUrl: '/dashboard.html',
				controller: 'DashboardCtrl'
			})
			.state('clients', {
				url: '/clients',
				templateUrl: '/clients.html',
				controller: 'ClientsCtrl',
				resolve: {
					postPromise: ['clients', function(clients) {
						return clients.getAll();
					}]
				}
			})
			.state('login', {
				url: '/login',
				templateUrl: '/login.html',
				controller: 'AuthCtrl',
				onEnter: ['$state', 'auth', function($state, auth) {
					if (auth.isLoggedIn()) {
						$state.go('clients');
					}
				}]
			})
			.state('register', {
				url: '/register',
				templateUrl: '/register.html',
				controller: 'AuthCtrl',
				onEnter: ['$state', 'auth', function($state, auth) {
					if (auth.isLoggedIn()) {
						$state.go('clients');
					}
				}]
			});

		$urlRouterProvider.otherwise('clients');
	}
]);

app.factory('auth', ['$http', '$window', function($http, $window) {
	var auth = {};

	auth.saveToken = function(token) {
		$window.localStorage['kex-token'] = token;
	};

	auth.getToken = function() {
		return $window.localStorage['kex-token'];
	};

	auth.isLoggedIn = function() {
		var token = auth.getToken();

		if (token) {
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUser = function() {
		if (auth.isLoggedIn()) {
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.register = function(user) {
		return $http.post('/register', user).success(function(data) {
			auth.saveToken(data.token);
		});
	};

	auth.logIn = function(user) {console.log('login');
		return $http.post('/login', user).success(function(data) {
			auth.saveToken(data.token);
		});
	};

	auth.logOut = function() {console.log('logout');
		$window.localStorage.removeItem('kex-token');
	};

	return auth;
}]);

app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth) {
		$scope.user = {};

		$scope.register = function() {
			auth
			.register($scope.user)
			.error(function(error) {
				$scope.error = error;
			})
			.then(function() {
				$state.go('clients');
			});
		};

		$scope.logIn = function() {
			auth.logIn($scope.user).error(function(error) {
				$scope.error = error;
			}).then(function() {
				$state.go('clients');
			});
		}
	}
]);

app.controller('NavCtrl', [
	'$scope',
	'auth',
	function($scope, auth) {
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
	}
]);
