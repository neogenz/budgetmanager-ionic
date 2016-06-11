(function () {
  'use strict';
  angular
    .module('appBudgetManager')
    .factory('ProvisionalPlanService', ProvisionalPlanWebAPI);

  ProvisionalPlanWebAPI.$inject = [
    '$http',
    '$q',
    '$ionicLoading',
    '$cacheFactory'
  ];

  function ProvisionalPlanWebAPI($http, $q, $ionicLoading, $cacheFactory) {

    var cache = $cacheFactory.get(budgetManager.config.cache.key);
    if (!cache) {
      cache = new $cacheFactory(budgetManager.config.cache.key);
    }

    return {
      findAll: _findAll,
      findById: _findById,
      addMovement: _addMovement,
      create: _create,
      remove: _remove,
      update: _update,
      buildDefaultMovementToAddByProvisionalPlanId: _buildDefaultMovementToAddByProvisionalPlanId,
      getSumOfMovementsBy: _getSumOfMovementsBy,
      getSumOfRisingMovementsBy: _getSumOfRisingMovementsBy,
      getSumOfDescendingMovementsBy: _getSumOfDescendingMovementsBy,
      save: _save
    };

    /**
     * @function _findAll
     * @param {boolean} byHttpCall Force the function to make an http call
     * @returns {Promise}
     */
    function _findAll(byHttpCall) {
      $ionicLoading.show({
        template: 'Récupération des données ... <ion-spinner ></ion-spinner>'
      });
      if (!byHttpCall) {
        var provisionalPlansCached = cache.get(budgetManager.config.cache.provisionalPlanKey);
        if (provisionalPlansCached) {
          $ionicLoading.hide();
          return $q.resolve(provisionalPlansCached);
        }
      }
      var requestOptions = neogenz.httpUtilities.buildGetRequestOptToCallThisUrl(
        '/me/provisionalPlans'
      );
      //var promise = $http(requestOptions);
      return $http(requestOptions).then(function (response) {
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
        cache.put(budgetManager.config.cache.provisionalPlanKey, provisionalPlans);
        return provisionalPlans;
      }).finally(function () {
        $ionicLoading.hide();
      });
    }


    /**
     * @function _findById
     * @param {number} provisionalPlanId
     * @returns {Promise}
     */
    function _findById(provisionalPlanId) {
      $ionicLoading.show({
        template: 'Récupération des données ... <ion-spinner ></ion-spinner>'
      });
      if (_.isNull(provisionalPlanId) || _.isUndefined(provisionalPlanId)) {
        return $q.reject('Id is null or undefined.');
      }
      var requestOptions = neogenz.httpUtilities.buildGetRequestOptToCallThisUrl(
        '/me/provisionalPlans/' + provisionalPlanId
      );
      var provisionalPlansCached = cache.get(budgetManager.config.cache.provisionalPlanKey);
      if (provisionalPlansCached) {
        var provisionalPlanCached = _.find(provisionalPlansCached, function (item) {
          return item.id === provisionalPlanId;
        });
        $ionicLoading.hide();
        return $q.resolve(provisionalPlanCached);
      } else {
        return $http(requestOptions).then(function (response) {
          var factory = neogenz.beans.factory;
          var provisionalPlan = factory.getBean('ProvisionalPlan', response.data);
          return provisionalPlan;
        }, function (reason) {
          return $q.reject('DiscussionThread with id ' + provisionalPlanId + ' is null.');
        }).finally(function () {
          $ionicLoading.hide();
        });
      }
    }


    /**
     * @function _addMovement
     * @param {Movement} movementToAdd
     * @returns {Promise}
     */
    function _addMovement(movementToAdd) {
      var provisionalPlansCached = cache.get(budgetManager.config.cache.provisionalPlanKey);
      $ionicLoading.show({
        template: 'Enregistrement ... <ion-spinner ></ion-spinner>'
      });
      if (movementToAdd.provisionalPlanId === null) {
        return $q.reject('Id of provisional plan to add is null.');
      }
      else {
        var requestOptions = neogenz.httpUtilities.buildPostRequestOptToCallThisUrl(
          '/me/provisionalPlans/' + movementToAdd.provisionalPlanId,
          movementToAdd
        );
        var promise = $http(requestOptions);
        return promise.then(function (response) {
          var beanMovementAdded = neogenz.beans.factory.getBean('Movement', response.data);
          if (provisionalPlansCached) {
            var provisionalPlanWhereAddMovement = _.find(provisionalPlansCached, function (item) {
              return item.id === movementToAdd.provisionalPlanId;
            });
            if (provisionalPlanWhereAddMovement) {
              provisionalPlanWhereAddMovement.movements.push(beanMovementAdded);
            }
          }
          return beanMovementAdded;
        }, function (reason) {
          return $q.reject('Add of movement to provisional plan has occured an error.');
        }).finally(function () {
          $ionicLoading.hide();
        });
      }
    }


    /**
     * @param {ProvisionalPlan} provisionalPlan
     * Add the provisional plan by webservice call, add to cache and return this.
     * @returns {ProvisionalPlan}
     */
    function _create(provisionalPlan) {
      $ionicLoading.show({
        template: 'Enregistrement ... <ion-spinner ></ion-spinner>'
      });
      var provisionalPlansCached = cache.get(budgetManager.config.cache.provisionalPlanKey);
      var bodyReq = provisionalPlan;
      var promise;
      if (!neogenz.utilities.isUndefinedOrNull(bodyReq)) {
        var requestOptions = neogenz.httpUtilities.buildPostRequestOptToCallThisUrl('/me/provisionalPlans/', bodyReq);
        promise = $http(requestOptions);
        return promise.then(function (response) {
          var created = neogenz.beans.factory.getBean('ProvisionalPlan', response.data);
          provisionalPlansCached.push(created);
          return created;
        }, function (reason) {
          return $q.reject(reason);
        }).finally(function () {
          $ionicLoading.hide();
        });
      }
      else {
        $ionicLoading.hide();
        return $q.reject('bodyReq is null or undefined.');
      }
    }

    /**
     * @function _remove
     * @param {ProvisionalPlan} provisionalPlan
     * @returns {Promise}
     */
    function _remove(provisionalPlan) {
      if (neogenz.utilities.isUndefinedOrNull(provisionalPlan.id) || provisionalPlan.id === '') {
        return $q.reject('The id of provisional plan to remove is undefined or null.');
      }
      $ionicLoading.show({
        template: 'Suppression ... <ion-spinner ></ion-spinner>'
      });
      //var promise;
      var provisionalPlansCached = cache.get(budgetManager.config.cache.provisionalPlanKey);
      var requestOptions = neogenz.httpUtilities.buildDeleteRequestOptToCallThisUrl('/me/provisionalPlans/' + provisionalPlan.id);
      //promise = $http(requestOptions);
      return $http(requestOptions).then(function (response) {
        var removed = neogenz.beans.factory.getBean('ProvisionalPlan', response.data);
        for (var i = 0; i < provisionalPlansCached.length; i++) {
          if (provisionalPlansCached[i].id === removed.id) {
            provisionalPlansCached.splice(i, 1);
          }
        }
        return removed;
      }, function (reason) {
        return $q.reject(reason);
      }).finally(function () {
        $ionicLoading.hide();
      });
    }


    /**
     * @function _update
     * @param {ProvisionalPlan} provisionalPlan
     * @returns {Promise}
     */
    function _update(provisionalPlan) {
      $ionicLoading.show({
        template: 'Enregistrement ... <ion-spinner ></ion-spinner>'
      });
      delete provisionalPlan.movements;
      if (!neogenz.utilities.isUndefinedOrNull(provisionalPlan)) {
        var provisionalPlansCached = cache.get(budgetManager.config.cache.provisionalPlanKey);
        var bodyReq = provisionalPlan;
        var requestOptions = neogenz.httpUtilities.buildPutRequestOptToCallThisUrl('/me/provisionalPlans', bodyReq);
        return $http(requestOptions).then(function (response) {
            var updated = neogenz.beans.factory.getBean('ProvisionalPlan', response.data);
            for (var i = 0; i < provisionalPlansCached.length; i++) {
              if (provisionalPlansCached[i].id === updated.id) {
                provisionalPlansCached[i] = updated;
                break;
              }
            }
            return updated;
          }, function (response) {
            return $q.reject(response.data);
          }
        ).finally(function () {
          $ionicLoading.hide();
        });
      } else {
        $ionicLoading.hide();
        return $q.reject('The provisional plan to update is null of undefined.');
      }
    }


    /**
     * @function _buildDefaultMovementToAddByProvisionalPlanId
     * @param provisionalPlanId
     * @returns {Movement}
     */
    function _buildDefaultMovementToAddByProvisionalPlanId(provisionalPlanId) {
      var movementDefault = neogenz.beans.factory.getBean('Movement', null); //app.data.autocomplete.Movement();
      movementDefault.active = true;
      movementDefault.name = 'Mouvement d\'argent';
      //Assign to this movement the provisionalPlanId to add
      movementDefault.provisionalPlanId = provisionalPlanId;

      return movementDefault;
    }


    /**
     * @function _getSumOfMovementsBy
     * @param {ProvisionalPlan} provisionalPlan
     * @returns {number}
     */
    function _getSumOfMovementsBy(provisionalPlan) {
      var total = provisionalPlan.baseAmount;
      if (provisionalPlan.movements === undefined) {
        return 0;
      }
      for (var i = 0; i < provisionalPlan.movements.length; i++) {
        var currentMovement = provisionalPlan.movements[i];
        if (currentMovement.active) {
          if (currentMovement.type === 'up') {
            for (var j = 0; j < currentMovement.repeat; j++) {
              total += currentMovement.amount;
            }
          }
          else {
            for (var y = 0; y < currentMovement.repeat; y++) {
              total -= currentMovement.amount;
            }
          }
        }
      }
      return total;
    }


    /**
     * @function _getSumOfRisingMovementsBy
     * @param {ProvisionalPlan} provisionalPlan
     * @returns {number}
     */
    function _getSumOfRisingMovementsBy(provisionalPlan) {
      var total = provisionalPlan.baseAmount;
      if (provisionalPlan.movements === undefined) {
        return provisionalPlan.baseAmount;
      }
      for (var i = 0; i < provisionalPlan.movements.length; i++) {
        var currentMovement = provisionalPlan.movements[i];
        if (currentMovement.active) {
          if (currentMovement.type === 'up') {
            for (var j = 0; j < currentMovement.repeat; j++) {
              total += currentMovement.amount;
            }
          }
        }
      }
      return total;
    }


    /**
     * @function _getSumOfDescendingMovementsBy
     * @param {ProvisionalPlan} provisionalPlan
     * @returns {number}
     */
    function _getSumOfDescendingMovementsBy (provisionalPlan) {
      if (provisionalPlan.movements === undefined) {
        return provisionalPlan.baseAmount;
      }
      var total = provisionalPlan.baseAmount;
      for (var i = 0; i < provisionalPlan.movements.length; i++) {
        var currentMovement = provisionalPlan.movements[i];
        if (currentMovement.active) {
          if (currentMovement.type === 'down') {
            for (var j = 0; j < currentMovement.repeat; j++) {
              total -= currentMovement.amount;
            }
          }
        }
      }
      return total;
    }


    /**
     * @function _save
     * Save an provisional plan by creation or edition according to the id property
     * @param {ProvisionalPlan} provisionalPlanToSave
     * @returns {Promise}
     */
    function _save(provisionalPlanToSave){
      if (neogenz.utilities.isUndefinedOrNull(provisionalPlanToSave.id)) {
        return _create(provisionalPlanToSave);
      } else {
        return _update(provisionalPlanToSave);
      }
    }

  }

})();
