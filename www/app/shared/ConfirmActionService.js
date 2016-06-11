(function () {
  'use strict';
  angular
    .module('appBudgetManager')
    .factory('ConfirmActionService', ConfirmActionService);

  ConfirmActionService.$inject = [
    '$ionicPopup',
    '$q'
  ];

  function ConfirmActionService($ionicPopup, $q) {

    return {
      manageModalConfirmationToDeleteMovement: _manageModalConfirmationToDeleteMovement
    };


    /**
     * @name _manageModalConfirmationToDeleteMovement
     * Call the WS to update movement
     * @param {object} param Object with provisionalPlanId and movement to update
     * @returns {d.promise|*|promise}
     */
    function _manageModalConfirmationToDeleteMovement(modalOptions) {
      var def = $q.defer();
      var YES = 1,
        NO = 2;
      if (navigator.notification) {
        navigator.notification.confirm(modalOptions.template, function (action) {
          switch (action) {
            case YES:
              def.resolve();
              break;
            case NO:
              def.reject();
              break;
          }
        }, modalOptions.title, [modalOptions.okText, modalOptions.cancelText]);
      } else {
        var confirmPopup = $ionicPopup.confirm(modalOptions);

        confirmPopup.then(function (deleteConfirmed) {
          if (deleteConfirmed) {
            return def.resolve();
          } else {
            return def.reject();
          }
        });
      }

      return def.promise;
    }
  }
})();
