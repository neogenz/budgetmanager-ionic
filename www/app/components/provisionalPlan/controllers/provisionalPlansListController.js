(function () {
  angular
    .module('appBudgetManager')
    .controller('ProvisionalPlansListController', ProvisionalPlansListController);

  ProvisionalPlansListController.$inject = [
    '$scope',
    'ProvisionalPlanService',
    'provisionalPlans',
    '$ionicModal',
    '$ionicPopup',
    'ConfirmActionService'
  ];

  function ProvisionalPlansListController($scope, ProvisionalPlanService, provisionalPlans, $ionicModal, ConfirmActionService) {
    var self = this;

    (function init() {
      defineScope();
      defineListeners();
    })();


    /**
     * @desc Defines all self variables
     * @function defineScope
     */
    function defineScope() {
      self.provisionalPlans = provisionalPlans;
      $scope.provisionalPlanFormModel = null;
      self.provisionalPlanFormModal = null;
      self.shouldShowDelete = false;
      self.shouldShowReorder = false;
      self.listCanSwipe = true;
      $scope.modal = {
        current: {}
      };
      _initProvisionalPlanModal();
    }


    /**
     * @desc Attach view listeners to this controller
     * @function defineListeners
     */
    function defineListeners() {
      self.refreshAllByRefresher = _refreshAllByRefresher;
      $scope.saveThenCloseProvisionalPlanModalForm = _saveThenCloseProvisionalPlanModalForm; //Attach to $scope for bindings with modal view, self don't work
      self.openModalToAddProvisionalPlanClickListener = _openModalToAddProvisionalPlanClickListener;
      $scope.hideProvisionalPlanModalForm = _hideProvisionalPlanModalForm; //Attach to $scope for bindings with modal view, self don't work
      self.onItemUpdated = _onItemUpdated;
      self.getTotalOf = _getTotalOf;
      self.getStyleBy = _getStyleBy;
      self.openModalToEditProvisionalPlanClickListener = _openModalToEditProvisionalPlanClickListener;
      self.openModalToConfirmDeleteClickListener = _openModalToConfirmDeleteClickListener;
    }


    /**
     * @desc Refresh all provisional with webservice call and broadcast event to close spinning refresher
     * @function _refreshAllByRefresher
     */
    function _refreshAllByRefresher() {
      ProvisionalPlanService.findAll(true).then(function (provisionalPlans) {
        self.provisionalPlans = provisionalPlans;
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }


    /**
     * @desc Save the movementFormModel and update the model then hide modal
     * @function _saveThenCloseProvisionalPlanModalForm
     */
    function _saveThenCloseProvisionalPlanModalForm(provisionalPlanFormModel) {
      ProvisionalPlanService.save(provisionalPlanFormModel).catch(function () {
        throw new Error(reason);
      }).finally(function () {
        self.provisionalPlanFormModal.hide();
      });
    }


    /**
     * @desc Hide the modal
     * @function _hideProvisionalPlanModalForm
     */
    function _hideProvisionalPlanModalForm() {
      self.provisionalPlanFormModal.hide();
    }


    /**
     * @desc Open a modal to add provisionalPlan
     * @function _openModalToAddProvisionalPlanClickListener
     */
    function _openModalToAddProvisionalPlanClickListener() {
      $scope.provisionalPlanFormModel = neogenz.beans.factory.getBean('ProvisionalPlan', null);
      self.provisionalPlanFormModal.show();
    }


    /**
     * @desc Init data shared with $ionicModal of provisionalPlan modal
     * @function _initProvisionalPlanModal
     */
    function _initProvisionalPlanModal() {
      $scope.modal = {
        current: {
          modes: budgetManager.uiManager.formMode,
          mode: budgetManager.uiManager.formMode.create,
          modeMessage: 'Ajouter'
        }
      };

      $ionicModal.fromTemplateUrl('app/components/provisionalPlan/views/provisionalPlanModalForm.html', {
        scope: $scope
      }).then(function (modal) {
        self.provisionalPlanFormModal = modal;
      });
    }


    /**
     * @function _onItemUpdated
     * @param {ProvisionalPlan} updated Provisional plan sending from component which updated
     * Update this list of provisional plan by callback called from the component which have
     * the responsability of the updating.
     */
    function _onItemUpdated(updated) {
      for (var i = 0; i < self.provisionalPlans.length; i++) {
        if (self.provisionalPlans[i].id === updated.id) {
          self.provisionalPlans[i] = updated;
        }
      }
    }


    /**
     * @function _getTotalOf
     * @param {ProvisionalPlan} provisionalPlan
     * @returns {number}
     */
    function _getTotalOf(provisionalPlan) {
      return ProvisionalPlanService.getSumOfMovementsBy(provisionalPlan);
    }


    /**
     * @function _getStyleBy
     * @param {ProvisionalPlan} provisionalPlan
     * @returns {{color: string}}
     */
    function _getStyleBy(provisionalPlan) {
      return ProvisionalPlanService.getSumOfMovementsBy(provisionalPlan) > 0 ? {'color': 'green'} : {'color': 'red'}
    }


    /**
     * @desc Open a modal to edit provisionalPlan
     * @function _openModalToEditProvisionalPlanClickListener
     */
    function _openModalToEditProvisionalPlanClickListener(provisionalPlan) {
      if (neogenz.utilities.isUndefinedOrNull(provisionalPlan)) {
        throw new Error('The provisional plan can\'t be null or undefiend');
      }
      $scope.provisionalPlanFormModel = provisionalPlan;
      self.provisionalPlanFormModal.show();
    }


    /**
     * @desc Open a modal to confirm action of deleting then call de delete webservice if user confirm action
     * @function _openModalToConfirmDelete
     * @param {ProvisionalPlan} provisionalPlan Provisional plan to remove
     * @memberOf Controllers.MovementController
     */
    function _openModalToConfirmDeleteClickListener(provisionalPlan) {
      ConfirmActionService.manageModalConfirmationToDeleteMovement({
        title: 'Confirmation',
        template: 'Êtes-vous sur de vouloir supprimer ' + provisionalPlan.name + ' ?',
        cancelText: 'Non',
        okText: 'Oui'
      }).then(function (res) {
        if (res) {
          _deleteThenRefreshBy(provisionalPlan);
        } else {
          console.log('Suppression annulé');
        }
      });
    }
  }


  /**
   * @desc Call the delete webservice
   * @function _deleteThenRefreshBy
   * @param {ProvisionalPlan} provisionalPlanToDelete
   */
  function _deleteThenRefreshBy(provisionalPlanToDelete) {
    return ProvisionalPlanService.remove(provisionalPlanToDelete).then(function () {
    }, function (reason) {
      throw new Error(reason);
    });
  }

}());
