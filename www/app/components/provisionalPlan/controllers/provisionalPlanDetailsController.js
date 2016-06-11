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
    'ProvisionalPlanService',
    '$scope',
    '$ionicModal',
    '$ionicPopup',
    'MovementService',
    'ConfirmActionService'
  ];


  /**
   * @desc Controllers of ProvisionalPlans
   * @namespace ProvisionalPlanDetailsController
   */
  function ProvisionalPlanDetailsController(provisionalPlan,
                                            ProvisionalPlanService,
                                            $scope, $ionicModal,
                                            $ionicPopup,
                                            MovementService,
                                            ConfirmActionService) {
    var self = this;

    (function () {
      defineScope();
      defineListeners();
    })();


    /**
     * @desc Defines all $scope variables
     * @function defineScope
     */
    function defineScope() {
      self.provisionalPlan = provisionalPlan;
      _refreshTotalOfMovements();
      //Ionic list options
      self.movementListOptions = {
        shouldShowDelete: false,
        shouldShowReorder: false,
        listCanSwipe: true
      };

      self.movementFormModal = null;
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
      self.openModalToConfirmDeleteClickListener = _openModalToConfirmDeleteClickListener;
      self.openEditModalClickListener = _openEditModalClickListener;
      self.openAddModalClickListener = _openModalToAddMovementClickListener;
      self.refreshTotalOfMovements = _refreshTotalOfMovements;
      $scope.saveThenCloseMovementModalForm = _saveThenCloseMovementModalForm;
      $scope.hideMovementModalForm = _hideMovementModalForm;
      self.refreshAllByRefresher = _refreshAllByRefresher;
    }


    /**
     * @desc Refresh all provisional with webservice call and broadcast event to close spinning refresher
     * @function _refreshAllByRefresher
     */
    function _refreshAllByRefresher() {
      ProvisionalPlanService.findById(self.provisionalPlan.id)
        .then(function (provisionalPlan) {
            //self.provisionalPlan = provisionalPlan;
          }
        ).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }


    /**
     * @desc Init data shared with $ionicModal of add movement modal
     * @function _initAddMovementModal
     * @private
     */
    function _initAddMovementModal() {
      //Build new movement by default
      $scope.movementFormModel = ProvisionalPlanService.buildDefaultMovementToAddByProvisionalPlanId(self.provisionalPlan.id);

      $scope.modal = {
        current: {
          modes: budgetManager.uiManager.formMode,
          mode: budgetManager.uiManager.formMode.create,
          provisionalPlanTitle: self.provisionalPlan.name,
          modeMessage: 'Ajouter un mouvement à '
        }
      };

      return $ionicModal.fromTemplateUrl('app/components/movement/views/movementModalForm.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        self.movementFormModal = modal;
      });
    }


    /**
     * @desc Refresh the data bind to the provisionalPlan recap
     * @function _refreshTotalOfMovements
     */
    function _refreshTotalOfMovements() {
      self.totalOfMovements = ProvisionalPlanService.getSumOfMovementsBy(self.provisionalPlan);
      self.style = self.totalOfMovements > 0 ? {'color': 'green'} : {'color': 'red'};
    }


    /**
     * @desc Save the movementFormModel and update the model then hide modal
     * @param {Movement} movementFormModel Movement to save
     * @function _saveThenCloseMovementModalForm
     */
    function _saveThenCloseMovementModalForm(movementFormModel) {
      MovementService.save(movementFormModel, self.provisionalPlan.id).then(function () {
        _refreshTotalOfMovements();
      }, function (reason) {
        throw new Error(reason);
      }).finally(function () {
        self.movementFormModal.hide();
      });
    }


    /**
     * @desc Hide the modal
     * @function _cancelEditingOfMovement
     */
    function _hideMovementModalForm() {
      self.movementFormModal.hide();
    }


    /**
     * @desc Open a modal to add or edit movement depending this id value (null = add else edit)
     * @function _openModalToAddClickListener
     */
    function _openModalToAddMovementClickListener() {
      _initAddMovementModal().then(function () {
        self.movementFormModal.show();
      });

    }


    /**
     * @desc Open a modal to confirm action of deleting then call de delete webservice if user confirm action
     * @function _openModalToConfirmDeleteClickListener
     * @param {Movement} movement Movement to remove
     */
    function _openModalToConfirmDeleteClickListener(movement) {
      ConfirmActionService.manageModalConfirmationToDeleteMovement({
        title: 'Confirmation',
        template: 'Êtes-vous sur de vouloir supprimer ' + movement.name + ' ?',
        cancelText: 'Non',
        okText: 'Oui'
      }).then(function () {
        _deleteThenRefreshBy(self.provisionalPlan.id, movement);
      }, function () {
        console.log('Suppression annulé.');
      });
    }


    /**
     * @desc Call the delete webservice
     * @function _deleteThenRefreshBy
     * @param {number} provisionalPlanId
     * @param {Movement} movementToDelete
     * @memberOf Controllers.MovementController
     */
    function _deleteThenRefreshBy(provisionalPlanId, movementToDelete) {
      return MovementService.remove({
        provisionalPlanId: provisionalPlanId,
        movement: movementToDelete
      }).then(function () {
        //self.provisionalPlan.movements = MovementService.getMovementsCollectionWithoutOne(
        //  self.provisionalPlan.movements,
        //  self.movement.id
        //);
        _refreshTotalOfMovements();
      }, function (reason) {
        throw new Error(reason);
      });
    }


    /**
     * @desc Open a modal to edit movement
     * @param {Movement} movement Movement to edit
     * @function _openEditModalClickListener
     */
    function _openEditModalClickListener(movement) {
      _initEditMovementModal(movement).then(function () {
        self.movementFormModal.show();
      });

    }


    /**
     * @desc Init data shared with $ionicModal of add movement modal
     * @param {Movement} movement Movement to edit
     * @function _initEditMovementModal
     */
    function _initEditMovementModal(movement) {
      //Build new movement by default
      $scope.movementFormModel = jQuery.extend(true, {}, movement);

      $scope.modal = {
        current: {
          modes: budgetManager.uiManager.formMode,
          mode: budgetManager.uiManager.formMode.edit,
          provisionalPlanTitle: self.provisionalPlan.name,
          modeMessage: 'Éditer le mouvement ' + movement.name
        }
      };

      return $ionicModal.fromTemplateUrl('app/components/movement/views/movementModalForm.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        self.movementFormModal = modal;
      });
    }

  }
})();
