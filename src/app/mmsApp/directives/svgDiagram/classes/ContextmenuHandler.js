/*globals angular, ga, $*/

'use strict';

module.exports = function (
    $scope, $rootScope, diagramService, $timeout, contextmenuService, operationsManager, wiringService, $log) {

    var
        onComponentContextmenu,
        onWireContextmenu,
        onPortContextmenu,
        onDiagramContextmenu,
        onDiagramMouseDown,
        getOffsetToMouse,

        openMenu;

    $log.debug('Initializing context menus.');

    getOffsetToMouse = function ($event) {

        var offset;

        offset = {
            x: $event.pageX - $scope.elementOffset.left,
            y: $event.pageY - $scope.elementOffset.top
        };

        return offset;

    };

    openMenu = function ($event) {

        contextmenuService.close();

        $timeout(function () {

            var openContextMenuEvent;

            openContextMenuEvent = angular.extend($.Event('openContextMenu'), {
                clientX: $event.clientX + 2,
                clientY: $event.clientY + 2,
                pageX: $event.pageX + 2,
                pageY: $event.pageY + 2,
                screenX: $event.screenX + 2,
                screenY: $event.screenY + 2,
                target: $event.target
            });

            $scope.$element.triggerHandler(openContextMenuEvent);

        });

    };

    onDiagramMouseDown = function () {
        contextmenuService.close();
    };

    onWireContextmenu = function (wire, segment, $event, wasCorner) {

        var wiringMenu;


        if (wasCorner) {
            ga('send', 'event', 'corner', 'contextmenu');
        } else {
            ga('send', 'event', 'wire', 'contextmenu');
        }

        wiringMenu = [];

        angular.forEach($scope.routerTypes, function(routerType) {

            wiringMenu.push(
                {
                    id: routerType.id,
                    label: routerType.label,
                    action: function(){
                        wiringService.routeWire( wire, routerType.type, routerType.params);
                        $rootScope.$emit('wireSegmentsMustBeSaved', wire);
                    }
                }
            );

        });

        $scope.contextMenuData = [
            {
                id: 'adjust',
                items: [
                    {
                        id: 'redraw',
                        label: 'Redraw wire',
                        menu: [
                            {
                                items: wiringMenu
                            }
                        ]
                    }
                ]
            },
            {
                id: 'delete',
                items: [
                    {
                        id: 'destroy',
                        label: 'Destroy wire',
                        iconClass: 'fa fa-trash-o',
                        action: function () {

                            ga('send', 'event', 'wire', 'destroy', wire.id);

                            $rootScope.$emit('wireDeletionMustBeDone', wire);
                        }
                    }
                ]
            }

        ];

        if (wasCorner) {

            $scope.contextMenuData.unshift(

                {

                    id: 'cornerManipulation',
                    items: [
                        {
                            id: 'destroyCorner',
                            label: 'Destroy corner',
                            iconClass: 'fa fa-minus',
                            action: function () {

                                var sIndex,
                                    nextSegment;

                                sIndex = wire.segments.indexOf(segment);

                                nextSegment = wire.segments[ sIndex + 1 ];

                                wire.segments[ sIndex + 1 ] = wiringService.getSegmentsBetweenPositions(
                                    {
                                        end1: {
                                            x: segment.x1,
                                            y: segment.y1
                                        },
                                        end2: {
                                            x: nextSegment.x2,
                                            y: nextSegment.y2
                                        }
                                    }, 'SimpleRouter')[0];

                                wire.segments.splice(sIndex, 1);

                                ga('send', 'event', 'corner', 'destroy', wire.id, sIndex);

                                $rootScope.$emit('wireSegmentsMustBeSaved', wire);
                            }
                        }
                    ]
                }
            );

        } else {

            $scope.contextMenuData.unshift(

                {

                    id: 'cornerManipulation',
                    items: [
                        {
                            id: 'addCorner',
                            label: 'Add corner',
                            iconClass: 'fa fa-plus',
                            action: function () {

                                var sIndex,
                                    newSegment,
                                    newPosition;

                                sIndex = wire.segments.indexOf(segment);

                                newPosition = getOffsetToMouse($event);

                                newSegment = wiringService.getSegmentsBetweenPositions(
                                    {
                                        end1: {
                                            x: newPosition.x,
                                            y: newPosition.y
                                        },

                                        end2: {
                                            x: segment.x2,
                                            y: segment.y2
                                        }
                                    }, 'SimpleRouter')[0];


                                wire.segments[ sIndex ] = wiringService.getSegmentsBetweenPositions(
                                    {
                                        end1: {
                                            x: segment.x1,
                                            y: segment.y1
                                        },

                                        end2: {
                                            x: newPosition.x,
                                            y: newPosition.y
                                        }
                                    }, 'SimpleRouter')[0];

                                wire.segments.splice(sIndex + 1, 0, newSegment);

                                ga('send', 'event', 'corner', 'add', wire.id, sIndex);

                                $rootScope.$emit('wireSegmentsMustBeSaved', wire);
                            }
                        }
                    ]
                }
            );


        }

        openMenu($event);

        $event.stopPropagation();

    };

    onComponentContextmenu = function (component, $event) {

        var inSelection,
            selectedComponents,
            destroyLabel,
            wiringMenu;

        wiringMenu = [];

        ga('send', 'event', 'component', 'contextmenu');

        angular.forEach($scope.routerTypes, function(routerType) {

            wiringMenu.push(
                {
                    id: routerType.id,
                    label: routerType.label,
                    action: function(){

                        var wires = $scope.diagram.getWiresForComponents([component]);

                        angular.forEach(wires, function(wire) {

                            ga('send', 'event', 'wire', 'redraw', wire.id);

                            wiringService.routeWire(wire, routerType.type, routerType.params);
                            $rootScope.$emit('wireSegmentsMustBeSaved', wire);

                        });
                    }
                }
            );

        });


        selectedComponents = $scope.diagram.getSelectedComponents();

        if ($scope.diagram.isComponentSelected(component) && selectedComponents.length > 1) {

            inSelection = true;

            destroyLabel = 'Destroy selected [' + selectedComponents.length + ']';

        } else {
            destroyLabel = 'Destroy';
        }

        $scope.contextMenuData = [
            {
                id: 'reposition',
                items: [
                    {
                        id: 'rotateCW',
                        label: 'Rotate CW',
                        iconClass: 'fa fa-rotate-right',
                        action: function () {

                            var operation;

                            operation = operationsManager.initNew('rotateComponents', $scope.diagram, component);
                            operation.set(90);
                            operation.commit();
                        }
                    },
                    {
                        id: 'rotateCCW',
                        label: 'Rotate CCW',
                        iconClass: 'fa fa-rotate-left',
                        action: function () {

                            var operation;

                            console.log('Rotating anti-clockwise');

                            operation = operationsManager.initNew('rotateComponents', $scope.diagram, component);
                            operation.set(-90);
                            operation.commit();

                        }
                    }
                ]
            },
            {
                id: 'adjust',
                items: [
                    {
                        id: 'redraw',
                        label: 'Redraw all wires',
                        menu: [
                            {
                                items: wiringMenu
                            }
                        ]
                    }
                ]
            },
            {
                id: 'delete',
                items: [
                    {
                        id: 'destroy',
                        label: destroyLabel,
                        iconClass: 'fa fa-trash-o',
                        action: function () {

                            ga('send', 'event', 'component', 'destroy', component.id);

                            if (!inSelection) {
                                $rootScope.$emit('componentDeletionMustBeDone', component);
                            } else {
                                $rootScope.$emit('componentDeletionMustBeDone', selectedComponents);
                            }


                        }
                    }
                ]
            }

        ];

        openMenu($event);

        $event.stopPropagation();

    };

    onPortContextmenu = function (component, port, $event) {

        $scope.contextMenuData = [
            {
                id: 'properties',
                items: [
                    {
                        id: 'info',
                        label: 'Info',
                        disabled: true,
                        iconClass: null,
                        action: function () {
                            console.log('Port info');
                        },
                        actionData: {}
                    }
                ]
            }
        ];

        openMenu($event);

        $event.stopPropagation();

        return false;

    };

    onDiagramContextmenu = function ($event) {

        var wiringMenu;

        wiringMenu = [];

        ga('send', 'event', 'diagram', 'contextmenu');

        angular.forEach($scope.routerTypes, function(routerType) {
                var selected;

                selected = routerType.id === $scope.selectedRouter.id;

            wiringMenu.push(
                {
                    id: routerType.id,
                    label: routerType.label,
                    cssClass: selected ? 'selected' : 'not-selected',
                    iconClass: selected ? 'fa fa-check' : undefined,
                    action: function () {

                        ga('send', 'event', 'diagram', 'changeRouter', routerType.id);

                        $scope.selectedRouter = routerType;

                    }
                }
            );

        });


        $scope.contextMenuData = [
            {
                id: 'testbenches',
                items: [
                    {
                        id: 'generatePCB',
                        label: 'Generate PCB',
                        disabled: !angular.isFunction($rootScope.startTestbench) || $rootScope.runningTestbench,
                        iconClass: 'fa fa-play',
                        action: function () {
                            $rootScope.startTestbench();
                        },
                        actionData: {}
                    }
                ]

            },
            {
                id: 'gridSettings',
                items: [
                    {
                        id: 'snapToGrid',
                        label: 'Snap to grid',
                        cssClass: $rootScope.snapToGrid ? 'selected' : 'not-selected',
                        iconClass: $rootScope.snapToGrid ? 'fa fa-check' : undefined,
                        action: function () {

                            if ($rootScope.snapToGrid === true) {
                                $rootScope.snapToGrid = false;
                            } else {
                                $rootScope.snapToGrid = true;
                            }

                            ga('send', 'event', 'diagram', 'changeSnapToGrid', $rootScope.snapToGrid);

                        },
                        actionData: {}
                    }
                ]

            },
            {
                id: 'wiringMethods',
                label: 'Wiring method',
                items: wiringMenu
            },
            {
                id: 'printMenu',
                items: [
                    {
                        id: 'printDiagram',
                        label: 'Print diagram',
                        iconClass: 'glyphicon glyphicon-print',
                        action: function() {
                            window.print();
                        }
                    }
                ]
            }
        ];

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
