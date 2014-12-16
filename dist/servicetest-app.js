(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular, console, setTimeout*/

var CyPhyApp = angular.module( 'CyPhyApp', [
    'gme.services',
    'cyphy.components'
] )
    .run( function ( dataStoreService, projectService, branchService, nodeService, workspaceService, componentService,
        designService, testBenchService, pluginService ) {
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

        nodeService.on( 'my-db-connection-id', 'initialize', function ( currentContext ) {
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
                                    var dKey;
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
                                    var dKey;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi9zcmMvYXBwL3NlcnZpY2V0ZXN0L2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIGFuZ3VsYXIsIGNvbnNvbGUsIHNldFRpbWVvdXQqL1xuXG52YXIgQ3lQaHlBcHAgPSBhbmd1bGFyLm1vZHVsZSggJ0N5UGh5QXBwJywgW1xuICAgICdnbWUuc2VydmljZXMnLFxuICAgICdjeXBoeS5jb21wb25lbnRzJ1xuXSApXG4gICAgLnJ1biggZnVuY3Rpb24gKCBkYXRhU3RvcmVTZXJ2aWNlLCBwcm9qZWN0U2VydmljZSwgYnJhbmNoU2VydmljZSwgbm9kZVNlcnZpY2UsIHdvcmtzcGFjZVNlcnZpY2UsIGNvbXBvbmVudFNlcnZpY2UsXG4gICAgICAgIGRlc2lnblNlcnZpY2UsIHRlc3RCZW5jaFNlcnZpY2UsIHBsdWdpblNlcnZpY2UgKSB7XG4gICAgICAgICd1c2Ugc3RyaWN0JztcbiAgICAgICAgZGF0YVN0b3JlU2VydmljZS5jb25uZWN0VG9EYXRhYmFzZSggJ215LWRiLWNvbm5lY3Rpb24taWQnLCB7XG4gICAgICAgICAgICBob3N0OiB3aW5kb3cubG9jYXRpb24uYmFzZW5hbWVcbiAgICAgICAgfSApXG4gICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnQ29ubmVjdGVkIC4uLicgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvamVjdFNlcnZpY2Uuc2VsZWN0UHJvamVjdCggJ215LWRiLWNvbm5lY3Rpb24taWQnLCAnQURNRWRpdG9yJyApO1xuICAgICAgICAgICAgfSApXG4gICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnUHJvamVjdCBzZWxlY3RlZC4uLicgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnJhbmNoU2VydmljZS5zZWxlY3RCcmFuY2goICdteS1kYi1jb25uZWN0aW9uLWlkJywgJ21hc3RlcicgKTtcbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ0JyYW5jaCBzZWxlY3RlZC4uLicgKTtcbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgLlxuICAgICAgICBjYXRjaCAoIGZ1bmN0aW9uICggcmVhc29uICkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvciggcmVhc29uICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICAvLyAgICAgICAgYnJhbmNoU2VydmljZS5vbih7ZGI6ICdteS1kYi1jb25uZWN0aW9uLWlkJywgcHJvamVjdElkOiAnQURNRWRpdG9yJywgYnJhbmNoSWQ6ICdtYXN0ZXInfSwgJ2luaXRpYWxpemUnLCBmdW5jdGlvbiAoY3VycmVudENvbnRleHQpIHtcbiAgICAgICAgLy8gICAgICAgICAgICBjb25zb2xlLmxvZygnYnJhbmNoU2VydmljZSBpbml0aWFsaXplZC4uJyk7XG4gICAgICAgIC8vICAgICAgICB9KTtcblxuICAgICAgICBub2RlU2VydmljZS5vbiggJ215LWRiLWNvbm5lY3Rpb24taWQnLCAnaW5pdGlhbGl6ZScsIGZ1bmN0aW9uICggY3VycmVudENvbnRleHQgKSB7XG4gICAgICAgICAgICB2YXIgbG9nZ2VyLFxuICAgICAgICAgICAgICAgIHRlc3RDb250ZXh0O1xuXG4gICAgICAgICAgICBsb2dnZXIgPSBmdW5jdGlvbiAoIGluZm8gKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCBpbmZvICk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0ZXN0Q29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICBkYjogJ215LWRiLWNvbm5lY3Rpb24taWQnLFxuICAgICAgICAgICAgICAgIHJlZ2lvbklkOiAnVGVzdFJlZ2lvbidcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvL3BsdWdpblNlcnZpY2UudGVzdFJ1blBsdWdpbih0ZXN0Q29udGV4dCk7XG4gICAgICAgICAgICB3b3Jrc3BhY2VTZXJ2aWNlLndhdGNoV29ya3NwYWNlcyggdGVzdENvbnRleHQsIGxvZ2dlciApXG4gICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJ1bk9uY2VBbHJlYWR5O1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnd2F0Y2hXb3Jrc3BhY2VzOicsIGRhdGEgKTtcblxuICAgICAgICAgICAgICAgICAgICBydW5PbmNlQWxyZWFkeSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yZUVhY2goIGRhdGEud29ya3NwYWNlcywgZnVuY3Rpb24gKCB2LCBrZXkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggcnVuT25jZUFscmVhZHkgPT09IGZhbHNlICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mQ29tcG9uZW50cyggdGVzdENvbnRleHQsIGtleSwgbG9nZ2VyIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnd2F0Y2hOdW1iZXJPZkNvbXBvbmVudHM6JywgZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mRGVzaWducyggdGVzdENvbnRleHQsIGtleSwgbG9nZ2VyIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnd2F0Y2hOdW1iZXJPZkRlc2lnbnM6JywgZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaE51bWJlck9mVGVzdEJlbmNoZXMoIHRlc3RDb250ZXh0LCBrZXksIGxvZ2dlciApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhdGNoTnVtYmVyT2ZUZXN0QmVuY2hlczonLCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLndhdGNoQ29tcG9uZW50cyggdGVzdENvbnRleHQsIGtleSwgbG9nZ2VyIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnd2F0Y2hDb21wb25lbnRzOicsIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCggZGF0YS5jb21wb25lbnRzLCBmdW5jdGlvbiAoIHYsIGNLZXkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaEludGVyZmFjZXMoIHRlc3RDb250ZXh0LCBjS2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICd3YXRjaENvbXBvbmVudERldGFpbHM6JywgZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNpZ25TZXJ2aWNlLndhdGNoRGVzaWducyggdGVzdENvbnRleHQsIGtleSwgbG9nZ2VyIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkS2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICd3YXRjaERlc2lnbnM6JywgZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY0tleSBpbiBkYXRhLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERldGFpbHModGVzdENvbnRleHQsIGNLZXksIGxvZ2dlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCd3YXRjaENvbXBvbmVudERldGFpbHM6JywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QmVuY2hTZXJ2aWNlLndhdGNoVGVzdEJlbmNoZXMoIHRlc3RDb250ZXh0LCBrZXksIGxvZ2dlciApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZEtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybiggJ3dhdGNoVGVzdEJlbmNoZXM6JywgZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY0tleSBpbiBkYXRhLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERldGFpbHModGVzdENvbnRleHQsIGNLZXksIGxvZ2dlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCd3YXRjaENvbXBvbmVudERldGFpbHM6JywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYnJlYWs7IC8vIENhbiBvbmx5IHdhdGNoIHRoZSBhYm92ZSBmb3Igb25lIHdvcmstc3BhY2UgKHVubGVzcyBjb250ZXh0IGlzIG1vZGlmaWVkKS5cblxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuT25jZUFscmVhZHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG4gICAgfSApOyJdfQ==
