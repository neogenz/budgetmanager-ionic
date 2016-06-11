(function () {
  'use strict';

  var isAuthenticated = function ($rootScope, $http, $state) {
    var httpRequestionOptions = neogenz.httpUtilities.buildGetRequestOptToCallThisUrl('/isAuthenticated');
    $http(httpRequestionOptions).then(
      function (response) {
        // Authenticated
        if (response.status !== undefined && response.status !== 200) {
          console.log(response.data);
          $state.go('signin');
        } else {
          $rootScope.user = response.data;
          return true;
        }
      }, function () {
        $state.go('signin');
      });
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
        cache: false, //For refresh the provisionalPlans
        views: {
          'menuContent': {
            templateUrl: 'app/components/provisionalPlan/views/provisionalPlansList.html',
            controller: 'ProvisionalPlansListController as provisionalPlanListCtrl',
            resolve: {
              provisionalPlans: function ($stateParams, ProvisionalPlanService) {
                try {
                  return ProvisionalPlanService.findAll();
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
        url: '/provisionalPlans/:id',
        views: {
          'menuContent': {
            templateUrl: 'app/components/provisionalPlan/views/provisionalPlanDetails.html',
            controller: 'ProvisionalPlanDetailsController as provisionalPlanDetailsCtrl',
            resolve: {
              provisionalPlan: function ($stateParams, ProvisionalPlanService) {
                try {
                  return ProvisionalPlanService.findById($stateParams.id);
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
