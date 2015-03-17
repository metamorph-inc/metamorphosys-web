/*globals angular, $, ga*/
'use strict';

var ComponentBrowserService = require('./classes/ComponentBrowserService.js');


angular.module( 'mms.mmsApp.componentBrowser', [
    'mms.componentBrowser.componentLibrary'
] )
    .config( function(componentLibraryProvider, componentServerUrl){
        componentLibraryProvider.setServerUrl(componentServerUrl);
    })
    .service( 'componentBrowserService', ComponentBrowserService )
    .controller( 'ComponentBrowserController',
    function (
        $scope, $window, $log, componentBrowserService, $timeout, componentLibrary, componentServerUrl
    ) {
        var init;

        this.getConnectionId = function () {
            return $scope.connectionId;
        };

        $scope.componentSearchUrl = componentServerUrl + '/components/search/!/';

        $scope.treeNavigatorData = componentBrowserService.treeNavigatorData;

        init = function() {

            // Tree setup

            $timeout(function () {
                $scope.adjustTreeNavigatorSize();
            }, 20);


            // Getting the data

            componentLibrary.getClassificationTree()
                .then(function(data){

                    componentBrowserService.initializeWithNodes(data);
                    $scope.grandTotal = componentLibrary.getGrandTotal();

                })
                .catch(function(e){

                    $log.error('Could not load components', e);

                });

            $scope.initialized = true;

        };

        $scope.getInitializedClass = function() {
            return $scope.initialized ? 'initialized' : 'not-initialized';
        };

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


        init();

    } )
    .directive( 'componentBrowser', function ($window) {

        return {
            restrict: 'E',
            scope: {
                autoHeight: '=autoHeight'
            },
            replace: true,
            templateUrl: '/mmsApp/templates/componentBrowser.html',
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
