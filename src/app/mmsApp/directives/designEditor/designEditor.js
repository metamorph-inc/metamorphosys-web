/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.designVisualization.designEditor', [] )
    .controller( 'DesignEditorController', function($scope, $rootScope, diagramService, $log, designService, $stateParams) {

        var designCtx;

        $scope.diagram = {};

        designCtx = {
            db: $rootScope.mainDbConnectionId,
            regionId: 'Design_' + ( new Date() ).toISOString()
        };

        $scope.diagramContainerConfig = {

        };

        if ($stateParams.containerId === 'dummy') {

            $scope.diagram = diagramService.getDiagram();

            $log.debug('Loading dummy diagram:', $scope.diagram);


        } else {


            designService.watchDesignStructure(designCtx, $rootScope.activeDesign.id, function (/*designStructureUpdateObject*/) {

            }).then(function (designStructure) {

                console.log(designStructure);

            });

        }



    })
    .directive( 'designEditor', [
        function () {

            return {
                restrict: 'E',
                controller: 'DesignEditorController',
                $scope: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/designEditor.html'

            };
        }] );
