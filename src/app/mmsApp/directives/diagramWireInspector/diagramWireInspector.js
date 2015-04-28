'use strict';

require('../contentEditable/contentEditable.js');

angular.module('mms.diagramWireInspector', [
        'mms.contentEditable'
    ])
    .directive('diagramWireInspector', [
        function() {

            function DiagramComponentInspectorController($scope, $rootScope, $http, diagramService) {

                var self = this,
                    initialized = false;

                this.$rootScope = $rootScope;

                this.config = this.config || {
                    noInspectableMessage: 'Select a single wire element to inspect.'
                };

                this.componentA = null;
                this.componentB = null;

                function initComponentDetails(wireId) {

                    self.wire = self.diagram.getWireById(wireId);

                    if (self.wire) {

                        self.componentA = {
                            id: self.wire._end1.component.id,
                            label: self.wire._end1.component.label,
                            classificationTags: self.wire._end1.component.classificationTags,
                            portLabel: self.wire._end1.port.portSymbol.label
                        };

                        self.componentB = {
                            id: self.wire._end2.component.id,                            
                            label: self.wire._end2.component.label,
                            classificationTags: self.wire._end2.component.classificationTags,                            
                            portLabel: self.wire._end2.port.portSymbol.label                            
                        };

                        initialized = true;

                    } else {

                        initialized = false;

                        self.componentA = null;
                        self.componentB = null;

                    }

                }

                $scope.$watch(function() {
                        return self.inspectableWireId;
                    }, function(newInspectableId, oldInspectableId) {

                        if (newInspectableId !== oldInspectableId || !initialized) {
                            initComponentDetails(newInspectableId);
                        }
                    }

                );


                initComponentDetails();

            }

            DiagramComponentInspectorController.prototype.selectComponent = function(id) {
                this.diagram.selectComponent(id);
            };

            return {
                restrict: 'E',
                controller: DiagramComponentInspectorController,
                controllerAs: 'ctrl',
                bindToController: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/diagramWireInspector.html',
                require: [],
                scope: {
                    inspectableWireId: '=',
                    diagram: '='
                }
            };
        }
    ]);
