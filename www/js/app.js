// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('dragonrace', ['ionic', 'ngAudio', 'dragonrace.controllers', 'dragonrace.services', 'dragonrace.directives'])

.run(function($ionicPlatform, $rootScope, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
	// force start at home page
	$rootScope.$on('$stateChangeStart', function (e) {
		if(!$rootScope.loaded) {
			$rootScope.loaded = true;
			e.preventDefault();
			$state.go('home');
			return;
		}
	});
})

.config(function($stateProvider, $urlRouterProvider) {
  
	$stateProvider
  .state('home', {
    url: '/',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
  })
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html'
  })
  .state('app.setup', {
    url: '/setup',
		views: {
			'menuContent': {
    		templateUrl: 'templates/setup.html',
    		controller: 'SetupCtrl'
			}
		}
  })
  .state('app.stats', {
    url: '/stats',
		views: {
			'menuContent': {
    		templateUrl: 'templates/stats.html',
    		controller: 'StatsCtrl'
			}
		}
  })
  .state('app.placebet', {
    url: '/placebet',
		views: {
			'menuContent': {
    		templateUrl: 'templates/place-bet.html',
    		controller: 'PlaceBetCtrl'
			}
		}
  })
  .state('app.game', {
    url: '/game',
    views: {
      'menuContent': {
        templateUrl: 'templates/game.html',
        controller: 'GameCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise('/');

});
