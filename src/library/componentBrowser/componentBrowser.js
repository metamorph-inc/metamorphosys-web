/*globals angular*/
'use strict';

angular.module( 'cyphy.components' )
    .controller( 'ComponentBrowserController',
    function ( $scope, $window, $modal, growl, componentService, fileService, $log ) {
        var
            addDomainWatcher,

            context,

            ComponentBrowserListHelper,
            listHelper,

            ComponentBrowserTreeHelper,
            treeHelper;


        this.getConnectionId = function () {
            return $scope.connectionId;
        };
        // Check for valid connectionId and register clean-up on destroy event.
        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'ComponentListController_' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                componentService.cleanUpAllRegions( context );
            } );
        } else {
            throw new Error( 'connectionId must be defined and it must be a string' );
        }

        // List setup

        ComponentBrowserListHelper = require('./classes/ComponentBrowserListHelper.js');
        listHelper = new ComponentBrowserListHelper($scope, $window, context, $modal, componentService, $log);

        $scope.listConfig = listHelper.config;
        $scope.listData = listHelper.data;

        // Tree setup

        ComponentBrowserTreeHelper = require('./classes/ComponentBrowserTreeHelper.js');
        treeHelper = new ComponentBrowserTreeHelper($log);

        $scope.treeConfig = treeHelper.config;
        $scope.treeData = treeHelper.data;


        // Getting the data

        addDomainWatcher = function (componentId) {

            componentService.watchComponentDomains(context, componentId, function (updateData) {
                listHelper.updateItemStats(componentId, updateData);
            })
                .then(function (data) {
                    listHelper.updateItemStats(componentId, data);
                });
        };


        componentService.registerWatcher( context, function ( destroyed ) {

            if ( destroyed ) {
                console.warn( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info( 'initialize event raised' );

            componentService.watchComponents( context, $scope.workspaceId, $scope.avmIds, function (
                updateObject ) {

                if ( updateObject.type === 'load' ) {

                    listHelper.addItem( updateObject.data );
                    addDomainWatcher( updateObject.id );

                } else if ( updateObject.type === 'update' ) {

                    listHelper.addItem( updateObject.data );

                } else if ( updateObject.type === 'unload' ) {

                    listHelper.removeItem(updateObject.id);

                } else {
                    throw new Error( updateObject );
                }
            } )
                .then( function ( data ) {
                    var componentId;
                    for ( componentId in data.components ) {
                        if ( data.components.hasOwnProperty( componentId ) ) {

                            listHelper.addItem( data.components[ componentId ] );
                            addDomainWatcher( componentId );

                        }
                    }
                } );
        } );
    } )
    .directive( 'componentBrowser', function () {

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
