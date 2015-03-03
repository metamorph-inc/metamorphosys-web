/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.components' )
    .controller( 'DesignTreeController', function ( $scope, $window, designService, desertService ) {
        'use strict';
        var context,
            config,
            treeData,
            rootNode,
            avmIds = {},
            buildTreeStructure;

        console.log( 'DesignTreeController' );

        // Check for valid connectionId and register clean-up on destroy event.
        if ( $scope.connectionId && angular.isString( $scope.connectionId ) ) {
            context = {
                db: $scope.connectionId,
                regionId: 'DesignTreeController_' + ( new Date() )
                    .toISOString()
            };
            $scope.$on( '$destroy', function () {
                designService.unregisterWatcher( context );
            } );
        } else {
            throw new Error( 'connectionId must be defined and it must be a string' );
        }

        config = {
            nodeContextmenuRenderer: function ( e, node ) {
                return [ {
                    items: [ {
                        id: 'create',
                        label: 'Open in Editor',
                        disabled: false,
                        iconClass: 'glyphicon glyphicon-edit',
                        actionData: {
                            id: node.id
                        },
                        action: function ( data ) {
                            $window.open( '/?project=ADMEditor&activeObject=' + data.id, '_blank' );
                        }
                    } ]
                } ];
            },
            nodeClick: function ( e, node ) {
                console.log( 'Node was clicked:', node, $scope );
            },
            disableManualSelection: true,
            folderIconClass: 'fa fa-cubes'
            //            nodeDblclick: function ( e, node ) {
            //                console.log( 'Node was double-clicked:', node );
            //            },
            //            nodeExpanderClick: function ( e, node, isExpand ) {
            //                console.log( 'Expander was clicked for node:', node, isExpand );
            //            }

        };

        rootNode = {
            id: $scope.designId,
            label: 'Loading Design Space Nodes..',
            extraInfo: '',
            children: [],
            childrenCount: 0
        };

        treeData = {
            id: '',
            label: '',
            extraInfo: '',
            unCollapsible: true,
            children: [
                rootNode
            ],
            childrenCount: 1
        };
        $scope.config = config;
        $scope.treeData = treeData;
        $scope.$on( 'setSelectedNodes', function ( event, data ) {
            $scope.config.state.selectedNodes = data;
        } );

        buildTreeStructure = function ( container, parentTreeNode ) {
            var key,
                childData,
                treeNode;
            if ( parentTreeNode ) {
                treeNode = {
                    id: null,
                    label: null,
                    extraInfo: null,
                    children: [],
                    childrenCount: 0
                };
                parentTreeNode.children.push( treeNode );
                parentTreeNode.childrenCount += 1;
            } else {
                treeNode = rootNode;
            }
            treeNode.id = container.id;
            treeNode.label = container.name;
            treeNode.extraInfo = container.type;
            $scope.config.state.expandedNodes.push( treeNode.id );
            for ( key in container.components ) {
                if ( container.components.hasOwnProperty( key ) ) {
                    childData = container.components[ key ];
                    treeNode.children.push( {
                        id: childData.id,
                        label: childData.name
                    } );
                    treeNode.childrenCount += 1;
                    if ( avmIds[ childData.avmId ] ) {
                        avmIds[ childData.avmId ].push( childData.id );
                    } else {
                        avmIds[ childData.avmId ] = [ childData.id ];
                    }
                }
            }
            for ( key in container.subContainers ) {
                if ( container.subContainers.hasOwnProperty( key ) ) {
                    childData = container.subContainers[ key ];
                    buildTreeStructure( childData, treeNode );
                }
            }
        };

        designService.registerWatcher( context, function ( destroyed ) {
            if ( destroyed ) {
                console.warn( 'destroy event raised' );
                // Data not (yet) avaliable.
                // TODO: display this to the user.
                return;
            }
            console.info( 'initialize event raised' );

            designService.watchDesignStructure( context, $scope.designId, function ( updateObject ) {
                console.warn( updateObject );
            } )
                .then( function ( data ) {
                    var rootContainer = data.containers[ data.rootId ],
                        desertInputData;
                    buildTreeStructure( rootContainer );
                    $scope.$emit( 'designTreeLoaded', avmIds );
                    // FIXME: This part is only here to reuse the data from watchDesignStructure.
                    // TODO: Find a more suitable location.
                    desertInputData = desertService.getDesertInputData( data );
                    $scope.$emit( 'desertInputReady', desertInputData );
                } );
        } );
    } )
    .directive( 'designTree', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                designId: '=designId',
                connectionId: '=connectionId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/DesignTree.html',
            controller: 'DesignTreeController'
        };
    } );
