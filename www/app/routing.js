(function () {
  'use strict';

  var isAuthenticated = function ($rootScope, $q, $http, $state) {
    var defer = $q.defer();
    $http.get(budgetManager.config.webApi.baseUrl + '/isAuthenticated').then(
      function (response) {
        // Authenticated
        if (response.status !== undefined && response.status !== 200) {
          console.log(response.data);
          defer.reject(response.data);
          $state.go('signin');
        } else {
          $rootScope.user = response.data;
          defer.resolve(true);
        }
      }, function () {
        $state.go('signin');
      });
    return defer.promise;
  };

  angular
    .module('appBudgetManager')
    .config(RoutingInitialization);
  RoutingInitialization.$intject = ['$stateProvider', '$urlRouterProvider'];

  function RoutingInitialization($stateProvider, $urlRouterProvider) {
    // Système de routage
    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppController'
      })
      .state('home', {
        url: '/home',
        templateUrl: 'app/components/home/homeView.html',
        controller: 'HomeController'
      })
      .state('signin', {
        url: '/signin',
        templateUrl: 'app/components/authentication/views/signinView.html',
        controller: 'SigninController'
      })
      .state('app.provisionalPlans', {
        url: '/provisionalPlans',
        views: {
          'menuContent': {
            template: `
            <ion-view view-title="Plans prévisionels">
              <ion-content class="has-header">
                <provisional-plan-list-cmp provisional-plans="provisionalPlans"></provisional-plan-list-cmp>
              <ion-content>
            <ion-view view-title="Plans prévisionels">`,
            controller: ['$scope', 'provisionalPlans', function ($scope, provisionalPlans) {
              $scope.provisionalPlans = provisionalPlans;
            }],
            resolve: {
              provisionalPlans: function ($stateParams, provisionalPlanWebApi) {
                console.log('im routing');
                try {
                  return provisionalPlanWebApi.findAll();
                } catch (err) {
                  throw new Error(err);
                }
              },
              user: isAuthenticated
            }
          }
        }
      })
      .state('app.provisionalPlansDetails', {
        url: '/:id',
        views: {
          'menuContent': {
            templateUrl: 'app/components/provisionalPlan/views/provisionalPlanDetailsIonicView.html',
            controller: 'ProvisionalPlanDetailsController',
            resolve: {
              provisionalPlan: function ($stateParams, provisionalPlanWebApi) {
                try {
                  return provisionalPlanWebApi.findById($stateParams.id);
                } catch (err) {
                  throw new Error(err);
                }
              },
              user: isAuthenticated
            }
          }
        }
      });

    $urlRouterProvider.otherwise('/home');
  }
})();
