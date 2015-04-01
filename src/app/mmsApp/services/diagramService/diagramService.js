/*globals angular */

'use strict';

angular.module('mms.designVisualization.diagramService', [
        'mms.designVisualization.symbolServices',
        'mms.designVisualization.operationsManager',
        'mms.utils'
    ])
    .service('diagramService', [
        '$q',
        '$timeout',
        'symbolManager',
        '$stateParams',
        'wiringService',
        'operationsManager',
        function($q, $timeout, symbolManager, $stateParams, wiringService, mmsUtils ) {

            var
                self = this,

                diagrams,

                DummyDiagramGenerator,
                dummyDiagramGenerator,

                CyPhyDiagramParser,
                cyPhyDiagramParser,

                DiagramComponent,
                ComponentPort,
                Wire;

            diagrams = {};

            DummyDiagramGenerator = require('./classes/DummyDiagramGenerator.js');
            CyPhyDiagramParser = require('./classes/CyPhyDiagramParser.js');

            DiagramComponent = require('./classes/DiagramComponent.js');
            ComponentPort = require('./classes/ComponentPort');
            Wire = require('./classes/Wire.js');

            dummyDiagramGenerator = new DummyDiagramGenerator(symbolManager, self, wiringService, mmsUtils);
            cyPhyDiagramParser = new CyPhyDiagramParser(symbolManager, self, wiringService);

            this.updateComponentsAndItsWiresPosition = function(diagramId, componentId, newPosition) {

                var diagram,
                    setOfWires;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    diagram.updateComponentPosition(componentId, newPosition);

                    setOfWires = diagram.getWiresByComponentId(componentId);

                    angular.forEach(setOfWires, function(wire) {

                        wiringService.adjustWireEndSegments(wire);

                    });


                }

            };

            this.updateComponentsAndItsWiresRotation = function(diagramId, componentId, newRotation) {

                var diagram,
                    setOfWires;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram)) {

                    diagram.updateComponentRotation(componentId, newRotation);

                    setOfWires = diagram.getWiresByComponentId(componentId);

                    angular.forEach(setOfWires, function(wire) {

                        wiringService.adjustWireEndSegments(wire);

                    });


                }

            };

            this.createDiagramFromCyPhyElements = function(diagramId, diagramElements) {

                var diagram;

                if (diagramId && angular.isObject(diagramElements)) {

                    diagram = cyPhyDiagramParser.getDiagram(diagramElements);
                    diagram.id = diagramId;

                    diagrams[diagramId] = diagram;

                }

                return diagram;

            };

            this.createNewComponentFromFromCyPhyElement = function(diagramId, diagramElementDescriptor) {

                var diagram,
                    newDiagramStuff;

                diagram = diagrams[diagramId];

                if (angular.isObject(diagram) && angular.isObject(diagramElementDescriptor)) {

                    newDiagramStuff = cyPhyDiagramParser.getDiagramElement(
                        diagramElementDescriptor,
                        diagram.getHighestZ() + 1,
                        diagram
                    );

                    if (diagramElementDescriptor.baseName === 'ConnectorComposition') {
                        diagram.addWire(newDiagramStuff);
                    } else {
                        diagram.addComponent(newDiagramStuff);
                    }


                }

                return newDiagramStuff;

            };

            this.getDiagram = function(diagramId) {

                var diagram;

                if (diagramId) {

                    diagram = diagrams[diagramId];

                }

                return diagram;

            };

            this.generateDummyDiagram = function(diagramId, countOfBoxes, countOfWires, canvasWidth, canvasHeight) {

                var dummyDiagram,
                    symbolTypes;

                symbolTypes = symbolManager.getAvailableSymbols();

                if (diagramId) {

                    dummyDiagram =
                        dummyDiagramGenerator.getDiagram(
                            countOfBoxes, countOfWires, canvasWidth, canvasHeight, symbolTypes
                        );

                    dummyDiagram.id = diagramId;

                    diagrams[diagramId] = dummyDiagram;

                }

                return dummyDiagram;

            };

        }
    ]);
