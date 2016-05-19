/**
 * @desc Controllers of BudgetManager
 * @namespace Controllers
 */
(function () {
  'use strict';

  angular
    .module('appBudgetManager')
    .controller('ProvisionalPlanDetailsController', ProvisionalPlanDetailsController);

  ProvisionalPlanDetailsController.$inject = [
    'provisionalPlan',
    'provisionalPlanCalculus',
    'provisionalPlanWebApi',
    '$state',
    '$scope',
    '$ionicModal'
  ];


  /**
   * @desc Controllers of ProvisionalPlans
   * @namespace HomeController
   */
  function ProvisionalPlanDetailsController(provisionalPlan, provisionalPlanCalculus, provisionalPlanWebApi, $state, $scope, $ionicModal) {
    (function () {
      defineScope();
      defineListeners();
    })();


    /**
     * @desc Defines all $scope variables
     * @function defineScope
     */
    function defineScope() {
      $scope.provisionalPlan = provisionalPlan;
      _refreshTotalOfMovements();
      $scope.confirmationMessage = 'Êtes vous sur de vouloir supprimer ce plan prévisionnel ?';
      //Ionic list options
      $scope.movementListOptions = {
        shouldShowDelete: false,
        shouldShowReorder: false,
        listCanSwipe: true
      };

      $scope.modalToAddMovement = null;
      $scope.movementFormModel = null;
      $scope.modal = {
        current: {}
      };

      _initAddMovementModal();
    }


    /**
     * @desc Attach view listeners to this controller
     * @function defineListeners
     */
    function defineListeners() {
      $scope.openModalToAddMovementClickListener = _openModalToAddMovementClickListener;
      $scope.refreshTotalOfMovements = _refreshTotalOfMovements;
      $scope.closeMovementModalForm = _closeMovementModalForm;
      $scope.hideMovementModalForm = _hideMovementModalForm;
      $scope.refreshAllByRefresher = _refreshAllByRefresher;
    }


    /**
     * @desc Refresh all provisional with webservice call and broadcast event to close spinning refresher
     * @function _refreshAllByRefresher
     */
    function _refreshAllByRefresher() {
      provisionalPlanWebApi.findById($scope.provisionalPlan.id)
        .then(function (provisionalPlan) {
            $scope.provisionalPlan = provisionalPlan;
          }
        ).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }


    /**
     * @desc Init data shared with $ionicModal of add movement modal
     * @function _initAddMovementModal
     */
    function _initAddMovementModal() {
      $scope.movementFormModel = null;
      //Build new movement by default
      $scope.movementFormModel = neogenz.beans.factory.getBean('Movement', null); //app.data.autocomplete.Movement();
      $scope.movementFormModel.active = true;
      $scope.movementFormModel.name = 'Mouvement d\'argent';
      //Assign to this movement the provisionalPlanId to add
      $scope.movementFormModel.provisionalPlanId = $scope.provisionalPlan.id;

      $scope.modal = {
        current: {
          modes: budgetManager.uiManager.formMode,
          mode: budgetManager.uiManager.formMode.create,
          provisionalPlanTitle: $scope.provisionalPlan.name,
          modeMessage: 'Ajouter un mouvement à '
        }
      };

      $ionicModal.fromTemplateUrl('app/components/movement/views/movementModalForm.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modalToAddMovement = modal;
      });
    }


    /**
     * @desc Refresh the data bind to the provisionalPlan recap
     * @function _refreshTotalOfMovements
     */
    function _refreshTotalOfMovements() {
      $scope.totalOfMovements =
        provisionalPlanCalculus.getTotalMovementsOf($scope.provisionalPlan);
      $scope.style = $scope.totalOfMovements > 0 ? {'color': 'green'} : {'color': 'red'};
    }


    /**
     * @desc Save the movementFormModel and update the model then hide modal
     * @function _closeAddModalMovement
     */
    function _closeMovementModalForm() {
      provisionalPlanWebApi.addMovement($scope.movementFormModel).then(function (movementAdded) {
        $scope.provisionalPlan.movements.push(movementAdded);
        _refreshTotalOfMovements();
      }, function (reason) {
        throw new Error(reason);
      });
      $scope.modalToAddMovement.hide();
    }


    /**
     * @desc Hide the modal
     * @function _cancelEditingOfMovement
     */
    function _hideMovementModalForm() {
      $scope.modalToAddMovement.hide();
    }


    /**
     * @desc Open a modal to add or edit movement depending this id value (null = add else edit)
     * @function _openModalToAddClickListener
     */
    function _openModalToAddMovementClickListener() {
      $scope.modalToAddMovement.show();
    }

  }
})();
