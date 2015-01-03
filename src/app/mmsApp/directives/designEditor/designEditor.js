/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module( 'mms.designVisualization.designEditor', [] )
    .controller( 'DesignEditorController', function(
        $scope, $rootScope, diagramService, $log, designService, $stateParams, designLayoutService) {

        var designCtx;

        $scope.diagram = null;

        designCtx = {
            db: $rootScope.mainDbConnectionId,
            regionId: 'Design_' + ( new Date() ).toISOString()
        };

        $scope.diagramContainerConfig = {

        };

        $scope.diagram = diagramService.getDiagram($stateParams.containerId);

        designLayoutService.watchChildrenPositions(designCtx, $rootScope.activeDesign.id, function (/*designStructureUpdateObject*/) {

        }).then(function (designStructure) {

            console.log(designStructure);

            $rootScope.activeContainerId = $stateParams.containerId || $rootScope.activeDesign.id;

            $log.debug($rootScope.activeContainerId);

            if ($stateParams.containerId === 'dummy') {

                $scope.diagram = diagramService.addDummyDiagram('dummy', 100, 50, 3000, 3000);

                $log.debug('Drawing dummy diagram:', $scope.diagram);

            } else {

                $scope.diagram = diagramService.getDiagram($stateParams.containerId);

            }


        });

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
