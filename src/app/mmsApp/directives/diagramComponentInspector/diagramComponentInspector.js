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

            function DiagramComponentInspectorController($scope, $http) {

                var self = this;

                this.config = this.config || {
                    noInspectableMessage: 'Select a single diagram element to inspect.'
                };

                this.classificationTags = [];


                $scope.$watch(function() {
                    return self.inspectable;
                }, function(newInspectable, oldInspectable) {

                    if (newInspectable !== oldInspectable) {

                        self.classificationTags = [];

                        if (newInspectable) {

                            if(newInspectable.metaType === 'AVMComponent') {

                                if (newInspectable.details) {

                                    if (!newInspectable.details.acmInfo) {

                                        if (newInspectable.details.resource) {

                                            $http.get('/rest/external/acminfo/' + newInspectable.details.resource)
                                            .then(function(response){

                                                if (response.data) {

                                                    if (angular.isString(response.data.classification)) {

                                                        response.data.classification.split('.').map(function(className) {

                                                            newInspectable.classificationTags.push({
                                                                id: className,
                                                                name: className.replace(/_/g, ' ')
                                                            });
                                                        });
                                                    }

                                                    newInspectable.details.properties = [];

                                                    angular.forEach(response.data.properties, function(prop, propName) {

                                                        newInspectable.details.properties.push({
                                                            name: propName,
                                                            value: prop.value,
                                                            unit: prop.unit
                                                        });

                                                    });

                                                    if (angular.isString(response.data.name)) {
                                                        response.data.name.replace(/_/g, ' ');
                                                    }
                                                    
                                                    newInspectable.details.acmInfo = response.data;

                                                }

                                            });

                                        }

                                    }

                                }

                            }

                        }
                    }

                });


            }

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
