'use strict';

function LockedComponentWireToastController ($scope, $rootScope, $mdToast, message, components, wires) {

    $scope.message = message;
    $scope.components = components;
    $scope.wires = wires;

    $scope.closeToast = function () {
        $mdToast.hide();
    };

    $scope.overrideWireLocks = function() {
        
        if ( wires ) {
            angular.forEach(wires, function(wire) {
                wire.unlockWire();
                $rootScope.$emit('wireLockMustBeSaved', wires[0], false);
            });
        }
        else {
            if (components.length) {
                $rootScope.$emit('wireLockMustBeSetForMultipleComponentsWires', components, false);
            }
            else {
                $rootScope.$emit('wireLockMustBeSetForComponentWires', components, false);
            }
        }

        $mdToast.hide();
    };

}


module.exports = function($mdToast, $rootScope, components, wires) {

    var self = this;

    this.showToast = function (message) {
            
        $mdToast.show({
            controller: LockedComponentWireToastController,
            templateUrl: '/mmsApp/templates/lockedComponentWiresToast.html',
            locals: {
                message: message,
                components: components,
                wires: wires
            },
            hideDelay: 5000
        });

    };

    return this;

}