/*globals angular*/

angular.module( 'cyphy.components' )
    .controller( 'ComponentBrowserController', function () {
        'use strict';
    } )
    .directive( 'componentBrowser', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId',
                connectionId: '=connectionId',
                avmIds: '=avmIds'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/componentBrowser.html',
            controller: 'ComponentBrowserController'
        };
    } );