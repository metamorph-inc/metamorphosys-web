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

        function getSIPrefix(number) {
            var ranges = [
                { divider: 1e18, suffix: 'P' },
                { divider: 1e15, suffix: 'E' },
                { divider: 1e12, suffix: 'T' },
                { divider: 1e9, suffix: 'G' },
                { divider: 1e6, suffix: 'M' },
                { divider: 1e3, suffix: 'k' },
                { divider: 1, suffix: '' },
                { divider: 1e-3, suffix: 'm' },
                { divider: 1e-6, suffix: 'μ' },
                { divider: 1e-9, suffix: 'n' },
                { divider: 1e-12, suffix: 'p' },
                { divider: 1e-15, suffix: 'f' }
            ];

            function formatNumber(n) {
                for (var i = 0; i < ranges.length; i++) {
                    if (n >= ranges[i].divider) {
                        return (n / ranges[i].divider).toFixed(2).toString() + ranges[i].suffix;
                    }
                }
                return n.toString();
            }
            return formatNumber(number);
        }

        function ResultDetailsController($log, $q, $http, projectHandling, nodeService) {

            this.noInspectedMessage = "View the SPICE simulation results for a signal by selecting its wire in the diagram.";

            var self = this,
                parentContext = projectHandling.getContainerLayoutContext(),
                context;

            this.removeSignal = function(context, index) {
                context.$parent.$parent.ctrl.ports.splice(index, 1);
            };

            this.pinSignal = function(context, index) {

                var pinEl = document.getElementById(index);

                if (pinEl) {
                    if (pinEl.classList.contains('pinned')) {
                        pinEl.classList.remove('pinned');
                    }
                    else {
                        pinEl.classList.add('pinned');
                    }
                }
            };

            this.toggleHideSignal = function(context) {
                context.port.showSignal = !context.port.showSignal;
            };

            this.cleanup = function () {
                if (context) {
                    nodeService.cleanUpRegion(context.db, context.regionId);
                    context = undefined;
                }
                self.ports = undefined;
            };

            this.setInspectedWire = function (wire) {

                this.cleanup();

                if (!wire) {
                    return;
                }
                var regionId = parentContext.regionId + '_spice_result_' + Date.now();

                context = {
                    db: parentContext.db,
                    regionId: regionId
                };

                var siginfo = $http.get('/rest/blob/view/' + this.result.resultHash + '/results/siginfo.json');
                var netdata = $http.get('/rest/blob/view/' + this.result.resultHash + '/results/netdata.json');

                this.inspectedWire = wire;

                nodeService.getMetaNodes(context)
                    .then(function (meta) {
                        return nodeService.loadNode(context, wire.getEnd1().port.id)
                            .then(function (connector) {
                                return $q.all([connector.loadChildren(), connector.getParentNode()])
                                    .then(function (args) {
                                        var gmePorts = args[0],
                                            connectorParent = args[1];
                                        return $q.all([siginfo, netdata]).then(function (args) {
                                            var siginfo = args[0].data;
                                            var netdata = args[1].data;
                                            var getSigInfoId = function (port) {
                                                var id;
                                                if (connectorParent.getMetaTypeName(meta) === 'AVMComponentModel') {
                                                    var ids = connectorParent.getId().split('/');
                                                    ids.pop();
                                                    id = 'id' + (ids.join('/')).substr(projectHandling.getSelectedDesignId().length).replace('/', '.');
                                                    id = id + '/' + connectorParent.getAttribute('InstanceID');
                                                } else {
                                                    id = 'id' + connectorParent.getId().substr(projectHandling.getSelectedDesignId().length).replace('/', '.');
                                                }
                                                id = id + '/' + (connector.getAttribute('ID') || connector.getGuid());
                                                id = id + '/' + (port.getAttribute('ID') || port.getGuid());
                                                return id;
                                            };
                                            self.ports = gmePorts.map(function (port) {
                                                var net = siginfo.objectToNetId[getSigInfoId(port)];
                                                if (net == null) {
                                                    return undefined;
                                                }
                                                return {
                                                    visualUrl: '/rest/blob/view/' + self.result.resultHash + '/results/net' + net + '.png',
                                                    name: port.getAttribute('name'),
                                                    showSignal: true,
                                                    minVoltage: getSIPrefix(netdata[net].min),
                                                    maxVoltage: getSIPrefix(netdata[net].max)
                                                };
                                            }).filter(function (port) {
                                                return port;
                                            });
                                            self.ports.sort(function (a, b) {
                                                return a.name.localeCompare(b.name);
                                            });
                                            $log.info(self.ports);
                                        });

                                    });
                            });
                    })
                    .catch(function (err) {
                        $log.error(err);
                    });
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
                    downloadUrl = '/rest/blob/download/' + ctrl.result.resultHash,
                    off;

                ctrl.setInspectedWire(designEditorController.inspectableWire);

                designEditorController.viewingWireResult = true;

                off = $rootScope.$on("inspectableWireHasChanged", function ($event, wire) {
                    ctrl.setInspectedWire(wire);
                });

                scope.$on('$destroy', function () {
                    designEditorController.viewingWireResult = false;
                    off();
                    ctrl.cleanup();
                });

            }
        };

    });
