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
    this.boundingBoxes = [];

    };


/**
 * Generates an orthogonal visibility graph, or alleys that a wire can take between ports.
 * @param points - Interesting <X,Y> coordinate pairs, composed of component bounding box corners and port locations
 * @param gridWidth - Max width
 * @param gridHeight - Max height
 */
VisibilityGraph.prototype.generate = function ( points, gridWidth, gridHeight ) {

    var sortedY = points.slice();
    sortedY.sort(function ( a, b ) { return a.comparePointsByXorY(b, 0); });

    var sortedX = points.slice();
    sortedX.sort(function ( a, b ) { return a.comparePointsByXorY(b, 1); });

    var horizontalSegments = this.verticalLineSweep(sortedY, gridWidth),
        verticalSegments = this.horizontalLineSweep(sortedX, gridHeight);

    var numberOfSegments = verticalSegments.length;
    for ( var s = 0; s < numberOfSegments; s++ ) {
        this.getSegmentIntersections(verticalSegments[s], horizontalSegments, gridHeight);
    }

    // NOTE:
    // At this point, all nodes and neighbors are determined except for far East and bottom right South nodes,
    // and nodes who are a port on the left-hand side of a component.
    // The E neighbor never would have been found for these. Handle this during A* search.
    while (this.incompleteNodes.length !== 0) {
        var node = this.incompleteNodes[0];

        if ( node.x in this.nodes === false ) {
            this.nodes[node.x] = {};
        }

        this.nodes[node.x][node.y] = new OrthogonalGridNode( node.x,
                                                             node.y,
                                                             node.north,
                                                             node.south ? node.south : gridHeight,
                                                             node.west,
                                                             node.east ? node.east : gridWidth );
        this.incompleteNodes.splice(0, 1);
    }

    this.edges = this.edges.concat(horizontalSegments).concat(verticalSegments);
};


/**
 * Sweeps a vertical line across the grid, left-to-right. Generates horizontal segments.
 * @param points - <X,Y> coordinate pairs that are sorted by Y, then X.
 * @param gridWidth - Max value a horizontal line can have.
 */
