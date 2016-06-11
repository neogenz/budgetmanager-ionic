(function () {
  'use strict';
  angular
    .module('appBudgetManager')
    .factory('MovementService', MovementWebAPI);

  MovementWebAPI.$inject = [
    '$http',
    '$q',
    '$ionicLoading',
    '$cacheFactory',
    'ProvisionalPlanService'
  ];

  function MovementWebAPI($http, $q, $ionicLoading, $cacheFactory, ProvisionalPlanService) {

    var cache = $cacheFactory.get(budgetManager.config.cache.key);
    if (!cache) {
      cache = new $cacheFactory(budgetManager.config.cache.key);
    }

    return {
      update: _update,
      remove: _remove,
      getMovementsCollectionWithoutOne: _getMovementsCollectionWithoutOne,
      save: _save
    };


    /**
     * @name _update
     * Call the WS to update movement
     * @param {{provisionalPlanId: number, movement: Movement}} param Object with provisionalPlanId
     *                                                          and movement to update
     * @returns {d.promise|*|promise}
     */
    function _update(param) {
      $ionicLoading.show({
        template: 'Enregistrement ... <ion-spinner ></ion-spinner>'
      });
      var provisionalPlansCached = cache.get(budgetManager.config.cache.provisionalPlanKey);
      var provisionalPlanFocused = _.find(provisionalPlansCached, function (item) {
        return item.id === param.provisionalPlanId;
      });

      var requestOptions = neogenz.httpUtilities.buildPutRequestOptToCallThisUrl(
        '/me/provisionalPlans/' + param.provisionalPlanId + '/movements',
        param.movement
      );
      var promise = $http(requestOptions);
      return promise.then(function (response) {
        var updated = neogenz.beans.factory.getBean('Movement', response.data);
        if (!neogenz.utilities.isUndefinedOrNull(provisionalPlansCached)) {
          for (var i = 0; i < provisionalPlanFocused.movements.length; i++) {
            if (provisionalPlanFocused.movements[i].id === updated.id) {
              provisionalPlanFocused.movements[i] = updated;
              break;
            }
          }
        }
        return updated;
      }, function (reason) {
        return $q.reject(reason);
      }).finally(function () {
        $ionicLoading.hide();
      });
    }


    /**
     * @name _remove
     * Call the WS to remove movement
     * @param {object} param Object with provisionalPlanId and movement to remove
     * @returns {d.promise|*|promise}
     */
    function _remove(param) {
      $ionicLoading.show({
        template: 'Suppression ... <ion-spinner></ion-spinner>'
      });
      var provisionalPlansCached = cache.get(budgetManager.config.cache.provisionalPlanKey),
        provisionalPlanFocused = _.findWhere(provisionalPlansCached, {id: param.provisionalPlanId});
      var requestOptions = neogenz.httpUtilities.buildDeleteRequestOptToCallThisUrl(
        '/me/provisionalPlans/' + param.provisionalPlanId + '/movements/' + param.movement.id
      );
      return $http(requestOptions).then(function (response) {
        var deleted = neogenz.beans.factory.getBean('Movement', response.data);
        provisionalPlanFocused.movements = _.reject(provisionalPlanFocused.movements, function (movement) {
          return movement.id === deleted.id;
        });
        return deleted;
      }, function (response) {
        console.error(response.data);
        return response.data;
      }).finally(function () {
        $ionicLoading.hide();
      });
    }

    /**
     * @name _getMovementsCollectionWithoutOne
     * Get an movement's collection without one specified by ID.
     * @param {object} param Object with movements collection and
     *                 movement id to remove.
     * @returns {array<Movement>}
     */
    function _getMovementsCollectionWithoutOne(movements, movementId) {
      return _.reject(movements, function (movement) {
        return movement.id === movementId;
      });
    }


    /**
     * @function _save
     * Save an movement by adding to an provisional plan
     * or just update an movement
     * @param {ProvisionalPlan} provisionalPlanToSave
     * @returns {Promise}
     */
    function _save(movement, provisionalPlanId) {
      if (neogenz.utilities.isUndefinedOrNull(movement.id)) {
        return ProvisionalPlanService.addMovement(movement);
      } else {
        return _update({
          provisionalPlanId: provisionalPlanId,
          movement: movement
        });
      }
    }
  }
})();
