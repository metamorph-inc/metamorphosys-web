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

                var self = this;
                
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

                this.onNameChange = function() {
                };

                this.nameInputKeys = function(e) {

                 if (e.keyCode === 27) {
                      self.nameForm.name.$rollbackViewValue();
                    }
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
