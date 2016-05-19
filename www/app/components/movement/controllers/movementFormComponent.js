(function init() {
  'use strict';

  var movementFormComponent = {
    bindings: {
      provisionalPlan: '=',
      movement: '=',
      modalInstance: '<'
    },
    templateUrl: 'app/components/movement/views/movementFormComponentView.html',
    controller: MovementFormController,
    controllerAs: 'movementFormCtrl'
  };

  angular
    .module('appBudgetManager')
    .component('movementFormCmp', movementFormComponent);

  MovementFormController.$inject = [
    'provisionalPlanWebApi'
  ];

  /**
   * @desc Controllers of Movements
   * @namespace MovementController
   */
  function MovementFormController(provisionalPlanWebApi) {
    var self = this;

    (function init() {
      debugger;
      defineScope();
      defineListeners();
    })();


    /**
     * @desc Defines all $scope variables
     * @function defineScope
     */
    function defineScope() {
      self.modes = budgetManager.uiManager.formMode;
      self.mode = (_.isNull(self.movement.id) ? budgetManager.uiManager.formMode.create : budgetManager.uiManager.formMode.edit);
      self.provisionalPlanTitle = self.provisionalPlan.name;
      self.modeMessage = self.mode == self.modes.create ? 'Ajouter un mouvement à ' : 'Editer un mouvement de';
    }


    /**
     * @desc Attach view listeners to this controller
     * @function defineListeners
     */
    function defineListeners() {
      self.ok = _ok;
      self.cancel = _cancel;
    }


    /**
     * @desc Close the modal with a promise resolve to success
     * @function _ok
     */
    function _ok() {
      provisionalPlanWebApi.addMovement(movement).then(function (movementAdded) {
        self.provisionalPlan.movements.push(movementAdded);
        _refreshTotalOfMovements();
      }, function (reason) {
        throw new Error(reason);
      });
      self.modalInstance.hide(self.movement);
    }


    /**
     * @desc Close the modal with a promise resolve to error
     * @function _cancel
     */
    function _cancel() {
      self.modalInstance.hide('Ajout du plan prévisionel annulé');
    }


    function _refreshTotalOfMovements() {
      self.totalOfMovements =
        provisionalPlanCalculus.getTotalMovementsOf(self.provisionalPlan);
      self.style = self.totalOfMovements > 0 ? {'color': 'green'} : {'color': 'red'};
    }
  }

})();
