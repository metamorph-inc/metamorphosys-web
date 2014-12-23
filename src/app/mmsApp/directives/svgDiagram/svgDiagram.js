/*globals angular, $*/

'use strict';

// Move this to GME eventually

require('../componentWire/componentWire.js');

angular.module('mms.designVisualization.svgDiagram', [
    'mms.designVisualization.gridService',
    'mms.designVisualization.componentWire',
    'isis.ui.contextmenu'
])
    .controller('SVGDiagramController', function (
        $scope, $log, diagramService, wiringService, gridService, $window, $timeout) {

        var

            ComponentSelectionHandler = require('./classes/ComponentSelectionHandler'),
            componentSelectionHandler,

            ComponentDragHandler = require('./classes/ComponentDragHandler'),
            componentDragHandler,

            WireDrawHandler = require('./classes/WireDrawHandler'),
            wireDrawHandler,

            ComponentContextMenuHandler = require('./classes/ComponentContextMenuHandler'),
            componentContextMenuHandler,

            componentElements,

            $$window;

        $$window = $($window);

        componentDragHandler = new ComponentDragHandler(
            $scope,
            diagramService,
            wiringService,
            $log
        );

        componentSelectionHandler = new ComponentSelectionHandler(
            $scope,
            diagramService,
            gridService,
            $log
        );

        wireDrawHandler = new WireDrawHandler(
            $scope,
            diagramService,
            wiringService,
            gridService,
            $log
        );

        componentContextMenuHandler = new ComponentContextMenuHandler(
            $scope,
            diagramService,
            $log
        );

        $scope.contextMenuData = [{
            id: 'top',
            items: [{
                id: 'newProject',
                label: 'New project ...',
                iconClass: 'glyphicon glyphicon-plus',
                action: function () {
                    console.log('New project clicked');
                },
                actionData: {}
            }]
        }];



        $scope.onMouseUp = function ($event) {

            componentDragHandler.onMouseUp($event);
            wireDrawHandler.onMouseUp($event);

            console.log('mouseUp', $event);

        };


        $scope.onClick = function (/*$event*/) {


        };

        $scope.onMouseMove = function ($event) {

            componentDragHandler.onMouseMove($event);
            wireDrawHandler.onMouseMove($event);

        };

        $scope.getCssClass = function () {

            var result = '';

            if ($scope.dragTargetsDescriptor) {
                result += 'dragging';
            }

            return result;

        };

        $scope.contextMenuData = [{
            id: 'context-menu-common',
            items: [{
                id: 'newComponent',
                label: 'New component ...',
                iconClass: 'glyphicon glyphicon-plus',
                action: function () {
                    console.log('New component clicked');
                },
                actionData: {}
            }]
        }];


        $scope.onMouseLeave = function ($event) {

            componentDragHandler.onMouseLeave($event);
            wireDrawHandler.onMouseLeave($event);

        };

        $$window.blur(function ($event) {

            componentDragHandler.onWindowBlur($event);
            wireDrawHandler.onWindowBlur($event);

        });


        // Interactions with components

        this.onComponentMouseUp = function (component, $event) {

            if (!componentDragHandler.dragging) {

                componentSelectionHandler.onComponentMouseUp(component, $event);
                $event.stopPropagation();

                componentDragHandler.onComponentMouseUp(component, $event);

            } else {
                componentDragHandler.onComponentMouseUp(component, $event);
            }
        };

        this.onPortMouseDown = function (component, port, $event) {
            wireDrawHandler.onPortMouseDown(component, port, $event);
        };

        this.onPortMouseUp = function (component, port, $event) {

            $event.stopPropagation();

        };

        this.onPortClick = function (component, port, $event) {

            $event.stopPropagation();

        };

        this.onComponentMouseDown = function (component, $event) {

            if ($event.which === 3) {

                console.log($scope.$element);

                $timeout(function() {

                    $scope.$element.trigger('openContextMenu');

                }, 100);

                //componentContextMenuHandler.onComponentMouseDown();

            } else {

                componentDragHandler.onComponentMouseDown(component, $event);

            }
        };

        this.isEditable = function () {

            $scope.diagram.config = $scope.diagram.config || {};

            return $scope.diagram.config.editable === true;
        };

        this.disallowSelection = function () {

            $scope.diagram.config = $scope.diagram.config || {};

            return $scope.diagram.config.disallowSelection === true;
        };

        this.registerComponentElement = function (id, el) {

            componentElements = componentElements || {};

            componentElements[id] = el;

        };

        this.unregisterComponentElement = function (id) {

            componentElements = componentElements || {};

            delete componentElements[id];

        };

    })
    .directive('svgDiagram', [
        '$log',
        'diagramService',
        'gridService',
        function ($log, diagramService, gridService) {

            return {
                controller: 'SVGDiagramController',
                require: '^diagramContainer',
                restrict: 'E',
                scope: false,
                replace: true,
                templateUrl: '/mmsApp/templates/svgDiagram.html',
                link: function (scope, element, attributes, diagramContainerController) {

                    var id;

                    id = diagramContainerController.getId();

                    scope.diagram = scope.diagram || {};
                    scope.$element = element;

                    scope.id = id;

                    scope.visibleObjects = gridService.createGrid(id, {
                            width: 10000,
                            height: 1000
                        },
                        scope.diagram
                    );

                    element.bind('openContextMenu', function(e) {
                       console.log('e');
                    });

                    scope.$watch(
                        function () {
                            return diagramContainerController.getVisibleArea();
                        }, function (visibleArea) {
                            scope.elementOffset = scope.$element.offset();
                            gridService.setVisibleArea(id, visibleArea);
                        });


                }

            };
        }
    ]);
