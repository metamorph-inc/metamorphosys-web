/*globals angular*/

'use strict';

// Move this to GME eventually

angular.module('mms.designVisualization.designEditor', [])
    .controller('DesignEditorController', function (
        $scope, $rootScope, diagramService, $log, connectionHandling,
        designService, $stateParams, designLayoutService, symbolManager, $timeout) {

        var RandomSymbolGenerator,
            randomSymbolGenerator,

            designCtx,

            setupDiagramEventHandlers;

        $scope.diagram = null;

        $scope.mainGMEConnectionId = connectionHandling.getMainGMEConnectionId();

        designCtx = {
            db: $scope.mainGMEConnectionId,
            regionId: 'Design_' + ( new Date() ).toISOString()
        };

        $scope.diagramContainerConfig = {};

        setupDiagramEventHandlers = function () {

            $scope.$on('componentsPositionChange', function (e, data) {

                var i;

                i = 1;

                angular.forEach(data.components, function (component) {

                    $timeout(function () {

                        designLayoutService.setPosition(
                            designCtx,
                            component.id,
                            component.getPosition(),
                            data.message
                        );
                    }, 10 * i);

                    i++;

                });

            });

            $scope.$on('componentsRotationChange', function (e, data) {

                var i;

                i = 1;

                angular.forEach(data.components, function (component) {

                    $timeout(function () {

                        designLayoutService.setRotation(
                            designCtx,
                            component.id,
                            component.rotation,
                            data.message
                        );
                    }, 10 * i);

                    i++;

                });

            });

        };

        if ($stateParams.containerId === 'dummy') {

            RandomSymbolGenerator = require('./classes/RandomSymbolGenerator');
            randomSymbolGenerator = new RandomSymbolGenerator(symbolManager);

            randomSymbolGenerator.generateSymbols(7);


            $scope.diagram = diagramService.addDummyDiagram('dummy', 100, 50, 3000, 3000);

            $log.debug('Drawing dummy diagram:', $scope.diagram);
            $rootScope.loading = false;

        } else {

            designLayoutService.watchDiagramElements(designCtx, $rootScope.activeDesign.id, function (designStructureUpdateObject) {

                $log.debug('DiagramElementsUpdate', designStructureUpdateObject);

                if (designStructureUpdateObject.updateType === 'positionChange') {

                    diagramService.updateComponentsAndItsWiresPosition(
                        $rootScope.activeContainerId,
                        designStructureUpdateObject.id,
                        designStructureUpdateObject.data.position
                    );
                }

                if (designStructureUpdateObject.updateType === 'rotationChange') {

                    diagramService.updateComponentsAndItsWiresRotation(
                        $rootScope.activeContainerId,
                        designStructureUpdateObject.id,
                        designStructureUpdateObject.data.rotation
                    );
                }

            }).then(function (cyPhyLayout) {

                $log.debug('Diagram elements', cyPhyLayout);

                $rootScope.activeContainerId = $stateParams.containerId || $rootScope.activeDesign.id;

                $log.debug($rootScope.activeContainerId);

                $scope.diagram =
                    diagramService.createDiagramFromCyPhyElements($rootScope.activeContainerId, cyPhyLayout.elements);

                $log.debug('Drawing diagram:', $scope.diagram);

                setupDiagramEventHandlers();

                $rootScope.loading = false;

            });
        }

    })
    .directive('designEditor', [
        function () {

            return {
                restrict: 'E',
                controller: 'DesignEditorController',
                $scope: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/designEditor.html'

            };
        }]);
