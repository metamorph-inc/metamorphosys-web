/*globals angular, $*/

'use strict';

module.exports = function (
    $scope, $rootScope, diagramService, $timeout, contextmenuService, operationsManager, wiringService, $log) {

    var
        onComponentContextmenu,
        onWireContextmenu,
        onPortContextmenu,
        onDiagramContextmenu,
        onDiagramMouseDown,

        openMenu;

    $log.debug('Initializing context menus.');

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

    onWireContextmenu = function (wire, segment, $event) {

        var wiringMenu;

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
                        label: 'Redraw line',
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
                            $rootScope.$emit('wireDeletionMustBeDone', wire);
                        }
                    }
                ]
            }

        ];

        openMenu($event);

        $event.stopPropagation();

    };

    onComponentContextmenu = function (component, $event) {

        var inSelection,
            selectedComponents,
            destroyLabel;

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

                            operation = operationsManager.initNew('rotateComponents', component);
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

                            operation = operationsManager.initNew('rotateComponents', component);
                            operation.set(-90);
                            operation.commit();

                        }
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
                        disabled: true,
                        iconClass: 'fa fa-play',
                        action: function () {
                            console.log('Statistics');
                        },
                        actionData: {}
                    }
                ]

            },
            {
                id: 'wiringMethods',
                label: 'Wiring method',
                items: wiringMenu
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
