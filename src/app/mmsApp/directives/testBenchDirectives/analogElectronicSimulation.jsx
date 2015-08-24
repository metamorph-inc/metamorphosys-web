/* globals ga*/

'use strict';

angular.module('mms.testBenchDirectives', ['ngAnimate'])
    .run(function (testBenchService) {

        testBenchService.registerTestBenchDirectives(
            'Analog Electronic Simulation',
            {
                config: 'cost-estimation-config', // TODO: do we need a new config directive?
                resultCompact: 'analog-electronic-simulation-result-compact',
                resultDetails: 'analog-electronic-simulation-result-details'
            }
        );

        testBenchService.registerTestBenchDescription(
            'Analog Electronic Simulation',
            'This test bench simulates the analog behavior of the circuit.'
        );

    })

    .directive('analogElectronicSimulationResultCompact', function () {

        function TestBenchResultCompactController() {

        }

        return {
            restrict: 'E',
            controller: TestBenchResultCompactController,
            controllerAs: 'ctrl',
            bindToController: true,
            replace: true,
            transclude: false,
            scope: {
                result: '='
            },
            templateUrl: '/mmsApp/templates/analogElectronicSimulationResultCompact.html',
            require: ['analogElectronicSimulationResultCompact', '^testBenchResultOpener'],
            link: function (s, element, attributes, controllers) {

                var ctrl = controllers[0],
                    openerController = controllers[1],
                    downloadUrl = '/rest/blob/download/' + ctrl.result.resultHash;

                openerController.resultsOpener = function () {
                        ga('send', 'event', 'testbench', 'result', ctrl.result.id);
                        window.location = downloadUrl;
                    };
            }
        };

    })

    .directive('analogElectronicSimulationResultDetails', function ($rootScope) {

        function ResultDetailsController() {

            this.noInspectedMessage = "View the SPICE simulation results for a signal by selecting its wire in the diagram.";
            this.inspectedWire = null;

            var wireDetails;

            this.getWireDetails = function() {
                var wireEnds = this.inspectedWire.getEnds();

                wireDetails = { componentA: wireEnds.end1.component.label || "Unnamed",
                                portA: wireEnds.end1.port.portSymbol.label || "Unnamed",
                                componentB: wireEnds.end2.component.label || "Unnamed",
                                portB: wireEnds.end2.port.portSymbol.label || "Unnamed"
                              };
            };

            this.getDetailDescription = function() {

                this.getWireDetails();

                return ["Results of SPICE simulation for wire connecting port " + wireDetails.portA + " of ",
                        "component " + wireDetails.componentA + " and port " + wireDetails.portB,
                        " of component " + wireDetails.componentB + "."].join('');
            };

        }

        return {
            restrict: 'E',
            controller: ResultDetailsController,
            controllerAs: 'ctrl',
            bindToController: true,
            replace: true,
            transclude: false,
            scope: {
                result: '='
            },
            templateUrl: '/mmsApp/templates/analogElectronicSimulationResultDetails.html',
            require: ['analogElectronicSimulationResultDetails', '^designEditor'],
            link: function (scope, element, attributes, controllers) {

                var ctrl = controllers[0],
                    designEditorController = controllers[1],
                    downloadUrl = '/rest/blob/download/' + ctrl.result.resultHash;


                var visualUrl = '/rest/blob/view/' + ctrl.result.resultHash + '/results/spice-plot.png';

                ctrl.visualUrl = '/images/spice_plot_example.png';

                ctrl.inspectedWire = designEditorController.inspectableWire;

                designEditorController.viewingWireResult = true;

                $rootScope.$on("inspectableWireHasChanged", function($event, wire) {
                    ctrl.inspectedWire = wire;
                });

                scope.$on('$destroy', function() {
                    designEditorController.viewingWireResult = false;
                });

            }
        };

    });
