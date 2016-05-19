(function init() {
  'use strict';

  var provisionalPlanListComponent = {
    bindings: {
      provisionalPlans: '='
    },
    templateUrl: 'app/components/provisionalPlan/views/provisionalPlanListComponentView.html',
    controller: ProvisionalPlanListController,
    controllerAs: 'provisionalPlanListCtrl'
  };

  angular
    .module('appBudgetManager')
    .component('provisionalPlanListCmp', provisionalPlanListComponent);

  ProvisionalPlanListController.$inject = [
    'provisionalPlanWebApi',
    '$scope'
  ];

  /**
   * @desc Controllers of ProvisionalPlanDetails component
   */
  function ProvisionalPlanListController(provisionalPlanWebApi, $scope) {
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
      self.multiplicityTitle = '';
      self.pluralTitle = '';
      self.shouldShowDelete = false;
      self.shouldShowReorder = false;
      self.listCanSwipe = true;
      _refreshTitles();
    }


    /**
     * @desc Attach view listeners to this controller
     * @function defineListeners
     */
    function defineListeners() {
      self.refreshTitles = _refreshTitles;
      self.refreshAllByRefresher = _refreshAllByRefresher;
    }


    function _refreshTitles() {
      var _provisionalPlansLength = self.provisionalPlans.length;
      if (_provisionalPlansLength === 0) {
        self.multiplicityTitle = 'Aucun';
        self.pluralTitle = 'plan prévisionnel';
      } else if (_provisionalPlansLength === 1) {
        self.multiplicityTitle = 'Dernier';
        self.pluralTitle = 'plan prévisionnel';
      } else {
        self.multiplicityTitle = _provisionalPlansLength + ' dernier';
        self.pluralTitle = 'plans prévisionnels';
      }
    }


    /**
     * @desc Refresh all provisional with webservice call and broadcast event to close spinning refresher
     * @function _refreshAllByRefresher
     */
    function _refreshAllByRefresher() {
      provisionalPlanWebApi.findAll()
        .then(function (provisionalPlans) {
          debugger;
            self.provisionalPlans = provisionalPlans;
          }
        ).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }
  }
}());
