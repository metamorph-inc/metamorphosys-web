'use strict';


function SvgDiagramIssueToastController ($scope, $mdToast, message) {

    $scope.message = message;

    $scope.closeToast = function () {
        $mdToast.hide();
    };

};


module.exports = function($mdToast) {

    var self = this;

    this.showToast = function (message) {
            
        $mdToast.show({
            controller: SvgDiagramIssueToastController,
            templateUrl: '/mmsApp/templates/svgDiagramToast.html',
            locals: {
                message: message
            },
            hideDelay: 5000
        });

    };

    return this;

}