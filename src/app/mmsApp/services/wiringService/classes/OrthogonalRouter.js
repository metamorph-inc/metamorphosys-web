'use strict';

var insert = require("../../mmsUtils/classes/simpleInsert.js"),
    Point = require("./orthogonalRouter/classes/Point.js"),
    OrthogonalGridNode = require("./orthogonalRouter/classes/orthogonalGridNode.js"),
    OrthogonalGridSegment = require("./orthogonalRouter/classes/orthogonalGridSegment.js"),
    WireSegment = require("../../diagramService/classes/WireSegment.js"),
    DiagramComponent = require("../../diagramService/classes/DiagramComponent.js"),
    SvgDiagramToast = require("../../../directives/svgDiagram/classes/SvgDiagramToast.js"),
    VisibilityGraph = require("./orthogonalRouter/classes/VisibilityGraph.js");


var OrthogonalRouter = function ($mdToast, $injector) {

    var self = this,
        routeWireByWire = true,
        svgDiagramToast = new SvgDiagramToast($mdToast),
        cachedRouterData = {},

        // debug helpers
        debugHelper = { sweepLines: [], sweepPoints: [] },
        debugRouter = false;

    self.name = 'OrthogonalRouter';

    if ($injector.has('debugAutoRouter')) {
        debugRouter = $injector.get('debugAutoRouter');
    }

    this.route = function( diagram, specificWireToRoute ) {

        var startTime = performance.now();

        var haveDiagramComponentsChanged,
            diagramWires,
            wireToRoute;

        if (diagram.getWires().length) {

            haveDiagramComponentsChanged = doesDiagramNeedToBeReRouted(diagram);

            if ( haveDiagramComponentsChanged ) {
                console.log('Something in diagram has changed, will have to re-routing entire diagram');
                self.routeDiagram(diagram, specificWireToRoute);
            }
            else {
                console.log('Diagram is consistent with previous wiring, able to use cached visibility graph');

                diagramWires = diagram.getWires();

                wireToRoute = specificWireToRoute ? specificWireToRoute : diagramWires[diagramWires.length - 1];

                routeWires(diagram, cachedRouterData.visibilityGraph, [wireToRoute], cachedRouterData.points);
            }

            cachedRouterData.visibilityGraph = cleanVisibilityGraph(cachedRouterData.visibilityGraph);

            var endTime = performance.now();

            console.log('AutoRoute Execution Time: ' + (endTime - startTime) + 'ms');

            if (debugRouter) {
                diagram.sweepLines = cachedRouterData.debugHelper.sweepLines;
                diagram.sweepPoints = cachedRouterData.debugHelper.sweepPoints;
            }
        }
    };

    function doesDiagramNeedToBeReRouted(diagram) {

        var rerouteNeeded = false,
            currentComponents = diagram.getComponents(),
            currentPorts = diagram.getPorts(),
            currentComponentPositions = [],
            currentPortPositions = [],
            currentIcons = [],
            i;

        if ( cachedRouterData.visibilityGraph ) {

            if (currentComponents.length !== cachedRouterData.componentPositions.length ||
                Object.keys(currentPorts).length !== cachedRouterData.portPositions.length) {
                rerouteNeeded = true;
            }
            else {
                currentComponents.forEach(function(component) {
                    currentComponentPositions.push(component.getGridPosition());
                    currentIcons.push(component.icon !== null && component.icon !== undefined);
                });

                rerouteNeeded = !angular.equals(currentComponentPositions, cachedRouterData.componentPositions);

            }

            if ( !rerouteNeeded ) {
                rerouteNeeded = !angular.equals(currentIcons, cachedRouterData.icons);
            }

            if ( !rerouteNeeded ) {

                angular.forEach(currentPorts, function(port) {
                    currentPortPositions.push(port.getGridPosition());
                });

                rerouteNeeded = !angular.equals(currentPortPositions, cachedRouterData.portPositions);

            }
        }
        else {
            rerouteNeeded = true;
        }

        return rerouteNeeded;
    };


    function routeWires (diagram, visibilityGraph, wireCollection, points) {

        var optimalConnections,
            nudgedConnections,
            wire,
            segment;

        optimalConnections = self.autoRouteWithGraph(visibilityGraph, wireCollection, points);

        if ( optimalConnections === null ) {
            svgDiagramToast.showToast("No valid path was found. Adjust components and try again.");
            return null;  // No path found
        }

        nudgedConnections = nudgeConnections(optimalConnections);

        // Update diagram Wires

        for ( var w = 0; w < wireCollection.length; w++ ) {

            wire = diagram.getWireById(wireCollection[w].getId());

            wire.removeSegments();


            for (var i = nudgedConnections[w].length - 1; i >= 0; i--) {

                segment = nudgedConnections[w][i];

                segment.setFipped(true, true);
                wire.appendSegmentFromParameters(segment);

            }

        }

        diagram.afterWireChange();

    };

    this.routeDiagram = function( diagram, specificWireToRoute ) {
        // Step 1: generateVisibilityGraph
        // Step 2: AutoRouteWithGraph
        // Step 3: nudgeRoutes

        var diagramComponents = diagram.getComponents(),
            validDiagram = this.validDiagramForAutoRoute ( diagramComponents,
                                                           diagram.config.height,
                                                           diagram.config.width );

        if ( validDiagram ) {

            var visibilityGraph = new VisibilityGraph(debugRouter),
                unlockedWireCollection = [],
                points,
                wires,
                replaceParent,
                replaceWire = [];

            unlockedWireCollection = diagram.getWires().filter( function(wire) {
                return !wire.isWireLocked();
            });

            points = this.getBoundingBoxAndPortPointsFromComponents(diagramComponents, visibilityGraph);

            visibilityGraph.generate(points, diagram.config.width, diagram.config.height, debugHelper, visibilityGraph.boundingBoxes);

            routeWires(diagram, visibilityGraph, unlockedWireCollection, points);

            diagram.afterWireChange();

            var componentPositions = [],
                portPositions = [],
                icons = [];

            angular.forEach(diagram.getComponents(), function(component) {
                componentPositions.push(component.getGridPosition());
                icons.push(component.icon !== null && component.icon !== undefined);
            });

            angular.forEach(diagram.getPorts(), function(port) {
                portPositions.push(port.getGridPosition());
            });

            cachedRouterData = {
                    visibilityGraph: visibilityGraph,
                    points: points,
                    componentPositions: componentPositions,
                    portPositions: portPositions,
                    icons: icons
                };

            if (debugRouter) {
                cachedRouterData.debugHelper = debugHelper;
            }

        }
        else {
            if (specificWireToRoute) {
                // We conditionally added the empty wire prior to the autoRoute, need to delete it.
                diagram.getWires().splice(-1, 1);
            }
        }
    };

    this.getBoundingBoxAndPortPointsFromComponents = function ( components, visibilityGraph ) {
        var points = [];
        for ( var i = 0; i < components.length; i++ ) {
            this.getBBAndPortPointsFromComponent(components[i], points, visibilityGraph);
        }
        return points;
    };

    /**
     * Bounding boxes have a 20-pixel padding added to reduce odds of nudging across components.
     */
    this.getBBAndPortPointsFromComponent = function ( component, points, visibilityGraph ) {
        var boundBox = component.getGridBoundingBox();

        // Nodes from bounding box
        points.push( new Point( boundBox.x - 10, boundBox.y - 10 ) );
        points.push( new Point( boundBox.x - 10, boundBox.y + boundBox.height + 10 ) );
        points.push( new Point( boundBox.x + boundBox.width + 10, boundBox.y - 10 ) );
        points.push( new Point( boundBox.x + boundBox.width + 10, boundBox.y + boundBox.height + 10 ) );

        visibilityGraph.boundingBoxes.push({ x: boundBox.x - 10,
                                             y: boundBox.y - 10,
                                             width: boundBox.width + 20,
                                             height: boundBox.height + 20} );

        // Nodes from ports
        for ( var k = 0; k < component.portInstances.length; k++ ) {
            var portPos = component.portInstances[k].getGridPosition(),
                portWireAngle = component.portInstances[k].getGridWireAngle(),
                x = portPos.x,
                y = portPos.y,
                actualX = x,
                actualY = y;

            if ([90, -270].indexOf(portWireAngle) !== -1) {
                y += boundBox.y + boundBox.height + 10 - y;  // S port
            }
            else if ([-90, 270].indexOf(portWireAngle) !== -1) {
                y -= y - (boundBox.y - 10);  // N port
            }
            else if ([180, -180].indexOf(portWireAngle) !== -1) {
                x -= x - (boundBox.x - 10);  // W port
            }
            else {
                x += boundBox.x + boundBox.width + 10 - x;  // E port
            }

            points.push( new Point( x, y, true, portWireAngle, {x: actualX, y: actualY} ) );
        }
    };

    ////////////////////////////////////////////////////////////////////////////
    /*                              Route Finder                              */
    ////////////////////////////////////////////////////////////////////////////


    this.autoRouteWithGraph = function ( visibilityGrid, wires, points ) {
        // Loop through connections to determine the optimal route of each one using orthogonal graph.

        var optimalConnections = [],  // Each element will be an array of wires
            searchedNodes = [];       // List of dirty nodes from previously found routes


        for ( var i = 0; i < wires.length; i++ ) {

            var end1 = wires[i].getEnd1(),
                end2 = wires[i].getEnd2(),
                wireAngle = end1.port.getGridWireAngle();

            // Convert from getGridWireAngle() output to array index.
            if (wireAngle === 90 || wireAngle === -270) {wireAngle = 1;}
            else if (wireAngle === 180 || wireAngle === -180) {wireAngle = 2;}
            else if (wireAngle === 270 || wireAngle === -90) {wireAngle = 0;}
            else if (wireAngle === 0 || wireAngle === 360 || wireAngle === -360) {wireAngle = 3;}

            var j,
                numberOfPoints = points.length,
                wire1Position = null,
                wire2Position = null,
                actualPos1 = end1.port.getGridPosition(),
                actualPos2 = end2.port.getGridPosition();
            for (j = 0; j < numberOfPoints; j++) {
                if ( points[j].portLocation ) {
                    if (points[j].portLocation.x === actualPos1.x &&
                        points[j].portLocation.y === actualPos1.y) {
                        wire1Position = points[j];
                    }
                    if (points[j].portLocation.x === actualPos2.x &&
                        points[j].portLocation.y === actualPos2.y) {
                        wire2Position = points[j];
                    }
                    if (wire1Position && wire2Position) {
                        break;
                    }
                }
            }

            var result = findOptimalRouteSimple( visibilityGrid.nodes,
                                                 wire1Position,
                                                 wire2Position,
                                                 wireAngle,
                                                 searchedNodes);

            if ( !result ) {
                return null;
            }
            optimalConnections.push(result.path);
            searchedNodes = result.dirtyNodes;

        }
        return optimalConnections;

    };


    function findOptimalRouteSimple ( visibilityGrid, startPt, endPt, startWireAngle, searchedNodes ) {
        // A* Search
        // cost = cost of this partial path from the start node to the current node, plus current number of bends.
        // heuristic = estimated guess for the cost of the remaining path from the current node to end node, plus
        //             the estimated number of remaining bends.
        // score = cost + heuristic

        var openHeap = [],
            destinationNode = visibilityGrid[endPt.x][endPt.y],
            closestNode = visibilityGrid[startPt.x][startPt.y];

        if ( !destinationNode || !closestNode ) {
            alert( "An error occurred when looking at route for port X: " +
                    endPt.x + ", Y: " + endPt.y );
            return null;
        }

        // For the case where multiple connections are being checked, need to erase computed values from last run.
        searchedNodes = resetSearchedNodes(searchedNodes);

        closestNode.dir = startWireAngle;
        closestNode.remBends = estimateRemainingBends(closestNode, destinationNode, startWireAngle);
        closestNode.heuristic = closestNode.manhattanDistance(destinationNode) + closestNode.remBends;
        closestNode.distance = 0;
        closestNode.bends = 0;
        closestNode.cost = 0;
        closestNode.score = closestNode.cost + closestNode.heuristic;
        closestNode.parent = null;
        searchedNodes.push(closestNode);

        openHeap.push(closestNode);

        while ( openHeap.length > 0 ) {
            // Get lowest f(x) scored node
            var currentNode = openHeap.shift();

            // Check if goal node has been reached, retrace path.
            if (destinationNode.compareXTo(currentNode) === 0 && destinationNode.compareYTo(currentNode) === 0) {
                return { "path": returnPath(visibilityGrid, currentNode, startPt, endPt),
                         "dirtyNodes": searchedNodes };
            }

            // Otherwise, move to closed and inspect neighbors
            currentNode.closed = true;

            // Check the forward, right, and left neighbors. No need to check reverse, as it will be closed.
            var neighbors = currentNode.getNeighbors();
            for (var j = 0; j < 3; j++ ) {
                var neighbor = neighbors.neighbors[j];

                if ( isNaN(neighbor) && !visibilityGrid[neighbor.x][neighbor.y].closed ) {

                    // Point to neighbor's entry in visibilityGrid as this has more information than just node neighbor
                    var n = visibilityGrid[neighbor.x][neighbor.y];

                    // Get g(x), shortest distance from start node to current node
                    var distance = currentNode.manhattanDistance(n),
                        bends = (j !== 0 && j !== 3) ? 5000 : 0,  // Neighbors are sorted in straight, R, L, reverse order
                        cost = currentNode.cost + distance + bends,
                        remBends = estimateRemainingBends(currentNode, destinationNode, neighbors.map[j]),
                        visited = n.visited;

                    if ((typeof n.cost === "undefined" || n.cost === null) ||
                        (!visited && (cost + remBends) < (n.cost + n.remBends))) {
                        // So far, a possible optimal route has been found
                        n.visited = true;
                        n.parent = currentNode;
                        n.dir = neighbors.map[j];
                        n.bends = bends;
                        n.remBends = remBends;
                        n.heuristic = n.manhattanDistance(destinationNode) + n.remBends;
                        n.cost = cost;
                        n.score = n.cost + n.heuristic;
                    }

                    // Update closest node if the partial cost and estimated remaining cost is better than the closest.
                    // If they are tied, go with the one which has a better partial cost.
                    if (((n.score) < (closestNode.score)) || (n.score === closestNode.score &&
                        n.cost < closestNode.cost)) {
                        closestNode = n;
                    }

                    // If this node has not yet been encountered, add it to the priority queue. If it has,
                    // then its score needs to be re-checked against the other nodes in the queue.
                    if (!visited) {
                        insert(n, openHeap, OrthogonalGridNode.compareScore);
                        searchedNodes.push(n);  // Mark the node as searched.
                    }
                    else {
                        // Remove element from array and re-check it.
                        for (var i = 0; i < openHeap.length; i++) {
                            if (n.compareXTo(openHeap[i]) === 0 && n.compareYTo(openHeap[i]) === 0) {
                                openHeap.splice(i, 1);
                                break;
                            }
                        }
                        insert(n, openHeap, OrthogonalGridNode.compareScore);
                    }
                }
            }

        }
    }

    function resetSearchedNodes(searchedNodes) {
        for ( var i = 0; i < searchedNodes.length; i++ ) {
            searchedNodes[i].resetNode();
        }
        return [];
    }

    function returnPath(visibilityGrid, currentNode, startPt, endPt) {
        var segments = [],
            segment;

        segment = new OrthogonalGridSegment(endPt.portLocation.x,
                                            endPt.portLocation.y,
                                            endPt.x,
                                            endPt.y);
        if (segment.x1 === segment.x2) {
            segment.orientation = "vertical";
        }
        else {
            segment.orientation = "horizontal";
        }
        segment.sortSegmentEndPoints();
        segment.objectLeft = 0;
        segment.objectRight = 0;
        segments.push(segment);

        while ( currentNode.parent !== null ) {
            segment = new OrthogonalGridSegment(currentNode.x,
                                                currentNode.y,
                                                currentNode.parent.x,
                                                currentNode.parent.y);
            segment.objectLeft = null;   // How far to left/top can you go before hitting object/boundary?
            segment.objectRight = null;  // " " to right/bottom


            segment.sortSegmentEndPoints();

            segment.findClosestObjects( currentNode.parent, currentNode );

            var prevSeg = segments[segments.length - 1];
            if (segments.length !== 0 && prevSeg.orientation === segment.orientation) {
                segment.extend(prevSeg);
            }
            else {
                segments.push(segment);
            }

            currentNode = visibilityGrid[currentNode.parent.x][currentNode.parent.y];
        }

        var lastSegment = segments[segments.length - 1];
        segment = new OrthogonalGridSegment(startPt.x,
                                            startPt.y,
                                            startPt.portLocation.x,
                                            startPt.portLocation.y);
        if (segment.x1 === segment.x2) {
            segment.orientation = "vertical";
        }
        else {
            segment.orientation = "horizontal";
        }

        segment.sortSegmentEndPoints();
        segment.objectLeft = 0;
        segment.objectRight = 0;

        if (lastSegment.orientation === segment.orientation) {
            segment.extend(lastSegment);
        }
        else {
            segments.push(segment);
        }

        return segments;

    }

    function estimateRemainingBends(start, end, dir) {
        // Dir is known from index in neighbors: [N, S, W, E]
        var sameLine = false,
            inFront = false;

        if ((dir === 0 || dir === 1) && (start.x === end.x)) {
            sameLine = true;
        }
        if ((dir === 2 || dir === 3) && (start.y === end.y)) {
            sameLine = true;
        }

        if (dir === 0 && (start.y - end.y > 0)) {
            inFront = true;
        }
        if (dir === 1 && (end.y - start.y > 0)) {
            inFront = true;
        }
        if (dir === 2 && (start.x - end.x > 0)) {
            inFront = true;
        }
        if (dir === 3 && (end.x - start.x > 0 )) {
            inFront = true;
        }

        if (sameLine) {
            if (inFront) {
                return 0;
            }
            else {
                return 15000;
            }
        }
        else if (inFront) {
            return 5000;
            }
        else {
            return 10000;
        }
    }


    ////////////////////////////////////////////////////////////////////////////
    /*                              Wire Nudger                               */
    ////////////////////////////////////////////////////////////////////////////


    function nudgeConnections( connections ) {

        var sharedEdges = getSharedEdges(connections),
            xyDirection,
            edgeSeparation = 5,
            portSeparator = 5;

        while (sharedEdges.vertical.length > 0 || sharedEdges.horizontal.length > 0) {

            var sharedEdge;

            if ( sharedEdges.vertical.length > 0 ) {
                sharedEdge = sharedEdges.vertical.pop();
                xyDirection = "x";
            }
            else {
                sharedEdge = sharedEdges.horizontal.pop();
                xyDirection = "y";
            }

            attemptToNudgeSharedEdges( sharedEdge, connections, xyDirection, edgeSeparation, portSeparator );
        }

        return connections;
    }


    function attemptToNudgeSharedEdges ( sharedEdge, connections, xyDirection, edgeSeparation, portSeparator ) {
        var jj,
            count = 1,
            edge,
            wireIndex,
            adjustLeft,
            maxAdjust,
            spacing;

        for (var e in sharedEdge) {

            wireIndex = sharedEdge[e].idx;
            edge = connections[e][wireIndex];

            if (wireIndex !== 0 && wireIndex !== connections[e].length - 1) {

                //if ( edge.objectLeft > 0 && edge.objectRight > 0 ) {
                adjustLeft = edge.objectLeft > edge.objectRight;
                maxAdjust = adjustLeft ? edge.objectLeft - 1 : edge.objectRight - 1;  // Avoid wire on border

                spacing = maxAdjust / Object.keys(sharedEdge).length;

                edgeSeparation = spacing < edgeSeparation ? spacing : edgeSeparation;

                if (adjustLeft) {
                    adjustMiddleWire(edge, connections[e], wireIndex, edgeSeparation, xyDirection, "left");
                }
                else {
                    adjustMiddleWire(edge, connections[e], wireIndex, edgeSeparation, xyDirection, "right");
                }

                edgeSeparation += 5;
                //}
            }
            else {

                if (connections[e].length > 1) {
                    if (wireIndex === 0) {
                        adjustPortWire(edge, connections[e], wireIndex, portSeparator, xyDirection, "first");
                    }
                    else {
                        adjustPortWire(edge, connections[e], wireIndex, portSeparator, xyDirection, "last");
                    }
                }
                // Reindex segments to account for additionally created segments.
                for (jj = 0; jj < connections[e].length; jj++) {
                    connections[e][jj].idx = jj;
                }

                if ( count & 1 ) {
                    portSeparator *= -1;
                }
                else {
                    portSeparator = -1 * portSeparator + 2;
                }
                count += -1;
            }
        }
    }


    /**
     * Adjust a middle wire segment to eliminate connections sharing segments.
     * @param edge  - segment of a wire that will be adjusted.
     * @param connection  - Wire that edge is a member of.
     * @param wireIndex  - index of edge within the connection.
     * @param edgeSeparation  - How much the segment will be adjusted
     * @param xOrY  - Principal axis that wire segment will be adjusted along.
     * @param leftright - Direction segment will be adjusted (if xOrY = X, left is west, if xOrY = Y, left is North)
     */
    function adjustMiddleWire ( edge, connection, wireIndex, edgeSeparation, xOrY, leftright ) {

        var segmentAtEnd1,
            segmentAtEnd2,
            segment1X,
            segment2X;

        segmentAtEnd1 = connection[wireIndex - 1];
        segmentAtEnd2 = connection[wireIndex + 1];

        if ( xOrY == "x" ) {
            // For the two attached segments, need to know which endpoint is connected to edge
            //   as this is the endpoint we are modifying.
            segment1X = segmentAtEnd1.x1 === edge.x1 ? "x1" : "x2";
            segment2X = segmentAtEnd2.x2 === edge.x1 ? "x2" : "x1";

            if (leftright === "left") {

                edge.x1 -= edgeSeparation;
                edge.x2 -= edgeSeparation;

                segmentAtEnd1[segment1X] -= edgeSeparation;
                segmentAtEnd2[segment2X] -= edgeSeparation;
            }
            else {
                edge.x1 += edgeSeparation;
                edge.x2 += edgeSeparation;

                segmentAtEnd1[segment1X] += edgeSeparation;
                segmentAtEnd2[segment2X] += edgeSeparation;
            }
        }
        else {

            segment1X = segmentAtEnd1.y1 === edge.y1 ? "y1" : "y2";
            segment2X = segmentAtEnd2.y2 === edge.y1 ? "y2" : "y1";

            if (leftright === "left") {

                edge.y1 -= edgeSeparation;
                edge.y2 -= edgeSeparation;

                segmentAtEnd1[segment1X] -= edgeSeparation;
                segmentAtEnd2[segment2X] -= edgeSeparation;
            }
            else {
                edge.y1 += edgeSeparation;
                edge.y2 += edgeSeparation;

                segmentAtEnd1[segment1X] += edgeSeparation;
                segmentAtEnd2[segment2X] += edgeSeparation;
            }
        }
    }


    /**
     * Adjust an end-point wire segment (one that is directly connected to a port).
     * Adjusting an end-point wire segment requires creating a new segment from the port to the new end-point.
     */
    function adjustPortWire ( edge, connection, wireIndex, edgeSeparation, xOrY, firstOrLast ) {

        var segment,
            segmentX,
            segmentY,
            newSegment;

        if ( firstOrLast === "first" ) {
            segment = connection[wireIndex + 1];
        }
        else {
            segment = connection[wireIndex - 1];
        }

        segmentX = segment.x2 === edge.x1 ? "x2" : "x1";
        segmentY = segment.y2 === edge.y1 ? "y2" : "y1";

        if ( xOrY == "x" ) {

            edge.x1 -= edgeSeparation;
            edge.x2 -= edgeSeparation;

            segment[segmentX] -= edgeSeparation;

            if ( firstOrLast !== "first" ) {

                newSegment = new OrthogonalGridSegment(
                    segment[segmentX],
                    edge[segmentY],
                    segment[segmentX] + edgeSeparation,
                    edge[segmentY],
                    "horizontal");

            } else {

                newSegment = new OrthogonalGridSegment(
                    segment[segmentX] + edgeSeparation,
                    edge[segmentY],
                    segment[segmentX],
                    edge[segmentY],
                    "horizontal");

            }

        }
        else {

            edge.y1 -= edgeSeparation;
            edge.y2 -= edgeSeparation;

            segment[segmentY] -= edgeSeparation;

            if ( firstOrLast !== "first" ) {

                newSegment = new OrthogonalGridSegment(
                    edge[segmentX],
                    edge[segmentY],
                    edge[segmentX],
                    segment[segmentY] + edgeSeparation,
                    "vertical");

            } else {

                newSegment = new OrthogonalGridSegment(
                    edge[segmentX],
                    segment[segmentY] + edgeSeparation,
                    edge[segmentX],
                    edge[segmentY],
                    "vertical");

            }

        }

        if ( firstOrLast !== "first" ) {
            connection.push( newSegment );
        }
        else {
            connection.unshift( newSegment );
        }
    }


    /**
     * For each connection A, iterate over all other connections (B) that are not A.
     * Compare each wire in A to each wire in B, checking for overlap, if they have similar orientation.
     */
    function getSharedEdges(connections) {
        var sharedEdges = {},
            sharedEdge,
            wire1,
            wire2,
            share;

        sharedEdges.horizontal = [];
        sharedEdges.vertical = [];

        for ( var i = 0; i < connections.length; i++ ) {

            for ( var k = 0; k < connections[i].length; k++ ) {

                sharedEdge = {};
                wire1 = connections[i][k];

                for ( var j = i+1; j < connections.length; j++ ) {

                    for ( var m = 0; m < connections[j].length; m++ ) {

                        wire2 = connections[j][m];
                        share = false;

                        if ( wire1.orientation === "horizontal" && wire2.orientation === wire1.orientation ) {
                            // Do the lines intersect each other at any point? (where not important)
                            if ( wire2.y1 === wire1.y1 ) {
                                wire1.sortSegmentEndPoints();
                                wire2.sortSegmentEndPoints();
                                if ( !(wire2.x2 < wire1.x1) && !(wire1.x2 < wire2.x1) ) {
                                    share = true;
                                }
                            }
                        }
                        if (wire1.orientation === "vertical" && wire2.orientation === wire1.orientation ) {
                            if ( wire2.x1 === wire1.x1 ) {
                                wire1.sortSegmentEndPoints();
                                wire2.sortSegmentEndPoints();
                                if ( !(wire2.y2 < wire1.y1) && !(wire1.y2 < wire2.y1) ) {
                                    share = true;
                                }
                            }
                        }
                        if (share) {
                            // The key is the element in connections that the wire belongs to. This is needed so that
                            // when a wire is nudged, the other wires in the same connection can also be modified.

                            if (i in sharedEdge === false) {
                                wire1.idx = k;
                                sharedEdge[i] = wire1;
                            }
                            if (j in sharedEdge === false) {
                                wire2.idx = m;
                                sharedEdge[j] = wire2;
                            }
                        }
                    }
                }

                if (Object.keys(sharedEdge).length > 0 ) {
                    sharedEdges[wire1.orientation].push(sharedEdge);
                }
            }
        }
        return sharedEdges;
    }


    /**
     * Check that no components are off of the grid or overlapping one another, prior to executing router.
     *
     * 7/28/15 - No longer pad bounding boxes. This issue should be resolved by improving the nudging
     *           algorithm.
     */
    this.validDiagramForAutoRoute = function ( components, gridHeight, gridWidth ) {
        var i, j,
            boundBox,
            invalidConditions,
            boundBoxes = [],
            componentOffGrid = false,
            overlap = false,
            message;

        for ( i = 0; i < components.length; i++ ) {
            boundBox = components[i].getGridBoundingBox();

            // GridBoundingBox gets boundBox of box symbol, it does not include the rectangle's padding.
            boundBox.x -= 10;
            boundBox.y -= 10;
            boundBox.width += 20;
            boundBox.height += 20;

            invalidConditions = [ boundBox.x <= 0,
                                  boundBox.y <= 0,
                                  boundBox.x > gridWidth,
                                  boundBox.y > gridHeight,
                                  boundBox.x + boundBox.width > gridWidth,
                                  boundBox.y + boundBox.height > gridHeight ];

            if ( invalidConditions.some(function(elem) { return !!elem; }) ) {
                componentOffGrid = true;
                if ( componentOffGrid ) {
                    message = "Component " + components[i].label + " is off or on the edge of the diagram. " +
                              "Adjust the component in order to auto-route the design.";
                    svgDiagramToast.showToast(message);
                }
                break;
            }

            boundBoxes.push(boundBox);
        }

        var numberOfBoundBoxes = boundBoxes.length;

        for ( i = 0; i < numberOfBoundBoxes; i++ ) {
            boundBox = boundBoxes[i];

            for ( j = 0; j < numberOfBoundBoxes; j++ ) {

                if ( j != i ) {

                    overlap = ( (boundBox.x < (boundBoxes[j].x + boundBoxes[j].width) &&
                    (boundBox.x + boundBox.width) > boundBoxes[j].x) &&
                    ((boundBox.y < (boundBoxes[j].y + boundBoxes[j].height)) &&
                    ((boundBox.y + boundBox.height) > boundBoxes[j].y)) );

                    if (overlap) {
                        message = "The bounding boxes for components " + components[i].label + " and " +
                                  components[j].label + " are overlapping. " +
                                  "Adjust components to auto-route.";
                        svgDiagramToast.showToast(message);
                        break;
                    }
                }
            }

            if ( overlap ) {
                break;
            }
        }

        return !(componentOffGrid || overlap);
    }

    function cleanVisibilityGraph(visibilityGraph) {

        if (visibilityGraph) {

            angular.forEach(visibilityGraph.nodes, function(value) {

                angular.forEach(value, function(gridNode) {

                    gridNode.closed = false;
                    gridNode.visited = false;
                    gridNode.parent = null;
                    gridNode.dir = null;

                    gridNode.bends = null;
                    gridNode.remBends = null;
                    gridNode.hueristic = null;
                    gridNode.cost = null;
                    gridNode.score = null;

                })

            });

            return visibilityGraph;
        }
    };

};

module.exports = OrthogonalRouter;
