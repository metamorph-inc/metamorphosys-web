/*globals angular, ga, $*/

'use strict';

// Move this to GME eventually

require('../drawingGrid/drawingGrid.js');

angular.module('mms.diagramContainer', [
        'mms.drawingGrid',
        'isis.ui.contextmenu'

    ])
    .controller('DiagramContainerController',
        function($scope, $timeout, $log, $window, $rootScope, $compile) {

            var self = this,

                compiledDirectives,

                ScrollHandler,
                scrollHandler;

            compiledDirectives = {};

            ScrollHandler = require('./classes/ScrollHandler');
            this.scrollHandler = scrollHandler = new ScrollHandler($scope, $timeout, $log);

            $scope.getCssClass = function() {

                var classString;

                classString = 'diagram-container';

                classString += ' zoom-level-' + $scope.zoomLevel;

                classString += self.isEditable() ? ' editable' : 'readonly';

                return classString;
            };

            $scope.getInitializedClass = function() {
                return $scope.initialized ? 'initialized' : 'not-initialized';
            };

            this.getVisibleArea = function() {
                return $scope.visibleArea;
            };

            this.getId = function() {

                var diagramId;

                if (angular.isObject($scope.diagram)) {
                    diagramId = $scope.diagram.id;
                }

                return diagramId;
            };

            this.getDiagram = function() {
                return $scope.diagram;
            };

            this.getZoomLevel = function() {
                return $scope.zoomLevel;
            };

            this.getCompiledDirective = function(directive) {
                return compiledDirectives[directive];
            };

            this.setCompiledDirective = function(directive, compiledDirective) {
                compiledDirectives[directive] = compiledDirective;
            };

            this.isEditable = function() {

                if (angular.isObject($scope.diagram)) {

                    $scope.diagram.config = $scope.diagram.config || {};

                    return $scope.diagram.config.editable === true;

                }

            };

            this.isComponentSelected = function(component) {

                if (angular.isObject($scope.diagram)) {

                    return $scope.diagram.state.selectedComponentIds.indexOf(component.id) > -1;

                }

            };

            this.getConfig = function() {
                return $scope.config;
            };

            this.setInitialized = function(val) {
                $scope.initialized = val;
            };

            this.scrollSome = function(x, y) {

                var jsp = $scope.$contentPane.data('jsp'),
                    result;

                if (x >= 0 &&
                    x + $scope.visibleArea.width <= $scope.diagram.config.width + 15 &&
                    y >= 0 &&
                    y + $scope.visibleArea.height <= $scope.diagram.config.height + 15) {

                    jsp.scrollTo(x, y, false);

                    result = true;

                } else {
                    result = false;
                }

                return result;

            };

            this.replaceWithDirective = function(placeHolderEl, directive, scope) {

                var compiledSymbol,
                    templateStr,
                    template;

                if (placeHolderEl) {

                    compiledSymbol = this.getCompiledDirective(directive);

                    if (!angular.isFunction(compiledSymbol)) {

                        templateStr = '<' + directive + '>' +
                        '</' + directive + '>';

                        template = angular.element(templateStr);

                        compiledSymbol = $compile(template);

                        this.setCompiledDirective(directive, compiledSymbol);

                    }


                    compiledSymbol(scope, function (clonedElement) {

                        placeHolderEl.parentNode.replaceChild(
                            clonedElement[0],
                            placeHolderEl
                        );

                    });

                }

            }


        }
    )
    .directive('diagramContainer', [
        '$rootScope', 'diagramService', '$log', '$timeout', '$window',
        function($rootScope, diagramService, $log, $timeout, $window) {

            return {
                controller: 'DiagramContainerController',
                scope: {
                    diagram: '=',
                    config: '='
                },
                restrict: 'E',
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/diagramContainer.html',
                require: ['diagramContainer', '?^designEditor'],
                link: function(scope, element, attributes, controllers) {

                    var $element,
                        processDropHandler,
                        processDragOverOrEnter,
                        $windowElement,

                        ctrl = controllers[0],
                        designEditorCtrl = controllers[1];

                    $log.debug('In diagram container', scope.visibleArea);

                    scope.config = scope.config || {};

                    $element = scope.$element = $(element);

                    scope.$contentPane = element.find('>.diagram-content-pane');

                    $element.keyup(function(e) {
                        $timeout(function() {

                            scope.pressedKey = null;

                            $timeout(function() {

                                scope.$broadcast('keyupOnDiagram', e);

                            });

                        });
                    });

                    $element.keydown(function(e) {


                        $timeout(function() {

                            scope.pressedKey = e.keyCode;

                            scope.$broadcast('keydownOnDiagram', e);

                        });

                    });

                    // processDragOverOrEnter = function(event) {

                    //     console.log(event.dataTransfer.getData('componentId'));

                    //     debugger;

                    //     if (!event || !event.dataTransfer.items || event.dataTransfer.items.length === 0 || event.dataTransfer.items[0].kind !== 'file') {
                    //         return false;
                    //     }
                    //     event.preventDefault();
                    //     if (event.dataTransfer.items[0].type === 'application/x-zip-compressed') {
                    //         event.dataTransfer.effectAllowed = 'copy';
                    //     } else {
                    //         event.dataTransfer.effectAllowed = 'none';
                    //     }
                    //     return false;

                    // };

                    // processDropHandler = function(event) {

                    //     if (!event || !event.dataTransfer.files || event.dataTransfer.files.length === 0) {
                    //         return false;
                    //     }
                    //     event.preventDefault();
                    //     scope.aFileWasDroppedOnMe(event.dataTransfer.files[0], event);
                    //     return false;

                    // };

                    $timeout(function() {
                        scope.$broadcast('DiagramContainerInitialized');
                    });

                    $rootScope.$on('containerMustBeOpened', function(ev, container) {

                        var jsp;

                        if (container && scope.diagram && container.id !== scope.diagram.id) {
                            scope.initialized = false;
                        }

                        jsp = scope.$contentPane.data('jsp');

                        if (angular.isObject(jsp)) {
                            jsp.scrollTo(0, 0);
                        }

                    });

                    $rootScope.$on('designMustBeOpened', function( /*ev, container*/ ) {

                        var jsp;

                        scope.initialized = false;

                        jsp = scope.$contentPane.data('jsp');

                        if (angular.isObject(jsp)) {
                            jsp.scrollTo(0, 0);
                        }

                    });

                    $windowElement = angular.element($window);

                    $windowElement.bind(
                        'resize', ctrl.scrollHandler.onWindowResize
                    );


                    if (designEditorCtrl) {
                        designEditorCtrl.addEventListener('resize', ctrl.scrollHandler.onWindowResize);
                    }

                    scope.$on('$destroy', function() {

                        if (designEditorCtrl) {
                            designEditorCtrl.removeEventListener('resize', ctrl.scrollHandler.onWindowResize);
                        }

                        $windowElement.unbind('resize', ctrl.scrollHandler.onWindowResize);

                        element.off();
                    });


                }

            };
        }
    ]);
