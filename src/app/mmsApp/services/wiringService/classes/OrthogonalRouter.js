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
        var optimalConnections = self.autoRouteWithGraph(this.visibilityGraph, diagram.getWires());

        var nudgedConnections = nudgeConnections(this.visibilityGraph, optimalConnections);
        var tempSegs = nudgedConnections.reduce(function(a,b) {
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
        var points = this.getNodes( diagram.getComponents() );

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
        // At this point, all nodes and neighbors are determined except for far East and bottom right south nodes,
        // and nodes who are a port
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

            // Collinear if denominator = 0
            if ( denominator !== 0 ) {
                // Check if an intersection between segments occurs at one of the end points.
                var share = this.doShareEndPoint(segment, segmentSet[i]);
                if ( share !== null && myIndexOfPoint(share, intersections) === -1 ) {
                    intersections.push(share);
                    populateNode(share, segment, segmentSet[i], nodes, incompleteNodes, gh);
                }
                else {
                    var newSegX = segment.x1 - segmentSet[i].x1,
                        newSegY = segment.y1 - segmentSet[i].y1,
                        numerator1 = segX * newSegY - segY * newSegX,
                        numerator2 = checkSegX * newSegY - checkSegY * newSegX,
                        collinear = ( (numerator1 < 0) === positiveDenom ) || ( (numerator2 < 0) === positiveDenom ),
                        noIntersect = ( (numerator1 > denominator) === positiveDenom ||
                                        (numerator2 > denominator) === positiveDenom );

                    if ( !collinear && !noIntersect ) {
                        var t = numerator2 / denominator,
                            intersection = {x: segment.x1 + (t * segX), y: segment.y1 + (t * segY)};

                        // Check intersection wasn't previously found
                        if ( myIndexOfPoint(intersection, intersections) === -1 ) {
                            intersections.push(intersection);

                            // There is an intersection, so need to store the vertex's neighbors
                            populateNode(intersection, segment, segmentSet[i], nodes, incompleteNodes, gh);
                        }
                    }
                }
            }
            if (segment.port !== null && myIndexOfPoint(segment.port, intersections) === -1) {
                intersections.push(segment.port);
                populateNode(segment.port, segment, segmentSet[i], nodes, incompleteNodes, gh);
            }
            if ( segmentSet[i].port !== null && myIndexOfPoint(segmentSet[i].port, intersections) === -1 ) {
                intersections.push(segmentSet[i].port);
                populateNode(segmentSet[i].port, segment, segmentSet[i], nodes, incompleteNodes, gh);
            }
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
        var nodes = [];
        for ( var i = 0; i < components.length; i++ ) {
            this.getNodesFromComponent(components[i], nodes);
        }
        return nodes;
    };

    this.getNodesFromComponent = function ( component, nodes ) {
        var boundBox = component.getGridBoundingBox();

        // Nodes from bounding box
        nodes.push( { x: boundBox.x - 10, y: boundBox.y - 10} );
        nodes.push( { x: boundBox.x - 10, y: boundBox.y + boundBox.height + 10} );
        nodes.push( { x: boundBox.x + boundBox.width + 10, y: boundBox.y - 10} );
        nodes.push( { x: boundBox.x + boundBox.width + 10, y: boundBox.y + boundBox.height + 10} );

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

            nodes.push( { x: x,
                          y: y,
                          isPort: true,
                          direction: portWireAngle } );
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
            var specialCasePort = false,
                skipLeft = false,
                skipRight = false;

            // If yc is in range of an open object, and x > open object x (inside bb).
            // If prevNode defined and x < prevNode x (inside bb on right).
            for (var k = 0; k < openObjects.length; k++) {
                if (nodes[i].y < openObjects[k].y2 && nodes[i].y > openObjects[k].y1) {
                    if ((prevNode === null && nodes[i].x > openObjects[k].x) ||
                        (prevNode !== null && nodes[i].x < prevNode.x)) {

                        if (!isInvalidPort) {
                            // If valid port, but inside bb, we know both end points. Valid segment should
                            // only go in one of the two directions however. Need to find which endpoint
                            // the port is closer to so we know to skip the other side.
                            var distEnd1 = Math.abs(nodes[i].y - openObjects[k].y1),
                                distEnd2 = Math.abs(nodes[i].y - openObjects[k].y2);

                            skipLeft = distEnd1 > distEnd2;
                            skipRight = !skipLeft;
                        }


                        specialCasePort = true;
                        break;  // We've found the port we're looking for, no need to loop through the others.
                    }
                }
            }

            if (isInvalidPort) {
            //if (isInvalidPort && !specialCasePort) {
                continue;
            }

            if (binTree.find(nodes[i].y).node === null) {
                // Not in tree, add
                binTree = binTree.insert(nodes[i].y, nodes[i].x);
                checkRemove = false;
            }
            // top
            if ((typeof nodes[i].isPort === "undefined" || nodes[i].direction === 270 ||
                                                          nodes[i].direction === -90 || specialCasePort) && !skipLeft) {
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
                    else if ( prevNode !== null && !specialCasePort ) {
                        // prevNode is defined, so previous entry was the left hand side of the closing segment.
                        // Both left and right segments were defined for prevNode, and this point is in the same line
                        // as that, so it can be skipped. Also, remove these two points from the binary tree and
                        // remove the line defined by them from the openObjects list.
                        binTree = binTree.remove(prevNode.y);
                        binTree = binTree.remove(nodes[i].y);
                        openObjects.splice(myIndexOfY({ y1: prevNode.y, y2: nodes[i].y }, openObjects), 1);
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
                var port = typeof nodes[i].isPort === "undefined" ? null : {x: nodes[i].x, y: nodes[i].y};
                var leftSegment = { y1: left, x1: nodes[i].x, y2: nodes[i].y, x2: nodes[i].x, port: port };
                segments.push(leftSegment);
            }
            // bottom
            if ((typeof nodes[i].isPort === "undefined" || nodes[i].direction === 90 ||
                                                          nodes[i].direction === -270 || specialCasePort) && !skipRight) {
                var right = findNextValidRightNeighbor ( nodes[i], "y", binTree, openObjects, sweepLength);

                var port = typeof nodes[i].isPort === "undefined" ? null : {x: nodes[i].x, y: nodes[i].y};
                var rightSegment = { y1: nodes[i].y, x1: nodes[i].x, y2: right, x2: nodes[i].x, port: port };
                segments.push(rightSegment);
            }
            if (checkRemove ) {
                if (typeof nodes[i].isPort === "undefined") {
                    if (prevNode === null) {
                        prevNode = {y: nodes[i].y, x: nodes[i].x};
                    }
                }
            }
            if (specialCasePort) {
                binTree = binTree.remove(nodes[i].y);
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
            prevNode = null,
            prevPort = null;

        for ( i = 0; i < nodes.length; i++ ) {
            var checkRemove = true;


            // If node is a port that is on bottom or top, ignore and skip this node.
            var isInvalidPort = (typeof nodes[i].isPort !== "undefined" &&
                                ( nodes[i].direction === 270 || nodes[i].direction === 90 ||
                                  nodes[i].direction === -270 || nodes[i].direction === -90));

            // If port is on top/bottom and inside of the component bounding box, a horz segment needs to be made.
            var specialCasePort = false,
                skipLeft = false,
                skipRight = false;


            // A valid port may also be inside a bb. Check for both valid/invalid cases.
            for (var k = 0; k < openObjects.length; k++) {
                if (nodes[i].x < openObjects[k].x2 && nodes[i].x > openObjects[k].x1) {
                    if ((prevNode === null && nodes[i].y > openObjects[k].y) ||
                        (prevNode !== null && nodes[i].y < prevNode.y)) {

                        if (!isInvalidPort) {
                            // If valid port, but inside bb, we know both end points. Valid segment should
                            // only go in one of the two directions however. Need to find which endpoint
                            // the port is closer to so we know to skip the other side.
                            var distEnd1 = Math.abs(nodes[i].x - openObjects[k].x1),
                                distEnd2 = Math.abs(nodes[i].x - openObjects[k].x2);

                            skipLeft = distEnd1 > distEnd2;
                            skipRight = !skipLeft;
                        }

                        specialCasePort = true;
                        break;  // We've found the port we're looking for, no need to loop through the others.
                    }
                }
            }

            if (isInvalidPort) {
            //if (isInvalidPort && !specialCasePort) {
                //prevPort = nodes[i];
                continue;
            }

            if (binTree.find(nodes[i].x).node === null) {
                // Not in tree, add
                binTree = binTree.insert(nodes[i].x, nodes[i].y);
                checkRemove = false;
            }
            // left
            if ((typeof nodes[i].isPort === "undefined" || nodes[i].direction === 180 ||
                                                          nodes[i].direction === -180 || specialCasePort) && !skipLeft) {
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
                    else if ( prevNode !== null && !specialCasePort) {
                        // prevNode is defined, so previous entry was the left hand side of the closing segment.
                        // Both left and right segments were defined for prevNode, and this point is in the same line
                        // as that, so it can be skipped. Also, remove these two points from the binary tree and
                        // remove the line defined by them from the openObjects list.
                        binTree = binTree.remove(prevNode.x);
                        binTree = binTree.remove(nodes[i].x);
                        openObjects.splice(myIndexOfX({ x1: prevNode.x, x2: nodes[i].x }, openObjects), 1);
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
                var port = typeof nodes[i].isPort === "undefined" ? null : {x: nodes[i].x, y: nodes[i].y};
                var leftSegment = { x1: left, y1: nodes[i].y, x2: nodes[i].x, y2: nodes[i].y, port: port };
                segments.push(leftSegment);
            }
            // right
            if ((typeof nodes[i].isPort === "undefined" || nodes[i].direction === 0 ||
                                                          nodes[i].direction === 360 || specialCasePort) && !skipRight) {
                var right = findNextValidRightNeighbor(nodes[i], "x", binTree, openObjects, sweepLength);

                var port = typeof nodes[i].isPort === "undefined" ? null : {x: nodes[i].x, y: nodes[i].y};
                var rightSegment = { x1: nodes[i].x, y1: nodes[i].y, x2: right, y2: nodes[i].y, port: port };
                segments.push(rightSegment);
            }
            if (checkRemove ) {
                if (typeof nodes[i].isPort === "undefined") {
                    if (prevNode === null) {
                        prevNode = {x: nodes[i].x, y: nodes[i].y};
                    }
                }
            }
            if (specialCasePort) {
                binTree = binTree.remove(nodes[i].x);
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

    // Sorts points based on <X,Y> position, and whether you want preference given to X or Y.
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
        closestNode.remBends = estimateRemainingBends(closestNode.v, destinationNode.v, startWireAngle);
        closestNode.heuristic = manhattanDistance(closestNode.v, destinationNode.v) + closestNode.remBends;
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
            if (compareX(destinationNode, currentNode) === 0 && compareY(destinationNode, currentNode) === 0) {
                return { "path": returnPath(visibilityGrid, currentNode, startPt, startLeadIn,
                                            endLeadIn, endWireAngle, startWireAngle),
                         "dirtyNodes": searchedNodes };
            }

            // Otherwise, move to closed and inspect neighbors
            currentNode.closed = true;

            // Check the forward, right, and left neighbors. No need to check reverse, as it will be closed.
            var neighbors = getNeighbors(currentNode);
            for (var j = 0; j < 3; j++ ) {
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
                        insert(n, openHeap, compareScore);
                        searchedNodes.push(n);  // Mark the node as searched.
                    }
                    else {
                        // Remove element from array and re-check it.
                        for (var i = 0; openHeap.length-1; i++) {
                            if (compareX(n, openHeap[i]) === 0 && compareY(n, openHeap[i]) === 0) {
                                openHeap.splice(i, 1);
                                break;
                            }
                        }
                        insert(n, openHeap, compareScore);
                    }
                }
            }

        }
    };

    function compareScore(a, b) {
        return a.score - b.score;
    }


    function getNeighbors(node) {
        // Return neighbors in a sorted order, with preference to neighbor in same direction,
        //  followed by the right neighbor, left neighbor, and reverse neighbor.

        // Since order of neighbors is based on [N, S, W, E] index, need to return index map so that
        // when currentNode is updated, the direction can be updated correctly, rather than relying
        // on the index of the for loop.

        if ( node.dir === 0 ) {
            // Going North
            return { "neighbors": [node.north, node.east, node.west, node.south], "map": [0, 3, 2, 1] };
        }
        if ( node.dir === 1 ) {
            // Going South
            return { "neighbors": [node.south, node.west, node.east, node.north], "map": [1, 2, 3, 0] };
        }
        if ( node.dir === 2 ) {
            // Going West
            return { "neighbors": [node.west, node.north, node.south, node.east], "map": [2, 0, 1, 3] };
        }
        if ( node.dir === 3 ) {
            // Going East
            return { "neighbors": [node.east, node.south, node.north, node.west], "map": [3, 1, 0, 2] };
        }
    }

    function resetSearchedNodes(searchedNodes) {
        for ( var i = 0; i < searchedNodes.length; i++ ) {
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

    function returnPath(visibilityGrid, currentNode, startPt, startLeadIn, endLeadIn, endWireAngle, startWireAngle) {
        var segments = [],
            segment,
            port = true;

        while ( currentNode.parent !== null ) {
            segment = {};
            segment.x1 = currentNode.v.x;
            segment.y1 = currentNode.v.y;
            segment.x2 = currentNode.parent.v.x;
            segment.y2 = currentNode.parent.v.y;
            segment.objectLeft = null;   // How far to left/top can you go before hitting object/boundary?
            segment.objectRight = null;  // " " to right/bottom
            if (port) {
                segment.port = currentNode.v;  // Port end location
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
                leftNeighborEnd1 = findClosestObject(currentNode, "west");
                leftNeighborEnd2 = findClosestObject(currentNode.parent, "west");
                segment.objectLeft = Math.min(Math.abs(segment.x1 - leftNeighborEnd1),
                                              Math.abs(segment.x1 - leftNeighborEnd2));

                // Find furthest distance you can travel east before hitting object.
                rightNeighborEnd1 = findClosestObject(currentNode, "east");
                rightNeighborEnd2 = findClosestObject(currentNode.parent, "east");
                segment.objectRight = Math.min(Math.abs(segment.x1 - rightNeighborEnd1),
                                               Math.abs(segment.x1 - rightNeighborEnd2));
            }
            else {
                segment.orientation = "horizontal";

                // Find furthest distance you can travel north before hitting object.
                leftNeighborEnd1 = findClosestObject(currentNode, "north");
                leftNeighborEnd2 = findClosestObject(currentNode.parent, "north");
                segment.objectLeft = Math.min(Math.abs(segment.y1 - leftNeighborEnd1),
                                              Math.abs(segment.y1 - leftNeighborEnd2));

                // Find furthest distance you can travel south before hitting object.
                rightNeighborEnd1 = findClosestObject(currentNode, "south");
                rightNeighborEnd2 = findClosestObject(currentNode.parent, "south");
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

            currentNode = visibilityGrid[currentNode.parent.v.x][currentNode.parent.v.y];


        }
        segments[segments.length - 1].port = startPt;
        segments[segments.length - 1].leadIn = startLeadIn;
        segments[segments.length - 1].portAngle = startWireAngle;

        return segments;

    }

    function findClosestObject(node, direction) {
        while ( typeof node[direction] === "object" ) {
            node = node[direction];
        }

        if ( typeof node[direction] === "undefined" && (direction === "west" || direction === "east")) {
            return node.x;
        }
        if ( typeof node[direction] === "undefined" && (direction === "north" || direction === "south")) {
            return node.y;
        }
        else {
            return node[direction];  // Node neighbor in this direction is a number, aka wall.
        }
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
        return a.v.y - b.v.y;
    };

    var compareX = function (a, b) {
        return a.v.x - b.v.x;
    };

    function PathNode( v ) {
        this.v = {x: v.x, y: v.y};
    }

    function manhattanDistance( pt1, pt2 ) {
        return Math.abs(pt2.x - pt1.x) + Math.abs(pt2.y - pt1.y);
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

    //function correctPortLeadIns(connections) {
    //    for ( var i = 0 ; i < connections.length; i++ ) {
    //        for ( var j = 0; j < connections[i].length; j++ ) {
    //            var wire = connections[i][j],
    //                d;
    //
    //            if ( typeof wire.port !== "undefined" ) {
    //                if ( wire.orientation === "horizontal" ) {
    //                    if ( wire.portAngle === 0 ) {
    //                        if (j === 0) {
    //                            connections[i].unshift({
    //                                y1: wire.port.y, y2: wire.port.y - wire.leadIn,
    //                                x1: wire.port.x, x2: wire.port.x,
    //                                port: wire.port, orientation: "vertical"
    //                            });
    //                            d = connections[i][2].x1 === wire.port.x ? "x1" : "x2";
    //                            connections[i][2][d] -= wire.leadIn;
    //                            // reorder segment idx
    //                            for (var jj = 0; jj < connections[i].length - 1; jj++) {
    //                                connections[i][jj].idx = jj;
    //                            }
    //                        }
    //                        else if (j === connections[i].length - 1) {
    //                            connections[i].push({
    //                                y1: wire.port.y, y2: wire.port.y - wire.leadIn,
    //                                x1: wire.port.x, x2: wire.port.x,
    //                                port: wire.port, orientation: "vertical"
    //                            });
    //                            d = connections[i][connections[i].length - 3].x1 === wire.port.x ? "x1" : "x2";
    //                            connections[i][connections[i].length - 3][d] -= wire.leadIn;
    //                            // reorder segment idx
    //                            for (var jj = 0; jj < connections[i].length - 1; jj++) {
    //                                connections[i][jj].idx = jj;
    //                            }
    //                        }
    //                    }
    //                    if ( wire.portAngle === 1 ) {
    //                        if ( j === 0 ) {
    //                            connections[i].unshift({
    //                                y1: wire.port.y, y2: wire.port.y + wire.leadIn,
    //                                x1: wire.port.x, x2: wire.port.x,
    //                                port: wire.port, orientation: "vertical"
    //                            });
    //                            d = connections[i][2].x1 === wire.port.x ? "x1" : "x2";
    //                            connections[i][2][d] += wire.leadIn;
    //                            // reorder segment idx
    //                            for (var jj = 0; jj < connections[i].length - 1; jj++) {
    //                                connections[i][jj].idx = jj;
    //                            }
    //                        }
    //                        else if ( j === connections[i].length - 1) {
    //                            connections[i].push({
    //                                y1: wire.port.y, y2: wire.port.y + wire.leadIn,
    //                                x1: wire.port.x, x2: wire.port.x,
    //                                port: wire.port, orientation: "vertical"
    //                            });
    //                            d = connections[i][connections[i].length - 3].x1 === wire.port.x ? "x1" : "x2";
    //                            connections[i][connections[i].length - 3][d] += wire.leadIn;
    //                            // reorder segment idx
    //                            for (var jj = 0; jj < connections[i].length - 1; jj++) {
    //                                connections[i][jj].idx = jj;
    //                            }
    //                        }
    //                    }
    //                }
    //                else if ( wire.orientation === "vertical" ) {
    //                    if ( wire.portAngle === 2 ) {
    //                        if (j === 0) {
    //                            connections[i].unshift({
    //                                y1: wire.port.y, y2: wire.port.y,
    //                                x1: wire.port.x, x2: wire.port.x - wire.leadIn,
    //                                port: wire.port, orientation: "horizontal"
    //                            });
    //                            d = connections[i][2].y1 === wire.port.y ? "y1" : "y2";
    //                            connections[i][2][d] -= wire.leadIn;
    //                            // reorder segment idx
    //                            for (var jj = 0; jj < connections[i].length - 1; jj++) {
    //                                connections[i][jj].idx = jj;
    //                            }
    //                        }
    //                        if (j === connections[i].length - 1) {
    //                            connections[i].push({
    //                                y1: wire.port.y, y2: wire.port.y,
    //                                x1: wire.port.x, x2: wire.port.x - wire.leadIn,
    //                                port: wire.port, orientation: "horizontal"
    //                            });
    //                            d = connections[i][connections[i].length - 3].y1 === wire.port.y ? "y1" : "y2";
    //                            connections[i][connections[i].length - 3][d] -= wire.leadIn;
    //                            // reorder segment idx
    //                            for (var jj = 0; jj < connections[i].length - 1; jj++) {
    //                                connections[i][jj].idx = jj;
    //                            }
    //                        }
    //                    }
    //                    if ( wire.portAngle === 3 ) {
    //                        if ( j === 0 ) {
    //                            connections[i].unshift({
    //                                y1: wire.port.y, y2: wire.port.y,
    //                                x1: wire.port.x, x2: wire.port.x + wire.leadIn,
    //                                port: wire.port, orientation: "horizontal"
    //                            });
    //                            d = connections[i][2].y1 === wire.port.y ? "y1" : "y2";
    //                            connections[i][2][d] += wire.leadIn;
    //                            // reorder segment idx
    //                            for (var jj = 0; jj < connections[i].length - 1; jj++) {
    //                                connections[i][jj].idx = jj;
    //                            }
    //                        }
    //                        if ( j === connections[i].length - 1) {
    //                            connections[i].push({
    //                                y1: wire.port.y, y2: wire.port.y,
    //                                x1: wire.port.x, x2: wire.port.x + wire.leadIn,
    //                                port: wire.port, orientation: "horizontal"
    //                            });
    //                            d = connections[i][connections[i].length - 3].y1 === wire.port.y ? "y1" : "y2";
    //                            connections[i][connections[i].length - 3][d] += wire.leadIn;
    //                            // reorder segment idx
    //                            for (var jj = 0; jj < connections[i].length - 1; jj++) {
    //                                connections[i][jj].idx = jj;
    //                            }
    //                        }
    //                    }
    //                }
    //
    //            }
    //        }
    //    }
    //    return connections;
    //}



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


    // NOT USED
    function GridNode(position) {
        this.x = position.x;
        this.y = position.y;

        this.resetNode = function() {
            this.heuristic = 0;
            this.bends = 0;
            this.remBends = 0;
            this.score = 0;
            this.dir = 0;
            this.visited = false;
            this.closed = false;
            this.cost = null;
            this.parent = null;
        };

        this.manhattanDistance = function ( otherNode ) {
            return Math.abs(this.v.x - otherNode.v.x) + Math.abs(this.v.y - otherNode.v.y);
        };

        this.getNeighbors = function getNeighbors(node) {
            // Return neighbors in a sorted order, with preference to neighbor in same direction,
            //  followed by the right neighbor, left neighbor, and reverse neighbor.

            // Since order of neighbors is based on [N, S, W, E] index, need to return index map so that
            // when currentNode is updated, the direction can be updated correctly, rather than relying
            // on the index of the for loop.

            if ( node.dir === 0 ) {
                // Going North
                return { "neighbors": [node.north, node.east, node.west, node.south], "map": [0, 3, 2, 1] };
            }
            if ( node.dir === 1 ) {
                // Going South
                return { "neighbors": [node.south, node.west, node.east, node.north], "map": [1, 2, 3, 0] };
            }
            if ( node.dir === 2 ) {
                // Going West
                return { "neighbors": [node.west, node.north, node.south, node.east], "map": [2, 0, 1, 3] };
            }
            if ( node.dir === 3 ) {
                // Going East
                return { "neighbors": [node.east, node.south, node.north, node.west], "map": [3, 1, 0, 2] };
            }
        };

    }

};

module.exports = OrthogonalRouter;
