'use strict';

angular.module('mms.primitiveDrawerPanel.primitiveConfig', [
])
.directive('primitiveConfig', function() {

        function primitiveConfigController() {

        }

        return {
            restrict: 'E',
            controller: primitiveConfigController,
            controllerAs: 'ctrl',
            bindToController: true,
            replace: true,
            transclude: false,
            scope: {
                config: '=',
                readOnly: '='
            },
            templateUrl: '/mmsApp/templates/primitiveConfig.html'
        };

});