/*globals angular, $*/
'use strict';

var ComponentBrowserService = require('./classes/ComponentBrowserService.js');


angular.module( 'cyphy.components' )
    .service( 'componentBrowserService', ComponentBrowserService )
    .controller( 'ComponentBrowserController',
    function (
        $scope, $window, $modal, growl, componentService, fileService, $log, componentBrowserService, $timeout
    ) {
        var
            addInterfaceWatcher,

            context;


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

        // Tree setup


        $scope.treeNavigatorData = componentBrowserService.treeNavigatorData;

        $timeout(function(){
            $scope.adjustTreeNavigatorSize();
        }, 20);


        // Getting the data

        addInterfaceWatcher = function (componentId) {

            componentService.watchInterfaces(context, componentId, function (updateData) {

                componentBrowserService.upsertComponentInterface(componentId, updateData);

            })
                .then(function (data) {

                    componentBrowserService.upsertComponentInterface(componentId, data);

                });
        };


        componentService.registerWatcher( context, function ( destroyed ) {

            if ( destroyed ) {
                $log.warn( 'destroy event raised' );
                return;
            }

            $log.debug( 'initialize event raised' );

            componentService.watchComponents( context, $scope.workspaceId, $scope.avmIds, function (
                updateObject ) {

                if ( updateObject.type === 'load' ) {

                    componentBrowserService.upsertItem( updateObject.data );

                    addInterfaceWatcher( updateObject.id );

                } else if ( updateObject.type === 'update' ) {

                    componentBrowserService.upsertItem( updateObject.data );

                } else if ( updateObject.type === 'unload' ) {

                    componentBrowserService.removeItem( updateObject.id );

                } else {
                    throw new Error( updateObject );
                }
            } )
                .then( function ( data ) {
                    var componentId;


                    componentBrowserService.initializeWithNodes(data.components);

                    for ( componentId in data.components ) {
                        if ( data.components.hasOwnProperty( componentId ) ) {

                            addInterfaceWatcher( componentId );

                        }
                    }
                } );
        } );

        $scope.$watch('componentSearchSelection', function(selectedObject) {

            var node;

            if (angular.isObject(selectedObject)) {

                node = selectedObject.originalObject;

                componentBrowserService.showNode(node.id);

                $timeout(function(){

                    var $nodeLi,
                        y;

                    if ($scope.$treeNavigatorNodesElement) {
                        $nodeLi = $scope.$treeNavigatorNodesElement.find('[title="' + node.label + '"]');

                        if ($nodeLi.length) {

                            y = ($nodeLi.offset().top -
                                $scope.$treeNavigatorNodesElement.offset().top) +
                                $scope.$treeNavigatorNodesElement.scrollTop();

                            $scope.$treeNavigatorNodesElement.animate({
                               scrollTop: y
                            }, 500);

                        }
                    }

                }, 100);
            }

        });

    } )
    .directive( 'componentBrowser', function ($window) {

        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId',
                connectionId: '=connectionId',
                avmIds: '=avmIds',
                autoHeight: '=autoHeight'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/componentBrowser.html',
            controller: 'ComponentBrowserController',
            link: function(scope, element) {

                var $treeNavigatorNodesElement,
                    $parent,
                    headerPartHeight,
                    $windowElement;

                $parent = $(element.parent());

                scope.adjustTreeNavigatorSize = function() {

                    var parentHeight;

                    if (scope.autoHeight) {

                        if (headerPartHeight === undefined) {
                            headerPartHeight = element.find('.header-part').outerHeight();
                        }

                        $treeNavigatorNodesElement = $treeNavigatorNodesElement || element.find('nav > div.tree-navigator-nodes');
                        scope.$treeNavigatorNodesElement = $treeNavigatorNodesElement;


                        if ($treeNavigatorNodesElement.length) {

                            parentHeight = $parent.innerHeight();

                            //parentHeight=$treeNavigatorNodesElement.parent().innerHeight();

                            console.log('--------------', parentHeight-headerPartHeight-10);

                            $treeNavigatorNodesElement.outerHeight(parentHeight-headerPartHeight-10);

                        }
                    }
                };

                $windowElement = angular.element($window);

                $windowElement.bind(
                    'resize', scope.adjustTreeNavigatorSize
                );

                scope.$on('destroy', function(){

                    $windowElement.unbind(
                        'resize', scope.adjustTreeNavigatorSize
                    );

                });
            }
        };
    } );
