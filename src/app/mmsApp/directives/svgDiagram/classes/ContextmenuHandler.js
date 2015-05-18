/*globals angular, ga, $*/

'use strict';

module.exports = function($scope, $rootScope, diagramService, $timeout,
    contextmenuService, operationsManager, wiringService, $log, gridService,
    testBenchService, projectHandling) {

    var WireSegment = require('../../../services/diagramService/classes/WireSegment.js');

    var
        onComponentContextmenu,
        onWireContextmenu,
        onPortContextmenu,
        onDiagramContextmenu,
        onDiagramMouseDown,
        getOffsetToMouse,

        openMenu;

    $log.debug('Initializing context menus.');

    getOffsetToMouse = function($event) {

        var offset;

        offset = {
            x: $event.pageX - $scope.elementOffset.left,
            y: $event.pageY - $scope.elementOffset.top
        };

        return offset;

    };

    openMenu = function($event) {

        var openContextMenuEvent;

        contextmenuService.close();

        openContextMenuEvent = angular.extend($.Event('openContextMenu'), {
            clientX: $event.clientX + 2,
            clientY: $event.clientY + 2,
            pageX: $event.pageX + 2,
            pageY: $event.pageY + 2,
            screenX: $event.screenX + 2,
            screenY: $event.screenY + 2,
            target: $event.target
        });


        $timeout(function() {

            $scope.$element.find('>svg').triggerHandler(openContextMenuEvent);

        }, 1, false);

    };

    onDiagramMouseDown = function() {
        contextmenuService.close();
    };

    onWireContextmenu = function(wire, segment, $event, wasCorner) {

        var wiringMenu,
            offsetToMouse = getOffsetToMouse($event);


        if (wasCorner) {
            ga('send', 'event', 'corner', 'contextmenu');
        } else {
            ga('send', 'event', 'wire', 'contextmenu');
        }

        wiringMenu = [];

        angular.forEach($scope.routerTypes, function(routerType) {

            wiringMenu.push({
                id: routerType.id,
                label: routerType.label,
                action: function() {
                    wiringService.routeWire(wire, routerType.type, routerType.params);
                    $rootScope.$emit('wireSegmentsMustBeSaved', wire);
                }
            });

        });

        $scope.contextMenuData = [{
                id: 'adjust',
                items: [{
                    id: 'redraw',
                    label: 'Redraw wire',
                    menu: [{
                        items: wiringMenu
                    }]
                }]
            }, {
                id: 'delete',
                items: [{
                    id: 'destroy',
                    label: 'Destroy wire',
                    iconClass: 'fa fa-trash-o',
                    action: function() {

                        ga('send', 'event', 'wire', 'destroy', wire.getId());

                        $rootScope.$emit('wireDeletionMustBeDone', wire);
                    }
                }]
            }

        ];

        if (wasCorner) {

            $scope.contextMenuData.unshift({

                id: 'cornerManipulation',
                items: [{
                    id: 'destroyCorner',
                    label: 'Destroy corner',
                    iconClass: 'fa fa-minus',
                    action: function() {

                        var sIndex,
                            nextSegment,
                            affectedSegmentParameters,
                            segments = wire.getSegments();

                        sIndex = segments.indexOf(segment);

                        nextSegment = segments[sIndex + 1];

                        var parameters = segment.getParameters();
                        var nextParameters = nextSegment.getParameters();

                        wire.deleteSegment(sIndex);

                        var newSegments = wiringService.getSegmentsBetweenPositions({
                            end1: {
                                x: parameters.x1,
                                y: parameters.y1
                            },
                            end2: {
                                x: nextParameters.x2,
                                y: nextParameters.y2
                            }
                        }, 'SimpleRouter');

                        wire.replaceSegmentsFromParametersArray(
                            sIndex,
                            newSegments
                        );

                        if (sIndex > 0 &&
                            parameters.router &&
                            parameters.router.type === 'ElbowRouter' &&
                            parameters.elbowPartOrder === 1) {

                            // If it was part of an Elbow routed segment set, set the other part to
                            // simple-routed

                            affectedSegmentParameters = segments[sIndex - 1].getParameters();
                            affectedSegmentParameters.router = {
                                type: 'SimpleRouter'
                            };

                            delete affectedSegmentParameters.elbowPartOrder;

                        }


                        if (sIndex + 1 < segments.length &&
                            nextParameters.router &&
                            nextParameters.router.type === 'ElbowRouter' &&
                            nextParameters.elbowPartOrder === 0) {

                            // If it was part of an Elbow routed segment set, set the other part to
                            // simple-routed

                            affectedSegmentParameters = segments[sIndex + 1].getParameters();
                            affectedSegmentParameters.router = {
                                type: 'SimpleRouter'
                            };

                            delete affectedSegmentParameters.elbowPartOrder;

                        }

                        $scope.diagram.updateWireSegments(wire);

                        ga('send', 'event', 'corner', 'destroy', wire.getId(), sIndex);

                        $rootScope.$emit('wireSegmentsMustBeSaved', wire);

                    }
                }]
            });

        } else {

            $scope.contextMenuData.unshift({

                id: 'cornerManipulation',
                items: [{
                    id: 'addCorner',
                    label: 'Add corner',
                    iconClass: 'fa fa-plus',
                    action: function() {

                        var sIndex,
                            newSegmentParameters1,
                            newSegmentParameters2,
                            newPosition,
                            segmentParameters,
                            nextParameters,
                            segments = wire.getSegments(),
                            affectedSegmentParameters;

                        sIndex = segments.indexOf(segment);

                        newPosition = offsetToMouse;

                        segmentParameters = segment.getParameters();

                        newPosition = gridService.getSnappedPosition(newPosition);

                        newSegmentParameters1 = wiringService.getSegmentsBetweenPositions({
                            end1: {
                                x: segmentParameters.x1,
                                y: segmentParameters.y1
                            },

                            end2: {
                                x: newPosition.x,
                                y: newPosition.y
                            }
                        }, 'SimpleRouter')[0];


                        newSegmentParameters2 = wiringService.getSegmentsBetweenPositions({
                            end1: {
                                x: newPosition.x,
                                y: newPosition.y
                            },

                            end2: {
                                x: segmentParameters.x2,
                                y: segmentParameters.y2
                            }
                        }, 'SimpleRouter')[0];

                        wire.deleteSegment(sIndex);
                        wire.insertSegment(sIndex, new WireSegment(newSegmentParameters1, wire));
                        wire.insertSegment(sIndex + 1, new WireSegment(newSegmentParameters2, wire));

                        if (sIndex > 0 &&
                            segmentParameters.router &&
                            segmentParameters.router.type === 'ElbowRouter' &&
                            segmentParameters.elbowPartOrder === 1) {

                            // If it was part of an Elbow routed segment set, set the other part to
                            // simple-routed

                            affectedSegmentParameters = segments[sIndex - 1].getParameters();
                            affectedSegmentParameters.router = {
                                type: 'SimpleRouter'
                            };

                            delete affectedSegmentParameters.elbowPartOrder;

                        }


                        nextParameters = segments[sIndex + 2];

                        if (sIndex + 2 < segments.length &&
                            nextParameters.router &&
                            nextParameters.router.type === 'ElbowRouter' &&
                            nextParameters.elbowPartOrder === 0) {

                            // If it was part of an Elbow routed segment set, set the other part to
                            // simple-routed

                            affectedSegmentParameters = segments[sIndex + 2].getParameters();
                            affectedSegmentParameters.router = {
                                type: 'SimpleRouter'
                            };

                            delete affectedSegmentParameters.elbowPartOrder;

                        }


                        $scope.diagram.updateWireSegments(wire);

                        ga('send', 'event', 'corner', 'add', wire.getId(), sIndex);

                        $rootScope.$emit('wireSegmentsMustBeSaved', wire);
                    }
                }]
            });


        }

        openMenu($event);

        $event.stopPropagation();

    };

    onComponentContextmenu = function(component, $event) {

        var inSelection,
            selectedComponents,
            destroyLabel,
            wiringMenu;

        wiringMenu = [];

        ga('send', 'event', 'component', 'contextmenu');

        angular.forEach($scope.routerTypes, function(routerType) {

            wiringMenu.push({
                id: routerType.id,
                label: routerType.label,
                action: function() {

                    var wires = $scope.diagram.getWiresForComponents([component]);

                    angular.forEach(wires, function(wire) {

                        ga('send', 'event', 'wire', 'redraw', wire.getId());

                        wiringService.routeWire(wire, routerType.type, routerType.params);
                        $rootScope.$emit('wireSegmentsMustBeSaved', wire);

                    });
                }
            });

        });


        selectedComponents = $scope.diagram.getSelectedComponents();

        if ($scope.diagram.isComponentSelected(component) && selectedComponents.length > 1) {

            inSelection = true;

            destroyLabel = 'Destroy selected [' + selectedComponents.length + ']';

        } else {
            destroyLabel = 'Destroy';
        }

        $scope.contextMenuData = [{
                id: 'reposition',
                items: [{
                    id: 'rotateCW',
                    label: 'Rotate CW',
                    keyboardShortcut: 'R',
                    iconClass: 'fa fa-rotate-right',
                    action: function() {

                        var operation;

                        operation = operationsManager.initNew('RotateComponents', $scope.diagram, component);
                        operation.set(90);
                        operation.finish();
                    }
                }, {
                    id: 'rotateCCW',
                    label: 'Rotate CCW',
                    keyboardShortcut: '⇧R',
                    iconClass: 'fa fa-rotate-left',
                    action: function() {

                        var operation;

                        operation = operationsManager.initNew('RotateComponents', $scope.diagram, component);
                        operation.set(-90);
                        operation.finish();

                    }
                }, {
                    id: 'bringToFront',
                    label: 'Bring to front',
                    keyboardShortcut: ']',
                    action: function() {

                        var operation;

                        operation = operationsManager.initNew(
                            'ReorderComponent',
                            $scope.diagram,
                            component
                        );

                        operation.set($scope.diagram.getHighestZ() + 1);
                        operation.finish();
                    }
                }, {
                    id: 'sendToBack',
                    label: 'Send to back',
                    keyboardShortcut: '[',
                    action: function() {

                        var operation;

                        operation = operationsManager.initNew(
                            'ReorderComponent',
                            $scope.diagram,
                            component
                        );

                        operation.set($scope.diagram.getLowestZ() - 1);
                        operation.finish();
                    }
                }]
            }, {
                id: 'adjust',
                items: [{
                    id: 'redraw',
                    label: 'Redraw all wires',
                    menu: [{
                        items: wiringMenu
                    }]
                }]
            }, {
                id: 'delete',
                items: [{
                    id: 'destroy',
                    label: destroyLabel,
                    iconClass: 'fa fa-trash-o',
                    keyboardShortcut: 'Del',
                    action: function() {

                        ga('send', 'event', 'component', 'destroy', component.id);

                        if (!inSelection) {
                            $rootScope.$emit('componentDeletionMustBeDone', component);
                        } else {
                            $rootScope.$emit('componentDeletionMustBeDone', selectedComponents);
                        }


                    }
                }]
            }

        ];

        if (component.metaType === 'Container') {

            $scope.contextMenuData.unshift({
                id: 'navigate',
                items: [{
                    id: 'lookInside',
                    label: 'Look inside',
                    keyboardShortcut: 'Enter',
                    iconClass: 'fa fa-sign-in',
                    action: function() {
                        $rootScope.$emit('containerMustBeOpened', component);
                    }
                }]
            });

        }

        openMenu($event);

        $event.stopPropagation();

    };

    onPortContextmenu = function(component, port, $event) {

        $scope.contextMenuData = [{
            id: 'properties',
            items: [{
                id: 'info',
                label: 'Info',
                disabled: true,
                iconClass: null,
                action: function() {
                    console.log('Port info');
                },
                actionData: {}
            }]
        }];

        openMenu($event);

        $event.stopPropagation();

        return false;

    };

    onDiagramContextmenu = function($event) {

        var wiringMenu;

        wiringMenu = [];

        ga('send', 'event', 'diagram', 'contextmenu');

        angular.forEach($scope.routerTypes, function(routerType) {
            var selected;

            selected = routerType.id === $scope.selectedRouter.id;

            wiringMenu.push({
                id: routerType.id,
                label: routerType.label,
                cssClass: selected ? 'selected' : 'not-selected',
                iconClass: selected ? 'fa fa-check' : undefined,
                action: function() {

                    ga('send', 'event', 'diagram', 'changeRouter', routerType.id);

                    $scope.selectedRouter = routerType;

                }
            });

        });

        $scope.contextMenuData = [{
                id: 'testbenches',
                items: [{
                    id: 'generatePCB',
                    label: 'Generate PCB',
                    disabled: !angular.isFunction($rootScope.startTestbench) || $rootScope.runningTestbench,
                    iconClass: 'fa fa-play',
                    action: function() {
                        $rootScope.startTestbench();
                    },
                    actionData: {}
                }]

            }, {
                id: 'gridSettings',
                items: [{
                    id: 'snapToGrid',
                    label: 'Snap to grid',
                    cssClass: $rootScope.snapToGrid ? 'selected' : 'not-selected',
                    iconClass: $rootScope.snapToGrid ? 'fa fa-check' : undefined,
                    action: function() {

                        if ($rootScope.snapToGrid === true) {
                            $rootScope.snapToGrid = false;
                        } else {
                            $rootScope.snapToGrid = true;
                        }

                        ga('send', 'event', 'diagram', 'changeSnapToGrid', $rootScope.snapToGrid);

                    },
                    actionData: {}
                }]

            }, {
                id: 'wiringMethods',
                label: 'Wiring method',
                items: wiringMenu
            }, {
                id: 'diagramRouteMenu',
                items: [{
                    id: 'rerouteDiagram',
                    label: 'Reroute diagram',
                    iconClass: 'glyphicon glyphicon-random',
                    action: function() {
                        wiringService.routeDiagram($scope.diagram, 'OrthogonalRouter');
                        $rootScope.$emit('wiresMustBeSaved', $scope.diagram.getWires());
                    }
                }]
            }, {
                id: 'projectMenu',
                label: 'Project',
                items: [{
                    id: 'undo',
                    label: 'Undo last change',
                    iconClass: 'fa fa-reply',
                    action: function() {
                        projectHandling.undo();
                    }
                },
                {
                    id: 'exportToGME',
                    label: 'Export to desktop tools',
                    iconClass: 'glyphicon glyphicon-floppy-save',
                    action: function() {

                        testBenchService.runTestBench(projectHandling.getWorkspaceContext(), projectHandling.getSelectedDesignId())
                            .then(function (resultData) {

                                var hash;

                                if (resultData && resultData.success === true) {

                                    $log.debug('testbench result', resultData);

                                    hash = resultData.artifacts['mga.zip'].hash;

                                    var downloadUrl = '/rest/blob/download/' + hash;
                                    window.location = downloadUrl;

                                } else {
                                    console.error('Project export failed.');
                                }

                            }).
                            catch(function () {
                                console.error('Project export failed.');
                            });
                    }
                }]
            }, {
                id: 'printMenu',
                items: [{
                    id: 'printDiagram',
                    label: 'Print diagram',
                    iconClass: 'glyphicon glyphicon-print',
                    action: function() {
                        window.print();
                    }
                }]
            }];

        openMenu($event);

        $event.stopPropagation();

    };

    this.onDiagramContextmenu = onDiagramContextmenu;
    this.onComponentContextmenu = onComponentContextmenu;

    this.onWireContextmenu = onWireContextmenu;

    this.onPortContextmenu = onPortContextmenu;
    this.onDiagramMouseDown = onDiagramMouseDown;

    return this;

};
