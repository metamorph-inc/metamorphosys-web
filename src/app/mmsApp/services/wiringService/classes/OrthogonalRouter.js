'use strict';

var insert = require("../../mmsUtils/classes/simpleInsert.js"),
    Point = require("./orthogonalRouter/classes/Point.js"),
    OrthogonalGridNode = require("./orthogonalRouter/classes/OrthogonalGridNode.js"),
    OrthogonalGridSegment = require("./orthogonalRouter/classes/OrthogonalGridSegment.js");


var OrthogonalRouter = function () {

    var self = this;

    self.name = 'OrthogonalRouter';


    this.routeDiagram = function( diagram ) {
        // Step 1: generateVisibilityGraph
        // Step 2: AutoRouteWithGraph
        // Step 3: nudgeRoutes
        // Step 4: deleteOldRoutes
        // Step 5: drawConnections <-- Is this done here or somewhere else??

        var validDiagram = this.validDiagramForAutoRoute ( diagram.getComponents(),
                                                           diagram.config.height,
                                                           diagram.config.width );

        if ( validDiagram ) {
            var start = performance.now();

            var VisibilityGraph = require("./orthogonalRouter/classes/VisibilityGraph.js"),
                visibilityGraph = new VisibilityGraph();

            var points = this.getBoundingBoxAndPortPointsFromComponents(diagram.getComponents(), visibilityGraph);

            visibilityGraph.generate(points, diagram.config.width, diagram.config.height);


            var end = performance.now();

            console.log("Graph time: " + (end - start));
            start = performance.now();
            var optimalConnections = self.autoRouteWithGraph(visibilityGraph, diagram.getWires(), points);

            var nudgedConnections = nudgeConnections(optimalConnections);
            var wires = diagram.getWires();
            //
            for ( var w = 0; w < wires.length; w++ ) {
                wires[w].segments = [];
                wires[w].segments = nudgedConnections[w];
            }
            //
            //end = performance.now();
            //console.log("Route time: " + (end - start));
            //
            //
            //diagram.sweepLines = visibilityGraph.edges;
            //diagram.sweepPoints = visibilityGraph.vertices;
            //var tempSegments = optimalConnections.reduce(function (a, b) {
            //    return a.concat(b);
            //});
            //diagram.optimalConnections = tempSegments;
        }
    };

    this.getBoundingBoxAndPortPointsFromComponents = function ( components, visibilityGraph ) {
        var points = [];
        for ( var i = 0; i < components.length; i++ ) {
            this.getBBAndPortPointsFromComponent(components[i], points, visibilityGraph);
        }
        return points;
    };

    this.getBBAndPortPointsFromComponent = function ( component, points, visibilityGraph ) {
        var boundBox = component.getGridBoundingBox();

        // Nodes from bounding box
        points.push( new Point( boundBox.x - 10, boundBox.y - 10 ) );
        points.push( new Point( boundBox.x - 10, boundBox.y + boundBox.height + 10 ) );
        points.push( new Point( boundBox.x + boundBox.width + 10, boundBox.y - 10 ) );
        points.push( new Point( boundBox.x + boundBox.width + 10, boundBox.y + boundBox.height + 10 ) );
        visibilityGraph.boundingBoxes.push({ x: boundBox.x - 10,
                                             y: boundBox.y - 10,
                                             width: boundBox.x + 10,
                                             height: boundBox.y + 10} );

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

            points.push( new Point( x, y, true, portWireAngle, {x:actualX, y:actualY} ) );
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

            var wireAngle = wires[i].end1.port.getGridWireAngle();

            // Convert from getGridWireAngle() output to array index.
            if (wireAngle === 90 || wireAngle === -270) {wireAngle = 1;}
            else if (wireAngle === 180 || wireAngle === -180) {wireAngle = 2;}
            else if (wireAngle === 270 || wireAngle === -90) {wireAngle = 0;}
            else if (wireAngle === 0 || wireAngle === 360 || wireAngle === -360) {wireAngle = 3;}

            var j,
                numberOfPoints = points.length,
                wire1Position = null,
                wire2Position = null,
                actualPos1 = wires[i].end1.port.getGridPosition(),
                actualPos2 = wires[i].end2.port.getGridPosition();
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

            optimalConnections.push(result.path);
            searchedNodes = result.dirtyNodes;


            // Overwrite the wires 'segments' field with the optimal route.
            //wires[i].segments = [];
            //wires[i].segments = result.path;

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
                        for (var i = 0; openHeap.length-1; i++) {
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
        segment = new OrthogonalGridSegment(startPt.portLocation.x,
                                            startPt.portLocation.y,
                                            startPt.x,
                                            startPt.y);
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
            portSeparator = 2;

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
            //break;
            // Update list of shared edges to see if nudging of previous edge caused any new shared edges.
            // ^^ No longer do this as we only want to improve the graph, not make it perfect.
            //    If ports share segments it is ok as it is valid in the electric sense.
            //sharedEdges = getSharedEdges(connections);
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

            // Do not adjust segments that are directly connected to ports.
            //if (wireIndex !== 0 && wireIndex !== connections[e].length - 1) {
            //
            //    adjustLeft = edge.objectLeft > edge.objectRight;
            //    maxAdjust = adjustLeft ? edge.objectLeft : edge.objectRight;
            //
            //    spacing = maxAdjust / Object.keys(sharedEdge).length;
            //
            //    edgeSeparation = spacing < edgeSeparation ? spacing : edgeSeparation;
            //
            //    if (adjustLeft) {
            //        adjustWireLeftOrRight(edge, connections[e], wireIndex, edgeSeparation, xyDirection, "left");
            //    }
            //    else {
            //        adjustWireLeftOrRight(edge, connections[e], wireIndex, edgeSeparation, xyDirection, "right");
            //    }
            //
            //    edgeSeparation += 10;
            //}
            if (wireIndex !== 0 && wireIndex !== connections[e].length - 1) {
                adjustLeft = edge.objectLeft > edge.objectRight;
                maxAdjust = adjustLeft ? edge.objectLeft : edge.objectRight;

                spacing = maxAdjust / Object.keys(sharedEdge).length;

                edgeSeparation = spacing < edgeSeparation ? spacing : edgeSeparation;

                if (adjustLeft) {
                    adjustWireLeftOrRight(edge, connections[e], wireIndex, edgeSeparation, xyDirection, "left");
                }
                else {
                    adjustWireLeftOrRight(edge, connections[e], wireIndex, edgeSeparation, xyDirection, "right");
                }

                edgeSeparation += 10;
            }
            else if ( wireIndex === 0 ) {
                adjustAndCreateWireLeftOrRight(edge, connections[e], wireIndex, portSeparator, xyDirection, "left", "first");
                //reindex segments
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
            else {
                adjustAndCreateWireLeftOrRight(edge, connections[e], wireIndex, portSeparator, xyDirection, "left", "last");
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
     * Adjust a wire segment to eliminate connections sharing segments.
     * @param edge  - segment of a wire that will be adjusted.
     * @param connection  - Wire that edge is a member of.
     * @param wireIndex  - index of edge within the connection.
     * @param edgeSeparation  - How much the segment will be adjusted
     * @param xy  - Wil
     * @param leftright
     */
    function adjustWireLeftOrRight ( edge, connection, wireIndex, edgeSeparation, xy, leftright ) {

        var segmentAtEnd1,
            segmentAtEnd2,
            segment1X,
            segment2X;

        segmentAtEnd1 = connection[wireIndex - 1];
        segmentAtEnd2 = connection[wireIndex + 1];

        if ( xy == "x" ) {
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


    function adjustAndCreateWireLeftOrRight ( edge, connection, wireIndex, edgeSeparation, xy, leftright, firstOrLast ) {

        var segment,
            segmentX,
            segmentY;

        if ( firstOrLast === "first" ) {
            segment = connection[wireIndex + 1];

            if ( xy == "x" ) {
                segmentX = segment.x2 === edge.x1 ? "x2" : "x1";

                if (leftright === "left") {

                    edge.x1 -= edgeSeparation;
                    edge.x2 -= edgeSeparation;

                    // find which x is the vertex
                    segment[segmentX] -= edgeSeparation;
                    connection.unshift({x1: segment[segmentX],
                                        x2: segment[segmentX] + edgeSeparation,
                                        y1: edge.y1,
                                        y2: edge.y1,
                                        orientation: "horizontal"});
                }
                else {
                    edge.x1 += edgeSeparation;
                    edge.x2 += edgeSeparation;

                    segment[segmentX] += edgeSeparation;
                    connection.push({x1: segment[segmentX] - edgeSeparation,
                                     x2: segment[segmentX],
                                     y1: edge.y1,
                                     y2: edge.y1,
                                     orientation: "horizontal"});
                }
            }
            else {
                segmentY = segment.y2 === edge.y1 ? "y2" : "y1";

                if (leftright === "left") {

                    edge.y1 -= edgeSeparation;
                    edge.y2 -= edgeSeparation;

                    segment[segmentY] -= edgeSeparation;
                    connection.unshift({y1: segment[segmentY],
                        y2: segment[segmentY] + edgeSeparation,
                        x1: edge.x1,
                        x2: edge.x1,
                        orientation: "vertical"});
                }
                else {
                    edge.y1 += edgeSeparation;
                    edge.y2 += edgeSeparation;

                    segment[segmentY] += edgeSeparation;
                    connection.push({y1: segment[segmentY] - edgeSeparation,
                        y2: segment[segmentY],
                        x1: edge.x1,
                        x2: edge.x1,
                        orientation: "vertical"});
                }
            }
        }
        else {
            segment = connection[wireIndex - 1];

            if ( xy == "x" ) {
                segmentX = segment.x2 === edge.x1 ? "x2" : "x1";

                if (leftright === "left") {

                    edge.x1 -= edgeSeparation;
                    edge.x2 -= edgeSeparation;

                    segment[segmentX] -= edgeSeparation;
                    connection.unshift({
                        x1: segment[segmentX],
                        x2: segment[segmentX] + edgeSeparation,
                        y1: edge.y1,
                        y2: edge.y1,
                        orientation: "horizontal"
                    });
                }
                else {
                    edge.x1 += edgeSeparation;
                    edge.x2 += edgeSeparation;

                    segment[segmentX] += edgeSeparation;
                    connection.push({
                        x1: segment[segmentX] - edgeSeparation,
                        x2: segment[segmentX],
                        y1: edge.y1,
                        y2: edge.y1,
                        orientation: "horizontal"
                    });
                }
            }
            else {
                segmentY = segment.y2 === edge.y1 ? "y2" : "y1";

                if (leftright === "left") {

                    edge.y1 -= edgeSeparation;
                    edge.y2 -= edgeSeparation;

                    segment[segmentY] -= edgeSeparation;
                    connection.unshift({y1: segment[segmentY],
                                        y2: segment[segmentY] + edgeSeparation,
                                        x1: edge.x1,
                                        x2: edge.x1,
                                        orientation: "vertical"});
                }
                else {
                    edge.y1 += edgeSeparation;
                    edge.y2 += edgeSeparation;

                    segment[segmentY] += edgeSeparation;
                    connection.push({y1: segment[segmentY] - edgeSeparation,
                                     y2: segment[segmentY],
                                     x1: edge.x1,
                                     x2: edge.x1,
                                     orientation: "vertical"});
                }
            }
        }
    }

    /**
     * For each connection A, iterate over all other connections (B) that are not A.
     * Compare each wire in A to each wire in B, checking for overlap, if they have similar orientation.
     */
    function getSharedEdges_notworking(connections) {
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
                            wire1.sortSegmentEndPoints();
                            wire2.sortSegmentEndPoints();
                            if ( !(wire2.x2 < wire1.x1) && !(wire1.x2 < wire2.x1) ) {
                                share = true;
                            }
                        }
                        if (wire1.orientation === "vertical" && wire2.orientation === wire1.orientation ) {
                            wire1.sortSegmentEndPoints();
                            wire2.sortSegmentEndPoints();
                            if ( !(wire2.y2 < wire1.y1) && !(wire1.y2 < wire2.y1) ) {
                                share = true;
                            }
                        }
                        if (share) {
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

                // Only push if sharedEdge is populated
                if (Object.keys(sharedEdge).length > 0 ) {
                    sharedEdges[wire1.orientation].push(sharedEdge);
                }
            }
        }
        return sharedEdges;
    }




    function getSharedEdges(connections) {
        /*
         For each connection A, iterate over all other connections (B) that are not A.
         Compare each wire in A to each wire in B, checking for overlap, if they have similar orientation.
         */
        var sharedEdges = {};

        sharedEdges.horizontal = [];
        sharedEdges.vertical = [];
        for ( var i = 0; i < connections.length; i++ ) {
            for ( var k = 0; k < connections[i].length; k++ ) {
                var sharedEdge = {};
                for ( var j = i+1; j < connections.length; j++ ) {

                    for ( var m = 0; m < connections[j].length; m++ ) {
                        var wire1 = connections[i][k],
                            wire2 = connections[j][m],
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
                            // Each element in shared Edges will be an object containing all of the
                            // wire segments that interfere. These segments contain the closest left/right
                            // each may move for nudging. The key is the element in connections that the wire
                            // belongs to. This is needed so that when a wire is nudged, the other wires in
                            // the same connection can also be modified.

                            // Since the wires in each connection have been condensed, a wire should only
                            // interfere with any other connection only once, for each vert or horz direction

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
                // Only push if sharedEdge is populated
                if (Object.keys(sharedEdge).length > 0 ) {
                    sharedEdges[wire1.orientation].push(sharedEdge);
                }
            }
        }
        return sharedEdges;
    }






    /**
     * Check that no components are off of the grid or overlapping one another, prior to executing router.
     */
    this.validDiagramForAutoRoute = function ( components, gridHeight, gridWidth ) {
        var boundBox,
            invalidConditions,
            boundBoxes = [],
            componentOffGrid = false,
            overlap = false;

        for ( var c = 0; c < components.length; c++ ) {
            boundBox = components[c].getGridBoundingBox();

            boundBox.x -= 10;
            boundBox.y -= 10;
            boundBox.height += 10;
            boundBox.width += 10;

            invalidConditions = [ boundBox.x < 0,
                                  boundBox.y < 0,
                                  boundBox.x > gridWidth,
                                  boundBox.y > gridHeight,
                                  boundBox.x + boundBox.width > gridWidth,
                                  boundBox.y + boundBox.height > gridHeight ];

            if ( invalidConditions.some(function(elem) { return !!elem; }) ) {
                componentOffGrid = true;
                if ( componentOffGrid ) {
                    alert("A component is off the diagram grid. Adjust components to auto-route.");
                }
                break;
            }

            boundBoxes.push(boundBox);
        }

        var numberOfBoundBoxes = boundBoxes.length;

        for ( var b = 1; b < numberOfBoundBoxes; b++ ) {
            boundBox = boundBoxes[b-1];

            overlap = ( (boundBox.x < (boundBoxes[b].x + boundBoxes[b].width) &&
            (boundBox.x + boundBox.width) > boundBoxes[b].x) &&
            ((boundBox.y < (boundBoxes[b].y + boundBoxes[b].height)) &&
            ((boundBox.y + boundBox.height) > boundBoxes[b].y)) );

            if ( overlap ) {
                alert("Two or more components are overlapping. Adjust components to auto-route.");
                break;
            }
        }

        return !(componentOffGrid || overlap);
    }

};

module.exports = OrthogonalRouter;
