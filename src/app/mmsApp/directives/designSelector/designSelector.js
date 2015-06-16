/*globals angular*/

'use strict';

angular.module( 'mms.designSelector', [] )
    .run(function($rootScope, $mdDialog) {

        $rootScope.openDesignSelector = function(ev) {

            $rootScope.cover();

            function DialogController($scope) {

                $scope.designsToSelect = require('./designsToSelect.js');

            }

            $mdDialog.show({
                    controller: DialogController,
                    template: '<md-dialog class="design-selector-dialog"><design-selector designs="::designsToSelect"></design-selector></md-dialog>',
                    targetEvent: ev
                })
                .then(function() {});
        };


    })
    .directive( 'designSelector', [ '$rootScope',
        function ($rootScope, $mdDialog) {

            return {
                restrict: 'E',
                replace: true,
                scope: {
                    designs: '='
                },
                templateUrl: '/mmsApp/templates/designSelector.html',
                controller: function($mdDialog, projectHandling, $rootScope) {

                    this.openDesign = function(designId) {

                        var availableDesigns,
                            design;

                        availableDesigns = projectHandling.getAvailableDesigns();

                        design = availableDesigns[designId];

                        if (design) {
                            $rootScope.$emit('designMustBeOpened', design);
                        }

                        $rootScope.unCover();
                        $mdDialog.cancel();

                    };

                    this.close = function () {
                        $rootScope.unCover();
                        $mdDialog.cancel();
                    };


                },
                controllerAs: 'ctrl',
                bindToController: true
            };

        }] );
