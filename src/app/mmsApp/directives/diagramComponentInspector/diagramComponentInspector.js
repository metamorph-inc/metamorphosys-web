'use strict';

require('../contentEditable/contentEditable.js');
require('./inspectedContainerDetails.js');
require('./inspectedComponentDetails.js');

angular.module('mms.diagramComponentInspector', [
        'mms.diagramComponentInspector.inspectedContainerDetails',
        'mms.diagramComponentInspector.inspectedComponentDetails',
        'mms.contentEditable'
    ])
    .directive('diagramComponentInspector', [
        function() {

            function DiagramComponentInspectorController($scope, $rootScope) {

                var self = this;

                this.$rootScope = $rootScope;
                this.nameEditing = false;

                this.config = this.config || {
                    noInspectableMessage: 'Select a single diagram element to inspect.'
                };


                $scope.$watch(function() {
                    return self.inspectable;
                }, function(newVal, oldVal) {

                    if (newVal !== oldVal) {
                        self.nameEditing = false;
                    }

                });

            }

            DiagramComponentInspectorController.prototype.startNameEdit = function() {
                this.nameEditing = true;
            };

            DiagramComponentInspectorController.prototype.completeNameEdit = function(control) {

                control.$commitViewValue();
                this.$rootScope.$emit('componentNameMustBeSaved', this.inspectable);

                this.nameEditing = false;
            };

            DiagramComponentInspectorController.prototype.cancelNameEdit = function(control) {
                control.$rollbackViewValue();
                this.nameEditing = false;
            };

            DiagramComponentInspectorController.prototype.onKeyup = function(control, e) {
                
                if (e.keyCode === 27) {
                    this.cancelNameEdit(control);
                }

                if (e.keyCode === 13) {
                    this.completeNameEdit(control);                
                }
            };

            return {
                restrict: 'E',
                controller: DiagramComponentInspectorController,
                controllerAs: 'ctrl',
                bindToController: true,
                replace: true,
                transclude: true,
                templateUrl: '/mmsApp/templates/diagramComponentInspector.html',
                require: [],
                scope: {
                    inspectable: '='
                }
            };
        }
    ]);
