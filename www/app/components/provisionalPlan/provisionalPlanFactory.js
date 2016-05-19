(function () {
  'use strict';
  angular
    .module('appBudgetManager')
    .factory('provisionalPlanWebApi', ProvisionalPlanWebAPI);

  ProvisionalPlanWebAPI.$inject = [
    '$http',
    '$q',
    '$ionicLoading'
  ];
  function ProvisionalPlanWebAPI($http, $q, $ionicLoading) {

    return {
      findAll: _findAll,
      findById: _findById,
      addMovement: _addMovement,
      create: _create,
      remove: _remove,
      update: _update
    };

    //Web API
    function _findAll() {
      $ionicLoading.show({
        template: 'Récupération des données ... <ion-spinner ></ion-spinner>'
      });
      var requestOptions = neogenz.httpUtilities.buildGetRequestOptToCallThisUrl(
        '/me/provisionalPlans'
      );
      var promise = $http(requestOptions);
      return promise.then(function (response) {
        var data = response.data;
        if (!data) {
          throw new Error('data');
        }
        var factory = neogenz.beans.factory;
        if (!_.isArray(data)) {
          throw new Error('The result of promise must be an array');
        }
        var provisionalPlans = [];
        for (var i = 0; i < data.length; i++) {
          provisionalPlans.push(factory.getBean('ProvisionalPlan', data[i]));
        }
        $ionicLoading.hide();
        return provisionalPlans;
      }).finally(function () {
        $ionicLoading.hide();
      });
    }

    function _findById(id) {
      $ionicLoading.show({
        template: 'Récupération des données ... <ion-spinner ></ion-spinner>'
      });
      var def = $q.defer();
      if (_.isNull(id) || _.isUndefined(id)) {
        def.reject('Id is null or undefined.');
      }
      else {
        var requestOptions = neogenz.httpUtilities.buildGetRequestOptToCallThisUrl(
          '/me/provisionalPlans/' + id
        );
        var promise = $http(requestOptions);
        promise.then(function (response) {
          var factory = neogenz.beans.factory;
          var provisionalPlans = factory.getBean('ProvisionalPlan', response.data);
          def.resolve(provisionalPlans);
        }, function (reason) {
          def.reject('DiscussionThread with id ' + id + ' is null.');
        }).finally(function () {
          $ionicLoading.hide();
        });
      }
      return def.promise;
    }

    function _addMovement(movementToAdd) {
      $ionicLoading.show({
        template: 'Enregistrement ... <ion-spinner ></ion-spinner>'
      });
      var def = $q.defer();
      if (movementToAdd.provisionalPlanId === null) {
        def.reject('Id of provisional plan to add is null.');
      }
      else {
        var requestOptions = neogenz.httpUtilities.buildPostRequestOptToCallThisUrl(
          '/me/provisionalPlans/' + movementToAdd.provisionalPlanId,
          movementToAdd
        );
        var promise = $http(requestOptions);
        promise.then(function (response) {
          debugger;
          var beanMovementAdded = neogenz.beans.factory.getBean('Movement', response.data);
          def.resolve(beanMovementAdded);
        }, function (reason) {
          def.reject('Add of movement to provisional plan has occured an error.');
        }).finally(function () {
          $ionicLoading.hide();
        });
      }
      return def.promise;
    }

    function _create(provisionalPlan) {
      $ionicLoading.show({
        template: 'Enregistrement ... <ion-spinner ></ion-spinner>'
      });
      var def = $q.defer();
      var bodyReq = provisionalPlan;
      var promise;
      if (!neogenz.utilities.isUndefinedOrNull(bodyReq)) {
        var requestOptions = neogenz.httpUtilities.buildPostRequestOptToCallThisUrl('/me/provisionalPlans/', bodyReq);
        promise = $http(requestOptions);
        promise.then(function (response) {
          var created = neogenz.beans.factory.getBean('ProvisionalPlan', response.data);
          def.resolve(created);
        }, function (reason) {
          def.reject(reason);
        }).finally(function () {
          $ionicLoading.hide();
        });
      }
      else {
        def.reject('bodyReq is null or undefined.');
      }
      return def.promise;
    }

    function _remove(provisionalPlan) {
      $ionicLoading.show({
        template: 'Suppression ... <ion-spinner ></ion-spinner>'
      });
      var def = $q.defer();
      var promise;
      if (neogenz.utilities.isUndefinedOrNull(provisionalPlan.id) || provisionalPlan.id === '') {
        def.reject();
        return def.promise;
      }
      var requestOptions = neogenz.httpUtilities.buildDeleteRequestOptToCallThisUrl('/me/provisionalPlans/' + provisionalPlan.id);
      promise = $http(requestOptions);
      promise.then(function () {
        def.resolve();
      }, function (reason) {
        def.reject(reason);
      }).finally(function () {
        $ionicLoading.hide();
      });
      return def.promise;
    }

    function _update(provisionalPlan) {
      $ionicLoading.show({
        template: 'Enregistrement ... <ion-spinner ></ion-spinner>'
      });
      delete provisionalPlan.movements;
      if (!neogenz.utilities.isUndefinedOrNull(provisionalPlan)) {
        var bodyReq = provisionalPlan;
        var requestOptions = neogenz.httpUtilities.buildPutRequestOptToCallThisUrl('/me/provisionalPlans', bodyReq);
        return $http(requestOptions).finally(function () {
          $ionicLoading.hide();
        });
      } else {
        return $q.reject();
      }

    }

  }

})();
