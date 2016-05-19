(function init() {
  'use strict';

  var movementComponent = {
    bindings: {
      provisionalPlan: '<',
      movement: '=',
      onUpdate: '&',
      onRemove: '&'
    },
    templateUrl: 'app/components/movement/views/movementComponentView.html',
    controller: MovementController,
    controllerAs: 'movementCtrl'
  };

  angular
    .module('appBudgetManager')
    .component('movement', movementComponent);

  MovementController.$inject = [
    'movementWebApi',
    '$ionicPopup',
    '$ionicModal',
    '$scope'
  ];

  /**
   * @desc Controllers of Movements
   * @namespace MovementController
   * @memberOf Controllers
   */
  function MovementController(movementWebApi, $ionicPopup, $ionicModal, $scope) {

    var self = this;

    (function init() {
      defineScope();
      defineListeners();
    })();


    /**
     * @desc Defines all $scope variables
     * @function defineScope
     * @memberOf Controllers.MovementController
     */
    function defineScope() {
      self.confirmationMessage = 'Êtes vous sur de vouloir supprimer ce mouvement ?';

      $scope.modalToEditMovement = null;
      $scope.movementFormModel = null;
      $scope.modal = {
        current: {}
      };

      _initAddMovementModal();
    }


    /**
     * @desc Attach view listeners to this controller
     * @function defineListeners
     * @memberOf Controllers.MovementController
     */
    function defineListeners() {
      self.inverseActiveStateClickListener = _inverseActiveState;
      self.deleteClickListener = _openModalToConfirmDelete;
      self.openEditModalClickListener = _openEditModalClickListener;
      $scope.closeMovementModalForm = _closeMovementModalForm;
      $scope.hideMovementModalForm = _hideMovementModalForm;
    }


    /**
     * @desc Init data shared with $ionicModal of add movement modal
     * @function _initAddMovementModal
     */
    function _initAddMovementModal() {
      $scope.movementFormModel = null;
      //Build new movement by default
      $scope.movementFormModel = jQuery.extend(true, {}, self.movement);

      $scope.modal = {
        current: {
          modes: budgetManager.uiManager.formMode,
          mode: budgetManager.uiManager.formMode.edit,
          provisionalPlanTitle: self.provisionalPlan.name,
          modeMessage: 'Éditer le mouvement ' + self.movement.name
        }
      };

      $ionicModal.fromTemplateUrl('app/components/movement/views/movementModalForm.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modalToEditMovement = modal;
      });
    }


    /**
     * @desc Inverse active state of movement and call WS to save the change
     * @function _inverseActiveState
     * @memberOf Controllers.MovementController
     */
    function _inverseActiveState() {
      self.movement.active = !self.movement.active;
      movementWebApi.update({
        provisionalPlanId: self.provisionalPlan.id,
        movement: self.movement
      }).then(
        function () {
          self.onUpdate();
        }, function (reason) {
          throw new Error(reason);
        }
      );
    }


    /**
     * @desc Open a modal to confirm action of deleting then call de delete webservice if user confirm action
     * @function _openModalToConfirmDelete
     * @param {function} successCallback Success callback to refresh an parent list for example, optionally
     * @memberOf Controllers.MovementController
     */
    function _openModalToConfirmDelete() {
      if (navigator.notification) {
        navigator.notification.confirm("Êtes vous sur de vouloir supprimer ce mouvement ?", function (buttonIndex) {
          switch (buttonIndex) {
            case 1:
              _delete({
                provisionalPlanId: self.provisionalPlan.id,
                movement: self.movement
              }).then(function () {
                self.onRemove();
              });
              break;
            case 2:
              console.log('Suppression annulé.');
              break;
          }
        }, "Confirmation", ["Oui", "Non"]);
      } else {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Confirmation',
          template: 'Êtes-vous sur de vouloir supprimer ' + self.movement.name + '?',
          cancelText: 'Non',
          okText: 'Oui'
        });

        confirmPopup.then(function (res) {
          if (res) {
            _delete({
              provisionalPlanId: self.provisionalPlan.id,
              movement: self.movement
            }).then(function () {
              self.onRemove();
            });
          } else {
            console.log('Suppression annulé');
          }
        });
      }
    }


    /**
     * @desc Call the delete webservice
     * @function _delete
     * @param {object} param Object with provisionalPlanId and movement to remove
     * @memberOf Controllers.MovementController
     */
    function _delete(param) {
      return movementWebApi.remove(param).then(function () {
        self.provisionalPlan.movements = movementWebApi.getMovementsCollectionWithoutOne(
          self.provisionalPlan.movements,
          self.movement.id
        );
      }, function (reason) {
        throw new Error(reason);
      });
    }


    /**
     * @desc Open a modal to edit movement
     * @function _openEditModalClickListener
     * @memberOf Controllers.MovementController
     */
    function _openEditModalClickListener() {
        $scope.modalToEditMovement.show();
    }


    /**
     * @desc Save the movementFormModel and update the model then hide modal
     * @function _closeAddModalMovement
     */
    function _closeMovementModalForm() {
      movementWebApi.update({
        provisionalPlanId: self.provisionalPlan.id,
        movement: $scope.movementFormModel
      }).then(
        function () {
          self.onUpdate();
          jQuery.extend(self.movement, $scope.movementFormModel);
          $scope.modalToEditMovement.hide();
        }, function (reason) {
          throw new Error(reason);
        }
      );
    }


    /**
     * @desc Hide the modal
     * @function _cancelEditingOfMovement
     */
    function _hideMovementModalForm() {
          $scope.modalToEditMovement.hide();
    }


    /**
     * @desc Call the update webservice
     * @function _update
     * @param {object} param Object with provisionalPlanId and movement to
     *                       update.
     * @memberOf Controllers.MovementController
     */
    function _update(param) {
      return movementWebApi.update(param).then(
        function () {
          var movementToUpdate = _.find(self.provisionalPlan.movements, function (currentMovement) {
            return currentMovement.id === param.movement.id;
          });
          _.extend(movementToUpdate, param.movement);
        }, function (reason) {
          throw new Error(reason);
        });
    }
  }

})();
