/*globals angular*/

'use strict';

var OrthogonalRouter = function () {

    var self = this;

    self.name = 'OrthogonalRouter';


    this.routeDiagram = function( diagram ) {

        console.log('------ This is the entry point', diagram);

        var start = performance.now();
        self.generateVisibilityGraph(diagram);
        var end = performance.now();
        console.log("Graph time: " + (end - start));

        self.autoRouteWithGraph(this.visibilityGraph, diagram.wires);

    };

    this.routeConnections = function ( components, connections ) {
        // Step 1: generateVisibilityGraph
        // Step 2: AutoRouteWithGraph
        // Step 3: nudgeRoutes
        // Step 4: deleteOldRoutes
        // Step 5: drawConnections <-- Is this done here or somewhere else??
    };

    this.generateVisibilityGraph = function ( diagram ) {
        /*
            Takes in the set of components with their coordinates of interest and generates orthogonal visibility grid.

            components: list<component>

            var component = {
                boundingBox: {
                    xMin: <double>,
                    yMin: <double>,
                    xMax: <double>,
                    yMax: <double>
                },
                ports: list<port>
            }

            var port = {
                name: <String>,
                X: <double>,
                Y: <double>,
                direction: <String> ("N", "S", "E", W")
            }

            grid: Size of style sheet for boundary calculations, and square increments. Eg,
            var grid = {
                length: <double>,
                height: <double>,
                increment: <double>
            }

         */
        this.visibilityGraph = {
            vertices: [],
            edges: []
        };
        var edges = [],
            vertices = [];

        // Get interesting points from components.
        var points = this.getNodes( diagram.components );

        // We will first get the interesting horizontal line segment, so sort by Y coordinate
        var sortedY = [].concat(points);
        sortedY.sort(function ( a, b ) { return self.compare(a, b, 0); });
        var sortedX = [].concat(points);
        sortedX.sort(function ( a, b ) { return self.compare(a, b, 1); });

        var horzSegments = this.verticalLineSweep(sortedY, diagram.config.width);
        var vertSegments = this.horizontalLineSweep(sortedX, diagram.config.height);

        var nodes = [],
            incompleteNodes = [];
        for ( var s = 0; s < vertSegments.length; s++ ) {
            vertices = this.getSegmentIntersections(vertSegments[s], horzSegments, vertices, incompleteNodes,
                                                    nodes, diagram.config.height, diagram.config.width);
        }

        edges = edges.concat(horzSegments);
        edges = edges.concat(vertSegments);
        diagram.sweepLines = edges;
        diagram.sweepPoints = [].concat(vertices);

        // At this point the edges of the grid are known. Need to determine all of the intersecting points created
        // by these segments as they represent the vertices of the grid. Each edge has two vertices.


        this.visibilityGraph.vertices = vertices;
        this.visibilityGraph.edges = edges;




    };

    this.getSegmentIntersections = function ( segment, segmentSet, intersections, incompleteNodes, nodes,
                                              gridHeight, gridWidth ) {
        // segment is the line that will be compared against all lines in the segment set.
        // Segments in segmentSet are sorted from top-down or left-right due to line sweep.

        var segX = segment.x2 - segment.x1,
            segY = segment.y2 - segment.y1;

        for ( var i = 0; i < segmentSet.length; i++ ) {
            var checkSegX = segmentSet[i].x2 - segmentSet[i].x1,
                checkSegY = segmentSet[i].y2 - segmentSet[i].y1,
                denominator = segX * checkSegY - checkSegX * segY,
                positive_denom = denominator > 0;

            if ( denominator === 0 ) {
                continue;  // collinear - shouldn't happen in this context, but still check.
            }

            // Check if the intersection between segments occurs at one of the end points.
            var share = this.doShareEndPoint(segment, segmentSet[i]);
            if ( share !== null ) {
                if ( myIndexOfPoint(share, intersections) === -1 ) {
                    intersections.push(share);
                    populateNode( share, segment, segmentSet[i], nodes,
                                  incompleteNodes, gridHeight, gridWidth );
                }
                continue;
            }

            var newSegX = segment.x1 - segmentSet[i].x1,
                newSegY = segment.y1 - segmentSet[i].y1,
                numerator1 = segX * newSegY - segY * newSegX,
                numerator2 = checkSegX * newSegY - checkSegY * newSegX;

            if ( (numerator1 < 0) === positive_denom ) {
                continue;  // collinear
            }
            else if ( (numerator2 < 0) === positive_denom ) {
                continue; // collinear
            }
            else if ( (numerator1 > denominator) === positive_denom ||
                    (numerator2 > denominator) === positive_denom ) {
                continue; // no intersection
            }

            var t = numerator2 / denominator;

            var intersection = {x: segment.x1 + (t * segX), y: segment.y1 + (t * segY)};
            if (myIndexOfPoint(intersection, intersections) !== -1) {
                continue;  // Intersection was previously found
            }

            intersections.push(intersection);

            // There is an intersection, so need to store the vertex's neighbors
            populateNode( intersection, segment, segmentSet[i], nodes, incompleteNodes, gridHeight, gridWidth );


        }
        return intersections;
    };

    function populateNode( vertex, vertSeg, horzSeg, nodes, incompleteNodes, gridHeight, gridWidth ) {
        var node = new PathNode( vertex );
        node.vertSeg = vertSeg;
        node.horzSeg = horzSeg;

        // Nodes are determined in order, sorted by X then Y, so (10, 70) comes before (10, 80).
        // Need to determine the N, S, W, E neighbors for each node. Only the N and W neighbors
        // can be determined when the node is created based on previous nodes and/or the upper
        // left boundary. The default value for N, S, W, E is null, and means there is no valid
        // neighbor in that direction for that node.

        // If incompleteNodes is populated, means a the previous node can be completed by the
        // current node. If the previous node has the same X value, but different Y value, the
        // previous node's S neighbor is the current node's vertex IFF the previous and current
        // nodes' vertical segments share an endpoint. Otherwise the previous node has no S neighbor
        // and the current node has no N neighbor. An example are two ports of a component being in
        // vertical line.

        // If the current and FIRST entry of incompleteNodes share a Y value but not an X value,
        // then you now know the current node's W neighbor and the other node's E neighbor, provided
        // a similar constraint as above holds.

        // Once a node has all 4 cardinal directions populated, remove from incompleteNodes and push to
        // nodes.
        if ( incompleteNodes.length === 0 ) {
            node.north = null;
            node.west = null;
            incompleteNodes.push(node);
            return;
        }

        var idx = incompleteNodes.length - 1,
            prevNode = incompleteNodes[idx],
            firstNode = incompleteNodes[0];
        if ( node.v.x === prevNode.v.x ) {
            if ( self.isPointOnLine(prevNode.vertSeg, {x:vertSeg.x1, y:vertSeg.y1}) ) {
                node.north = prevNode.v;
                prevNode.south = node.v;

                // If vertex is an endpoint and horzSeg is 0, west is border
                if (horzSeg.x1 === 0) {
                    node.west = null;
                }
            }
            else {
                // Segments defining vertices don't share points, the N/S directions are invalid.
                node.north = null;
                prevNode.south = null;
            }
        }
        if ( node.v.y === firstNode.v.y ) {
            if (self.isPointOnLine(firstNode.horzSeg, {x:horzSeg.x1, y:horzSeg.y1})) {
                node.west = firstNode.v;
                firstNode.east = node.v;
                if ( node.v.y !== prevNode.v.y ) {
                    prevNode.south = null;
                    node.north = null;
                }
            }
            else {
                firstNode.east = null;
                node.west = null;
            }
        }
        else {
            while ( idx > 0 ) {
                prevNode = incompleteNodes[idx];
                if ( node.v.y === prevNode.v.y ) {
                    if (self.isPointOnLine(prevNode.horzSeg, {x: horzSeg.x1, y: horzSeg.y1})) {
                        node.west = prevNode.v;
                        prevNode.east = node.v;
                        if (node.v.x !== prevNode.v.x) {
                            prevNode.south = null;
                            node.north = null;
                        }
                    }
                    else {
                        prevNode.east = null;
                        node.west = null;
                    }
                    break;
                }
                else {
                    idx = idx - 1;
                }
            }
        }

        incompleteNodes.push(node);

        if (prevNode.hasOwnProperty('north') && prevNode.hasOwnProperty('south') &&
            prevNode.hasOwnProperty('west') && prevNode.hasOwnProperty('east')) {
            // Node is now completely defined
            nodes.push( {v: prevNode.v,
                         north: prevNode.north,
                         south: prevNode.south,
                         west: prevNode.west,
                         east: prevNode.east} );
            incompleteNodes.splice(idx, 1);
        }
        else if (firstNode.hasOwnProperty('north') && firstNode.hasOwnProperty('south') &&
                 firstNode.hasOwnProperty('west') && firstNode.hasOwnProperty('east')) {
            // Node is now completely defined
            nodes.push( {v: firstNode.v,
                north: firstNode.north,
                south: firstNode.south,
                west: firstNode.west,
                east: firstNode.east} );
            incompleteNodes.splice(0, 1);
        }
    }

    function populateNode2( vertex, vertSeg, horzSeg, nodes, incompleteNodes, gridHeight, gridWidth ) {
        var node = new PathNode( vertex );
        node.vertSeg = vertSeg;
        node.horzSeg = horzSeg;

        /*
        Nodes will be created in order, sorted by X then Y, so (10, 70) comes before (10, 80).
        Need to determine the N, S, W, E neighbors for each node. Only the N and W neighbors
        can be determined when the node is created based on previous nodes and/or the upper
        left boundary. The default value for N, S, W, E is null, and means there is no valid
        neighbor in that direction for that node.

        When a node is created it is added to the list incompleteNodes. The nodes in this list
        are ones that do not have all 4 cardinal directions defined. A binary insert method is
        used to keep track of the incomplete nodes, with the key being the Y value of the node.
        At any given time there should only be one incompleteNode per Y value.

        If a new node is created that has the same Y value as one already in the list, that means
        that remaining cardinal directions can be determined using the new node. The previously
        incomplete node is now added to the 'nodes' list, and removed from incompleteNodes. The newly
        created node now takes its place in the list.

        1) Create node (done above)
        2) If the list is empty, add the node (initializing case)
        3) If node Y value not in list, this node is South of the previous node.
            3a) We now know the previous node's South neighbor, and current node's North neighbor
            3b) If the horizontal segment the node is on starts at X=0, the node's West neighbor is the boundary/null.
        4) Otherwise, grab the object at the Y value's list index, store as oldNode. oldNode is directly West
           of the current node. However, the nodes might not be connected.
            4a) If the just added node
            This also means that the X value of the created nodes has increased (next largest vertical line).
                With that, the South neighbor of the largest X value is the boundary/null.
            4b) The north neighbor of this



         */



        if ( incompleteNodes.length === 0 ) {
            node.north = null;
            node.west = null;
            incompleteNodes.push(node);
            return;
        }

    this.doShareEndPoint = function ( seg1, seg2 ) {
        if ( this.isPointOnLine(seg1, {x: seg2.x1, y: seg2.y1}) ) {
            return {x: seg2.x1, y: seg2.y1};
        }
        else if ( this.isPointOnLine(seg1, {x: seg2.x2, y: seg2.y2}) ) {
            return {x: seg2.x2, y: seg2.y2};
        }
        else if ( this.isPointOnLine(seg2, {x: seg1.x1, y: seg1.y1}) ) {
            return {x: seg1.x1, y: seg1.y1};
        }
        else if ( this.isPointOnLine(seg2, {x: seg1.x2, y: seg1.y2}) ) {
            return {x: seg1.x2, y: seg1.y2};
        }
        else {
            return null;
        }
    };

    this.isPointOnLine = function ( seg, pt ) {
        var slope = ( seg.y2 - seg.y1 ) / (seg.x2 - seg.x1 );
        if (slope === Number.POSITIVE_INFINITY) {
            if (pt.y < seg.y1 || pt.y > seg.y2) {
                // Out of range
                return false;
            }
            return (pt.x === seg.x1);
        }
        else if (slope === 0) {
            if (pt.x < seg.x1 || pt.x > seg.x2) {
                // Out of range
                return false;
            }
            return (pt.y === seg.y1);
        }
        return ((pt.y - seg.y1) === (pt.x - seg.x1));
    };

    this.getNodes = function ( components ) {
        var i, nodes = [];
        for (i = 0; i < components.length; i++) {
            this.getNodesFromComponent(components[i], nodes);
        }
        return nodes;
    };

    this.getNodesFromComponent = function ( component, nodes ) {
        var boundBox = component.getGridBoundingBox(),
            k;

        // Nodes from bounding box
        nodes.push( { x: boundBox.x, y: boundBox.y});
        nodes.push( { x: boundBox.x, y: boundBox.y + boundBox.height});
        nodes.push( { x: boundBox.x + boundBox.width, y: boundBox.y});
        nodes.push( { x: boundBox.x + boundBox.width, y: boundBox.y + boundBox.height});

        // Nodes from ports
        for ( k = 0; k < component.portInstances.length; k++ ) {
            var portPos = component.portInstances[k].getGridPosition();
            nodes.push({x: portPos.x,
                        y: portPos.y,
                        isPort: true,
                        direction: component.portInstances[k].getGridWireAngle()});
        }
    };

    this.horizontalLineSweep = function ( nodes, sweepLength ) {
        // Perform line sweep algorithm on grid.
        var createTree = require("functional-red-black-tree");
        var segments = [],
            openObjects = [],
            i,
            binTree = createTree(),
            prevNode = null;

        for ( i = 0; i < nodes.length; i++ ) {
            var checkRemove = true;


            // If node is a port that is on left or right, ignore and skip this node.
            if (typeof nodes[i].isPort !== "undefined" &&
                ( nodes[i].direction === 180 || nodes[i].direction === 360 ||
                  nodes[i].direction === -180 || nodes[i].direction === 0 )) {
                continue;
            }

            if (binTree.find(nodes[i].y).node === null) {
                // Not in tree, add
                binTree = binTree.insert(nodes[i].y, nodes[i].x);
                checkRemove = false;
            }
            // top
            if (typeof nodes[i].isPort === "undefined" || nodes[i].direction === 270 || nodes[i].direction === -90) {
                var left, leftIter = binTree.lt(nodes[i].y);
                if (leftIter.valid) {
                    // If closest left node has the same Y-coord as current node's Y-coord, lines are colinear, skip.
                    if (leftIter.value === nodes[i].x) {
                        if (binTree.length % 2 === 0) {
                            // even number of keys, therefore this is part of an object segment.
                            openObjects.push({y1: leftIter.key, y2: nodes[i].y});
                        }
                        continue;
                    }
                    else if ( prevNode !== null ) {
                        // prevNode is defined, so previous entry was the left hand side of the closing segment.
                        // Both left and right segments were defined for prevNode, and this point is in the same line
                        // as that, so it can be skipped. Also, remove these two points from the binary tree and
                        // remove the line defined by them from the openObjects list.
                        binTree = binTree.remove(prevNode);
                        binTree = binTree.remove(nodes[i].y);
                        openObjects.splice(myIndexOf({ y1: prevNode, y2: nodes[i].y }, openObjects), 1);
                        prevNode = null;
                        continue;
                    }
                    left = leftIter.key;
                }
                else {
                    left = 0;
                }
                var leftSegment = { y1: left, x1: nodes[i].x, y2: nodes[i].y, x2: nodes[i].x };
                segments.push(leftSegment);
            }
            // bottom
            if (typeof nodes[i].isPort === "undefined" || nodes[i].direction === 90 || nodes[i].direction === -270) {
                var right, rightIter = binTree.gt(nodes[i].y);
                if (rightIter.valid) {
                    var seg = {y1: nodes[i].y, y2: rightIter.key};
                    if (myIndexOf(seg, openObjects) !== -1) {
                        // Means this segment is in the list of open segments, grab the closest node from rightIter
                        rightIter = binTree.gt(rightIter.key);
                        if (rightIter.valid) {
                            right = rightIter.key;
                        }
                        else {
                            right = sweepLength;
                        }
                    }
                    else {
                        right = rightIter.key;
                    }

                }
                else {
                    right = sweepLength;
                }
                var rightSegment = { y1: nodes[i].y, x1: nodes[i].x, y2: right, x2: nodes[i].x };
                segments.push(rightSegment);
            }
            if (checkRemove ) {
                if (typeof nodes[i].isPort === "undefined") {
                    if (prevNode === null) {
                        prevNode = nodes[i].y;
                    }
                }
            }
        }
        return segments;
    };


    this.verticalLineSweep = function ( nodes, sweepLength ) {
        // Perform line sweep algorithm on grid. Method can either be vertical or horizontal implementation of line sweep.
        var createTree = require("functional-red-black-tree");
        var segments = [],
            openObjects = [],
            i,
            binTree = createTree(),
            prevNode = null;

        for ( i = 0; i < nodes.length; i++ ) {
            var checkRemove = true;


            // If node is a port that is on top or bottom, ignore and skip this node.
            if (typeof nodes[i].isPort !== "undefined" &&
                ( nodes[i].direction === 270 || nodes[i].direction === 90 ||
                  nodes[i].direction === -270 || nodes[i].direction === -90 )) {
                continue;
            }

            if (binTree.find(nodes[i].x).node === null) {
                // Not in tree, add
                binTree = binTree.insert(nodes[i].x, nodes[i].y);
                checkRemove = false;
            }
            // left
            if (typeof nodes[i].isPort === "undefined" || nodes[i].direction === 180 || nodes[i].direction === -180) {
                var left, leftIter = binTree.lt(nodes[i].x);
                if (leftIter.valid) {
                    // If closest left node has the same Y-coord as current node's Y-coord, lines are colinear, skip.
                    if (leftIter.value === nodes[i].y) {
                        if (binTree.length % 2 === 0) {
                            // even number of keys, therefore this is part of an object segment.
                            openObjects.push({x1: leftIter.key, x2: nodes[i].x});
                        }
                        continue;
                    }
                    else if ( prevNode !== null ) {
                        // prevNode is defined, so previous entry was the left hand side of the closing segment.
                        // Both left and right segments were defined for prevNode, and this point is in the same line
                        // as that, so it can be skipped. Also, remove these two points from the binary tree and
                        // remove the line defined by them from the openObjects list.
                        binTree = binTree.remove(prevNode);
                        binTree = binTree.remove(nodes[i].x);
                        openObjects.splice(myIndexOf({ x1: prevNode, x2: nodes[i].x }, openObjects), 1);
                        prevNode = null;
                        continue;
                    }
                    left = leftIter.key;
                }
                else {
                    left = 0;
                }
                var leftSegment = { x1: left, y1: nodes[i].y, x2: nodes[i].x, y2: nodes[i].y };
                segments.push(leftSegment);
            }
            // right
            if (typeof nodes[i].isPort === "undefined" || nodes[i].direction === 0 || nodes[i].direction === 360 ) {
                var right, rightIter = binTree.gt(nodes[i].x);
                if (rightIter.valid) {
                    var seg = {x1: nodes[i].x, x2: rightIter.key};
                    if (myIndexOf(seg, openObjects) !== -1) {
                        // Means this segment is in the list of open segments, grab the closest node from rightIter
                        rightIter = binTree.gt(rightIter.key);
                        if (rightIter.valid) {
                            right = rightIter.key;
                        }
                        else {
                            right = sweepLength;
                        }
                    }
                    else {
                        right = rightIter.key;
                    }

                }
                else {
                    right = sweepLength;
                }
                var rightSegment = { x1: nodes[i].x, y1: nodes[i].y, x2: right, y2: nodes[i].y };
                segments.push(rightSegment);
            }
            if (checkRemove ) {
                if (typeof nodes[i].isPort === "undefined") {
                    if (prevNode === null) {
                        prevNode = nodes[i].x;
                    }
                }
            }
        }
        return segments;
    };

    function myIndexOf(o, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].x1 === o.x1 && arr[i].x2 === o.x2) {
                return i;
            }
        }
        return -1;
    }

    function myIndexOfPoint(pt, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].x === pt.x && arr[i].y === pt.y) {
                return i;
            }
        }
        return -1;
    }

    this.lineSweep = function ( nodes, method, sweepLength ) {
      // NOT USED - REMOVE
      // Perform line sweep algorithm on grid. Method can either be vertical or horizontal implementation of line sweep.
        var segments = [],
            openObjects = [],
            horzNodes = nodes,
            i, j;


        // Components are sorted by Y coordinate and then X coordinate for position.
        // The Y coordinate sorting allows for the event queue to be know (steps in for loop where sweep line will go).

        // Due to sorting, each node's closest left and right neighbors are known.
        // If first or last entry, neighbor is boundary of grid.

        // If neighbor is at the same Y coordinate, objects are colinear, so grab the nearest neighbor of the neighbor.
        // Repeat until either neighbor is not colinear or boundary is hit.

        // At each event an object will be either open or closed. If object is opened, compare coordinates as above,
        // but also check the coordinates of any nodes in the openObjects queue.

        segments.push({ x1: 0, y1: horzNodes[0].y, x2: horzNodes[0].x, y2: horzNodes[0].y });
        segments.push({ x1: horzNodes[0].x, y1: horzNodes[0].y, x2: sweepLength, y2: horzNodes[0].y });

        for ( i = 1; i < horzNodes.length; i++ ) {
            // If node is a port that is on top or bottom, ignore and skip this node.
            if (typeof horzNodes[i].isPort !== "undefined" &&
                ( horzNodes[i].direction === 270 || horzNodes[i].direction === 90 )) {
                horzNodes.splice(i);
                i--;
                continue;
            }

            var leftSegment = { x1: 0, y1: horzNodes[i].y, x2: horzNodes[i].x, y2: horzNodes[i].y },
                rightSegment = { x1: horzNodes[i].x, y1: horzNodes[i].y, x2: sweepLength, y2: horzNodes[i].y };

            for ( j = 0; j < openObjects.length; j++ ) {

                if (openObjects[j].x2 < horzNodes[i].x) {
                    leftSegment.x1 = Math.max(openObjects[j].x2, leftSegment.x1);
                }
                if (openObjects[j].x1 > horzNodes[i].x) {
                    rightSegment.x2 = Math.min(openObjects[j].x1, rightSegment.xs);
                }


                if (typeof horzNodes[i - 1].isPort === "undefined" && typeof horzNodes[i].isPort === "undefined") {
                    if (openObjects[j].x1 === horzNodes[i - 1].x && openObjects[j].x2 === horzNodes[i].x) {
                        // This and the previous nodes make up a segment already in OpenObjects... closing of object.
                        openObjects.splice(j);
                    }
                }
            }
            if ( openObjects.length === 0 ) {
                    openObjects.push( { x1: horzNodes[i-1].x, y1: horzNodes[i-1].y, x2: horzNodes[i].x, y2: horzNodes[i].y});
                }



            if ( segments.indexOf( leftSegment ) === -1 ) {
                segments.push(leftSegment);
            }
            if ( segments.indexOf( rightSegment ) === -1 ) {
                segments.push(rightSegment);
            }

            console.log(horzNodes[i]);
            console.log(leftSegment);
            console.log(rightSegment);
            console.log(segments.length);


        }
        return segments;
    };

    // Lexagraphical sorting
    this.compare = function ( node, compareNode, order ) {
        if ( order === 1 ) {
            // Sort by X then Y (Vertical line sweep)
            if  ( node.x > compareNode.x ) {
                return 1;
            }
            if ( node.x < compareNode.x ) {
                return -1;
            }
            if (node.y > compareNode.y ) {
                return 1;
            }
            if (node.y < compareNode.y ) {
                return -1;
            }
        }
        else {
            // Sort by Y then X (Horizontal line sweep)
            if (node.y > compareNode.y ) {
                return 1;
            }
            if (node.y < compareNode.y ) {
                return -1;
            }
            if ( node.x > compareNode.x ) {
                return 1;
            }
            if ( node.x < compareNode.x ) {
                return -1;
            }
        }
        return 0; // Same point
    };

    this.autoRouteWithGraph = function ( visibilityGrid, wires ) {
        /*
            Loop through connections to determine the optimal route of each one using orthogonal graph.

            connection: list<connection>

            var connection = {
                srcPort: <port>,
                dstPort: <port>
            }

             var port = {
                 name: <String>,
                 X: <double>,
                 Y: <double>
             }

        */
        var optimalConnections = [];  // Each element will be a wire


        for ( var i = 0; i < wires.length; i++ ) {
            // Find the optimal route for this wire
            this.findOptimalRoute( visibilityGrid,
                                   wires[i].end1.port.getGridPosition(),
                                   wires[i].end2.port.getGridPosition() );

            // overwrite the wires 'segments' field with the optimal route.
        }

    };

    this.findOptimalRoute = function ( visibilityGrid, startPt, endPt ) {
        /*
            Given the orthogonal grid and two points to be connected, find optimal route.  --> A* search
            Returns an array of vertical/horizontal segments making up the connection.
        */

        var segments = [],
            openHeap = getHeap(),
            destinationNode = new PathNode(endPt),
            closestNode = new PathNode(startPt);

        start.md = manhattanDistance(startPt, endPt);

        openHeap.push(closestNode);

        while( openHeap.size() > 0 ) {
            var currentNode = openHeap.pop();

            // Have we reached the destination?
            if ( currentNode === destinationNode ) {
                return route(currentNode);
            }

            // Move currentNode from open to closed.
            currentNode.closed = true;

            // Find the neighbors of the node.


        }










    };

    function PathNode( v ) {
        this.v = {x: v.x, y: v.y};
    }

    function route( node ) {
        // todo
    }

    function manhattanDistance( pt1, pt2 ) {
        return Math.abs(pt2.x - pt1.x) + Math.abs(pt2.y - pt1.y);
    }

    function getHeap() {
        return new BinaryHeap(function(node) {
            return node.lv;
        });
    }

    function BinaryHeap(scoreFunction){
        this.content = [];
        this.scoreFunction = scoreFunction;
    }

    BinaryHeap.prototype = {
        push: function(element) {
            // Add the new element to the end of the array.
            this.content.push(element);
            // Allow it to bubble up.
            this.bubbleUp(this.content.length - 1);
        },

        pop: function() {
            // Store the first element so we can return it later.
            var result = this.content[0];
            // Get the element at the end of the array.
            var end = this.content.pop();
            // If there are any elements left, put the end element at the
            // start, and let it sink down.
            if (this.content.length > 0) {
                this.content[0] = end;
                this.sinkDown(0);
            }
            return result;
        },

        remove: function(node) {
            var length = this.content.length;
            // To remove a value, we must search through the array to find
            // it.
            for (var i = 0; i < length; i++) {
                if (this.content[i] !== node) {
                    continue;
                }
                // When it is found, the process seen in 'pop' is repeated
                // to fill up the hole.
                var end = this.content.pop();
                // If the element we popped was the one we needed to remove,
                // we're done.
                if (i === length - 1) {
                    break;
                }
                // Otherwise, we replace the removed element with the popped
                // one, and allow it to float up or sink down as appropriate.
                this.content[i] = end;
                this.bubbleUp(i);
                this.sinkDown(i);
                break;
            }
        },

        size: function() {
            return this.content.length;
        },

        bubbleUp: function(n) {
            // Fetch the element that has to be moved.
            var element = this.content[n], score = this.scoreFunction(element);
            // When at 0, an element can not go up any further.
            while (n > 0) {
                // Compute the parent element's index, and fetch it.
                var parentN = Math.floor((n + 1) / 2) - 1,
                    parent = this.content[parentN];
                // If the parent has a lesser score, things are in order and we
                // are done.
                if (score >= this.scoreFunction(parent)) {
                    break;
                }

                // Otherwise, swap the parent with the current element and
                // continue.
                this.content[parentN] = element;
                this.content[n] = parent;
                n = parentN;
            }
        },

        sinkDown: function(n) {
            // Look up the target element and its score.
            var length = this.content.length,
                element = this.content[n],
                elemScore = this.scoreFunction(element);

            while(true) {
                // Compute the indices of the child elements.
                var child2N = (n + 1) * 2, child1N = child2N - 1;
                // This is used to store the new position of the element,
                // if any.
                var swap = null;
                // If the first child exists (is inside the array)...
                if (child1N < length) {
                    // Look it up and compute its score.
                    var child1 = this.content[child1N],
                        child1Score = this.scoreFunction(child1);
                    // If the score is less than our element's, we need to swap.
                    if (child1Score < elemScore) {
                        swap = child1N;
                    }
                }
                // Do the same checks for the other child.
                if (child2N < length) {
                    var child2 = this.content[child2N],
                        child2Score = this.scoreFunction(child2);
                    if (child2Score < (swap === null ? elemScore : child1Score)) {
                        swap = child2N;
                    }
                }

                // No need to swap further, we are done.
                if (swap === null) {
                    break;
                }

                // Otherwise, swap and continue.
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }
        }
    };

    this.nudgeRoutes = function ( connections ) {
        /*
            Takes in the optimal connections calculated, and separates them where segments are shared.
            Updates the list of connections to reflect nudged positions.
        */
        var nudgedConnections = [];
        this.connections = nudgedConnections;
    };

    this.deleteOldRoutes = function ( oldConnections ) {
        // Input to auto router is a collection of connections. Once these connections are optimized, delete old lines.
    };

};

module.exports = OrthogonalRouter;
