/* globals ga d3*/

'use strict';

angular.module('mms.testBenchDirectives')
    .run(function (testBenchService) {

        testBenchService.registerTestBenchDirectives(
            'Analog Electronic Simulation',
            {
                config: 'analog-electronic-simulation-config',
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

    .directive('analogElectronicSimulationResultDetails', function ($rootScope, $timeout) {

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
                var sign = '';
                if (n < 0) {
                    n = -n;
                    sign = '-';
                }
                for (var i = 0; i < ranges.length; i++) {
                    if (n >= ranges[i].divider) {
                        return sign + (n / ranges[i].divider).toFixed(2).toString() + ranges[i].suffix;
                    }
                }
                return n.toString();
            }
            return formatNumber(number);
        }

        function ResultDetailsController($log, $q, $http, projectHandling, nodeService, $mdDialog) {

            this.noInspectedMessage = "View the SPICE simulation results for a signal by selecting its wire in the diagram.";

            // TODO: These properties/functions should be defined/created in a separate module/widget in the future.
            this.visualizer = {
                margin: null,
                width: null,
                height: null,
                chartHandle: null,
                plotAreaHandle: null,
                xScale: null,
                yScale: null,
                xAxis: null,
                yAxis: null,
                navChartHandle: null,
                navWidth: null,
                navHeight: null,
                navXScale: null,
                navYScale: null,
                navXAxis: null,
                overlay: null,
                viewport: null,
                line: null,
                navLine: null,
                zoom: null,
                redrawChart: null,
                defaultDomainX: [0.0, 1.0],
                defaultDomainY: [-12, 12],
                domainX: [0.0, 1.0],
                domainY: [-12, 12],
                xlimits: [0.0, 1.0],
                ylimits: [-12, 12],
                colorPalette: d3.scale.category20(),
                reapplyOverlay: null,
                updateVisualizer: null,
                updateViewportFromChart: null,
                tooltipGuide: null
            };

            this.visualizer.openHelpDialog = function (ev) {

                function DialogController($scope) {

                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.close = function () {
                        $mdDialog.hide();
                    };

                    $scope.keyboardMap = require('./visualizerControlsRegistry.js');
                }

                ga('send', 'event', 'spiceVisualizerHelpDialog', 'open');

                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: '/mmsApp/templates/visualizerHelpDialog.html',
                    targetEvent: ev
                })
                    .then(function () {
                    });
            };

            var self = this,
                parentContext = projectHandling.getContainerLayoutContext(),
                context,
                line;

            this.pinnedSignals = [];
            this.outputUnit = "V";

            this.getSIPrefixMetric = function(metric) {
                return getSIPrefix(metric);
            };

            this.toggleSignalPin = function(context) {

                if (context.port.pinned) {
                    var pinnedSignalIndex = self.pinnedSignals.map(function(s) {
                            return s.id;
                        }).indexOf(context.port.id);

                    self.pinnedSignals.splice(pinnedSignalIndex, 1);

                    context.port.pinned = false;

                }
                else {

                    context.port.pinned = true;
                    this.pinnedSignals.push(context.port);

                }
            };

            this.updateVisualizer = function(port) {

                self.visualizer.chartHandle.select('.line.' + port.name).classed('hidden', !port.showSignal);
                self.visualizer.navChartHandle.select('.navline.' + port.name).classed('hidden', !port.showSignal);

                self.visualizer.updateVisualizer(self.ports);
            };

            this.cleanup = function () {
                if (context) {
                    nodeService.cleanUpRegion(context.db, context.regionId);
                    context = undefined;
                }
                self.ports = undefined;
            };

            this.createSeriesTooltip = function(chartHandle, seriesLabel) {
                var tooltip;

                tooltip = chartHandle.append('g')
                    .attr('class', 'tooltip ' + seriesLabel)
                    .style('opacity', 0);

                tooltip.append('path')
                    .attr('class', 'tooltip-box')
                    .attr('d', 'm0,10l5,-10l85,0l0,20l-85,0l-5,-10z');

                tooltip.append('text')
                    .attr('class', 'tooltip-text')
                    .attr('x', 5).attr('y', 14);

                return tooltip;

            };

            this.addSeries = function (data, label) {
                if (data.length <= 1) {
                    console.warn(["Spice data set for signal " + label + " does not have at least two points!",
                        " This signal will not be added to the plot."].join(""));

                    return null;
                }
                else {
                    return self.visualizer.plotAreaHandle.append('path')
                        .attr('class', 'line ' + label)
                        .attr('d', self.visualizer.line(data));
                }
            };

            this.addNavigatorSeries = function(data, label) {
                return self.visualizer.navChartHandle.append('path')
                     .attr('class', 'navline ' + label)
                     .attr('d', self.visualizer.navLine(data));
            };

            this.removeSeries = function (data, label) {
                if (label) {
                    self.visualizer.plotAreaHandle.selectAll('path.line.' + label).remove();
                    self.visualizer.navChartHandle.selectAll('path.navline.' + label).remove();
                    self.visualizer.chartHandle.select('.tooltip.' + label).remove();
                }
            };

            this.getSeriesColor = function(context) {
                return context.plotSeriesHandle.attr('stroke');
            };

            this.removeUnpinnedSeries = function() {

                angular.forEach(self.ports, function(port) {
                    if (self.pinnedSignals.indexOf(port) === -1) {
                        self.removeSeries(port.plotSeriesHandle, port.name);
                    }
                });

                self.visualizer.plotAreaHandle.selectAll('path.overlay').remove();

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

                                            $q.all(gmePorts.map(function (port) {
                                                var net = siginfo.objectToNetId[getSigInfoId(port)];

                                                 if (net == null) {
                                                    return undefined;
                                                }

                                                return $http.get('/rest/blob/view/' + self.result.resultHash + '/results/net' + net + '.json')
                                                    .then(function(netSignal) {

                                                        var sigLabel = port.getAttribute('name'),

                                                            match = self.pinnedSignals.filter(function(signal) {
                                                                return signal.id === port.id;
                                                            });

                                                        if (match.length) {
                                                            return undefined;
                                                        }

                                                        return {
                                                            id: port.id,
                                                            visualUrl: '/rest/blob/view/' + self.result.resultHash + '/results/net' + net + '.png',
                                                            name: sigLabel,
                                                            showSignal: true,
                                                            minVoltage: netdata[net].min,
                                                            maxVoltage: netdata[net].max,
                                                            netData: netSignal.data,
                                                            plotSeriesHandle: self.addSeries(netSignal.data, sigLabel),
                                                            navigatorSeriesHandle: self.addNavigatorSeries(netSignal.data, sigLabel),
                                                            tooltipHandle: self.createSeriesTooltip(self.visualizer.chartHandle, sigLabel)
                                                        };


                                                    });
                                            }))
                                            .then(function(ports) {
                                                self.ports = ports.filter(function (port) {
                                                    return port;
                                                });
                                                self.ports.sort(function (a, b) {
                                                    return a.name.localeCompare(b.name);
                                                });

                                                // Ensure no duplicate port indices when clicking between wires with pinned signals.
                                                var trueIndex = 0,
                                                    getNextTrueIndex = function(idx) {
                                                        if (self.pinnedSignals.filter(function(s) { return s.index === idx; }).length) {
                                                            idx += 1;
                                                            return getNextTrueIndex(idx);
                                                        }
                                                        else {
                                                            return idx;
                                                        }
                                                    };
                                                angular.forEach(self.ports, function(port) {

                                                    trueIndex = getNextTrueIndex(trueIndex);

                                                    port.index = trueIndex;

                                                    // Colorize signals
                                                    port.plotSeriesHandle.attr('stroke', function() { return self.visualizer.colorPalette(port.index); });
                                                    port.tooltipHandle.attr('fill', self.visualizer.colorPalette(port.index));

                                                    trueIndex++;
                                                });

                                                self.ports = self.pinnedSignals.concat(self.ports);
                                            });

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
                    off,

                    visualizer = ctrl.visualizer;

                ctrl.setInspectedWire(designEditorController.inspectableWire);
                ctrl.displayNoInspectedMessage = designEditorController.inspectableWire === null ? true : false;

                designEditorController.viewingWireResult = true;

                off = $rootScope.$on("inspectableWireHasChanged", function ($event, wire) {
                    ctrl.removeUnpinnedSeries();
                    ctrl.setInspectedWire(wire);

                    ctrl.displayNoInspectedMessage = wire === null ? true : false;
                });

                scope.$on('$destroy', function () {
                    designEditorController.viewingWireResult = false;
                    off();
                    ctrl.cleanup();
                });

                scope.$watch(function() {

                    return ctrl.ports;

                }, function(newVal, oldVal) {

                    if (newVal !== oldVal) {

                        if (newVal !== undefined) {
                            visualizer.updateVisualizer(newVal);
                        }

                    }

                });

                visualizer.updateVisualizer = function(ports) {
                    visualizer.updateScales(ports);
                    visualizer.setZoomBehavior();
                    visualizer.reapplyOverlay();
                    visualizer.redrawChart();
                    visualizer.redrawNavigator();
                    visualizer.updateZoomFromChart();
                    visualizer.updateViewportFromChart();

                    $timeout(function() {
                        angular.forEach(document.getElementsByClassName('navline'), function(navline) {
                            // This needs to be removed first in order to check what the path bounding box size is.
                            navline.classList.remove('flatline');

                            if (navline.getBoundingClientRect().height <= 0.1) {
                                navline.classList.add('flatline');
                            }

                        });
                    });
                };

                function initializeVisualizer() {

                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    /// The main chart

                    // Set up chart area

                    visualizer.margin = {top: 5, right: 40, bottom: 40, left: 60};
                    visualizer.topLevelPlotEl = d3.select('#spice-visualizer').classed('spice-visualizer', true);

                    visualizer.width = parseFloat(visualizer.topLevelPlotEl.style("width")) - visualizer.margin.left - visualizer.margin.right;
                    visualizer.height = 0.25 * parseFloat(visualizer.topLevelPlotEl.style("width")) - visualizer.margin.top - visualizer.margin.bottom;

                    // PreserveAspectRatio and svg-content-responsive allow for chart to be adjusted after window resizing.
                    visualizer.chartHandle = visualizer.topLevelPlotEl.append('svg')
                        .attr('class', 'chart')
                        .attr("preserveAspectRatio", "xMinYMin meet")
                        .attr("viewBox", "0 0 " + (visualizer.width + visualizer.margin.left + visualizer.margin.right) + " " + (visualizer.height + visualizer.margin.top + visualizer.margin.bottom))
                        .classed("svg-content-responsive", true)
                        .append('g')
                        .attr('transform', 'translate(' + visualizer.margin.left + ',' + visualizer.margin.top + ')');

                    visualizer.plotAreaHandle = visualizer.chartHandle.append('g')
                        .attr('clip-path', 'url(#plotAreaClip)')
                        .attr('id', 'plotArea');

                    visualizer.plotAreaHandle.append('clipPath')
                        .attr('id', 'plotAreaClip')
                        .append('rect')
                        .attr({ width: visualizer.width, height: visualizer.height });

                    // Scales. Scales have both a domain and a range.

                    visualizer.xScale = d3.scale.linear()
                        .domain(visualizer.domainX)
                        .range([0, visualizer.width]);

                    visualizer.yScale = d3.scale.linear()
                        .domain(visualizer.domainY).nice()
                        .range([visualizer.height, 0]);

                    // Axes. tickSize set up so lines are drawn across entire plot dimensions.

                    visualizer.xAxis = d3.svg.axis()
                        .scale(visualizer.xScale)
                        .orient('bottom')
                        .tickFormat(d3.format('.3f'))
                        .tickSize(-visualizer.height);

                    visualizer.yAxis = d3.svg.axis()
                        .scale(visualizer.yScale)
                        .orient('left')
                        .tickSize(-visualizer.width)
                        .tickFormat(d3.format('.3f'))
                        .ticks(5);

                    visualizer.chartHandle.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + visualizer.height + ')')
                        .call(visualizer.xAxis);

                    visualizer.chartHandle.append('g')
                        .attr('class', 'y axis')
                        .call(visualizer.yAxis);

                    // Axis labels

                    visualizer.chartHandle.append("text")
                        .attr("transform", "translate(" + (visualizer.width / 2) + " ," + (visualizer.height + visualizer.margin.bottom - 5) + ")")
                        .attr('class', 'axislabel')
                        .style("text-anchor", "middle")
                        .text("Time (s)");

                    visualizer.chartHandle.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 0 - visualizer.margin.left)
                        .attr("x", 0 - (visualizer.height / 2))
                        .attr("dy", "1em")
                        .attr('class', 'axislabel')
                        .style("text-anchor", "middle")
                        .text("Voltage (V)");

                    // Tooltip guide - Vertical line that is drawn from the mouse x-position to show each series' y-value at that position.

                    visualizer.tooltipGuide = visualizer.chartHandle.append('line')
                        .attr('class', 'tooltip-guide')
                        .attr('x1', 0).attr('x2', 0)
                        .attr('y1', 0).attr('y2', visualizer.height)
                        .style('opacity', 0);

                    // Line function that generates a line from a set of [X, Y] data points.

                    visualizer.line = d3.svg.line()
                        .x(function(data) { return visualizer.xScale(data[0]); })
                        .y(function(data) { return visualizer.yScale(data[1]); });



                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    /// Navigation Chart

                    // Drawing area setup

                    visualizer.navWidth = visualizer.width;
                    visualizer.navHeight = 100 - visualizer.margin.top - visualizer.margin.bottom;

                    visualizer.navChartHandle = d3.select('#spice-visualizer').classed('spice-visualizer', true).append('svg')
                        .classed('navigator', true)
                        .attr("preserveAspectRatio", "xMinYMin meet")
                        .attr("viewBox", "0 0 " + (visualizer.navWidth + visualizer.margin.left + visualizer.margin.right) + " " + (visualizer.navHeight + visualizer.margin.top + visualizer.margin.bottom))
                        .attr("svg-content-response", true)
                        .append('g')
                        .attr('transform', 'translate(' + visualizer.margin.left + ',' + visualizer.margin.top + ')');

                    // Scales

                    visualizer.navXScale = d3.scale.linear()
                            .domain(visualizer.domainX)
                            .range([0, visualizer.navWidth]);
                    visualizer.navYScale = d3.scale.linear()
                        .domain(visualizer.domainY)
                        .range([visualizer.navHeight, 0]);

                    // Axis. Only care to show X-axis for this mini-chart.

                    visualizer.navXAxis = d3.svg.axis()
                        .scale(visualizer.navXScale)
                        .orient('bottom');

                    visualizer.navChartHandle.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + visualizer.navHeight + ')')
                        .call(visualizer.navXAxis);

                    // Line function that generates a line from a set of [X, Y] data points.
                    visualizer.navLine = d3.svg.line()
                        .x(function (data) { return visualizer.navXScale(data[0]); })
                        .y(function (data) { return visualizer.navYScale(data[1]); });


                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    /// Viewport

                    // Set initial viewport brush
                    visualizer.viewport = d3.svg.brush()
                        .x(visualizer.navXScale)
                        .on("brush", function () {
                            visualizer.xScale.domain(visualizer.viewport.empty() ? visualizer.navXScale.domain() : visualizer.viewport.extent());
                            visualizer.redrawChart();
                        });

                    visualizer.navChartHandle.append("g")
                        .attr("class", "viewport")
                        .call(visualizer.viewport)
                        .selectAll("rect")
                        .attr("height", visualizer.navHeight);

                    visualizer.setViewportBrush = function() {
                        if (visualizer.zoomMethods.x.active) {
                            visualizer.viewport.clear();
                            visualizer.viewport = d3.svg.brush()
                                .x(visualizer.navXScale)
                                .on("brush", function () {
                                    visualizer.xScale.domain(visualizer.viewport.empty() ? visualizer.navXScale.domain() : visualizer.viewport.extent());
                                    visualizer.redrawChart();
                                });
                        }
                        else {
                            visualizer.viewport = d3.svg.brush()
                                .x(visualizer.navXScale)
                                .y(visualizer.navYScale)
                                .on("brush", function () {
                                    var extent = visualizer.viewport.extent();
                                    visualizer.xScale.domain(visualizer.viewport.empty() ? visualizer.navXScale.domain() : [extent[0][0], extent[1][0]]);
                                    visualizer.yScale.domain(visualizer.viewport.empty() ? visualizer.navYScale.domain() : [extent[0][1], extent[1][1]]);
                                    visualizer.redrawChart();
                                });
                        }

                        visualizer.viewport.on("brushend", function () {
                            visualizer.updateZoomFromChart();
                        });
                    };

                    // Update viewport from zoom/pan actions in main chart
                    visualizer.updateViewportFromChart = function() {

                        var pastXDomain = (visualizer.xScale.domain()[0] <= visualizer.domainX[0]) && (visualizer.xScale.domain()[1] >= visualizer.domainX[1]),
                            pastYDomain = (visualizer.yScale.domain()[0] <= visualizer.domainY[0]) && (visualizer.yScale.domain()[1] >= visualizer.domainY[1]);

                        if (visualizer.zoomMethods.x.active) {
                            if (pastXDomain) {
                                visualizer.viewport.clear();
                            }
                            else {
                                visualizer.viewport.extent(visualizer.xScale.domain());
                            }
                        }
                        else {

                            if (pastXDomain && pastYDomain) {

                                visualizer.viewport.clear();

                            }
                            else {

                                var xd = visualizer.xScale.domain(),
                                    yd = visualizer.yScale.domain();

                                visualizer.viewport.extent([[xd[0], yd[0]], [xd[1], yd[1]]]);

                            }
                        }

                        visualizer.navChartHandle.select('.viewport').call(visualizer.viewport);
                    };


                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    /// Zooming and Panning

                    visualizer.zoomMethods = {
                        x: { active: true, brush: null, zoomBehavior: null },
                        box: { active: false, brush: null, zoomBehavior: null }
                    };

                    visualizer.zoomMethods.x.zoomBehavior = function() {

                        if (visualizer.xScale.domain()[0] < visualizer.domainX[0]) {

                            visualizer.zoom.translate([visualizer.zoom.translate()[0] - visualizer.xScale(visualizer.domainX[0]) + visualizer.xScale.range()[0], 0]);

                        } else if (visualizer.xScale.domain()[1] > visualizer.domainX[1]) {

                            visualizer.zoom.translate([visualizer.zoom.translate()[0] - visualizer.xScale(visualizer.domainX[1]) + visualizer.xScale.range()[1], 0]);
                        }

                        visualizer.xScale.domain([Math.max(visualizer.xScale.domain()[0], visualizer.xlimits[0]), Math.min(visualizer.xScale.domain()[1], visualizer.xlimits[1])]);

                        visualizer.redrawChart();
                        visualizer.updateViewportFromChart();
                    };

                    visualizer.zoomMethods.box.zoomBehavior = function() {

                        var tx = visualizer.zoom.translate()[0],
                            ty = visualizer.zoom.translate()[1];

                        if (visualizer.xScale.domain()[0] < visualizer.domainX[0]) {

                            visualizer.zoom.translate([tx - visualizer.xScale(visualizer.domainX[0]) + visualizer.xScale.range()[0], ty]);

                        } else if (visualizer.xScale.domain()[1] > visualizer.domainX[1]) {

                            visualizer.zoom.translate([tx - visualizer.xScale(visualizer.domainX[1]) + visualizer.xScale.range()[1], ty]);
                        }

                        if (visualizer.yScale.domain()[0] < visualizer.domainY[0]) {

                            visualizer.zoom.translate([tx, ty - visualizer.yScale(visualizer.domainY[0]) + visualizer.yScale.range()[0]]);

                        } else if (visualizer.yScale.domain()[1] > visualizer.domainY[1]) {

                            visualizer.zoom.translate([tx, ty - visualizer.yScale(visualizer.domainY[1]) + visualizer.yScale.range()[1]]);

                        }

                        visualizer.xScale.domain([Math.max(visualizer.xScale.domain()[0], visualizer.xlimits[0]), Math.min(visualizer.xScale.domain()[1], visualizer.xlimits[1])]);
                        visualizer.yScale.domain([Math.max(visualizer.yScale.domain()[0], visualizer.ylimits[0]), Math.min(visualizer.yScale.domain()[1], visualizer.ylimits[1])]);

                        visualizer.redrawChart();
                        visualizer.updateViewportFromChart();
                    };

                    // Redefines what happens when user zooms/pans. Scales also need to be reset as one uses the y-axis.
                    visualizer.setZoomBehavior = function() {
                        if (visualizer.zoomMethods.x.active) {
                            visualizer.zoom = d3.behavior.zoom()
                                .x(visualizer.xScale)
                                .on('zoom', function() {
                                    visualizer.zoomMethods.x.zoomBehavior();
                                });
                        }
                        else {
                            visualizer.zoom = d3.behavior.zoom()
                                .x(visualizer.xScale)
                                .y(visualizer.yScale)
                                .on('zoom', function() {
                                    visualizer.zoomMethods.box.zoomBehavior();
                                });
                        }
                    };

                    // Menu buttons that toggle the zoom method
                    visualizer.zoomMenuButtons = {
                        x: document.querySelector("#zoom-button.x-zoom"),
                        box: document.querySelector("#zoom-button.box-zoom")
                    };

                    // Initial zoom behavior
                    visualizer.zoom = d3.behavior.zoom()
                        .x(visualizer.xScale)
                        .on('zoom', function() {
                            visualizer.zoomMethods.x.zoomBehavior();
                        });

                    // Invisible 'blanket' div that mouse actions are applied too. Otherwise zoom/pan would only work when exactly on data points.
                    visualizer.overlay = d3.svg.area()
                        .x(function (data) { return visualizer.xScale(data[0]); })
                        .y0(0)
                        .y1(visualizer.height);

                    // Overlay needs to be reapplied when the chart size changes
                    visualizer.reapplyOverlay = function() {
                        visualizer.plotAreaHandle.selectAll('path.overlay').remove();

                        if (ctrl.ports && ctrl.ports.length) {
                            visualizer.plotAreaHandle.append('path')
                                .attr('class', 'overlay')
                                .attr('d', visualizer.overlay(ctrl.ports[0].netData))
                                .call(visualizer.zoom)
                                .on("dblclick.zoom", function() {
                                    d3.transition().duration(750).tween("zoom", function() {
                                        var ix = d3.interpolate(visualizer.xScale.domain(), visualizer.domainX),
                                            iy = d3.interpolate(visualizer.yScale.domain(), visualizer.domainY);
                                        return function(t) {
                                            visualizer.zoom.x(visualizer.xScale.domain(ix(t)))
                                                           .y(visualizer.yScale.domain(iy(t)));
                                            visualizer.redrawChart();
                                            visualizer.updateZoomFromChart();
                                            visualizer.updateViewportFromChart();

                                            // We just applied a function for zooming in y, need to reset the zoom.
                                            if (visualizer.zoomMethods.x.active) {
                                                visualizer.setZoomBehavior();
                                                visualizer.reapplyOverlay();
                                            }
                                        };
                                    });
                                });
                            }
                    };

                    // Update main chart from brush actions on navigator
                    visualizer.updateZoomFromChart = function() {

                        visualizer.zoom.x(visualizer.xScale);

                        if (visualizer.zoomMethods.box.active) {
                            visualizer.zoom.y(visualizer.yScale);
                        }

                        var fullDomain = visualizer.domainX[1],
                            currentDomain = visualizer.xScale.domain()[1] - visualizer.xScale.domain()[0];

                        var minScale = currentDomain / fullDomain,
                            maxScale = minScale * 40;

                        visualizer.zoom.scaleExtent([minScale, maxScale]);
                    };


                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    /// Helper Methods

                    ////////////////////
                    // Redraw Methods
                    visualizer.redrawChart = function() {

                        var xMin = visualizer.xScale.domain()[0],
                            xMax = visualizer.xScale.domain()[1],
                            yMin = visualizer.yScale.domain()[0],
                            yMax = visualizer.yScale.domain()[1];

                        angular.forEach(ctrl.ports, function(port) {
                            if (port.showSignal) {
                                port.plotSeriesHandle.attr('d', getLine(port.netData, xMin, xMax, yMin, yMax));
                            }
                        });

                        visualizer.chartHandle.select('.x.axis').call(visualizer.xAxis);
                        visualizer.chartHandle.select('.y.axis').call(visualizer.yAxis);
                    };

                    visualizer.redrawNavigator = function() {

                        angular.forEach(ctrl.ports, function(port) {
                            if (port.showSignal) {
                                port.navigatorSeriesHandle.attr('d', visualizer.navLine(port.netData));
                             }
                        });

                        visualizer.navChartHandle.select('.x.axis').call(visualizer.navXAxis);

                    };

                    ////////////////////
                    // Tooltip Methods
                    visualizer.disableTooltip = function() {
                        visualizer.tooltipStatus = "OFF";

                        visualizer.chartHandle.on("mousemove", null);

                        document.querySelector("#toggle-tooltip-button").classList.remove("on");
                    };

                    visualizer.enableTooltip = function() {

                        visualizer.tooltipStatus = "ON";

                        document.querySelector("#toggle-tooltip-button").classList.add("on");

                        visualizer.chartHandle.on("mousemove", function() {
                            if (ctrl.ports) {
                                var x0 = visualizer.xScale.invert(d3.mouse(this)[0]),
                                    i = visualizer.bisectXScale(ctrl.ports[0].netData, x0, 1),
                                    d0 = ctrl.ports[0].netData[i - 1],
                                    d1 = ctrl.ports[0].netData[i],
                                    idx = d1 !== undefined ? (x0 - d0[1] > d1[1] - x0 ? i : i - 1) : i - 1,
                                    portTooltipText,
                                    x,
                                    y;

                                angular.forEach(ctrl.ports, function(port) {

                                    if (port.showSignal) {
                                        x = port.netData[idx][0];
                                        y = port.netData[idx][1];

                                        visualizer.transformElement(port.tooltipHandle, visualizer.xScale(x), visualizer.yScale(y) - 10);
                                        visualizer.showElement(port.tooltipHandle);

                                        portTooltipText = port.tooltipHandle.select('.tooltip-text');

                                        if (portTooltipText) {
                                            portTooltipText.text(port.name + ": " + getSIPrefix(y) + ctrl.outputUnit);
                                        }
                                        else {
                                            console.warn("Port tooltip wasn't selected!");
                                        }
                                    }

                                });

                                visualizer.tooltipGuide.style('opacity', 1)
                                    .attr('x1', visualizer.xScale(x)).attr('x2', visualizer.xScale(x));
                            }
                        })
                        .on("mouseleave", function() {
                            visualizer.hideTooltips();
                        });
                    };

                    visualizer.hideTooltips = function() {
                        if (ctrl.ports) {
                            angular.forEach(ctrl.ports, function(port) {
                                visualizer.hideElement(port.tooltipHandle);
                            });
                        }

                        visualizer.hideElement(visualizer.tooltipGuide);
                    };

                    ////////////////////
                    // General Methods
                    visualizer.hideElement = function(element) {
                        element.style("opacity", 0);
                    };

                    visualizer.showElement = function(element) {
                        element.style("opacity", 1);
                    };

                    visualizer.transformElement = function(element, x, y) {
                        element.attr("transform", "translate(" + x + "," + y + ")");
                    };

                    visualizer.bisectXScale = d3.bisector( function(d) { return d[0]; }).left;

                    var isPointInDomain = function(point, minX, maxX, minY, maxY) {
                        return point[0] >= minX && point[0] <= maxX && point[1] > minY && point[1] <= maxY;
                    };

                    var getLine = function(data, minX, maxX, minY, maxY) {

                        var match = [],
                            previousInDomain = false,
                            minXPassed = false,
                            maxXPassed = false,
                            minXId = 0,
                            maxXId = data.length - 1,
                            stepSize = (maxX - minX) / visualizer.width;

                        for (var i = 0; i < data.length; i++ ) {

                            if (isPointInDomain(data[i], minX, maxX, minY, maxY) ) {

                                if (!previousInDomain && i > 0) {
                                    match.push(data[i - 1]);
                                }

                                previousInDomain = true;

                                if ( i === 0 ) {
                                    match.push(data[i]);
                                }
                                else if ( data[i][0] > (match[match.length - 1][0] + stepSize) ) {
                                    match.push(data[i]);
                                }

                            }
                            else {

                                if (previousInDomain) {
                                    match.push( data[i] );
                                }

                                previousInDomain = false;
                            }

                            if ( data[i][0] > minX && !minXPassed) {

                                if (i > 0) {
                                    minXId = i - 1;
                                }

                                minXPassed = true;
                            }
                            else if (data[i][0] > maxX && !maxXPassed ) {

                                maxXId = i;

                                maxXPassed = true;
                            }

                        }

                        if (match.length < 2) {

                            match.push(data[minXId]);
                            match.push(data[maxXId]);

                        }

                        return visualizer.line(match);

                    };

                    visualizer.updateScales = function(dataSet) {
                        var minX = visualizer.defaultDomainX[0],
                            maxX = visualizer.defaultDomainX[1],
                            minY = visualizer.defaultDomainY[0],
                            maxY = visualizer.defaultDomainY[1],
                            xPadding, yPadding;

                        if (dataSet !== undefined && dataSet.length) {
                            minX = d3.min(dataSet, function(data) {
                                if (data.showSignal) {
                                    return d3.min(data.netData, function(d) {
                                        return d[0];
                                    });
                                }
                                else {
                                    return 1E20;
                                }
                            });

                            maxX = d3.max(dataSet, function(data) {
                                if (data.showSignal) {
                                    return d3.max(data.netData, function(d) {
                                        return d[0];
                                    });
                                }
                                else {
                                    return -1E20;
                                }
                            });

                            minY = d3.min(dataSet, function(data) {
                                if (data.showSignal) {
                                    return d3.min(data.netData, function(d) {
                                        return d[1];
                                    });
                                }
                                else {
                                    return 1E20;
                                }
                            });

                            maxY = d3.max(dataSet, function(data) {
                                if (data.showSignal) {
                                    return d3.max(data.netData, function(d) {
                                        return d[1];
                                    });
                                }
                                else {
                                    return -1E20;
                                }
                            });
                        }

                        if ( !(minX === 1E20 && maxX === -1E20 && minY === 1E20 && maxY === -1E20) ) {
                            xPadding = (maxX - minX) > 0 ? 0 : maxX * 0.05;
                            yPadding = (maxY - minY) > 0 ? (maxY - minY) * 0.05 : maxY * 0.05;

                            visualizer.domainX = [minX - xPadding, maxX + xPadding];
                            visualizer.domainY = [minY - yPadding, maxY + yPadding];
                        }
                        else {
                            // All signals are hidden
                            visualizer.domainX = visualizer.defaultDomainX;
                            visualizer.domainY = visualizer.defaultDomainY;
                        }

                        visualizer.xScale.domain(visualizer.domainX);
                        visualizer.yScale.domain(visualizer.domainY);

                        visualizer.navXScale.domain(visualizer.domainX);
                        visualizer.navYScale.domain(visualizer.domainY);

                        visualizer.xlimits = visualizer.domainX;
                        visualizer.ylimits = visualizer.domainY;

                    };


                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    /// Menu buttons

                    // Tooltip
                    visualizer.toggleTooltipDisplay = function() {
                        if (visualizer.tooltipStatus === "ON") {
                            visualizer.disableTooltip();
                        }
                        else {
                            visualizer.enableTooltip();
                        }
                    };

                    // Zoom
                    visualizer.setZoomMethod = function(method) {

                        if (visualizer.zoomMethods.box.active) {
                            visualizer.yScale.domain(visualizer.domainY);
                            visualizer.redrawChart();
                            visualizer.updateViewportFromChart();
                        }

                        angular.forEach(visualizer.zoomMenuButtons, function(value, key) {
                            if (key === method) {

                                value.classList.add("selected");
                                visualizer.zoomMethods[key].active = true;
                                visualizer.setZoomBehavior();
                                visualizer.reapplyOverlay();
                                visualizer.setViewportBrush();
                                visualizer.updateViewportFromChart();

                            }
                            else {
                                value.classList.remove("selected");
                                visualizer.zoomMethods[key].active = false;
                            }
                        });
                    };


                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    // Apply default settings
                    visualizer.updateZoomFromChart();
                    visualizer.setZoomMethod('x');
                    visualizer.enableTooltip();

                }

                var resizeVisualizer = function() {
                    // updateVisualizer is not called here as the scales do not need to be updated.
                    // This allows the charts to be redrawn to the resized width, then adjusted to
                    // show the pre-resizing zoom level and viewport.
                    visualizer.redrawChart();
                    visualizer.redrawNavigator();
                    visualizer.updateZoomFromChart();
                    visualizer.updateViewportFromChart();
                };

                window.onresize = resizeVisualizer;

                initializeVisualizer();
            }
        };

    })
.directive('analogElectronicSimulationConfig', function() {

        function TestBenchConfigController() {
            // add configuration properties if they are not there
            var self = this,
                configDefaults = {
                'Spice Step Size': '0.0001',
                'Spice End Time': '1',
                'Spice Analysis Type': 'Transient Analysis'
            };
            Object.keys(configDefaults).forEach(function (propertyLabel) {
                var property = self.testBench.config.properties.filter(function (prop) {
                    return prop.label === propertyLabel;
                })[0];
                if (!property) {
                    self.testBench.config.properties.push({
                        label: propertyLabel,
                        value: configDefaults[propertyLabel]
                    });
                }
            });
            this.testBench.config.save();
        }

        return {
            restrict: 'E',
            controller: TestBenchConfigController,
            controllerAs: 'ctrl',
            bindToController: true,
            replace: true,
            transclude: false,
            scope: {
                testBench: '='
            },
            templateUrl: '/mmsApp/templates/analogElectronicSimulationConfig.html'
        }
    });

