/*globals angular, $*/

'use strict';

module.exports = function ($scope, diagramService, $timeout, contextmenuService, $log) {

    var
        onComponentContextmenu,
        onPortContextmenu,
        onDiagramContextmenu,
        onDiagramMouseDown,

        openMenu;

    $log.debug('Initializing context menus.');

    openMenu = function($event) {

        contextmenuService.close();

        $timeout(function () {

            var openContextMenuEvent;

                openContextMenuEvent = angular.extend($.Event('openContextMenu'), {
                clientX: $event.clientX,
                clientY: $event.clientY,
                pageX: $event.pageX,
                pageY: $event.pageY,
                screenX: $event.screenX,
                screenY: $event.screenY,
                target: $event.target
            });

            $scope.$element.triggerHandler(openContextMenuEvent);

        });

    };

    onDiagramMouseDown = function() {
        contextmenuService.close();
    };

    onComponentContextmenu = function (component, $event) {

        $scope.contextMenuData = [
            {
                id: 'reposition',
                items: [
                    {
                        id: 'rotateCW',
                        label: 'Rotate CW',
                        iconClass: 'fa fa-rotate-right',
                        action: function () {
                            console.log('Rotating clockwise');
                        }
                    },
                    {
                        id: 'rotateCCW',
                        label: 'Rotate CCW',
                        iconClass: 'fa fa-rotate-left',
                        action: function () {
                            console.log('Rotating anti-clockwise');
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

        $scope.contextMenuData = [
            {
                id: 'about',
                items: [
                    {
                        id: 'getStats',
                        label: 'Statistics',
                        disabled: true,
                        iconClass: 'glyphicon glyphicon-plus',
                        action: function () {
                            console.log('Statistics');
                        },
                        actionData: {}
                    }
                ]
            }
        ];

        openMenu($event);

        $event.stopPropagation();

    };

    this.onDiagramContextmenu = onDiagramContextmenu;
    this.onComponentContextmenu = onComponentContextmenu;
    this.onPortContextmenu = onPortContextmenu;
    this.onDiagramMouseDown = onDiagramMouseDown;

    return this;

};
