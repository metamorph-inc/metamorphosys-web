/**
 * Created by robertboyles on 4/20/15.
 */

'use strict';

var insert = require("../../../../mmsUtils/classes/simpleInsert.js"),
    Point = require("./Point.js"),
    OrthogonalGridNode = require("./orthogonalGridNode.js"),
    OrthogonalGridSegment = require("./orthogonalGridSegment.js");

var VisibilityGraph = function (debugRouter) {

    this.nodes = {};
    this.incompleteNodes = [];
    this.edges = [];
    this.vertices = [];
    this.boundingBoxes = [];
    this.debug = debugRouter;

    };


/**
 * Generates an orthogonal visibility graph, or alleys that a wire can take between ports.
 * @param points - Interesting <X,Y> coordinate pairs, composed of component bounding box corners and port locations
 * @param gridWidth - Max width
 * @param gridHeight - Max height
 */
VisibilityGraph.prototype.generate = function ( points, gridWidth, gridHeight, debugHelper, bboxes ) {

    var sortedY = points.slice();
    sortedY.sort(function ( a, b ) { return a.comparePointsByXorY(b, 0); });

    var sortedX = points.slice();
    sortedX.sort(function ( a, b ) { return a.comparePointsByXorY(b, 1); });

    this.edges = this.getGrid(sortedX, sortedY, gridWidth, gridHeight, bboxes);

    // NOTE:
    // At this point, all nodes and neighbors are determined except for far East and bottom right South nodes,
    // and nodes who are a port on the left-hand side of a component.
    while (this.incompleteNodes.length !== 0) {
        var node = this.incompleteNodes[0];

        if ( node.x in this.nodes === false ) {
            this.nodes[node.x] = {};
        }

        var east,
            nodeXKeys = Object.keys(this.nodes),
            nodeXValues = [];
        for (var e in nodeXKeys) {
            nodeXValues.push(Number(nodeXKeys[e]));
        }
        if ( node.east ) {
            east = node.east;
        }
        else {

            east = node.x === Math.max.apply(null, nodeXValues) ? gridWidth : node.x;
        }
        this.nodes[node.x][node.y] = new OrthogonalGridNode( node.x,
                                                             node.y,
                                                             node.north,
                                                             node.south ? node.south : gridHeight,
                                                             node.west,
                                                             east );
        this.incompleteNodes.splice(0, 1);
    }

    if (this.debug) {
        debugHelper.sweepLines = this.edges;
        debugHelper.sweepPoints = this.vertices;
    }
};


VisibilityGraph.prototype.getGrid = function (sortedXpoints, sortedYpoints, gridWidth, gridHeight, bboxes) {

    var hlines,
        vlines,
        i, b;

    // Find all segments, then filter out copies and nulls (nulls will be invlaid ports).
    hlines = sortedYpoints.map(function(p) {
        if ( !!p.isPort && ( p.direction === 270 || p.direction === 90 || p.direction === -270 || p.direction === -90 ) ){
            return null;
        }
        else {
            return new OrthogonalGridSegment(0, p.y, gridWidth, p.y, 'horizontal');
        }
    });

    vlines = sortedXpoints.map(function(p) {
        if ( !!p.isPort && ( p.direction === 180 || p.direction === -180 || p.direction === 0 || p.direction === 360 ) ){
            return null;
        }
        else {
            return new OrthogonalGridSegment(p.x, 0, p.x, gridHeight, 'vertical');
        }
    });

    // Remove invalid ports
    hlines = hlines.filter(function(el) {
        return el !== null;
    });

    vlines = vlines.filter(function(el) {
        return el !== null;
    });

    // Remove duplicated line segments
    for (i = 1; i < hlines.length; ) {
        if ( hlines[i - 1].doesSegmentMatch(hlines[i]) ) {
            hlines.splice(i, 1);
        }
        else {
            i++;
        }
    }

    for (i = 1; i < vlines.length; ) {
        if ( vlines[i - 1].doesSegmentMatch(vlines[i]) ) {
            vlines.splice(i, 1);
        }
        else {
            i++;
        }
    }

    // Now we have a unique set of horizontal/vertical lines spanning the diagram. There is a line at each
    // bounding box edge and port location. No components have been taken into consideration.

    var sortedBBoxes = bboxes.sort(function(a, c) {
        return (a.x - c.x);
    });

    var box,
        line,
        side,
        newSeg1,
        newSeg2,
        incMod,
        r;

    for (i = 0; i < hlines.length; ) {

        line = hlines[i];
        incMod = false;

        for (b = 0; b < sortedBBoxes.length; b++) {

            box = sortedBBoxes[b];

            side = new OrthogonalGridSegment(box.x, box.y, box.x, box.y + box.height, 'vertical');

            r = line.getIntersection(side);

            if (r && !side.isPointOnEndPoint(r)) {
                newSeg1 = new OrthogonalGridSegment(line.x1, line.y1, box.x, line.y2, 'horizontal');
                newSeg2 = new OrthogonalGridSegment(box.x + box.width, line.y1, line.x2, line.y1, 'horizontal');

                // Replace bigger segment with broken up segment
                hlines.splice(i, 1).splice.apply(hlines, [i, 0].concat([newSeg1, newSeg2]));

                line = hlines[i + 1];
                i += 1;
                incMod = true;

            }

        }

        if (!incMod) {
            i += 1;
        }

    }

    sortedBBoxes = bboxes.sort(function(a, c) {
        return (a.y - c.y);
    });

    for (i = 0; i < vlines.length; ) {

        line = vlines[i];
        incMod = false;

        for (b = 0; b < sortedBBoxes.length; b++) {

            box = sortedBBoxes[b];

            side = new OrthogonalGridSegment(box.x, box.y, box.x + box.width, box.y, 'horizontal');

            r = line.getIntersection(side);

            if (r && !side.isPointOnEndPoint(r)) {
                newSeg1 = new OrthogonalGridSegment(line.x1, line.y1, line.x1, box.y, 'vertical');
                newSeg2 = new OrthogonalGridSegment(line.x1, box.y + box.height, line.x1, line.y2, 'vertical');

                // Replace bigger segment with broken up segment
                vlines.splice(i, 1).splice.apply(vlines, [i, 0].concat([newSeg1, newSeg2]));

                line = vlines[i + 1];
                i += 1;
                incMod = true;

            }

        }

        if (!incMod) {
            i += 1;
        }

    }

    // Get segment intersections 
    for ( var s = 0; s < vlines.length; s++ ) {
        this.getSegmentIntersections(vlines[s], hlines, gridHeight);
    }

    return hlines.concat(vlines);

};


/**
 * Compare segment against all lines in segmentSet to determine any intersections.
 * @param segment
 * @param segmentSet
 * @param gridHeight
 */
VisibilityGraph.prototype.getSegmentIntersections = function ( segment, segmentSet, gridHeight ) {

    var intersections = this.vertices,
        totalSegments = segmentSet.length;

    for ( var i = 0; i < totalSegments; i++ ) {

        var intersection;

        intersection = segment.getIntersection(segmentSet[i]);

        if ( intersection ) {

            if ( intersection.myIndexOfPoint(intersections) === -1 ) {

                intersections.push(intersection);
                this.populateNode(intersection, segment, segmentSet[i], gridHeight);

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
