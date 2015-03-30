/*globals angular*/

'use strict';

var OrthogonalRouter = function () {

    var self = this;

    self.name = 'OrthogonalRouter';

    this.connections = [];


    this.routeDiagram = function( diagram ) {

        console.log('------ This is the entry point', diagram);

        var start = performance.now();
        self.generateVisibilityGraph(diagram);
        var end = performance.now();
        console.log("Graph time: " + (end - start));

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

        // Get interesting nodes from components.
        var nodes = this.getNodes( diagram.components );

        // We will first get the interesting horizontal line segment, so sort by Y coordinate
        var sortedY = [].concat(nodes);
        sortedY.sort(function ( a, b ) { return self.compare(a, b, 0); });
        var sortedX = [].concat(nodes);
        sortedX.sort(function ( a, b ) { return self.compare(a, b, 1); });


        var horzSegments = this.verticalLineSweep(sortedY, diagram.config.width);
        var vertSegments = this.horizontalLineSweep(sortedX, diagram.config.height);

        for ( var s = 0; s < vertSegments.length; s++ ) {
            vertices = vertices.concat( this.getSegmentIntersections(vertSegments[s], horzSegments) );
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

    this.getSegmentIntersections = function ( segment, segmentSet ) {
        // segment is the line that will be compared against all lines in the segment set.
        // Segments in segmentSet are sorted from top-down or left-right due to line sweep.

        var intersections = [],
            segX = segment.x2 - segment.x1,
            segY = segment.y2 - segment.y1;

        for ( var i = 0; i < segmentSet.length; i++ ) {
            var checkSegX = segmentSet[i].x2 - segmentSet[i].x1,
                checkSegY = segmentSet[i].y2 - segmentSet[i].y1,
                denominator = segX * checkSegY - checkSegX * segY,
                positive_denom = denominator > 0;

            if ( denominator === 0 ) {
                continue;  // collinear - shouldn't happen in this context, but still check.
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

            intersections.push({x: segment.x1 + (t * segX), y: segment.y1 + (t * segY)});
        }
        return intersections;
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
                ( nodes[i].direction === 180 || nodes[i].direction === 360 || nodes[i].direction === 0 )) {
                continue;
            }

            if (binTree.find(nodes[i].y).node === null) {
                // Not in tree, add
                binTree = binTree.insert(nodes[i].y, nodes[i].x);
                checkRemove = false;
            }
            // top
            if (typeof nodes[i].isPort === "undefined" || nodes[i].direction === 270) {
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
            if (typeof nodes[i].isPort === "undefined" || nodes[i].direction === 90 ) {
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
                ( nodes[i].direction === 270 || nodes[i].direction === 90 )) {
                continue;
            }

            if (binTree.find(nodes[i].x).node === null) {
                // Not in tree, add
                binTree = binTree.insert(nodes[i].x, nodes[i].y);
                checkRemove = false;
            }
            // left
            if (typeof nodes[i].isPort === "undefined" || nodes[i].direction === 180) {
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

    this.lineSweep = function ( nodes, method, sweepLength ) {
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




        /*for ( i = 0; i < nodes.length; i++ ) {
            // If openObjects does not have an entry at X coords, then new object is encountered. Add to openObject.
            var sLeft = nodes[i],
                sRight = nodes[i+1];

            if ( openObjects.length > 0 ) {
                // Some objects are open, work here...
            }
            else {
                openObjects.push({ sLeft: sLeft, sRight: sRight });


            }

            //

        }*/



        return segments;
    };

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

    this.AutoRouteWithGraph = function ( visibilityGrid, connections ) {
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
        var optimalConnections = [];
        this.connections = optimalConnections;  // Each connection will be a list of line segments

    };

    this.findOptimalRoute = function ( visibilityGrid, point1, point2 ) {
        /*
            Given the orthogonal grid and two points to be connected, find optimal route.  --> A* search
        */
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
