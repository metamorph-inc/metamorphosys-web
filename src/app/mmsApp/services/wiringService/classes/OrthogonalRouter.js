/*globals angular*/

'use strict';

var OrthogonalRouter = function () {

    var self = this;

    this.name = 'OrthogonalRouter';

    this.visibilityGraph = [];

    this.connections = [];

    this.routeDiagram = function( diagram ) {
        console.log('------ This is the entry point', diagram);
    };

    this.routeConnections = function ( components, connections ) {
        // Step 1: generateVisibilityGraph
        // Step 2: AutoRouteWithGraph
        // Step 3: nudgeRoutes
        // Step 4: deleteOldRoutes
        // Step 5: drawConnections <-- Is this done here or somewhere else??
    };

    this.generateVisibilityGraph = function ( components ) {
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
                 Y: <double>
             }
         */
        var visibilityGraph = [];
        this.visibilityGraph = visibilityGraph;
    };

    this.lineSweep = function ( components, method ) {
      // Perform line sweep algorithm on grid. Method can either be vertical or horizontal implementation of line sweep.
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
