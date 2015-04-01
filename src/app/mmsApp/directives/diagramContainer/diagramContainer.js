/*globals angular, ga, $*/

'use strict';

// Move this to GME eventually

require('../drawingGrid/drawingGrid.js');

angular.module('mms.diagramContainer', [
        'mms.drawingGrid',
        'isis.ui.contextmenu'

    ])
    .controller('DiagramContainerController', [
        '$scope',
        '$timeout',
        '$log',
        '$window',
        'componentBrowserService',
        '$rootScope',
        'componentServerUrl',
        'acmImportService',
        function($scope, $timeout, $log, $window, componentBrowserService, $rootScope, componentServerUrl, acmImportService) {

            var self = this,

                compiledDirectives,

                ScrollHandler,
                scrollHandler,
                getPositionFromEvent = function($event) {
                    var position,
                        x,
                        y;
                    if ($event && $event.originalEvent) {

                        x = $event.originalEvent.offsetX || $event.originalEvent.layerX || 100;
                        y = $event.originalEvent.offsetY || $event.originalEvent.layerY || 100;

                        position = {
                            x: x - 20,
                            y: y - 20
                        };

                    }

                    return position;
                };

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



            $scope.aFileWasDroppedOnMe = function(file, $event) {
                var position = getPositionFromEvent($event);

                acmImportService.storeDroppedAcm(file)
                    .then(function(url) {
                        $rootScope.$emit('componentInstantiationMustBeDone', url, position);
                    })
                    .catch(function(err) {
                        $log.error("Error creating drag-n-drop component: " + err);
                    });
            };

            $scope.somethingWasDroppedOnMe = function($event, $data) {

                var component,
                    position;

                component = componentBrowserService.getComponentById($data);

                if (component) {

                    position = getPositionFromEvent($event);

                    ga('send', 'event', 'avmComponent', 'dropped', component.id);

                    $rootScope.$emit('componentInstantiationMustBeDone',
                        componentServerUrl + '/getcomponent/download/' + component.id, position);
                }

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

        }
    ])
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

                    processDragOverOrEnter = function(event) {

                        if (!event || !event.dataTransfer.items || event.dataTransfer.items.length === 0 || event.dataTransfer.items[0].kind !== 'file') {
                            return false;
                        }
                        event.preventDefault();
                        if (event.dataTransfer.items[0].type === 'application/x-zip-compressed') {
                            event.dataTransfer.effectAllowed = 'copy';
                        } else {
                            event.dataTransfer.effectAllowed = 'none';
                        }
                        return false;

                    };

                    processDropHandler = function(event) {

                        if (!event || !event.dataTransfer.files || event.dataTransfer.files.length === 0) {
                            return false;
                        }
                        event.preventDefault();
                        scope.aFileWasDroppedOnMe(event.dataTransfer.files[0], event);
                        return false;

                    };

                    element.bind('dragover', processDragOverOrEnter);
                    element.bind('dragenter', processDragOverOrEnter);
                    element.bind('drop', processDropHandler);

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

                        $windowElement.unBind('resize', ctrl.scrollHandler.onWindowResize);

                        element.off();
                    });


                }

            };
        }
    ]);