VisibilityGraph.prototype.verticalLineSweep = function ( points, gridWidth ) {
    // Perform line sweep algorithm on grid.
    var createTree = require("functional-red-black-tree"),
        segments = [],
        openObjects = [],
        i,
        binTree = createTree(),
        previousNode = null,
        segment,
        numberOfPoints = points.length;

    for ( i = 0; i < numberOfPoints; i++ ) {
        var checkRemoveFromOpen = true;


        // If node is a port that is on bottom or top, ignore and skip this node.
        var isInvalidPort = ( points[i].isPort &&
                                ( points[i].direction === 270 || points[i].direction === 90 ||
                                  points[i].direction === -270 || points[i].direction === -90 ) );

        // If port is on top/bottom and inside of the component bounding box, a horizontal segment needs to be made.
        var specialCasePort = false,
            skipLeft = false,
            skipRight = false;

        // A valid port may also be inside a bb. Check for both valid/invalid cases.
        for (var k = 0; k < openObjects.length; k++) {
            if (points[i].x < openObjects[k].x2 && points[i].x > openObjects[k].x1) {
                if ((previousNode === null && points[i].y > openObjects[k].y1) ||
                    (previousNode !== null && points[i].y < previousNode.y)) {

                    if (!isInvalidPort) {
                        // If valid port, but inside bb, we know both end points. Valid segment should
                        // only go in one of the two directions however. Need to find which endpoint
                        // the port is closer to so we know to skip the other side.
                        var distanceToEnd1 = Math.abs(points[i].x - openObjects[k].x1),
                            distanceToEnd2 = Math.abs(points[i].x - openObjects[k].x2);

                        skipLeft = distanceToEnd1 > distanceToEnd2;
                        skipRight = !skipLeft;
                    }

                    specialCasePort = true;
                    break;  // We've found the port we're looking for, no need to loop through the others.
                }
            }
        }

        if ( !isInvalidPort ) {
            if (binTree.find(points[i].x).node === null) {
                // Not in tree, add
                binTree = binTree.insert(points[i].x, points[i].y);
                checkRemoveFromOpen = false;
            }
            // left
            if ( ( !points[i].isPort || points[i].direction === 180 ||
                    points[i].direction === -180 || specialCasePort ) && !skipLeft ) {
                var left, leftIter = binTree.lt(points[i].x);
                if (leftIter.valid) {
                    // If closest left node has the same Y-coord as current node's Y-coord, lines are colinear, skip.
                    if (leftIter.value === points[i].y) {
                        if (binTree.length % 2 === 0 && !points[i].isPort) {
                            // even number of keys, therefore this is part of an object segment.
                            openObjects.push(new OrthogonalGridSegment(leftIter.key, points[i].y,
                                points[i].x, points[i].y));
                        }
                        continue;  // Move to next point
                    }
                    else if (previousNode !== null && !specialCasePort) {
                        // prevNode is defined, so previous entry was the left hand side of the closing segment.
                        // Both left and right segments were defined for prevNode, and this point is in the same line
                        // as that, so it can be skipped. Also, remove these two points from the binary tree and
                        // remove the line defined by them from the openObjects list.
                        binTree = binTree.remove(previousNode.x);
                        binTree = binTree.remove(points[i].x);
                        segment = new OrthogonalGridSegment(previousNode.x, null, points[i].x, null);
                        openObjects.splice(segment.getIndexUsingX(openObjects), 1);
                        previousNode = null;
                        continue;  // Move to next point
                    }
                    left = leftIter.key;
                    if (points[i].direction && points[i].x > leftIter.key) {
                        // Check that leftIter.key is actually a part of the openObject that the port belongs to
                        var keyIsMin = false;
                        for (var n = 0; n < openObjects.length; n++) {
                            if (openObjects[n].x1 === leftIter.key) {
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
                var leftSegment = new OrthogonalGridSegment(left, points[i].y, points[i].x, points[i].y);
                segments.push(leftSegment);
            }
            // right
            if ((!points[i].isPort || points[i].direction === 0 ||
                points[i].direction === 360 || specialCasePort) && !skipRight) {
                var right = this.findNextValidRightNeighbor(points[i], "x", binTree, openObjects, gridWidth);

                var rightSegment = new OrthogonalGridSegment(points[i].x, points[i].y, right, points[i].y);
                segments.push(rightSegment);
            }
            if (checkRemoveFromOpen) {
                if (!points[i].isPort) {
                    if (previousNode === null) {
                        previousNode = new Point(points[i].x, points[i].y);
                    }
                }
            }
            if (specialCasePort) {
                binTree = binTree.remove(points[i].x);
            }
        }

    }
    return segments;

};


/**
 * Sweeps a horizontal line across the grid, top-to-bottom. Generates vertical segments.
 * @param points - <X,Y> coordinate pairs that are sorted by X, then Y.
 * @param gridHeight - Max value a vertical line can have.
 */
VisibilityGraph.prototype.horizontalLineSweep = function ( points, gridHeight ) {
    // Perform line sweep algorithm on grid. Generate vertical line segments.
    var createTree = require("functional-red-black-tree");
    var segments = [],
        openObjects = [],
        i,
        binTree = createTree(),
        prevNode = null,
        tmpSeg,
        numberOfPoints = points.length;

    for ( i = 0; i < numberOfPoints; i++ ) {
        var checkRemove = true;

        // If node is a port that is on left or right, ignore and skip this node.
        var isInvalidPort = ( points[i].isPort &&
        ( points[i].direction === 180 || points[i].direction === 360 ||
        points[i].direction === -180 || points[i].direction === 0 ));

        // If port is on left/right and inside of the component bounding box, a vertical segment needs to be made.
        var specialCasePort = false,
            skipLeft = false,
            skipRight = false;

        // If yc is in range of an open object, and x > open object x (inside bb).
        // If prevNode defined and x < prevNode x (inside bb on right).
        for (var k = 0; k < openObjects.length; k++) {
            if (points[i].y < openObjects[k].y2 && points[i].y > openObjects[k].y1) {
                if ((prevNode === null && points[i].x > openObjects[k].x1) ||
                    (prevNode !== null && points[i].x < prevNode.x)) {

                    if (!isInvalidPort) {
                        // If valid port, but inside bb, we know both end points. Valid segment should
                        // only go in one of the two directions however. Need to find which endpoint
                        // the port is closer to so we know to skip the other side.
                        var distEnd1 = Math.abs(points[i].y - openObjects[k].y1),
                            distEnd2 = Math.abs(points[i].y - openObjects[k].y2);

                        skipLeft = distEnd1 > distEnd2;
                        skipRight = !skipLeft;
                    }


                    specialCasePort = true;
                    break;  // We've found the port we're looking for, no need to loop through the others.
                }
            }
        }

        if ( !isInvalidPort ) {
            if (binTree.find(points[i].y).node === null) {
                // Not in tree, add
                binTree = binTree.insert(points[i].y, points[i].x);
                checkRemove = false;
            }
            // top
            if ((!points[i].isPort || points[i].direction === 270 ||
                points[i].direction === -90 || specialCasePort) && !skipLeft) {
                var left, leftIter = binTree.lt(points[i].y);
                if (leftIter.valid) {
                    // If closest left node has the same Y-coord as current node's Y-coord, lines are collinear, skip.
                    if (leftIter.value === points[i].x) {
                        if (binTree.length % 2 === 0 && !points[i].isPort) {
                            // even number of keys, therefore this is part of an object segment.
                            //openObjects.push({y1: leftIter.key, y2: nodes[i].y, x: nodes[i].x});
                            openObjects.push(new OrthogonalGridSegment(points[i].x, leftIter.key,
                                points[i].x, points[i].y));

                        }
                        continue;
                    }
                    else if (prevNode !== null && !specialCasePort) {
                        // prevNode is defined, so previous entry was the left hand side of the closing segment.
                        // Both left and right segments were defined for prevNode, and this point is in the same line
                        // as that, so it can be skipped. Also, remove these two points from the binary tree and
                        // remove the line defined by them from the openObjects list.
                        binTree = binTree.remove(prevNode.y);
                        binTree = binTree.remove(points[i].y);
                        tmpSeg = new OrthogonalGridSegment(null, prevNode.y, null, points[i].y);
                        openObjects.splice(tmpSeg.getIndexUsingY(openObjects), 1);
                        prevNode = null;
                        continue;
                    }
                    left = leftIter.key;
                    if (points[i].direction && points[i].y > leftIter.key) {
                        var keyIsMin = false;
                        for (var n = 0; n < openObjects.length; n++) {
                            if (openObjects[n].y1 === leftIter.key) {
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
                var leftSegment = new OrthogonalGridSegment(points[i].x, left, points[i].x, points[i].y);

                segments.push(leftSegment);
            }
            // bottom
            if ((!points[i].isPort || points[i].direction === 90 ||
                points[i].direction === -270 || specialCasePort) && !skipRight) {
                var right = this.findNextValidRightNeighbor(points[i], "y", binTree, openObjects, gridHeight);

                var rightSegment = new OrthogonalGridSegment(points[i].x, points[i].y, points[i].x, right);
                segments.push(rightSegment);
            }
            if (checkRemove) {
                if (!points[i].isPort) {
                    if (prevNode === null) {
                        prevNode = new Point(points[i].x, points[i].y);
                    }
                }
            }
            if (specialCasePort) {
                binTree = binTree.remove(points[i].y);
            }
        }
    }
    return segments;

};


// TODO: Ports are now projected onto the bounding box edge. This may make needing to check that
// TODO: the neighbor being returned by binTree is valid unnecessary... investigate.
VisibilityGraph.prototype.findNextValidRightNeighbor = function ( node, axis, binTree, openObjects, sweepLength) {
    var right, rightIter = binTree.gt(node[axis]);
    if (rightIter.valid) {
        var segment = new OrthogonalGridSegment();
        segment[axis+1] = node[axis];
        segment[axis+2] = rightIter.key;

        // X-coords will be the same, need to see if y2 coord of seg is equal or less than open object y2
        var ltoe = segment.inSetAndLessThanOrEqual(openObjects, axis+1, axis+2);

        if (ltoe !== -1) {
            // Means this segment is in the list of open segments, grab the closest node from rightIter that
            // isn't a part of the open segment. The object may have many ports so...

            // Need to check if seg is on line that defines an open object. In the case where there is a port,
            // seg will lie on the line of an open object. Need to repeatedly grab the node's right neighbor
            // defines the open object completely (x = x & y = y).

            while ( ltoe.equal === false ) {
                rightIter = binTree.gt(rightIter.key);
                segment[axis+2] = rightIter.key;
                ltoe = segment.inSetAndLessThanOrEqual(openObjects, axis+1, axis+2);
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
                    // Means the port is not in line with the bounding box (inside of it). Grab the next right iter.
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
};


/**
 * Compare segment against all lines in segmentSet to determine any intersections.
 * @param segment
 * @param segmentSet
 * @param gridHeight
 */
VisibilityGraph.prototype.getSegmentIntersections = function ( segment, segmentSet, gridHeight ) {

    var intersections = this.vertices,
        segmentX = segment.x2 - segment.x1,
        segmentY = segment.y2 - segment.y1,
        totalSegments = segmentSet.length;

    for ( var i = 0; i < totalSegments; i++ ) {
        var checkSegmentX = segmentSet[i].x2 - segmentSet[i].x1,
            checkSegmentY = segmentSet[i].y2 - segmentSet[i].y1,
            denominator = segmentX * checkSegmentY - checkSegmentX * segmentY,
            posDenominator = denominator > 0,
            intersection;

        // Collinear if denominator = 0
        if ( denominator !== 0 ) {
            // Check if an intersection between segments occurs at one of the end points.
            intersection = segment.getSharedEndPoint(segmentSet[i]);
            if ( intersection ) {
                if ( intersection.myIndexOfPoint(intersections) === -1 ) {
                    intersections.push(intersection);
                    this.populateNode(intersection, segment, segmentSet[i], gridHeight);
                }
            }
            else {
                // See if intersection occurs elsewhere between the two segments.
                var newSegmentX = segment.x1 - segmentSet[i].x1,
                    newSegmentY = segment.y1 - segmentSet[i].y1,
                    numerator1 = segmentX * newSegmentY - segmentY * newSegmentX,
                    numerator2 = checkSegmentX * newSegmentY - checkSegmentY * newSegmentX,
                    collinear = ( (numerator1 < 0) === posDenominator ) || ( (numerator2 < 0) === posDenominator ),
                    noIntersect = ( (numerator1 > denominator) === posDenominator ||
                                    (numerator2 > denominator) === posDenominator );

                if ( !collinear && !noIntersect ) {
                    var t = numerator2 / denominator;

                    intersection = new Point( segment.x1 + (t * segmentX), segment.y1 + (t * segmentY) );

                    // Check intersection wasn't previously found
                    if ( intersection.myIndexOfPoint(intersections) === -1 ) {
                        intersections.push(intersection);
                        this.populateNode(intersection, segment, segmentSet[i], gridHeight);
                    }
                }
            }
        }
    }

};

/**
 *   Nodes will be created in order, sorted by X then Y, so (10, 70) comes before (10, 80).
     Need to determine the N, S, W, E neighbors for each node. Only the N and W neighbors
     can be determined when the node is created based on previous nodes and/or the upper
     left boundary. The default value for N, S, W, E is null, and means there is no valid
     neighbor in that direction for that node.

     When a node is created it is added to the list incompleteNodes. The nodes in this list
     are ones that do not have all 4 cardinal directions defined. An insert method is
     used to keep track of the incomplete nodes, with the key being the Y value of the node.
     At any given time there should only be one incompleteNode per Y value.

     If a new node is created that has the same Y value as one already in the list, that means
     that remaining cardinal directions can be determined using the new node. The previously
     incomplete node is now added to the 'nodes' list, and removed from incompleteNodes. The newly
     created node now takes its place in the list.
 * @param vertex  - Coordinate location of node being populated
 * @param verticalSegment   - Vertical segment defining the node
 * @param horizontalSegment - Horizontal segment definind the node
 * @param gridHeight  - Max height of diagram
 */
VisibilityGraph.prototype.populateNode = function ( vertex, verticalSegment, horizontalSegment, gridHeight ) {
    var node = new OrthogonalGridNode( vertex.x, vertex.y );

    node.verticalSegment = verticalSegment;
    node.horizontalSegment = horizontalSegment;

    if ( this.incompleteNodes.length === 0 ) {
        node.north = 0;
        node.west = 0;
        insert(node, this.incompleteNodes, OrthogonalGridNode.compareY);
        return;
    }

    var idx = insert(node, this.incompleteNodes, OrthogonalGridNode.compareY) - 1,
        matchNode,
        smallNeighbor,
        largeNeighbor,
        checkComplete = false;

    // Check if Y value is duplicated. If it is, new node will be added directly after the existing one.
    if (idx !== 0 && node.compareYTo(this.incompleteNodes[idx-1]) === 0) {

        checkComplete = true;
        matchNode = this.incompleteNodes[idx-1];
        smallNeighbor = idx-1 === 0 ? null : idx - 2;
        largeNeighbor = idx === this.incompleteNodes.length - 1 ? null : idx + 1;

        // Do the horizontal segments of each node overlap at all? If so, there is a segment between them.
        // Otherwise there is not (eg, the nodes are ports on opposite sides of component).
        if (matchNode.horizontalSegment.isPointOnLine({x:horizontalSegment.x1, y:horizontalSegment.y1})) {
            node.west = matchNode;
            matchNode.east = node;
        }
        else {
            matchNode.east = matchNode.x;
            node.west = node.x;
        }

        if (smallNeighbor === null) {
            // This node is at the top of the grid. Since points are sorted, we know previous point was
            // the largest Y value at that X, so the previous node's S is gridHeight and this node's N is 0.
            node.north = 0;
            this.incompleteNodes[this.incompleteNodes.length - 1].south = gridHeight;
        }
        if (largeNeighbor === null) {
            this.incompleteNodes[this.incompleteNodes.length - 2].south = gridHeight;
        }

    }
    else {
        // Node didn't exist, so it was added.
        node.west = 0;
    }

    // Grab closest small neighbor in Y that has the same X value, provided node isn't first in list.
    if (idx !== 0) {
        var i = idx - 1;

        smallNeighbor = this.incompleteNodes[i];
        while (node.compareXTo(smallNeighbor) !== 0 && node.manhattanDistance(smallNeighbor) !== 0) {
            i -= 1;
            if (i < 0) {
                node.north = 0;
                break;
            }
            smallNeighbor = this.incompleteNodes[i];
        }

        // Make sure smallNeighbor was found
        if (node.north !== 0) {
            // See if the vertical segments of each node overlap at all. If so, there is a segment between them.
            // Otherwise there is not (eg, the nodes are ports on opposite sides of component).
            if (smallNeighbor.verticalSegment.isPointOnLine({x: verticalSegment.x1, y: verticalSegment.y1})) {
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

    this.updateNodeIfOnBoundingBox( node );

    if (checkComplete) {
        // Only nodes that can be completed are ones where a matchNode has been found and filled out.
        if (matchNode.areAllNeighborsDefined()) {
            if ( matchNode.x in this.nodes === false ) {
                this.nodes[matchNode.x] =  { };
            }

            this.nodes[matchNode.x][matchNode.y] = new OrthogonalGridNode( matchNode.x,
                                                                           matchNode.y,
                                                                           matchNode.north,
                                                                           matchNode.south,
                                                                           matchNode.west,
                                                                           matchNode.east );
            this.incompleteNodes.splice(idx-1, 1);
        }
    }

};


VisibilityGraph.prototype.updateNodeIfOnBoundingBox = function ( node ) {
    var c,
        boundBox,
        numberBoundBoxes = this.boundingBoxes.length,
        segmentTop,
        segmentBottom,
        segmentLeft,
        segmentRight;

    for (c = 0; c < numberBoundBoxes; c++ ) {
        boundBox = this.boundingBoxes[c];

        segmentTop = new OrthogonalGridSegment( boundBox.x,
                                                boundBox.y,
                                                boundBox.x + boundBox.width,
                                                boundBox.y );
        segmentBottom = new OrthogonalGridSegment( boundBox.x,
                                                   boundBox.y + boundBox.height,
                                                   boundBox.x + boundBox.width,
                                                   boundBox.y + boundBox.height );
        segmentLeft = new OrthogonalGridSegment( boundBox.x,
                                                 boundBox.y,
                                                 boundBox.x,
                                                 boundBox.y + boundBox.height );
        segmentRight = new OrthogonalGridSegment( boundBox.x + boundBox.width,
                                                  boundBox.y,
                                                  boundBox.x + boundBox.width,
                                                  boundBox.y + boundBox.height );

        if ( segmentTop.isPointOnLine( node ) && !segmentTop.isPointOnEndPoint( node ) ) {
            node.south = node.y;
            break;
        }
        if ( segmentBottom.isPointOnLine( node ) && !segmentTop.isPointOnEndPoint( node ) ) {
            node.north = node.y;
            break;
        }
        if ( segmentLeft.isPointOnLine( node ) && !segmentTop.isPointOnEndPoint( node ) ) {
            node.east = node.x;
            break;
        }
        if ( segmentRight.isPointOnLine( node ) && !segmentTop.isPointOnEndPoint( node ) ) {
            node.west = node.x;
            break;
        }
    }

};


module.exports = VisibilityGraph;
