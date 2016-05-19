'use strict';

/**
 * Déclaration de l'application appBudgetManager
 */
angular
  .module('appBudgetManager',
    [
      'ui.router',
      'ui.bootstrap',
      'angular-loading-bar',
      'ngAnimate',
      'ngStorage',
      'toastr',
      'ionic'
    ]
  );

angular
  .module('appBudgetManager')
  .run(function ($localStorage, $state, $rootScope, $ionicPlatform) {
    $rootScope.devise = '€';

    $ionicPlatform.ready(function () {
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
  });

angular
  .module('appBudgetManager')
  .config(function ($httpProvider, $ionicConfigProvider) {
    $ionicConfigProvider.backButton.text('').icon('ion-ios-arrow-left');
    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
      return {
        'request': function (config) {
          config.headers = config.headers || {};
          if (!neogenz.utilities.isUndefinedOrNull($localStorage.token)) {
            config.headers.Authorization = 'Bearer ' + $localStorage.token;
          }
          return config;
        },
        'responseError': function (response) {
          if (response.status === 401) {
            $location.path('/signin');
          }
          return $q.reject(response);
        }
      };
    }]);
  });


angular
  .module('appBudgetManager')
  .controller('AppController', AppController);

AppController.$inject = [
  '$scope',
  'authenticateWebApi',
  '$rootScope',
  '$localStorage',
  '$state'
];

function AppController($scope, authenticateWebApi, $rootScope, $localStorage, $state) {
  (function init() {
    defineScope();
    defineListeners();
  })();

  /**
   * @desc Defines all $scope variables
   * @function defineScope
   * @memberOf Controllers.ProvisionalPlanAddController
   */
  function defineScope() {
  }


  /**
   * @desc Attach view listeners to this controller
   * @function defineListeners
   * @memberOf Controllers.ProvisionalPlanAddController
   */
  function defineListeners() {
    $scope.signout = _signout;
  }


  /**
   * @desc Call a factory to try disconnect user
   * @function _signout
   */
  function _signout(){
    debugger;
    console.error('test');
    authenticateWebApi.logout().then(function () {
      $rootScope.user = null;
      delete $localStorage.token;
      $state.go('home');
    }, function(){
      alert('err');
    });
  }
}
