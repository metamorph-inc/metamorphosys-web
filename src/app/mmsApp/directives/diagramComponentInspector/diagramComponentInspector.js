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

            function DiagramComponentInspectorController() {

                this.nameEditing = false;

                this.config = this.config || {
                    noInspectableMessage: 'Select a single diagram element to inspect.'
                };

                this.startNameEdit = function() {
                    this.nameEditing = true;
                }; 

                this.finishNameEdit = function() {
                    this.nameEditing = false;
                }; 

            }



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
                    inspectable: '=',
                    config: '@'
                }
            };
        }
    ]);
