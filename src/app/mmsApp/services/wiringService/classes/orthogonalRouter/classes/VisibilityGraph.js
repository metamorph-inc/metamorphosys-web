/**
 * Created by robertboyles on 4/20/15.
 */

'use strict';

var insert = require("../../../../mmsUtils/classes/simpleInsert.js"),
    Point = require("./Point.js"),
    OrthogonalGridNode = require("./OrthogonalGridNode.js"),
    OrthogonalGridSegment = require("./OrthogonalGridSegment.js");

var VisibilityGraph = function () {
    this.nodes = {};
    this.incompleteNodes = [];
    this.edges = [];
    this.vertices = [];
    this.v = [];  // switch to nodes


    };


/**
 * Generates an orthogonal visibility graph, or alleys that a wire can take between ports.
 * @param points - Interesting <X,Y> coordinate pairs, composed of component bounding box corners and port locations
 * @param gridWidth - Max width
 * @param gridHeight - Max height
 */
VisibilityGraph.prototype.generate = function ( points, gridWidth, gridHeight ) {
    // We will first get the interesting horizontal line segment, so sort by Y coordinate
    var sortedY = points.slice();
    sortedY.sort(function ( a, b ) { return a.comparePointsByXorY(b, 0); });
    var sortedX = points.slice();
    sortedX.sort(function ( a, b ) { return a.comparePointsByXorY(b, 1); });

    var horizontalSegments = this.verticalLineSweep(sortedY, gridWidth);
    var verticalSegments = this.horizontalLineSweep(sortedX, gridHeight);

    var nodes = [],
        incompleteNodes = [];
    for ( var s = 0; s < verticalSegments.length; s++ ) {
        this.vertices = this.getSegmentIntersections(verticalSegments[s], horizontalSegments, this.vertices, incompleteNodes, nodes,  gridHeight);
    }

    // NOTE:
    // At this point, all nodes and neighbors are determined except for far East and bottom right south nodes,
    // and nodes who are a port
    // on the left-hand side of a component. The E neighbor never would have been found for these. Handle this
    // during A* search. (Could also loop through components again, but that is costly...). Just add to nodes.
    var j = 0;
    while (incompleteNodes.length !== 0) {
        var incNode = incompleteNodes[j];

        if ( incNode.x in nodes === false ) {
            nodes[incNode.x] = { };
        }

        nodes[incNode.x][incNode.y] = new OrthogonalGridNode( incNode.x,
            incNode.y,
            incNode.north,
            incNode.south ? incNode.south : gridHeight,
            incNode.west,
            incNode.east ? incNode.east : gridWidth );

        incompleteNodes.splice(j, 1);
    }


    // var edges = [];
    this.edges = this.edges.concat(horizontalSegments);
    this.edges = this.edges.concat(verticalSegments);

    this.v = this.vertices;
    this.vertices = nodes;

    //this.edges = edges;

};

/**
 * Sweeps a vertical line across the grid, left-to-right. Generates horizontal segments.
 * @param points - <X,Y> coordinate pairs that are sorted by Y, then X.
 * @param gridWidth - Max value a horizontal line can have.
 */
