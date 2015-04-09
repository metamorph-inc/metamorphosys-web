'use strict';

var insert = require("../../mmsUtils/classes/simpleInsert.js");

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
        self.generateVisibilityGraph(diagram);
        var end = performance.now();
        console.log("Graph time: " + (end - start));
        start = performance.now();
        var optimalConnections = self.autoRouteWithGraph(this.visibilityGraph, diagram.wires);
        // diagram.optimalConnections = optimalConnections[0]; old

        var tempSegs = optimalConnections.reduce(function(a,b) {
            return a.concat(b);
        });
        diagram.optimalConnections = tempSegs;
        end = performance.now();
        console.log("Route time: " + (end - start));

    };

    this.generateVisibilityGraph = function ( diagram ) {
        /*
            Takes in the set of components with coordinates of interest and generates an orthogonal visibility grid.
            The interesting coordinates include bounding box corners and port locations.
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
            vertices = this.getSegmentIntersections(vertSegments[s], horzSegments, vertices, incompleteNodes, nodes,  diagram.config.height);
        }

        // NOTE:
        // At this point, all nodes and neighbors are determined except for far East nodes, and nodes who are a port
        // on the left-hand side of a component. The E neighbor never would have been found for these. Handle this
        // during A* search. (Could also loop through components again, but that is costly...). Just add to nodes.
        var j = 0;
        while (incompleteNodes.length !== 0) {
            var incNode = incompleteNodes[j];

            if ( incNode.v.x in nodes === false ) {
                nodes[incNode.v.x] = { };
            }
            nodes[incNode.v.x][incNode.v.y] = { v: incNode.v,
                                                north: incNode.north,
                                                south: typeof incNode.south === "undefined" ? diagram.config.height : incNode.south,
                                                west: incNode.west,
                                                east: typeof incNode.east === "undefined" ? diagram.config.width : incNode.east };
            incompleteNodes.splice(j, 1);
        }



        edges = edges.concat(horzSegments);
        edges = edges.concat(vertSegments);
        diagram.sweepLines = edges;
        diagram.sweepPoints = vertices;

        // At this point the edges of the grid are known. Need to determine all of the intersecting points created
        // by these segments as they represent the vertices of the grid. Each edge has two vertices.


        this.visibilityGraph.vertices = nodes;
        this.visibilityGraph.edges = edges;




    };

    this.getSegmentIntersections = function ( segment, segmentSet, intersections, incompleteNodes, nodes, gh ) {
        // segment is the line that will be compared against all lines in the segment set.
        // Segments in segmentSet are sorted from top-down or left-right due to line sweep.

        var segX = segment.x2 - segment.x1,
            segY = segment.y2 - segment.y1;

        for ( var i = 0; i < segmentSet.length; i++ ) {
            var checkSegX = segmentSet[i].x2 - segmentSet[i].x1,
                checkSegY = segmentSet[i].y2 - segmentSet[i].y1,
                denominator = segX * checkSegY - checkSegX * segY,
                positiveDenom = denominator > 0;

            if ( denominator === 0 ) {
                continue;  // collinear - shouldn't happen in this context, but still check.
            }

            // Check if the intersection between segments occurs at one of the end points.
            var share = this.doShareEndPoint(segment, segmentSet[i]);
            if ( share !== null ) {
                if ( myIndexOfPoint(share, intersections) === -1 ) {
                    intersections.push(share);
                    populateNode( share, segment, segmentSet[i], nodes, incompleteNodes, gh );
                }
                continue;
            }

            var newSegX = segment.x1 - segmentSet[i].x1,
                newSegY = segment.y1 - segmentSet[i].y1,
                numerator1 = segX * newSegY - segY * newSegX,
                numerator2 = checkSegX * newSegY - checkSegY * newSegX;

            if ( (numerator1 < 0) === positiveDenom ) {
                continue;  // collinear
            }
            else if ( (numerator2 < 0) === positiveDenom ) {
                continue; // collinear
            }
            else if ( (numerator1 > denominator) === positiveDenom ||
                    (numerator2 > denominator) === positiveDenom ) {
                continue; // no intersection
            }

            var t = numerator2 / denominator;

            var intersection = {x: segment.x1 + (t * segX), y: segment.y1 + (t * segY)};
            if (myIndexOfPoint(intersection, intersections) !== -1) {
                continue;  // Intersection was previously found
            }

            intersections.push(intersection);

            // There is an intersection, so need to store the vertex's neighbors
            // populateNode( intersection, segment, segmentSet[i], nodes, incompleteNodes, gridHeight, gridWidth );
            populateNode( intersection, segment, segmentSet[i], nodes, incompleteNodes, gh );

        }
        return intersections;
    };

    function populateNode( vertex, vertSeg, horzSeg, nodes, incompleteNodes, gh ) {
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
            node.north = 0;
            node.west = 0;
            insert(node, incompleteNodes, compareY);
            return node;
        }

        // Add new node to list
        var idx = insert(node, incompleteNodes, compareY) - 1,
            matchNode = null,
            smallNeighbor = null,
            checkComplete = false;

        node = incompleteNodes[idx];

        // Check if Y value is duplicated. If it is, new node will be added directly after the existing one.
        if (idx !== 0 && compareY(incompleteNodes[idx], incompleteNodes[idx-1]) === 0) {

            checkComplete = true;
            matchNode = incompleteNodes[idx-1];
            smallNeighbor = idx-1 === 0 ? null : idx - 2;

            var largeNeighbor = idx === incompleteNodes.length - 1 ? null : idx + 1;

            ///// Horizontal segments
            // See if the horizontal segments of each node overlap at all. If so, there is a segment between them.
            // Otherwise there is not (eg, the nodes are ports on opposite sides of component).
            if (self.isPointOnLine(matchNode.horzSeg, {x:horzSeg.x1, y:horzSeg.y1})) {
                node.west = matchNode.v;
                matchNode.east = node.v;
            }
            else {
                matchNode.east = matchNode.v.x;
                node.west = node.v.x;
            }

            if (smallNeighbor === null) {
                // This node is at the top of the grid. Since points are sorted, we know previous point was
                // the largest Y value for that X, so the previous node's S is null and this node's N is null.
                node.north = 0;
                incompleteNodes[incompleteNodes.length - 1].south = gh;
            }
            if (largeNeighbor === null) {
                incompleteNodes[incompleteNodes.length - 2].south = gh;
            }

        }
        else {
            // Node didn't exist, so it was added.
            node.west = 0;
        }

        // Grab closest small neighbor in Y that has the same X value, provided node isn't first in list.
        if (idx !== 0) {
            var i = idx - 1;

            smallNeighbor = incompleteNodes[i];
            while (compareX(node, smallNeighbor) !== 0 && manhattanDistance(node.v, smallNeighbor.v) !== 0) {
                i -= 1;
                if (i < 0) {
                    console.log('No vertical segment match.');
                    node.north = 0;
                    break;
                }
                else {
                    // If here, you have a node who is closer to current node, but to the left on a different line.
                    // If this happens, it means that this 'close' node is a port who will not have an E neighbor.
                    // smallNeighbor.east = null;

                    // Check if providing this direction completed that node.

                    smallNeighbor = incompleteNodes[i];
                }
            }


            // Make sure smallNeighbor was found
            if (node.north !== 0) {
                // See if the vertical segments of each node overlap at all. If so, there is a segment between them.
                // Otherwise there is not (eg, the nodes are ports on opposite sides of component).
                if (self.isPointOnLine(smallNeighbor.vertSeg, {x: vertSeg.x1, y: vertSeg.y1})) {
                    node.north = smallNeighbor.v;
                    smallNeighbor.south = node.v;
                }
                else {
                    smallNeighbor.south = smallNeighbor.v.y;
                    node.north = node.v.y;
                }
            }
        }
        else {
            node.north = 0;
        }

        if (checkComplete) {
            // Only nodes that can be completed are ones where a matchNode has been found and filled out.
            if (matchNode.hasOwnProperty('north') && matchNode.hasOwnProperty('south') &&
                matchNode.hasOwnProperty('west') && matchNode.hasOwnProperty('east')) {
                // Node is now completely defined
                if ( matchNode.v.x in nodes === false ) {
                    nodes[matchNode.v.x] =  { };
                }
                nodes[matchNode.v.x][matchNode.v.y] = { v: matchNode.v,
                                                        north: matchNode.north,
                                                        south: matchNode.south,
                                                        west: matchNode.west,
                                                        east: matchNode.east };


                incompleteNodes.splice(idx-1, 1);
            }
        }


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
        // Perform line sweep algorithm on grid. Generate vertical line segments.
        var createTree = require("functional-red-black-tree");
        var segments = [],
            openObjects = [],
            i,
            binTree = createTree(),
            prevNode = null;

        for ( i = 0; i < nodes.length; i++ ) {
            var checkRemove = true;

            // If node is a port that is on left or right, ignore and skip this node.
            var isInvalidPort = (typeof nodes[i].isPort !== "undefined" &&
                                ( nodes[i].direction === 180 || nodes[i].direction === 360 ||
                                  nodes[i].direction === -180 || nodes[i].direction === 0 ));

            // If port is on left/right and inside of the component bounding box, a vertical segment needs to be made.
            if (isInvalidPort) {
                continue;
            }

            if (binTree.find(nodes[i].y).node === null) {
                // Not in tree, add
                binTree = binTree.insert(nodes[i].y, nodes[i].x);
                checkRemove = false;
            }
            // top
            if (typeof nodes[i].isPort === "undefined" || nodes[i].direction === 270 ||
                                                          nodes[i].direction === -90) {
                var left, leftIter = binTree.lt(nodes[i].y);
                if (leftIter.valid) {
                    // If closest left node has the same Y-coord as current node's Y-coord, lines are collinear, skip.
                    if (leftIter.value === nodes[i].x) {
                        if (binTree.length % 2 === 0 && typeof nodes[i].isPort === "undefined") {
                            // even number of keys, therefore this is part of an object segment.
                            openObjects.push({y1: leftIter.key, y2: nodes[i].y, x: nodes[i].x});
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
                        openObjects.splice(myIndexOfY({ y1: prevNode, y2: nodes[i].y }, openObjects), 1);
                        prevNode = null;
                        continue;
                    }
                    left = leftIter.key;
                    if (typeof nodes[i].direction !== "undefined" && nodes[i].y > leftIter.key) {
                        var keyIsMin = false;
                        for (var n = 0; n < openObjects.length; n++) {
                            if ( openObjects[n].y1 === leftIter.key ) {
                                keyIsMin = true;
                                break;
                            }
                        }
                        if (keyIsMin) {
                            // Means the port is not in line with the bounding box (inside of it). Grab the next top iter.
                            leftIter = binTree.lt(leftIter.key);
                            if (leftIter.valid) {
                                left = leftIter.key;
                            }
                            else {
                                left = 0;
                            }
                        }
                    }
                    else {
                        left = leftIter.key;
                    }
                }
                else {
                    left = 0;
                }
                var leftSegment = { y1: left, x1: nodes[i].x, y2: nodes[i].y, x2: nodes[i].x };
                segments.push(leftSegment);
            }
            // bottom
            if (typeof nodes[i].isPort === "undefined" || nodes[i].direction === 90 ||
                                                          nodes[i].direction === -270) {
                var right = findNextValidRightNeighbor ( nodes[i], "y", binTree, openObjects, sweepLength);

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
        // Perform line sweep algorithm on grid.
        var createTree = require("functional-red-black-tree");
        var segments = [],
            openObjects = [],
            i,
            binTree = createTree(),
            prevNode = null;

        for ( i = 0; i < nodes.length; i++ ) {
            var checkRemove = true;


            // If node is a port that is on bottom or top, ignore and skip this node.
            var isInvalidPort = (typeof nodes[i].isPort !== "undefined" &&
                                ( nodes[i].direction === 270 || nodes[i].direction === 90 ||
                                  nodes[i].direction === -270 || nodes[i].direction === -90));

            // If port is on top/bottom and inside of the component bounding box, a horz segment needs to be made.
            if (isInvalidPort) {
                continue;
            }

            if (binTree.find(nodes[i].x).node === null) {
                // Not in tree, add
                binTree = binTree.insert(nodes[i].x, nodes[i].y);
                checkRemove = false;
            }
            // left
            if (typeof nodes[i].isPort === "undefined" || nodes[i].direction === 180 ||
                                                          nodes[i].direction === -180) {
                var left, leftIter = binTree.lt(nodes[i].x);
                if (leftIter.valid) {
                    // If closest left node has the same Y-coord as current node's Y-coord, lines are colinear, skip.
                    if (leftIter.value === nodes[i].y) {
                        if (binTree.length % 2 === 0 && typeof nodes[i].isPort === "undefined") {
                            // even number of keys, therefore this is part of an object segment.
                            openObjects.push({x1: leftIter.key, x2: nodes[i].x, y: nodes[i].y});
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
                        openObjects.splice(myIndexOfX({ x1: prevNode, x2: nodes[i].x }, openObjects), 1);
                        prevNode = null;
                        continue;
                    }
                    left = leftIter.key;
                    if (typeof nodes[i].direction !== "undefined" && nodes[i].x > leftIter.key) {
                        // Check that leftIter.key is actually a part of the openObject that the port belongs to
                        var keyIsMin = false;
                        for (var n = 0; n < openObjects.length; n++) {
                            if ( openObjects[n].x1 === leftIter.key ) {
                                keyIsMin = true;
                                break;
                            }
                        }
                        if (keyIsMin) {
                            // Means the port is not in line with the bounding box (inside of it). Grab the next left iter.
                            leftIter = binTree.lt(leftIter.key);
                            if (leftIter.valid) {
                                left = leftIter.key;
                            }
                            else {
                                left = 0;
                            }
                        }
                    }
                    else {
                        left = leftIter.key;
                    }
                }
                else {
                    left = 0;
                }
                var leftSegment = { x1: left, y1: nodes[i].y, x2: nodes[i].x, y2: nodes[i].y };
                segments.push(leftSegment);
            }
            // right
            if (typeof nodes[i].isPort === "undefined" || nodes[i].direction === 0 ||
                                                          nodes[i].direction === 360) {
                var right = findNextValidRightNeighbor(nodes[i], "x", binTree, openObjects, sweepLength);

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

    function findNextValidRightNeighbor ( node, axis, binTree, openObjects, sweepLength) {
        var right, rightIter = binTree.gt(node[axis]);
        if (rightIter.valid) {
            var seg = {};
            seg[axis+1] = node[axis];
            seg[axis+2] = rightIter.key;  // {y1: node[axis], y2: rightIter.key}

            var ltoe = inSetAndLessThanOrEqual(seg, openObjects, axis+1, axis+2);
            // X-coords will be the same, need to see if y2 coord of seg is equal or less than open object y2
            if (ltoe !== -1) {
                // Means this segment is in the list of open segments, grab the closest node from rightIter that
                // isn't a part of the open segment. The object may have many ports so...

                // Need to check if seg is on line that defines an open object. In the case where there is a port,
                // seg will lie on the line of an open object. Need to repeatedly grab the node's right neighbor
                // defines the open object completely (x = x & y = y).

                while ( ltoe.equal === false ) {
                    rightIter = binTree.gt(rightIter.key);
                    seg[axis+2] = rightIter.key;
                    ltoe = inSetAndLessThanOrEqual(seg, openObjects, axis+1, axis+2);
                }

                // At this point the line is defined along the object, but this segment's visibility will continue
                // either to the next open object, or to the boundary. So need to grab the right neighbor once more.

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
                if (typeof node.direction !== "undefined" && node[axis] < rightIter.key) {
                    var keyIsMin = false;
                    for (var n = 0; n < openObjects.length; n++) {
                        if ( openObjects[n][axis+2] === rightIter.key ) {
                            keyIsMin = true;
                            break;
                        }
                    }
                    if (keyIsMin) {
                        // Means the port is not in line with the bounding box (inside of it). Grab the next left iter.
                        rightIter = binTree.gt(rightIter.key);
                        if (rightIter.valid) {
                            right = rightIter.key;
                        }
                        else {
                            right = sweepLength;
                        }
                    }
                }
            }

        }
        else {
            right = sweepLength;
        }
        return right;
    }

    function myIndexOfX(o, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].x1 === o.x1 && arr[i].x2 === o.x2) {
                return i;
            }
        }
        return -1;
    }

    function myIndexOfY(o, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].y1 === o.y1 && arr[i].y2 === o.y2) {
                return i;
            }
        }
        return -1;
    }

    function inSetAndLessThanOrEqual(o, arr, min, max) {
        // Checks if segments with same starting point have same ending point. If segments do not have
        // matching starting points, return -1.
        for (var i = 0; i < arr.length; i++) {
            if (o[max] < arr[i][max] && o[min] === arr[i][min]) {
                return {"idx": i, "equal": false};
            }
            if (o[max] === arr[i][max] && o[min] === arr[i][min]) {
                return {"idx": i, "equal": true};
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

            var result = this.findOptimalRoute( visibilityGrid.vertices,
                                                wires[i].end1.port.getGridPosition(),
                                                wires[i].end2.port.getGridPosition(),
                                                wireAngle,
                                                searchedNodes);

            optimalConnections.push(result.path);
            searchedNodes = result.dirtyNodes;


            // overwrite the wires 'segments' field with the optimal route.


        }
        return optimalConnections;

    };

    this.findOptimalRoute = function ( visibilityGrid, startPt, endPt, startWireAngle, searchedNodes ) {
        // A* Search
        // cost = cost of this partial path from the start node to the current node, plus current number of bends.
        // heuristic = estimated guess for the cost of the remaining path from the current node to end node, plus
        //             the estimated number of remaining bends.
        // score = cost + heuristic

        var openHeap = getHeap(),
            destinationNode = visibilityGrid[endPt.x][endPt.y],
            closestNode = visibilityGrid[startPt.x][startPt.y];

        // For the case where multiple connections are being checked, need to erase computed values from last run.
        searchedNodes = resetSearchedNodes(searchedNodes);

        closestNode.dir = startWireAngle;
        closestNode.remBends = estimateRemainingBends(closestNode.v, destinationNode.v, startWireAngle);
        closestNode.heuristic = manhattanDistance(closestNode.v, destinationNode.v) + closestNode.remBends;
        closestNode.distance = 0;
        closestNode.bends = 0;
        closestNode.cost = 0;
        closestNode.score = closestNode.cost + closestNode.heuristic;
        closestNode.parent = null;
        searchedNodes.push(closestNode);

        openHeap.push(closestNode);

        while ( openHeap.size() > 0 ) {
            // Get lowest f(x) scored node
            var currentNode = openHeap.pop();

            // Check if goal node has been reached, retrace path.
            if (isSamePoint(destinationNode, currentNode) === true) {
                return { "path": returnPath(visibilityGrid, currentNode, startPt),
                         "dirtyNodes": searchedNodes };
            }

            // Otherwise, move to closed and inspect neighbors
            currentNode.closed = true;

            // Check each of the 4 neighbors. TODO: Can this be reduced to 3? Not checking reverse neighbor
            var neighbors = getNeighbors(currentNode);
            for (var j = 0; j < 4; j++ ) {
                var neighbor = neighbors.neighbors[j];

                if ( isNaN(neighbor) && !visibilityGrid[neighbor.x][neighbor.y].closed ) {

                    // Point to neighbor's entry in visibilityGrid as this has more information than just node neighbor
                    var n = visibilityGrid[neighbor.x][neighbor.y];

                    // Get g(x), shortest distance from start node to current node
                    var distance = manhattanDistance(currentNode.v, n.v),
                        bends = (j !== 0 && j !== 3) ? 5000 : 0,  // Neighbors are sorted in straight, R, L, reverse order
                        cost = currentNode.cost + distance + bends,
                        remBends = estimateRemainingBends(currentNode.v, destinationNode.v, neighbors.map[j]),
                        visited = n.visited;

                    if ((typeof n.cost === "undefined" || n.cost === null) ||
                        (!visited && (cost + remBends) < (n.cost + n.remBends))) {
                        // So far, a possible optimal route has been found
                        n.visited = true;
                        n.parent = currentNode;
                        n.dir = neighbors.map[j];
                        n.bends = bends;
                        n.remBends = remBends;
                        n.heuristic = manhattanDistance(n.v, destinationNode.v) + n.remBends;
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
                        openHeap.push(n);
                        searchedNodes.push(n);  // Mark the node as searched.
                    }
                    else {
                        openHeap.rescoreElement(n);
                    }
                }
            }

        }
    };

    function getNeighbors(node) {
        // Return neighbors in a sorted order, with preference to neighbor in same direction,
        //  followed by the right neighbor, left neighbor, and reverse neighbor.

        // Since order of neighbors is based on [N, S, W, E] index, need to return index map so that
        // when currentNode is updated, the direction can be updated correctly, rather than relying
        // on the index of the for loop.

        if (node.dir === 0) {
            // Going North
            return { "neighbors": [node.north, node.east, node.west, node.south], "map": [0, 3, 2, 1] };
        }
        if (node.dir === 1) {
            // Going South
            return { "neighbors": [node.south, node.west, node.east, node.north], "map": [1, 2, 3, 0] };
        }
        if (node.dir === 2) {
            // Going West
            return { "neighbors": [node.west, node.north, node.south, node.east], "map": [2, 0, 1, 3] };
        }
        if (node.dir === 3) {
            // Going East
            return { "neighbors": [node.east, node.south, node.north, node.west], "map": [3, 1, 0, 2] };
        }
    }

    function resetSearchedNodes(searchedNodes) {
        for (var i = 0; i < searchedNodes.length; i++) {
            resetNode(searchedNodes[i]);
        }
        return [];
    }

    function resetNode(node) {
        node.heuristic = 0;
        node.bends = 0;
        node.remBends = 0;
        node.score = 0;
        node.dir = 0;
        node.visited = false;
        node.closed = false;
        node.cost = null;
        node.parent = null;
    }

    function returnPath(visibilityGrid, currentNode, startPt) {
        var segments = [],
            segment;

        while ( currentNode.parent !== null ) {
            segment = {};
            segment.x1 = currentNode.v.x;
            segment.y1 = currentNode.v.y;
            segment.x2 = currentNode.parent.v.x;
            segment.y2 = currentNode.parent.v.y;
            segment.objectLeft = null;   // How far to left/top can you go before hitting object/boundary?
            segment.objectRight = null;  // " " to right/bottom

            if (segment.x1 === segment.x2) {
                segment.orientation = "vertical";
            }
            else {
                segment.orientation = "horizontal";
            }

            if (segments.length !== 0 && segments[segments.length - 1].orientation === segment.orientation) {
                segments[segments.length - 1].x2 = segment.x2;
                segments[segments.length - 1].y2 = segment.y2;
            }
            else {
                segments.push(segment);
            }

            currentNode = visibilityGrid[currentNode.parent.v.x][currentNode.parent.v.y];


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

    var compareY = function (a, b) {
        try {
            return a.v.y - b.v.y;
        } catch (err) {
            return -99;
        }
    };

    var compareX = function (a, b) {
        try {
            return a.v.x - b.v.x;
        } catch (err) {
            return -99;
        }
    };

    function isSamePoint(a, b) {
        return compareX(a, b) === 0 && compareY(a, b) === 0;
    }

    function PathNode( v ) {
        this.v = {x: v.x, y: v.y};
    }

    function manhattanDistance( pt1, pt2 ) {
        return Math.abs(pt2.x - pt1.x) + Math.abs(pt2.y - pt1.y);
    }


    /*
    *
    *                   *** Binary Heap ***
    *    Original: http://eloquentjavascript.net/1st_edition/appendix2.html
    *    With modifications by: http://github.com/bgrins/javascript-astar
    *
    */

    function getHeap() {
        return new BinaryHeap(function(node) {
            return node.score;
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

        rescoreElement: function(node) {
            this.sinkDown(this.content.indexOf(node));
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

};

module.exports = OrthogonalRouter;
