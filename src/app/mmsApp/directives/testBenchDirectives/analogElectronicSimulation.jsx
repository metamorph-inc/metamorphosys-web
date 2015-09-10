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

        function ResultDetailsController($log, $q, $http, projectHandling, nodeService) {

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

            var self = this,
                parentContext = projectHandling.getContainerLayoutContext(),
                context,
                line;

            this.getSIPrefixMetric = function(metric) {
                return getSIPrefix(metric);
            };

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

            this.updateVisualizer = function(port) {
                // context.showSignal = !context.showSignal;

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

            this.createSeriesTooltip = function(chartHandle, seriesLabel, fillColor) {
                var tooltip;

                tooltip = chartHandle.append('g')
                    .attr('class', 'tooltip ' + seriesLabel)
                    .style('opacity', 0);

                tooltip.append('path')
                    .attr('class', 'tooltip-box')
                    .attr('d', 'm0,10l5,-10l35,0l0,20l-35,0l-5,-10z')
                    .attr('fill', fillColor);

                tooltip.append('text')
                    .attr('class', 'tooltip-text')
                    .attr('x', 5).attr('y', 14);

                return tooltip;

            };

            this.addSeries = function (data, label, index) {
                if (data.length <= 1) {
                    console.warn(["Spice data set for signal " + label + " does not have at least two points!",
                        " This signal will not be added to the plot."].join(""));

                    return null;
                }
                else {
                    return self.visualizer.plotAreaHandle.append('path')
                        .attr('class', 'line ' + label)
                        .attr('d', self.visualizer.line(data))
                        .attr('stroke', function() { return self.visualizer.colorPalette(index); });
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
                    self.removeSeries(port.plotSeriesHandle, port.name);
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

                                            $q.all(gmePorts.map(function (port, index) {
                                                var net = siginfo.objectToNetId[getSigInfoId(port)];

                                                 if (net == null) {
                                                    return undefined;
                                                }

                                                return $http.get('/rest/blob/view/' + self.result.resultHash + '/results/net' + net + '.json')
                                                    .then(function(netSignal) {

                                                        var sigLabel = port.getAttribute('name');

                                                        return {
                                                            visualUrl: '/rest/blob/view/' + self.result.resultHash + '/results/net' + net + '.png',
                                                            name: sigLabel,
                                                            showSignal: true,
                                                            minVoltage: netdata[net].min,
                                                            maxVoltage: netdata[net].max,
                                                            netData: netSignal.data,
                                                            index: index,
                                                            plotSeriesHandle: self.addSeries(netSignal.data, sigLabel, index),
                                                            navigatorSeriesHandle: self.addNavigatorSeries(netSignal.data, sigLabel),
                                                            tooltipHandle: self.createSeriesTooltip(self.visualizer.chartHandle, sigLabel, self.visualizer.colorPalette(index))
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
                                            });
                                            // $log.info(self.ports);
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

                designEditorController.viewingWireResult = true;

                off = $rootScope.$on("inspectableWireHasChanged", function ($event, wire) {
                    ctrl.removeUnpinnedSeries();
                    ctrl.setInspectedWire(wire);
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

                    visualizer.margin = {top: 5, right: 40, bottom: 40, left: 60};

                    var topLevelPlotEl = d3.select('#spice-visualizer').classed('spice-visualizer', true);

                    visualizer.width = parseFloat(topLevelPlotEl.style("width")) - visualizer.margin.left - visualizer.margin.right;
                    visualizer.height = 0.5 * parseFloat(topLevelPlotEl.style("width")) - visualizer.margin.top - visualizer.margin.bottom;

                    visualizer.chartHandle = topLevelPlotEl.append('svg')
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

                    visualizer.xScale = d3.scale.linear()
                        .domain(visualizer.domainX)
                        .range([0, visualizer.width]);

                    visualizer.yScale = d3.scale.linear()
                        .domain(visualizer.domainY).nice()
                        .range([visualizer.height, 0]);

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

                    visualizer.tooltipGuide = visualizer.chartHandle.append('line')
                        .attr('class', 'tooltip-guide')
                        .attr('x1', 0).attr('x2', 0)
                        .attr('y1', 0).attr('y2', visualizer.height)
                        .style('opacity', 0);

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
                            console.warn('Error filtering points');

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

                    visualizer.line = d3.svg.line()
                        .x(function(data) { return visualizer.xScale(data[0]); })
                        .y(function(data) { return visualizer.yScale(data[1]); });

                    visualizer.navWidth = visualizer.width;
                    visualizer.navHeight = 0.2 * visualizer.height - visualizer.margin.top - visualizer.margin.bottom;

                    visualizer.navChartHandle = d3.select('#spice-visualizer').classed('spice-visualizer', true).append('svg')
                        .classed('navigator', true)
                        .attr("preserveAspectRatio", "xMinYMin meet")
                        .attr("viewBox", "0 0 " + (visualizer.navWidth + visualizer.margin.left + visualizer.margin.right) + " " + (visualizer.navHeight + visualizer.margin.top + visualizer.margin.bottom))
                        .attr("svg-content-response", true)
                        .append('g')
                        .attr('transform', 'translate(' + visualizer.margin.left + ',' + visualizer.margin.top + ')');

                    visualizer.navXScale = d3.scale.linear()
                            .domain(visualizer.domainX)
                            .range([0, visualizer.navWidth]);
                    visualizer.navYScale = d3.scale.linear()
                        .domain(visualizer.domainY)
                        .range([visualizer.navHeight, 0]);

                    visualizer.navXAxis = d3.svg.axis()
                        .scale(visualizer.navXScale)
                        .orient('bottom');

                    visualizer.navChartHandle.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + visualizer.navHeight + ')')
                        .call(visualizer.navXAxis);

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

                    visualizer.updateViewportFromChart = function() {

                        if ((visualizer.xScale.domain()[0] <= visualizer.domainX[0]) && (visualizer.xScale.domain()[1] >= visualizer.domainX[1])) {

                            visualizer.viewport.clear();
                        }
                        else {

                            visualizer.viewport.extent(visualizer.xScale.domain());
                        }

                        visualizer.navChartHandle.select('.viewport').call(visualizer.viewport);
                    };

                    visualizer.navLine = d3.svg.line()
                        .x(function (data) { return visualizer.navXScale(data[0]); })
                        .y(function (data) { return visualizer.navYScale(data[1]); });

                    visualizer.zoomMethods = {
                        active: 'x',
                        x: { active: true, brush: null, zoomBehavior: null },
                        box: { active: false, brush: null, zoomBehavior: null }
                    };

                    visualizer.zoomMethods.x.brush = d3.svg.brush()
                        .x(visualizer.navXScale)
                        .on("brush", function () {
                            visualizer.xScale.domain(visualizer.viewport.empty() ? visualizer.navXScale.domain() : visualizer.viewport.extent());
                            visualizer.redrawChart();
                        });

                    visualizer.zoomMethods.box.brush = d3.svg.brush()
                        .x(visualizer.navXScale)
                        .y(visualizer.navYScale)
                        .on("brush", function () {
                            visualizer.xScale.domain(visualizer.viewport.empty() ? visualizer.navXScale.domain() : visualizer.viewport.extent());
                            visualizer.yScale.domain(visualizer.viewport.empty() ? visualizer.navYScale.domain() : visualizer.viewport.extent());
                            visualizer.redrawChart();
                        });


                    // Set initial viewport brush
                    visualizer.viewport = visualizer.zoomMethods.x.active ? visualizer.zoomMethods.x.brush : visualizer.zoomMethods.box.brush;

                    visualizer.navChartHandle.append("g")
                        .attr("class", "viewport")
                        .call(visualizer.viewport)
                        .selectAll("rect")
                        .attr("height", visualizer.navHeight);

                    visualizer.zoomMethods.x.zoomBehavior = function() {
                        // var x;
                        // if (visualizer.xScale.domain()[0] < visualizer.domainX[0]) {
                        //     x = visualizer.zoom.translate()[0] - visualizer.xScale(visualizer.domainX[0]) + visualizer.xScale.range()[0];
                        //         visualizer.zoom.translate([x, 0]);
                        // }
                        // else if (visualizer.xScale.domain()[1] > visualizer.domainX[1]) {
                        //     x = visualizer.zoom.translate()[0] - visualizer.xScale(visualizer.domainX[1]) + visualizer.xScale.range()[1];
                        //         visualizer.zoom.translate([x, 0]);
                        // }
                        var e = d3.event,
                            tx = Math.min(0, Math.max(e.translate[0], visualizer.width - visualizer.width * e.scale));

                        visualizer.zoom.translate([tx, 0]);
                        visualizer.xScale.domain([Math.max(visualizer.xScale.domain()[0], visualizer.xlimits[0]), Math.min(visualizer.xScale.domain()[1], visualizer.xlimits[1])]);

                        visualizer.redrawChart();
                        visualizer.updateViewportFromChart();
                    };

                    visualizer.zoomMethods.box.zoomBehavior = function() {
                            // var x, y;
                            // if (visualizer.xScale.domain()[0] < visualizer.domainX[0]) {
                            //     x = visualizer.zoom.translate()[0] - visualizer.xScale(visualizer.domainX[0]) + visualizer.xScale.range()[0];
                            //         visualizer.zoom.translate([x, 0]);
                            // }
                            // else if (visualizer.xScale.domain()[1] > visualizer.domainX[1]) {
                            //     x = visualizer.zoom.translate()[0] - visualizer.xScale(visualizer.domainX[1]) + visualizer.xScale.range()[1];
                            //         visualizer.zoom.translate([x, 0]);
                            // }
                            // if (visualizer.yScale.domain()[0] < visualizer.domainY[0]) {
                            //     y = visualizer.zoom.translate()[1] - visualizer.yScale(visualizer.domainY[0]) + visualizer.yScale.range()[0];
                            //         visualizer.zoom.translate([0, y]);
                            // } else if (visualizer.yScale.domain()[1] > visualizer.domainY[1]) {
                            //     y = visualizer.zoom.translate()[1] - visualizer.yScale(visualizer.domainY[1]) + visualizer.yScale.range()[1];
                            //         visualizer.zoom.translate([0, y]);
                            // }
                            var e = d3.event,
                                tx = Math.min(0, Math.max(e.translate[0], visualizer.width - visualizer.width * e.scale)),
                                ty = Math.min(0, Math.max(e.translate[1], visualizer.height - visualizer.height * e.scale));

                            visualizer.zoom.translate([tx, ty]);
                            visualizer.xScale.domain([Math.max(visualizer.xScale.domain()[0], visualizer.xlimits[0]), Math.min(visualizer.xScale.domain()[1], visualizer.xlimits[1])]);
                            visualizer.yScale.domain([Math.max(visualizer.yScale.domain()[0], visualizer.ylimits[0]), Math.min(visualizer.yScale.domain()[1], visualizer.ylimits[1])]);

                            visualizer.redrawChart();
                            visualizer.updateViewportFromChart();
                    };

                    // Initial zoom behavior
                    visualizer.zoom = d3.behavior.zoom()
                        .x(visualizer.xScale)
                        .on('zoom', function() {
                            visualizer.zoomMethods.x.zoomBehavior();
                        });


                    visualizer.overlay = d3.svg.area()
                        .x(function (data) { return visualizer.xScale(data[0]); })
                        .y0(0)
                        .y1(visualizer.height);

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
                                            visualizer.zoom.x(visualizer.xScale.domain(ix(t))); // .y(visualizer.yScale.domain(iy(t)));
                                            visualizer.redrawChart();
                                            visualizer.updateZoomFromChart();
                                            visualizer.updateViewportFromChart();
                                        };
                                    });
                                });
                            }
                    };

                    visualizer.updateZoomFromChart = function() {

                        visualizer.zoom.x(visualizer.xScale);
                        // visualizer.zoom.y(visualizer.yScale);

                        var fullDomain = visualizer.domainX[1],
                            currentDomain = visualizer.xScale.domain()[1] - visualizer.xScale.domain()[0];

                        var minScale = currentDomain / fullDomain,
                            maxScale = minScale * 40;

                        visualizer.zoom.scaleExtent([minScale, maxScale]);
                    };

                    visualizer.viewport.on("brushend", function () {
                        visualizer.updateZoomFromChart();
                    });

                    visualizer.updateZoomFromChart();

                    visualizer.bisectXScale = d3.bisector( function(d) { return d[0]; }).left;


                    // Tooltip Methods
                    visualizer.toggleTooltipDisplay = function() {
                        if (visualizer.tooltipStatus === "ON") {
                            visualizer.disableTooltip();
                        }
                        else {
                            visualizer.enableTooltip();
                        }
                    };

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
                                            portTooltipText.text(d3.round(y, 3));
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

                    visualizer.hideElement = function(element) {
                        element.style("opacity", 0);
                    };

                    visualizer.showElement = function(element) {
                        element.style("opacity", 1);
                    };

                    visualizer.transformElement = function(element, x, y) {
                        element.attr("transform", "translate(" + x + "," + y + ")");
                    };

                    // Zoom Methods
                    visualizer.zoomMenuButtons = {
                        x: document.querySelector("#zoom-button.x-zoom"),
                        box: document.querySelector("#zoom-button.box-zoom")
                    };

                    visualizer.setViewportBrush = function(brush) {
                        if (brush) {
                           visualizer.viewport = brush;

                        }
                        else {
                            console.warn("Attempted to set visualizer viewport brush to null! Sticking with previous behavior.");
                        }
                    };

                    // visualizer.setZoomBehavior = function(behavior) {
                    //     if (behavior) {
                    //         visualizer.zoom = behavior;
                    //     }
                    //     else {
                    //         console.warn("Attempted to set visualizer zoom behavior to null! Sticking with previous behavior.");
                    //     }
                    // };

                    visualizer.setZoomMethod = function(method) {
                        angular.forEach(visualizer.zoomMenuButtons, function(value, key) {
                            if (key === method) {
                                value.classList.add("selected");
                                visualizer.zoomMethods.active = key;
                                visualizer.zoomMethods[key].active = true;
                                visualizer.setViewportBrush(visualizer.zoomMethods[key].brush);
                                visualizer.setZoomBehavior();
                                visualizer.reapplyOverlay();
                            }
                            else {
                                value.classList.remove("selected");
                                visualizer.zoomMethods[key].active = false;
                            }
                        });
                    };

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

                    // Default settings
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

