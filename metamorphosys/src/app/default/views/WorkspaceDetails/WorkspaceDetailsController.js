/*globals angular, console */

angular.module( 'CyPhyApp' )
    .controller( 'WorkspaceDetailsController', function ( $rootScope, $scope, $window, $state ) {
        'use strict';
        var workspaceId = $state.params.workspaceId.replace( /-/g, '/' );
        console.log( 'WorkspaceDetailsController', workspaceId );
        $scope.dataModel = {
            workspaceId: workspaceId
        };
        $rootScope.mainNavigator.items = [ {
            id: 'root',
            label: 'ADMEditor',
            itemClass: 'cyphy-root',
            menu: [ {
                id: 'editor',
                items: [ {
                    id: 'open',
                    label: 'Open in editor',
                    disabled: false,
                    iconClass: 'glyphicon glyphicon-edit',
                    action: function () {
                        $window.open( '/?project=ADMEditor', '_blank' );
                    },
                    actionData: {}
                } ]
            } ]
        } ];
        $rootScope.mainNavigator.separator = false;
        //debugger;
    } );