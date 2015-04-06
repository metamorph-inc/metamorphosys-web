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

                this.$rootScope = $rootScope;
                this.nameEditing = false;

                this.config = this.config || {
                    noInspectableMessage: 'Select a single diagram element to inspect.'
                };

            }


            DiagramComponentInspectorController.prototype.commitName = function(control) {

                this.$rootScope.$emit('componentLabelMustBeSaved', this.inspectable);

            };

            DiagramComponentInspectorController.prototype.isNameValid = function(data) {

                if (data.length < 1 || data.length > 20) {
                    return 'Name should be between 1 and 20 characters long!';
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
