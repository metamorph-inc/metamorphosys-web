/*globals angular*/

'use strict';

var OrthogonalRouter = function () {

    var self = this;

    self.name = 'OrthogonalRouter';

    this.connections = [];


    this.routeDiagram = function( diagram ) {

        console.log('------ This is the entry point', diagram);
        self.generateVisibilityGraph(diagram);
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
        var edges = [];

        // Get interesting nodes from components.
        this.getNodes( diagram.components );

        // We will first get the interesting horizontal line segment, so sort by Y coordinate
        var sortedY = this.visibilityGraph.vertices;
        sortedY.sort(function ( a, b ) { return self.compare(a, b, 0); });

        var horzSegments = this.lineSweep(sortedY, "horizontal", diagram.config.width);




        this.visibilityGraph.edges = edges;
    };

    this.getNodes = function ( components ) {
        var i;
        for (i = 0; i < components.length; i++) {
            this.getNodesFromComponent(components[i]);
        }
        return this.visibilityGraph.vertices;
    };

    this.getNodesFromComponent = function ( component ) {
        var compPos = component.getGridPosition(),
            xyNoFlip = component.rotation % 180 === 0,  // If rotated 90 or 270, width/height values switch
            xc = xyNoFlip*component.symbol.width + !xyNoFlip*component.symbol.height,
            yc = xyNoFlip*component.symbol.height + !xyNoFlip*component.symbol.width,
            k;

        this.visibilityGraph.vertices.push( { x: compPos.x, y: compPos.y});
        this.visibilityGraph.vertices.push( { x: compPos.x, y: compPos.y + yc});
        this.visibilityGraph.vertices.push( { x: compPos.x + xc, y: compPos.y});
        this.visibilityGraph.vertices.push( { x: compPos.x + xc, y: compPos.y + yc});

        for ( k = 0; k < component.portInstances.length; k++ ) {
            var portPos = component.portInstances[k].getGridPosition();
            this.visibilityGraph.vertices.push({x: portPos.x,
                                                y: portPos.y,
                                                isPort: true,
                                                direction: component.portInstances[k].portSymbol.side});
        }
    };

    this.lineSweep = function ( nodes, method, sweepLength ) {
      // Perform line sweep algorithm on grid. Method can either be vertical or horizontal implementation of line sweep.
        var segments = [],
            openObjects = [],
            i;

        // Components are sorted by Y coordinate and then X coordinate for position.
        // The Y coordinate sorting allows for the event queue to be know (steps in for loop where sweep line will go).

        // Due to sorting, each node's closest left and right neighbors are known.
        // If first or last entry, neighbor is boundary of grid.

        // If neighbor is at the same Y coordinate, objects are colinear, so grab the nearest neighbor of the neighbor.
        // Repeat until either neighbor is not colinear or boundary is hit.

        // At each event an object will be either open or closed. If object is opened, compare coordinates as above,
        // but also check the coordinates of any nodes in the openObjects queue.

        for ( i = 0; i < nodes.length; i++ ) {
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

        }



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
