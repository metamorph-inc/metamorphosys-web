(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular, console*/

angular.module( 'CyPhyApp', [
    'gme.services',
    'cyphy.components'
] )
    .run( function ( dataStoreService, projectService, branchService, nodeService, workspaceService, componentService,
        designService, testBenchService ) {
        'use strict';
        dataStoreService.connectToDatabase( 'my-db-connection-id', {
            host: window.location.basename
        } )
            .then( function () {
                console.log( 'Connected ...' );
                return projectService.selectProject( 'my-db-connection-id', 'ADMEditor' );
            } )
            .then( function () {
                console.log( 'Project selected...' );
                return branchService.selectBranch( 'my-db-connection-id', 'master' );
            } )
            .then( function () {
                console.log( 'Branch selected...' );
            } )
            .
        catch ( function ( reason ) {
            console.error( reason );
        } );

        //        branchService.on({db: 'my-db-connection-id', projectId: 'ADMEditor', branchId: 'master'}, 'initialize', function (currentContext) {
        //            console.log('branchService initialized..');
        //        });

        nodeService.on( 'my-db-connection-id', 'initialize', function ( /*currentContext*/) {
            var logger,
                testContext;

            logger = function ( info ) {
                console.warn( info );
            };

            testContext = {
                db: 'my-db-connection-id',
                regionId: 'TestRegion'
            };
            //pluginService.testRunPlugin(testContext);
            workspaceService.watchWorkspaces( testContext, logger )
                .then( function ( data ) {
                    var runOnceAlready;

                    console.log( 'watchWorkspaces:', data );

                    runOnceAlready = false;

                    angular.foreEach( data.workspaces, function ( v, key ) {

                        if ( runOnceAlready === false ) {

                            workspaceService.watchNumberOfComponents( testContext, key, logger )
                                .then( function ( data ) {
                                    console.log( 'watchNumberOfComponents:', data );
                                } );
                            workspaceService.watchNumberOfDesigns( testContext, key, logger )
                                .then( function ( data ) {
                                    console.log( 'watchNumberOfDesigns:', data );
                                } );
                            workspaceService.watchNumberOfTestBenches( testContext, key, logger )
                                .then( function ( data ) {
                                    console.log( 'watchNumberOfTestBenches:', data );
                                } );
                            componentService.watchComponents( testContext, key, logger )
                                .then( function ( data ) {
                                    console.log( 'watchComponents:', data );
                                    angular.forEach( data.components, function ( v, cKey ) {
                                        componentService.watchInterfaces( testContext, cKey,
                                            logger )
                                            .then( function ( data ) {
                                                console.log( 'watchComponentDetails:', data );
                                            } );
                                    } );
                                } );
                            designService.watchDesigns( testContext, key, logger )
                                .then( function ( data ) {
                                    console.log( 'watchDesigns:', data );
                                    //                                for (cKey in data.components) {
                                    //                                    componentService.watchComponentDetails(testContext, cKey, logger)
                                    //                                        .then(function (data) {
                                    //                                            console.warn('watchComponentDetails:', data);
                                    //                                        });
                                    //                                }
                                } );
                            testBenchService.watchTestBenches( testContext, key, logger )
                                .then( function ( data ) {
                                    console.warn( 'watchTestBenches:', data );
                                    //                                for (cKey in data.components) {
                                    //                                    componentService.watchComponentDetails(testContext, cKey, logger)
                                    //                                        .then(function (data) {
                                    //                                            console.warn('watchComponentDetails:', data);
                                    //                                        });
                                    //                                }
                                } );
                        }
                        //break; // Can only watch the above for one work-space (unless context is modified).

                        runOnceAlready = true;
                    } );
                } );
        } );
    } );
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL3NlcnZpY2V0ZXN0L2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbHMgYW5ndWxhciwgY29uc29sZSovXG5cbmFuZ3VsYXIubW9kdWxlKCAnQ3lQaHlBcHAnLCBbXG4gICAgJ2dtZS5zZXJ2aWNlcycsXG4gICAgJ2N5cGh5LmNvbXBvbmVudHMnXG5dIClcbiAgICAucnVuKCBmdW5jdGlvbiAoIGRhdGFTdG9yZVNlcnZpY2UsIHByb2plY3RTZXJ2aWNlLCBicmFuY2hTZXJ2aWNlLCBub2RlU2VydmljZSwgd29ya3NwYWNlU2VydmljZSwgY29tcG9uZW50U2VydmljZSxcbiAgICAgICAgZGVzaWduU2VydmljZSwgdGVzdEJlbmNoU2VydmljZSApIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuICAgICAgICBkYXRhU3RvcmVTZXJ2aWNlLmNvbm5lY3RUb0RhdGFiYXNlKCAnbXktZGItY29ubmVjdGlvbi1pZCcsIHtcbiAgICAgICAgICAgIGhvc3Q6IHdpbmRvdy5sb2NhdGlvbi5iYXNlbmFtZVxuICAgICAgICB9IClcbiAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdDb25uZWN0ZWQgLi4uJyApO1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9qZWN0U2VydmljZS5zZWxlY3RQcm9qZWN0KCAnbXktZGItY29ubmVjdGlvbi1pZCcsICdBRE1FZGl0b3InICk7XG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdQcm9qZWN0IHNlbGVjdGVkLi4uJyApO1xuICAgICAgICAgICAgICAgIHJldHVybiBicmFuY2hTZXJ2aWNlLnNlbGVjdEJyYW5jaCggJ215LWRiLWNvbm5lY3Rpb24taWQnLCAnbWFzdGVyJyApO1xuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnQnJhbmNoIHNlbGVjdGVkLi4uJyApO1xuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAuXG4gICAgICAgIGNhdGNoICggZnVuY3Rpb24gKCByZWFzb24gKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCByZWFzb24gKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgIC8vICAgICAgICBicmFuY2hTZXJ2aWNlLm9uKHtkYjogJ215LWRiLWNvbm5lY3Rpb24taWQnLCBwcm9qZWN0SWQ6ICdBRE1FZGl0b3InLCBicmFuY2hJZDogJ21hc3Rlcid9LCAnaW5pdGlhbGl6ZScsIGZ1bmN0aW9uIChjdXJyZW50Q29udGV4dCkge1xuICAgICAgICAvLyAgICAgICAgICAgIGNvbnNvbGUubG9nKCdicmFuY2hTZXJ2aWNlIGluaXRpYWxpemVkLi4nKTtcbiAgICAgICAgLy8gICAgICAgIH0pO1xuXG4gICAgICAgIG5vZGVTZXJ2aWNlLm9uKCAnbXktZGItY29ubmVjdGlvbi1pZCcsICdpbml0aWFsaXplJywgZnVuY3Rpb24gKCAvKmN1cnJlbnRDb250ZXh0Ki8pIHtcbiAgICAgICAgICAgIHZhciBsb2dnZXIsXG4gICAgICAgICAgICAgICAgdGVzdENvbnRleHQ7XG5cbiAgICAgICAgICAgIGxvZ2dlciA9IGZ1bmN0aW9uICggaW5mbyApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oIGluZm8gKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRlc3RDb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgIGRiOiAnbXktZGItY29ubmVjdGlvbi1pZCcsXG4gICAgICAgICAgICAgICAgcmVnaW9uSWQ6ICdUZXN0UmVnaW9uJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vcGx1Z2luU2VydmljZS50ZXN0UnVuUGx1Z2luKHRlc3RDb250ZXh0KTtcbiAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hXb3Jrc3BhY2VzKCB0ZXN0Q29udGV4dCwgbG9nZ2VyIClcbiAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcnVuT25jZUFscmVhZHk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICd3YXRjaFdvcmtzcGFjZXM6JywgZGF0YSApO1xuXG4gICAgICAgICAgICAgICAgICAgIHJ1bk9uY2VBbHJlYWR5ID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JlRWFjaCggZGF0YS53b3Jrc3BhY2VzLCBmdW5jdGlvbiAoIHYsIGtleSApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBydW5PbmNlQWxyZWFkeSA9PT0gZmFsc2UgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZDb21wb25lbnRzKCB0ZXN0Q29udGV4dCwga2V5LCBsb2dnZXIgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICd3YXRjaE51bWJlck9mQ29tcG9uZW50czonLCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZEZXNpZ25zKCB0ZXN0Q29udGV4dCwga2V5LCBsb2dnZXIgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICd3YXRjaE51bWJlck9mRGVzaWduczonLCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlcyggdGVzdENvbnRleHQsIGtleSwgbG9nZ2VyIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnd2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzOicsIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnRzKCB0ZXN0Q29udGV4dCwga2V5LCBsb2dnZXIgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICd3YXRjaENvbXBvbmVudHM6JywgZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCBkYXRhLmNvbXBvbmVudHMsIGZ1bmN0aW9uICggdiwgY0tleSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLndhdGNoSW50ZXJmYWNlcyggdGVzdENvbnRleHQsIGNLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlciApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhdGNoQ29tcG9uZW50RGV0YWlsczonLCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2lnblNlcnZpY2Uud2F0Y2hEZXNpZ25zKCB0ZXN0Q29udGV4dCwga2V5LCBsb2dnZXIgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICd3YXRjaERlc2lnbnM6JywgZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY0tleSBpbiBkYXRhLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERldGFpbHModGVzdENvbnRleHQsIGNLZXksIGxvZ2dlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCd3YXRjaENvbXBvbmVudERldGFpbHM6JywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLndhdGNoVGVzdEJlbmNoZXMoIHRlc3RDb250ZXh0LCBrZXksIGxvZ2dlciApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oICd3YXRjaFRlc3RCZW5jaGVzOicsIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNLZXkgaW4gZGF0YS5jb21wb25lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hDb21wb25lbnREZXRhaWxzKHRlc3RDb250ZXh0LCBjS2V5LCBsb2dnZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybignd2F0Y2hDb21wb25lbnREZXRhaWxzOicsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2JyZWFrOyAvLyBDYW4gb25seSB3YXRjaCB0aGUgYWJvdmUgZm9yIG9uZSB3b3JrLXNwYWNlICh1bmxlc3MgY29udGV4dCBpcyBtb2RpZmllZCkuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bk9uY2VBbHJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApO1xuICAgIH0gKTsiXX0=