VisibilityGraph.prototype.verticalLineSweep = function ( nodes, gridWidth ) {
    // Perform line sweep algorithm on grid.
    var createTree = require("functional-red-black-tree");
    var segments = [],
        openObjects = [],
        i,
        binTree = createTree(),
        prevNode = null,
        prevPort = null,
        tmpSeg;

    for ( i = 0; i < nodes.length; i++ ) {
        var checkRemove = true;


        // If node is a port that is on bottom or top, ignore and skip this node.
        var isInvalidPort = ( nodes[i].isPort &&
        ( nodes[i].direction === 270 || nodes[i].direction === 90 ||
        nodes[i].direction === -270 || nodes[i].direction === -90));

        // If port is on top/bottom and inside of the component bounding box, a horz segment needs to be made.
        var specialCasePort = false,
            skipLeft = false,
            skipRight = false;


        // A valid port may also be inside a bb. Check for both valid/invalid cases.
        for (var k = 0; k < openObjects.length; k++) {
            if (nodes[i].x < openObjects[k].x2 && nodes[i].x > openObjects[k].x1) {
                if ((prevNode === null && nodes[i].y > openObjects[k].y1) ||
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
        if ((!nodes[i].isPort || nodes[i].direction === 180 ||
            nodes[i].direction === -180 || specialCasePort) && !skipLeft) {
            var left, leftIter = binTree.lt(nodes[i].x);
            if (leftIter.valid) {
                // If closest left node has the same Y-coord as current node's Y-coord, lines are colinear, skip.
                if (leftIter.value === nodes[i].y) {
                    if (binTree.length % 2 === 0 && !nodes[i].isPort) {
                        // even number of keys, therefore this is part of an object segment.
                        openObjects.push( new OrthogonalGridSegment( leftIter.key, nodes[i].y,
                            nodes[i].x, nodes[i].y) );
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
                    tmpSeg = new OrthogonalGridSegment( prevNode.x, null, nodes[i].x, null );
                    openObjects.splice(tmpSeg.getIndexUsingX(openObjects), 1);
                    prevNode = null;
                    continue;
                }
                left = leftIter.key;
                if (nodes[i].direction && nodes[i].x > leftIter.key) {
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
            var port = nodes[i].isPort ? new Point( nodes[i].x, nodes[i].y) : null,
                leftSegment = new OrthogonalGridSegment( left, nodes[i].y, nodes[i].x, nodes[i].y, port );
            segments.push(leftSegment);
        }
        // right
        if ((!nodes[i].isPort || nodes[i].direction === 0 ||
            nodes[i].direction === 360 || specialCasePort) && !skipRight) {
            var right = this.findNextValidRightNeighbor(nodes[i], "x", binTree, openObjects, gridWidth);

            var port = nodes[i].isPort ? new Point( nodes[i].x, nodes[i].y) : null,
                rightSegment = new OrthogonalGridSegment( nodes[i].x, nodes[i].y, right, nodes[i].y, port );
            segments.push(rightSegment);
        }
        if (checkRemove ) {
            if (!nodes[i].isPort) {
                if (prevNode === null) {
                    prevNode = new Point( nodes[i].x, nodes[i].y );
                }
            }
        }
        if (specialCasePort) {
            binTree = binTree.remove(nodes[i].x);
        }

    }
    return segments;

};


/**
 * Sweeps a horizontal line across the grid, top-to-bottom. Generates vertical segments.
 * @param points - <X,Y> coordinate pairs that are sorted by X, then Y.
 * @param gridHeight - Max value a vertical line can have.
 */
VisibilityGraph.prototype.horizontalLineSweep = function ( nodes, gridHeight ) {
    // Perform line sweep algorithm on grid. Generate vertical line segments.
    var createTree = require("functional-red-black-tree");
    var segments = [],
        openObjects = [],
        i,
        binTree = createTree(),
        prevNode = null,
        tmpSeg;

    for ( i = 0; i < nodes.length; i++ ) {
        var checkRemove = true;

        // If node is a port that is on left or right, ignore and skip this node.
        var isInvalidPort = ( nodes[i].isPort &&
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
                if ((prevNode === null && nodes[i].x > openObjects[k].x1) ||
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
        if ((!nodes[i].isPort || nodes[i].direction === 270 ||
            nodes[i].direction === -90 || specialCasePort) && !skipLeft) {
            var left, leftIter = binTree.lt(nodes[i].y);
            if (leftIter.valid) {
                // If closest left node has the same Y-coord as current node's Y-coord, lines are collinear, skip.
                if (leftIter.value === nodes[i].x) {
                    if (binTree.length % 2 === 0 && !nodes[i].isPort) {
                        // even number of keys, therefore this is part of an object segment.
                        //openObjects.push({y1: leftIter.key, y2: nodes[i].y, x: nodes[i].x});
                        openObjects.push( new OrthogonalGridSegment( nodes[i].x, leftIter.key,
                            nodes[i].x, nodes[i].y) );

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
                    tmpSeg = new OrthogonalGridSegment(null, prevNode.y, null, nodes[i].y);
                    openObjects.splice(tmpSeg.getIndexUsingY(openObjects), 1);
                    prevNode = null;
                    continue;
                }
                left = leftIter.key;
                if (nodes[i].direction && nodes[i].y > leftIter.key) {
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
            var port = nodes[i].isPort ? new Point( nodes[i].x, nodes[i].y ) : null,
                leftSegment = new OrthogonalGridSegment(nodes[i].x, left, nodes[i].x, nodes[i].y, port);

            segments.push(leftSegment);
        }
        // bottom
        if ((!nodes[i].isPort || nodes[i].direction === 90 ||
            nodes[i].direction === -270 || specialCasePort) && !skipRight) {
            var right = this.findNextValidRightNeighbor ( nodes[i], "y", binTree, openObjects, gridHeight);

            var port = nodes[i].isPort ? new Point( nodes[i].x, nodes[i].y) : null,
                rightSegment = new OrthogonalGridSegment( nodes[i].x, nodes[i].y, nodes[i].x, right, port );
            segments.push(rightSegment);
        }
        if (checkRemove ) {
            if (!nodes[i].isPort) {
                if (prevNode === null) {
                    prevNode = new Point( nodes[i].x, nodes[i].y );
                }
            }
        }
        if (specialCasePort) {
            binTree = binTree.remove(nodes[i].y);
        }
    }
    return segments;

};


VisibilityGraph.prototype.findNextValidRightNeighbor = function ( node, axis, binTree, openObjects, sweepLength) {
    var right, rightIter = binTree.gt(node[axis]);
    if (rightIter.valid) {
        var seg = new OrthogonalGridSegment();
        seg[axis+1] = node[axis];
        seg[axis+2] = rightIter.key;  // {y1: node[axis], y2: rightIter.key}

        var ltoe = seg.inSetAndLessThanOrEqual(openObjects, axis+1, axis+2);
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
                ltoe = seg.inSetAndLessThanOrEqual(openObjects, axis+1, axis+2);
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
            if (node.hasOwnProperty("direction") && node[axis] < rightIter.key) {
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



VisibilityGraph.prototype.getSegmentIntersections = function ( segment, segmentSet, intersections, incompleteNodes, nodes, gh ) {
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
            var share = segment.getSharedEndPoint(segmentSet[i]);
            if ( share !== null && share.myIndexOfPoint(intersections) === -1 ) {
                intersections.push(share);
                this.populateNode(share, segment, segmentSet[i], nodes, incompleteNodes, gh);
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
                        intersection = new Point( segment.x1 + (t * segX), segment.y1 + (t * segY) );

                    // Check intersection wasn't previously found
                    if ( intersection.myIndexOfPoint(intersections) === -1 ) {
                        intersections.push(intersection);

                        // There is an intersection, so need to store the vertex's neighbors
                        this.populateNode(intersection, segment, segmentSet[i], nodes, incompleteNodes, gh);
                    }
                }
            }
        }
        if (segment.port !== null && segment.port.myIndexOfPoint(intersections) === -1) {
            intersections.push(segment.port);
            this.populateNode(segment.port, segment, segmentSet[i], nodes, incompleteNodes, gh);
        }
        if ( segmentSet[i].port !== null && segmentSet[i].port.myIndexOfPoint(intersections) === -1 ) {
            intersections.push(segmentSet[i].port);
            this.populateNode(segmentSet[i].port, segment, segmentSet[i], nodes, incompleteNodes, gh);
        }
    }
    return intersections;

};


VisibilityGraph.prototype.populateNode = function ( vertex, vertSeg, horzSeg, nodes, incompleteNodes, gh ) {
    //var node = new PathNode( vertex );
    var node = new OrthogonalGridNode( vertex.x, vertex.y );
    node.vertSeg = vertSeg;  // should be OrthogonalGridSegment
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
        insert(node, incompleteNodes, OrthogonalGridNode.compareY);
        return node;
    }

    // Add new node to list
    var idx = insert(node, incompleteNodes, OrthogonalGridNode.compareY) - 1,
        matchNode = null,
        smallNeighbor = null,
        checkComplete = false;

    node = incompleteNodes[idx];

    // Check if Y value is duplicated. If it is, new node will be added directly after the existing one.
    if (idx !== 0 && node.compareYTo(incompleteNodes[idx-1]) === 0) {

        checkComplete = true;
        matchNode = incompleteNodes[idx-1];
        smallNeighbor = idx-1 === 0 ? null : idx - 2;

        var largeNeighbor = idx === incompleteNodes.length - 1 ? null : idx + 1;

        ///// Horizontal segments
        // See if the horizontal segments of each node overlap at all. If so, there is a segment between them.
        // Otherwise there is not (eg, the nodes are ports on opposite sides of component).
        if (matchNode.horzSeg.isPointOnLine({x:horzSeg.x1, y:horzSeg.y1})) {
            node.west = matchNode;
            matchNode.east = node;
        }
        else {
            matchNode.east = matchNode.x;
            node.west = node.x;
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
        while (node.compareXTo(smallNeighbor) !== 0 && node.manhattanDistance(smallNeighbor) !== 0) {
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
            if (smallNeighbor.vertSeg.isPointOnLine({x: vertSeg.x1, y: vertSeg.y1})) {
                node.north = smallNeighbor;
                smallNeighbor.south = node;
            }
            else {
                smallNeighbor.south = smallNeighbor.y;
                node.north = node.y;
            }
        }
    }
    else {
        node.north = 0;
    }

    if (checkComplete) {
        // Only nodes that can be completed are ones where a matchNode has been found and filled out.
        if (matchNode.areAllNeighborsDefined()) {
            // Node is now completely defined
            if ( matchNode.x in nodes === false ) {
                nodes[matchNode.x] =  { };
            }

            nodes[matchNode.x][matchNode.y] = new OrthogonalGridNode( matchNode.x,
                matchNode.y,
                matchNode.north,
                matchNode.south,
                matchNode.west,
                matchNode.east );
            incompleteNodes.splice(idx-1, 1);
        }
    }

};

module.exports = VisibilityGraph;
