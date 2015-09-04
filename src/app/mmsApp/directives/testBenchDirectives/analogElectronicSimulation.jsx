/* globals ga d3*/

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
                colorPalette: d3.scale.category20(),
                reapplyOverlay: null,
                updateVisualizer: null,
                updateViewportFromChart: null
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

            this.addSeries = function (data, label, index) {
                return self.visualizer.plotAreaHandle.append('path')
                    .attr('class', 'line ' + label)
                    .attr('d', self.visualizer.line(data))
                    .attr('stroke', function() { return self.visualizer.colorPalette(index); });
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
                                                            plotSeriesHandle: self.addSeries(netSignal.data, sigLabel, index),
                                                            navigatorSeriesHandle: self.addNavigatorSeries(netSignal.data, sigLabel)
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
                    visualizer.reapplyOverlay();
                    visualizer.redrawChart();
                    visualizer.redrawNavigator();
                    visualizer.updateZoomFromChart();
                    visualizer.updateViewportFromChart();

                    // TOOD: Is there a better way than this timeout? The dom elements exist prior to this,
                    //       but until the paths are rendered they have 0 width/height.
                    $timeout(function() {
                        angular.forEach(document.getElementsByClassName('navline'), function(navline) {
                            // This needs to be removed first in order to check what the path bounding box size is.
                            navline.classList.remove('flatline');

                            if (navline.getBoundingClientRect().height <= 0.1) {
                                navline.classList.add('flatline');
                                console.log('flatline: ' + navline.classList);
                            }

                        });
                    });
                };

                function initializeVisualizer() {

                    visualizer.margin = {top: 20, right: 20, bottom: 40, left: 60};
                    visualizer.width = 800 - visualizer.margin.left - visualizer.margin.right;
                    visualizer.height = 400 - visualizer.margin.top - visualizer.margin.bottom;

                    visualizer.chartHandle = d3.select('#spice-visualizer').classed('spice-visualizer', true).append('svg')
                        .attr('class', 'chart')
                        .attr('width', visualizer.width + visualizer.margin.left + visualizer.margin.right)
                        .attr('height', visualizer.height + visualizer.margin.top + visualizer.margin.bottom)
                        .attr('shape-rendering', 'crispEdges')
                        .append('g')
                        .attr('transform', 'translate(' + visualizer.margin.left + ',' + visualizer.margin.top + ')');

                    visualizer.plotAreaHandle = visualizer.chartHandle.append('g')
                        .attr('clip-path', 'url(#plotAreaClip)');

                    visualizer.plotAreaHandle.append('clipPath')
                        .attr('id', 'plotAreaClip')
                        .append('rect')
                        .attr({ width: visualizer.width, height: visualizer.height });

                    visualizer.xScale = d3.scale.linear()
                        .domain(visualizer.defaultDomainX)
                        .range([0, visualizer.width]);

                    visualizer.yScale = d3.scale.linear()
                        .domain(visualizer.defaultDomainY).nice()
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
                        .attr("x",0 - (visualizer.height / 2))
                        .attr("dy", "1em")
                        .attr('class', 'axislabel')
                        .style("text-anchor", "middle")
                        .text("Voltage (V)");

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

                    };

                    visualizer.line = d3.svg.line()
                        .x(function(data) { return visualizer.xScale(data[0]); })
                        .y(function(data) { return visualizer.yScale(data[1]); });

                    visualizer.navWidth = visualizer.width;
                    visualizer.navHeight = 100 - visualizer.margin.top - visualizer.margin.bottom;

                    visualizer.navChartHandle = d3.select('#spice-visualizer').classed('spice-visualizer', true).append('svg')
                        .classed('navigator', true)
                        .attr('width', visualizer.navWidth + visualizer.margin.left + visualizer.margin.right)
                        .attr('height', visualizer.navHeight + visualizer.margin.top + visualizer.margin.bottom)
                        .append('g')
                        .attr('transform', 'translate(' + visualizer.margin.left + ',' + visualizer.margin.top + ')');

                    visualizer.navXScale = d3.scale.linear()
                            .domain(visualizer.defaultDomainX)
                            .range([0, visualizer.navWidth]);
                    visualizer.navYScale = d3.scale.linear()
                        .domain(visualizer.defaultDomainY)
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
                    }

                    visualizer.redrawNavigator = function() {

                        angular.forEach(ctrl.ports, function(port) {
                            if (port.showSignal) {

                                port.navigatorSeriesHandle.attr('d', visualizer.navLine(port.netData));
                                // visualizer.navChartHandle.append('path')
                                //  .attr('class', 'navline ' + port.name)
                                //  .attr('d', visualizer.navLine(port.netData));
                             }
                        });

                        visualizer.navChartHandle.select('.x.axis').call(visualizer.navXAxis);

                    }

                    visualizer.updateViewportFromChart = function() {

                        if ((visualizer.xScale.domain()[0] <= visualizer.domainX[0]) && (visualizer.xScale.domain()[1] >= visualizer.domainX[1])) {

                            visualizer.viewport.clear();
                        }
                        else {

                            visualizer.viewport.extent(visualizer.xScale.domain());
                        }

                        visualizer.navChartHandle.select('.viewport').call(visualizer.viewport);
                    }

                    visualizer.navLine = d3.svg.line()
                        .x(function (data) { return visualizer.navXScale(data[0]); })
                        .y(function (data) { return visualizer.navYScale(data[1]); });

                    visualizer.viewport = d3.svg.brush()
                        .x(visualizer.navXScale)
                        // .y(visualizer.navYScale)
                        .on("brush", function () {
                            visualizer.xScale.domain(visualizer.viewport.empty() ? visualizer.navXScale.domain() : visualizer.viewport.extent());
                            // visualizer.yScale.domain(visualizer.viewport.empty() ? visualizer.navYScale.domain() : visualizer.viewport.extent());
                            visualizer.redrawChart();
                        });

                    visualizer.navChartHandle.append("g")
                        .attr("class", "viewport")
                        .call(visualizer.viewport)
                        .selectAll("rect")
                        .attr("height", visualizer.navHeight);

                    visualizer.zoom = d3.behavior.zoom()
                        .x(visualizer.xScale)
                        // .y(visualizer.yScale)
                        .on('zoom', function() {
                            if (visualizer.xScale.domain()[0] < visualizer.domainX[0]) {
                                var x = visualizer.zoom.translate()[0] - visualizer.xScale(visualizer.domainX[0]) + visualizer.xScale.range()[0];
                                    visualizer.zoom.translate([x, 0]);
                            }
                            else if (visualizer.xScale.domain()[1] > visualizer.domainX[1]) {
                                var x = visualizer.zoom.translate()[0] - visualizer.xScale(visualizer.domainX[1]) + visualizer.xScale.range()[1];
                                    visualizer.zoom.translate([x, 0]);
                            }
                            // else if (visualizer.yScale.domain()[0] < -12) {
                            //     var y = visualizer.zoom.translate()[1] - visualizer.yScale(-12) + visualizer.yScale.range()[0];
                            //         visualizer.zoom.translate([0, y]);
                            // } else if (visualizer.yScale.domain()[1] > 12) {
                            //     var y = visualizer.zoom.translate()[1] - visualizer.yScale(12) + visualizer.yScale.range()[1];
                            //         visualizer.zoom.translate([0, y]);
                            // }
                            visualizer.redrawChart();
                            visualizer.updateViewportFromChart();
                        });

                    visualizer.overlay = d3.svg.area()
                        .x(function (data) { return visualizer.xScale(data[0]); })
                        // .x0(0)
                        // .x1(visualizer.width)
                        .y0(0)
                        .y1(visualizer.height);
                        // ([[0, 0], [visualizer.width, 0], [visualizer.width, visualizer.height], [0, visualizer.height]]);

                    visualizer.reapplyOverlay = function() {
                            visualizer.plotAreaHandle.selectAll('path.overlay').remove();

                        if (ctrl.ports && ctrl.ports.length) {
                            visualizer.plotAreaHandle.append('path')
                                .attr('class', 'overlay')
                                // .attr('d', visualizer.overlay([[0, 0], [visualizer.width, 0], [visualizer.width, visualizer.height], [0, visualizer.height]]))
                                .attr('d', visualizer.overlay(ctrl.ports[0].netData))
                                .call(visualizer.zoom)
                                .on("dblclick.zoom", function() {
                                    d3.transition().duration(750).tween("zoom", function() {
                                        var ix = d3.interpolate(visualizer.xScale.domain(), visualizer.domainX),
                                            iy = d3.interpolate(visualizer.yScale.domain(), visualizer.domainY);
                                        return function(t) {
                                          visualizer.zoom.x(visualizer.xScale.domain(ix(t))).y(visualizer.yScale.domain(iy(t)));
                                          visualizer.redrawChart();
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
                    }

                    visualizer.viewport.on("brushend", function () {
                        visualizer.updateZoomFromChart();
                    });

                    visualizer.updateZoomFromChart();

                }

                initializeVisualizer();
            }
        };

    });
