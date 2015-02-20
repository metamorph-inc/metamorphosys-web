/*globals angular, ga, $*/

'use strict';

// Move this to GME eventually

require('../drawingGrid/drawingGrid.js');

angular.module('mms.designVisualization.diagramContainer', [
        'mms.designVisualization.drawingGrid',
        'isis.ui.contextmenu'
    ])
    .controller('DiagramContainerController', [
        '$scope',
        '$timeout',
        '$log',
        '$window',
        'componentBrowserService',
        '$rootScope',
        function ($scope, $timeout, $log, $window, componentBrowserService, $rootScope) {

            var self = this,

                $windowElement,

                compiledDirectives,

                ScrollHandler,
                scrollHandler;

            compiledDirectives = {};

            ScrollHandler = require('./classes/ScrollHandler');
            scrollHandler = new ScrollHandler($scope, $timeout, $log);

            $windowElement = angular.element($window);

            $windowElement.bind(
                'resize', scrollHandler.onWindowResize
            );


            $scope.getCssClass = function () {

                var classString;

                classString = 'diagram-container';

                classString += ' zoom-level-' + $scope.zoomLevel;

                classString += self.isEditable() ? ' editable' : 'readonly';

                return classString;
            };


            $scope.somethingWasDroppedOnMe = function($event, $data) {

                var component,
                    position,
                    x,
                    y;

                component = componentBrowserService.getComponentById($data);

                if (component) {

                    if ($event && $event.originalEvent) {

                        x = $event.originalEvent.offsetX || 100;
                        y = $event.originalEvent.offsetY || 100;

                        position = {
                            x: x - 20,
                            y: y - 20
                        };

                    }

                    ga('send', 'event', 'avmComponent', 'dropped', component.id);

                    $rootScope.$emit('componentInstantiationMustBeDone', component, position);

                }

            };


            this.getVisibleArea = function () {
                return $scope.visibleArea;
            };

            this.getId = function () {

                var diagramId;

                if (angular.isObject($scope.diagram)) {
                    diagramId = $scope.diagram.id;
                }

                return diagramId;
            };

            this.getDiagram = function () {
                return $scope.diagram;
            };

            this.getZoomLevel = function () {
                return $scope.zoomLevel;
            };

            this.getCompiledDirective = function (directive) {
                return compiledDirectives[directive];
            };

            this.setCompiledDirective = function (directive, compiledDirective) {
                compiledDirectives[directive] = compiledDirective;
            };

            this.isEditable = function () {

                if (angular.isObject($scope.diagram)) {

                    $scope.diagram.config = $scope.diagram.config || {};

                    return $scope.diagram.config.editable === true;

                }

            };

            this.isComponentSelected = function (component) {

                if (angular.isObject($scope.diagram)) {

                    return $scope.diagram.state.selectedComponentIds.indexOf(component.id) > -1;

                }

            };

            this.getConfig = function () {
                return $scope.config;
            };

            this.setInitialized = function(val) {
                $scope.initialized = val;
            };

        }
    ])
    .directive('diagramContainer', [
        '$rootScope', 'diagramService', '$log', '$timeout',
        function ($rootScope, diagramService, $log, $timeout) {

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
                link: function (scope, element) {

                    var $element,
                        $contentPane;

                    $log.debug('In diagram container', scope.visibleArea);

                    scope.config = scope.config || {};

                    $element = scope.$element = $(element);

                    $contentPane = $element.find('.diagram-content-pane');

                    scope.$contentPane = element.find('>.diagram-content-pane');

                    $element.keyup(function (e) {
                        $timeout(function () {

                            scope.pressedKey = null;

                            $timeout(function () {

                                scope.$broadcast('keyupOnDiagram', e);

                            });

                        });
                    });

                    $element.keydown(function (e) {


                        $timeout(function () {

                            scope.pressedKey = e.keyCode;

                            scope.$broadcast('keydownOnDiagram', e);

                        });

                    });

                    $timeout(function() {
                        scope.$broadcast('DiagramContainerInitialized');
                    });


                }

            };
        }
    ]);

