/*globals angular*/

'use strict';

angular.module( 'mms.designSelector', [] )
    .run(function($rootScope, $mdDialog) {

        $rootScope.openDesignSelector = function(ev, isWelcomeScreen) {

            function DialogController($scope) {

                $scope.designsToSelect = require('./designsToSelect.js');
                $scope.isWelcomeScreen = isWelcomeScreen;

            }

            $mdDialog.show({
                    controller: DialogController,
                    template: '<md-dialog class="design-selector-dialog">' +
                    '<design-selector designs="::designsToSelect" is-welcome-screen="::isWelcomeScreen"></design-selector>' +
                    '</md-dialog>',
                    targetEvent: ev,
                    clickOutsideToClose: !isWelcomeScreen,
                    escapeToClose: !isWelcomeScreen
                })
                .then(function() {});
        };


    })
    .directive( 'designSelector',
        function ($rootScope, $log) {

            return {
                restrict: 'E',
                replace: true,
                scope: {
                    designs: '=',
                    isWelcomeScreen: '='
                },
                templateUrl: '/mmsApp/templates/designSelector.html',
                controller: function($mdDialog, projectHandling) {

                    this.openDesign = function(designName) {

                        var availableDesigns,
                            design;

                        availableDesigns = projectHandling.getAvailableDesigns();

                        for (var i in availableDesigns) {

                            var d = availableDesigns[i];

                            //console.log(d.name.replace(/_/g, ' ') === designName);

                            if (!design && d.name.replace(/_/g, ' ') === designName) {
                                design = d;
                            }
                        }

                        if (design && projectHandling.getSelectedDesignId() !== design.id) {
                            $rootScope.$emit('designMustBeOpened', design);
                        } else {
                            $log.error('No design found by name', designName, availableDesigns);
                        }

                        $mdDialog.cancel();
                    };

                    this.close = function () {
                        $mdDialog.cancel();
                    };


                },
                controllerAs: 'ctrl',
                bindToController: true
            };

        } );
