function LockedComponentWireToastController ($scope, $rootScope, $mdToast, message, components) {

    $scope.message = message;
    $scope.components = components;

    $scope.closeToast = function () {
        $mdToast.hide();
    };

    $scope.overrideWireLocks = function() {
        
        $rootScope.$emit('wireLockMustBeSetForMultipleComponentsWires', components, false);        

        $mdToast.hide();
    }

};


module.exports = function($mdToast, $rootScope, components) {

    var self = this;

    this.showToast = function (message) {
            
        $mdToast.show({
            controller: LockedComponentWireToastController,
            templateUrl: '/mmsApp/templates/lockedComponentWiresToast.html',
            locals: {
                message: message,
                components: components,
            },
            hideDelay: 0
        });

    };

    return this;

}