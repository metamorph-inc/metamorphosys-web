/*globals angular*/

'use strict';

angular.module( 'mms.designSelector', [] )
    .directive( 'designSelector', [ '$rootScope',
        function () {

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

                        $mdDialog.cancel();

                    };

                    this.close = function () {
                        $mdDialog.cancel();
                    };


                },
                controllerAs: 'ctrl',
                bindToController: true
            };

        }] );
