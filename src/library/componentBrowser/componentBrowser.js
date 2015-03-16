/*globals angular, $, ga*/
'use strict';

var ComponentBrowserService = require('./classes/ComponentBrowserService.js');


angular.module( 'cyphy.components' )
    .service( 'componentBrowserService', ComponentBrowserService )
    .controller( 'ComponentBrowserController',
    function (
        $scope, $window, $modal, growl, componentService, fileService, $log, componentBrowserService, $timeout,
        projectHandling, connectionHandling
    ) {
        var init,
            addInterfaceWatcher,
            context,
            workspaceId;

        this.getConnectionId = function () {
            return $scope.connectionId;
        };

        $scope.treeNavigatorData = componentBrowserService.treeNavigatorData;

        init = function(workspaceId) {

            $scope.connectionId = connectionHandling.getMainGMEConnectionId();

            // Check for valid connectionId and register clean-up on destroy event.
            if ($scope.connectionId && angular.isString($scope.connectionId)) {
                context = {
                    db: $scope.connectionId,
                    regionId: 'ComponentListController_' + ( new Date() )
                        .toISOString()
                };
                $scope.$on('$destroy', function () {
                    componentService.unregisterWatcher(context);
                });
            } else {
                throw new Error('connectionId must be defined and it must be a string');
            }

            // Tree setup

            $timeout(function () {
                $scope.adjustTreeNavigatorSize();
            }, 20);


            // Getting the data

            addInterfaceWatcher = function (componentId) {

                componentService.watchInterfaces(context, componentId, null)
                    .then(function (data) {

                        componentBrowserService.upsertComponentInterface(componentId, data);

                    });
            };


            componentService.registerWatcher(context, function (destroyed) {

                if (destroyed) {
                    $log.warn('destroy event raised');
                    return;
                }

                $log.debug('initialize event raised');

                componentService.loadComponentsFromWorkspace(context, workspaceId)
                    .then(function (data) {
                        var componentId;

                        componentBrowserService.initializeWithNodes(data.components);

                        for (componentId in data.components) {
                            if (data.components.hasOwnProperty(componentId)) {

                                addInterfaceWatcher(componentId);

                            }
                        }
                    });
            });

            $scope.$watch('componentSearchSelection', function (selectedObject) {

                var node;

                if (angular.isObject(selectedObject)) {

                    node = selectedObject.originalObject;

                    componentBrowserService.showNode(node.id);

                    $timeout(function () {

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

                        ga('send', 'event', 'componentBrowser', 'search', node.label);

                    }, 100);
                }

            });

            $scope.initialized = true;

        };

        $scope.$watch(function(){
            return projectHandling.getSelectedWorkspaceId();
        }, function(newId){

            if (newId && newId !== workspaceId) {
                workspaceId = newId;
                init(newId);
            }

        });

        $scope.getInitializedClass = function() {
            return $scope.initialized ? 'initialized' : 'not-initialized';
        };

    } )
    .directive( 'componentBrowser', function ($window) {

        return {
            restrict: 'E',
            scope: {
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

                scope.initialized = false;

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

                            //console.log('--------------', parentHeight-headerPartHeight-10);

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

                $(document).bind('keyup', function (event) {

                    var d,
                        doIt,
                        input;

                    if (event.keyCode === 191) {

                        input = element.find('#component-search-autocomplete_value');

                        d = event.srcElement || event.target;

                        if (input.length && input[0] !== d) {

                            doIt = true;

                            if (d.tagName) {

                                if ((d.tagName.toUpperCase() === 'INPUT' &&
                                    (
                                    d.type.toUpperCase() === 'TEXT' ||
                                    d.type.toUpperCase() === 'PASSWORD' ||
                                    d.type.toUpperCase() === 'FILE' ||
                                    d.type.toUpperCase() === 'EMAIL' ||
                                    d.type.toUpperCase() === 'SEARCH' ||
                                    d.type.toUpperCase() === 'DATE' )
                                    ) ||
                                    d.tagName.toUpperCase() === 'TEXTAREA') {
                                    doIt = d.readOnly || d.disabled;
                                }
                            }

                            if (doIt) {

                                event.stopPropagation();
                                input.focus();

                            }
                        }

                    }

                });
            }
        };
    } );
