'use strict';

var insert = require("../../mmsUtils/classes/simpleInsert.js"),
    Point = require("./orthogonalRouter/classes/Point.js"),
    OrthogonalGridNode = require("./orthogonalRouter/classes/OrthogonalGridNode.js"),
    OrthogonalGridSegment = require("./orthogonalRouter/classes/OrthogonalGridSegment.js"),
    VisibilityGraph = require("./orthogonalRouter/classes/VisibilityGraph.js");


var OrthogonalRouter = function () {

    var self = this;

    self.name = 'OrthogonalRouter';


    this.routeDiagram = function( diagram ) {
        // Step 1: generateVisibilityGraph
        // Step 2: AutoRouteWithGraph
        // Step 3: nudgeRoutes
        // Step 4: deleteOldRoutes
        // Step 5: drawConnections <-- Is this done here or somewhere else??

        console.log('------ This is the entry point', diagram);

        var start = performance.now();
        // Get interesting points from components.
        var points = this.getBoundingBoxAndPortPointsFromComponents( diagram.getComponents() );

        var VisibilityGraph = require("./orthogonalRouter/classes/VisibilityGraph.js"),
            visibilityGraph = new VisibilityGraph();

        visibilityGraph.generate( points, diagram.config.width, diagram.config.height );

        diagram.sweepLines = visibilityGraph.edges;
        diagram.sweepPoints = visibilityGraph.v;

        //self.generateVisibilityGraph(diagram);
        var end = performance.now();

        console.log("Graph time: " + (end - start));
        start = performance.now();
        var optimalConnections = self.autoRouteWithGraph(visibilityGraph, diagram.getWires());

        var nudgedConnections = nudgeConnections(visibilityGraph, optimalConnections);
        var tempSegs = nudgedConnections.reduce(function(a,b) {
            return a.concat(b);
        });
        diagram.optimalConnections = tempSegs;
        end = performance.now();
        console.log("Route time: " + (end - start));

    };

    this.getBoundingBoxAndPortPointsFromComponents = function ( components ) {
        var points = [];
        for ( var i = 0; i < components.length; i++ ) {
            this.getBBAndPortPointsFromComponent(components[i], points);
        }
        return points;
    };

    this.getBBAndPortPointsFromComponent = function ( component, points ) {
        var boundBox = component.getGridBoundingBox();

        // Nodes from bounding box
        points.push( new Point( boundBox.x - 10, boundBox.y - 10 ) );
        points.push( new Point( boundBox.x - 10, boundBox.y + boundBox.height + 10 ) );
        points.push( new Point( boundBox.x + boundBox.width + 10, boundBox.y - 10 ) );
        points.push( new Point( boundBox.x + boundBox.width + 10, boundBox.y + boundBox.height + 10 ) );


        // Nodes from ports
        for ( var k = 0; k < component.portInstances.length; k++ ) {
            var portPos = component.portInstances[k].getGridPosition(),
                portWireAngle = component.portInstances[k].getGridWireAngle(),
                x = portPos.x,
                y = portPos.y;

            //if ([90, -270].indexOf(portWireAngle) !== -1) {
            //    y += component.portInstances[k].portSymbol.wireLeadIn; // S port
            //}
            //else if ([-90, 270].indexOf(portWireAngle) !== -1) {
            //    y -= component.portInstances[k].portSymbol.wireLeadIn; // N port
            //}
            //else if ([180, -180].indexOf(portWireAngle) !== -1) {
            //    x -= component.portInstances[k].portSymbol.wireLeadIn; // W port
            //}
            //else {
            //    x += component.portInstances[k].portSymbol.wireLeadIn; // E port
            //}

            points.push( new Point( x, y, true, portWireAngle ) );
        }
    };

    ////////////////////////////////////////////////////////////////////////////
    /*                              Route Finder                              */
    ////////////////////////////////////////////////////////////////////////////


    this.autoRouteWithGraph = function ( visibilityGrid, wires ) {
        // Loop through connections to determine the optimal route of each one using orthogonal graph.

        var optimalConnections = [],  // Each element will be an array of wires
            searchedNodes = [];       // List of dirty nodes from previously found routes


        for ( var i = 0; i < wires.length; i++ ) {

            var wireAngle = wires[i].end1.port.getGridWireAngle(),
                wireAngle2 = wires[i].end2.port.getGridWireAngle();

            // Convert from getGridWireAngle() output to array index.
            if (wireAngle === 90 || wireAngle === -270) {wireAngle = 1;}
            else if (wireAngle === 180 || wireAngle === -180) {wireAngle = 2;}
            else if (wireAngle === 270 || wireAngle === -90) {wireAngle = 0;}
            else if (wireAngle === 0 || wireAngle === 360 || wireAngle === -360) {wireAngle = 3;}

            // Convert from getGridWireAngle() output to array index.
            if (wireAngle2 === 90 || wireAngle2 === -270) {wireAngle2 = 1;}
            else if (wireAngle2 === 180 || wireAngle2 === -180) {wireAngle2 = 2;}
            else if (wireAngle2 === 270 || wireAngle2 === -90) {wireAngle2 = 0;}
            else if (wireAngle2 === 0 || wireAngle2 === 360 || wireAngle2 === -360) {wireAngle2 = 3;}

            var result = this.findOptimalRouteSimple( visibilityGrid.vertices,
                                                wires[i].end1.port.getGridPosition(),
                                                wires[i].end2.port.getGridPosition(),
                                                wires[i].end1.port.portSymbol.wireLeadIn,
                                                wires[i].end2.port.portSymbol.wireLeadIn,
                                                wireAngle,
                                                wireAngle2,
                                                searchedNodes);

            optimalConnections.push(result.path);
            searchedNodes = result.dirtyNodes;


            // overwrite the wires 'segments' field with the optimal route.


        }
        return optimalConnections;

    };

    this.findOptimalRouteSimple = function ( visibilityGrid, startPt, endPt, startLeadIn,
                                            endLeadIn, startWireAngle, endWireAngle, searchedNodes ) {
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
                return { "path": returnPath(visibilityGrid, currentNode, startPt, startLeadIn,
                                            endLeadIn, endWireAngle, startWireAngle),
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
                        insert(n, openHeap, compareScore);  // TODO
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
                        insert(n, openHeap, compareScore);  //TODO
                    }
                }
            }

        }
    };

    function compareScore(a, b) {
        return a.score - b.score;
    }

    function resetSearchedNodes(searchedNodes) {
        for ( var i = 0; i < searchedNodes.length; i++ ) {
            searchedNodes[i].resetNode();
        }
        return [];
    }

    function returnPath(visibilityGrid, currentNode, startPt, startLeadIn, endLeadIn, endWireAngle, startWireAngle) {
        var segments = [],
            segment,
            port = true;

        while ( currentNode.parent !== null ) {
            segment = {};
            segment.x1 = currentNode.x;
            segment.y1 = currentNode.y;
            segment.x2 = currentNode.parent.x;
            segment.y2 = currentNode.parent.y;
            segment.objectLeft = null;   // How far to left/top can you go before hitting object/boundary?
            segment.objectRight = null;  // " " to right/bottom
            if (port) {
                segment.port = currentNode;  // Port end location
                segment.leadIn = endLeadIn;
                segment.portAngle = endWireAngle;
                port = false;
            }

            // Sort coordinates.
            if (segment.x2 < segment.x1) {
                var tmpx = segment.x2;
                segment.x2 = segment.x1;
                segment.x1 = tmpx;
            }
            if (segment.y2 < segment.y1) {
                var tmpy = segment.y2;
                segment.y2 = segment.y1;
                segment.y1 = tmpy;
            }

            var leftNeighborEnd1, leftNeighborEnd2,
                rightNeighborEnd1, rightNeighborEnd2;
            if (segment.x1 === segment.x2) {
                segment.orientation = "vertical";

                // Find furthest distance you can travel west before hitting object.
                leftNeighborEnd1 = currentNode.findClosestObject("west");
                leftNeighborEnd2 = currentNode.parent.findClosestObject("west");
                segment.objectLeft = Math.min(Math.abs(segment.x1 - leftNeighborEnd1),
                                              Math.abs(segment.x1 - leftNeighborEnd2));

                // Find furthest distance you can travel east before hitting object.
                rightNeighborEnd1 = currentNode.findClosestObject("east");
                rightNeighborEnd2 = currentNode.parent.findClosestObject("east");
                segment.objectRight = Math.min(Math.abs(segment.x1 - rightNeighborEnd1),
                                               Math.abs(segment.x1 - rightNeighborEnd2));
            }
            else {
                segment.orientation = "horizontal";

                // Find furthest distance you can travel north before hitting object.
                leftNeighborEnd1 = currentNode.findClosestObject("north");
                leftNeighborEnd2 = currentNode.parent.findClosestObject("north");
                segment.objectLeft = Math.min(Math.abs(segment.y1 - leftNeighborEnd1),
                                              Math.abs(segment.y1 - leftNeighborEnd2));

                // Find furthest distance you can travel south before hitting object.
                rightNeighborEnd1 = currentNode.findClosestObject("south");
                rightNeighborEnd2 = currentNode.parent.findClosestObject("south");
                segment.objectRight = Math.min(Math.abs(segment.y1 - rightNeighborEnd1),
                                               Math.abs(segment.y1 - rightNeighborEnd2));

            }

            var prevSeg = segments[segments.length - 1];
            if (segments.length !== 0 && prevSeg.orientation === segment.orientation) {
                if (segment.orientation === "horizontal" && segment.x1 < prevSeg.x1 && segment.x1 < prevSeg.x2) {
                    prevSeg.x1 = segment.x1;
                }
                else if (segment.orientation === "horizontal" && segment.x1 < prevSeg.x1 && segment.x1 < prevSeg.x2) {
                    prevSeg.x1 = segment.x1;
                }

                prevSeg.x1 = segment.x2 === prevSeg.x1 ? segment.x1 : prevSeg.x1;
                prevSeg.x2 = segment.x1 === prevSeg.x2 ? segment.x2 : prevSeg.x2;
                prevSeg.y1 = segment.y2 === prevSeg.y1 ? segment.y1 : prevSeg.y1;
                prevSeg.y2 = segment.y1 === prevSeg.y2 ? segment.y2 : prevSeg.y2;

                prevSeg.objectLeft = segment.ObjectLeft < prevSeg.objectLeft ? segment.ObjectLeft : prevSeg.objectLeft;
                prevSeg.objectRight = segment.ObjectRight < prevSeg.objectRight ? segment.ObjectRight : prevSeg.objectRight;

            }
            else {
                segments.push(segment);
            }

            currentNode = visibilityGrid[currentNode.parent.x][currentNode.parent.y];


        }
        segments[segments.length - 1].port = startPt;
        segments[segments.length - 1].leadIn = startLeadIn;
        segments[segments.length - 1].portAngle = startWireAngle;

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


    function nudgeConnections(visibilityGraph, connections) {
        // Step 0: Add in any necessary port lead in segments
        // var updatedConnections = correctPortLeadIns(connections);

        // Step 1: Gather list of shared edges
        var sharedEdges = getSharedEdges(connections);



        // Step 2: While list of shared edges is populated...
        while (sharedEdges.vertical.length > 0 || sharedEdges.horizontal.length > 0) {

            var sharedEdge,
                edge,
                e,
                seg,
                moveLeft,
                maxMove,
                spacing,
                edgeSep = null;
            // Preference to nudging vertical routes
            if (sharedEdges.vertical.length > 0) {
                sharedEdge = sharedEdges.vertical.pop();

                for (e in sharedEdge) {
                    seg = sharedEdge[e];
                    edge = connections[e][seg.idx];
                    var oldEdge = edge.x1;
                    if (true ) { //! edge.hasOwnProperty("port") ) {
                        moveLeft = edge.objectLeft > edge.objectRight;
                        maxMove = moveLeft ? edge.objectLeft : edge.objectRight;
                        spacing = maxMove / Object.keys(sharedEdge).length;
                        if (edgeSep === null) {
                            edgeSep = spacing > 10 ? 10 : spacing;
                        }

                        if (moveLeft) {
                            edge.x1 -= edgeSep;
                            edge.x2 -= edgeSep;

                            if ( seg.idx === 0 ) {
                                // find which x is the vertex
                                var x = connections[e][1].x1 === oldEdge ? "x1" : "x2";
                                connections[e][1][x] -= edgeSep;
                                connections[e].unshift({x1: connections[e][1][x], x2: oldEdge, y1: edge.port.y, y2: edge.port.y, orientation: "horizontal"});
                                //reindex segments
                                for (var jj = 0; jj < connections[e].length - 1; jj++) {
                                    connections[e][jj].idx = jj;
                                }
                            }
                            else if (seg.idx === connections[e].length - 1) {
                                var x = connections[e][connections[e].length -2].x1 === oldEdge ? "x1" : "x2";
                                connections[e][connections[e].length -2][x] -= edgeSep;
                                connections[e].push({x1: connections[e][connections[e].length -2][x], x2: oldEdge, y1: edge.port.y, y2: edge.port.y, orientation: "horizontal"});
                                // reorder segment idx
                                for (var jj = 0; jj < connections[e].length - 1; jj++) {
                                    connections[e][jj].idx = jj;
                                }
                            }
                            else {
                                var seg1 = connections[e][seg.idx - 1],
                                    seg2 = connections[e][seg.idx + 1];

                                var seg1X = seg1.x1 === edge.x1 ? "x1" : "x2",
                                    seg2X = seg1.x2 === edge.x1 ? "x2" : "x1";

                                seg1[seg1X] -= edgeSep;
                                seg2[seg2X] -= edgeSep;

                                connections[e][seg.idx - 1] = seg1;
                                connections[e][seg.idx + 1] = seg2;
                            }
                        }
                        else {
                            edge.x1 += edgeSep;
                            edge.x2 += edgeSep;

                            if ( seg.idx === 0 ) {
                                // find which x is the vertex
                                var x = connections[e][1].x1 === oldEdge ? "x1" : "x2";
                                connections[e][1][x] += edgeSep;
                                connections[e].unshift({x1: connections[e][1][x], x2: oldEdge, y1: edge.port.y, y2: edge.port.y, orientation: "horizontal"});
                                //reindex segments
                                for (var jj = 0; jj < connections[e].length - 1; jj++) {
                                    connections[e][jj].idx = jj;
                                }
                            }
                            else if (seg.idx === connections[e].length - 1) {
                                var x = connections[e][connections[e].length -2].x1 === oldEdge ? "x1" : "x2";
                                connections[e][connections[e].length -2][x] += edgeSep;
                                connections[e].push({x1: connections[e][connections[e].length -2][x], x2: oldEdge, y1: edge.port.y, y2: edge.port.y, orientation: "horizontal"});
                                // reorder segment idx
                                for (var jj = 0; jj < connections[e].length - 1; jj++) {
                                    connections[e][jj].idx = jj;
                                }
                            }
                            else {
                                var seg1 = connections[e][seg.idx - 1],
                                    seg2 = connections[e][seg.idx + 1];

                                var seg1X = seg1.x1 === oldEdge ? "x1" : "x2",
                                    seg2X = seg1.x2 === oldEdge ? "x2" : "x1";

                                seg1[seg1X] += edgeSep;
                                seg2[seg2X] += edgeSep;

                                connections[e][seg.idx - 1] = seg1;
                                connections[e][seg.idx + 1] = seg2;
                            }
                        }
                        edgeSep += edgeSep;
                    }
                    connections[e][seg.idx] = edge;  // update connection

                }
            }
            else {
                sharedEdge = sharedEdges.horizontal.pop();

                for (e in sharedEdge) {
                    seg = sharedEdge[e];
                    edge = connections[e][seg.idx];
                    var oldEdge = edge.y1;
                    if (true ) { //! edge.hasOwnProperty("port") ) {
                        moveLeft = edge.objectLeft > edge.objectRight;
                        maxMove = moveLeft ? edge.objectLeft : edge.objectRight;
                        spacing = maxMove / Object.keys(sharedEdge).length;
                        if (edgeSep === null) {
                            edgeSep = spacing > 10 ? 10 : spacing;
                        }
                        if (moveLeft) {
                            edge.y1 -= edgeSep;
                            edge.y2 -= edgeSep;

                            if ( seg.idx === 0 ) {
                                // find which x is the vertex
                                var x = connections[e][1].y1 === oldEdge ? "y1" : "y2";
                                connections[e][1][x] -= edgeSep;
                                connections[e].unshift({y1: connections[e][1][x], y2: oldEdge, x1: edge.port.x, x2: edge.port.x, orientation: "vertical"});
                                //reindex segments
                                for (var jj = 0; jj < connections[e].length - 1; jj++) {
                                    connections[e][jj].idx = jj;
                                }
                            }
                            else if (seg.idx === connections[e].length - 1) {
                                var x = connections[e][connections[e].length -2].y1 === oldEdge ? "y1" : "y2";
                                connections[e][connections[e].length -2][x] -= edgeSep;
                                connections[e].push({y1: connections[e][connections[e].length -2][x], y2: oldEdge, x1: edge.port.x, x2: edge.port.x, orientation: "vertical"});
                                // reorder segment idx
                                for (var jj = 0; jj < connections[e].length - 1; jj++) {
                                    connections[e][jj].idx = jj;
                                }
                            }
                            else {
                                var seg1 = connections[e][seg.idx - 1],
                                    seg2 = connections[e][seg.idx + 1];

                                var seg1X = seg1.y1 === edge.y1 ? "y1" : "y2",
                                    seg2X = seg1.y2 === edge.y1 ? "y2" : "y1";

                                seg1[seg1X] -= edgeSep;
                                seg2[seg2X] -= edgeSep;

                                connections[e][seg.idx - 1] = seg1;
                                connections[e][seg.idx + 1] = seg2;
                            }
                        }
                        else {
                            edge.y1 += edgeSep;
                            edge.y2 += edgeSep;

                            if ( seg.idx === 0 ) {
                                // find which x is the vertex
                                var x = connections[e][1].y1 === oldEdge ? "y1" : "y2";
                                connections[e][1][x] += edgeSep;
                                connections[e].unshift({y1: connections[e][1][x], y2: oldEdge, x1: edge.port.x, x2: edge.port.x, orientation: "vertical"});
                                //reindex segments
                                for (var jj = 0; jj < connections[e].length - 1; jj++) {
                                    connections[e][jj].idx = jj;
                                }
                            }
                            else if (seg.idx === connections[e].length - 1) {
                                var x = connections[e][connections[e].length -2].y1 === oldEdge ? "y1" : "y2";
                                connections[e][connections[e].length -2][x] += edgeSep;
                                connections[e].push({y1: connections[e][connections[e].length -2][x], y2: oldEdge, x1: edge.port.x, x2: edge.port.x, orientation: "vertical"});
                                // reorder segment idx
                                for (var jj = 0; jj < connections[e].length - 1; jj++) {
                                    connections[e][jj].idx = jj;
                                }
                            }
                            else {
                                var seg1 = connections[e][seg.idx - 1],
                                    seg2 = connections[e][seg.idx + 1];

                                var seg1X = seg1.y1 === oldEdge ? "y1" : "y2",
                                    seg2X = seg1.y2 === oldEdge ? "y2" : "y1";

                                seg1[seg1X] += edgeSep;
                                seg2[seg2X] += edgeSep;

                                connections[e][seg.idx - 1] = seg1;
                                connections[e][seg.idx + 1] = seg2;
                            }
                        }
                        edgeSep += edgeSep;
                    }
                    connections[e][seg.idx] = edge;  // update connection

                }

            }

            // Step 3: Nudge routes along one shared edge (requires shared edge in question and wires, nodes being shared).


            // Step 4: Update the wire segments based on the nudging
            // modify elements of connections that were involved in step 3


            // Step 5: Update list of shared edges to see if nudging of previous edge caused any new shared edges.
            sharedEdges = getSharedEdges(connections);
        }
        return connections;


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
            for ( var j = i+1; j < connections.length; j++ ) {
                for ( var k = 0; k < connections[i].length; k++ ) {
                    var sharedEdge = {};
                    for ( var m = 0; m < connections[j].length; m++ ) {
                        var wire1 = connections[i][k],
                            wire2 = connections[j][m],
                            share = false;

                        if ( wire1.orientation === "horizontal" && wire2.orientation === wire1.orientation ) {
                            // Do the lines intersect each other at any point? (where not important)
                            if ( wire2.y1 === wire1.y1 ) {
                                if (wire1.x1 <= wire2.x1 && wire2.x1 < wire1.x2) {
                                    share = true;
                                }
                                else {
                                    if ((wire1.x1 >= wire2.x1 && wire2.x1 > wire1.x2)) {
                                        share = true;
                                    }
                                }
                            }
                        }
                        if (wire1.orientation === "vertical" && wire2.orientation === wire1.orientation ) {
                            if ( wire2.x1 === wire1.x1 ) {
                                if (wire1.y1 <= wire2.y1 && wire2.y1 < wire1.y2) {
                                    share = true;
                                }
                                else {
                                    if ((wire1.y1 >= wire2.y1 && wire2.y1 > wire1.y2)) {
                                        share = true;
                                    }
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
                    // Only push if sharedEdge is populated
                    if (Object.keys(sharedEdge).length > 0 ) {
                        sharedEdges[wire1.orientation].push(sharedEdge);
                    }
                }
            }
        }
        return sharedEdges;
    }


};

module.exports = OrthogonalRouter;
