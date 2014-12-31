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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9hcHAvc2VydmljZXRlc3QvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyBhbmd1bGFyLCBjb25zb2xlKi9cblxuYW5ndWxhci5tb2R1bGUoICdDeVBoeUFwcCcsIFtcbiAgICAnZ21lLnNlcnZpY2VzJyxcbiAgICAnY3lwaHkuY29tcG9uZW50cydcbl0gKVxuICAgIC5ydW4oIGZ1bmN0aW9uICggZGF0YVN0b3JlU2VydmljZSwgcHJvamVjdFNlcnZpY2UsIGJyYW5jaFNlcnZpY2UsIG5vZGVTZXJ2aWNlLCB3b3Jrc3BhY2VTZXJ2aWNlLCBjb21wb25lbnRTZXJ2aWNlLFxuICAgICAgICBkZXNpZ25TZXJ2aWNlLCB0ZXN0QmVuY2hTZXJ2aWNlICkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG4gICAgICAgIGRhdGFTdG9yZVNlcnZpY2UuY29ubmVjdFRvRGF0YWJhc2UoICdteS1kYi1jb25uZWN0aW9uLWlkJywge1xuICAgICAgICAgICAgaG9zdDogd2luZG93LmxvY2F0aW9uLmJhc2VuYW1lXG4gICAgICAgIH0gKVxuICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ0Nvbm5lY3RlZCAuLi4nICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2plY3RTZXJ2aWNlLnNlbGVjdFByb2plY3QoICdteS1kYi1jb25uZWN0aW9uLWlkJywgJ0FETUVkaXRvcicgKTtcbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ1Byb2plY3Qgc2VsZWN0ZWQuLi4nICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJyYW5jaFNlcnZpY2Uuc2VsZWN0QnJhbmNoKCAnbXktZGItY29ubmVjdGlvbi1pZCcsICdtYXN0ZXInICk7XG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coICdCcmFuY2ggc2VsZWN0ZWQuLi4nICk7XG4gICAgICAgICAgICB9IClcbiAgICAgICAgICAgIC5cbiAgICAgICAgY2F0Y2ggKCBmdW5jdGlvbiAoIHJlYXNvbiApIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIHJlYXNvbiApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gICAgICAgIGJyYW5jaFNlcnZpY2Uub24oe2RiOiAnbXktZGItY29ubmVjdGlvbi1pZCcsIHByb2plY3RJZDogJ0FETUVkaXRvcicsIGJyYW5jaElkOiAnbWFzdGVyJ30sICdpbml0aWFsaXplJywgZnVuY3Rpb24gKGN1cnJlbnRDb250ZXh0KSB7XG4gICAgICAgIC8vICAgICAgICAgICAgY29uc29sZS5sb2coJ2JyYW5jaFNlcnZpY2UgaW5pdGlhbGl6ZWQuLicpO1xuICAgICAgICAvLyAgICAgICAgfSk7XG5cbiAgICAgICAgbm9kZVNlcnZpY2Uub24oICdteS1kYi1jb25uZWN0aW9uLWlkJywgJ2luaXRpYWxpemUnLCBmdW5jdGlvbiAoIC8qY3VycmVudENvbnRleHQqLykge1xuICAgICAgICAgICAgdmFyIGxvZ2dlcixcbiAgICAgICAgICAgICAgICB0ZXN0Q29udGV4dDtcblxuICAgICAgICAgICAgbG9nZ2VyID0gZnVuY3Rpb24gKCBpbmZvICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybiggaW5mbyApO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGVzdENvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgZGI6ICdteS1kYi1jb25uZWN0aW9uLWlkJyxcbiAgICAgICAgICAgICAgICByZWdpb25JZDogJ1Rlc3RSZWdpb24nXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy9wbHVnaW5TZXJ2aWNlLnRlc3RSdW5QbHVnaW4odGVzdENvbnRleHQpO1xuICAgICAgICAgICAgd29ya3NwYWNlU2VydmljZS53YXRjaFdvcmtzcGFjZXMoIHRlc3RDb250ZXh0LCBsb2dnZXIgKVxuICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBydW5PbmNlQWxyZWFkeTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhdGNoV29ya3NwYWNlczonLCBkYXRhICk7XG5cbiAgICAgICAgICAgICAgICAgICAgcnVuT25jZUFscmVhZHkgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvcmVFYWNoKCBkYXRhLndvcmtzcGFjZXMsIGZ1bmN0aW9uICggdiwga2V5ICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHJ1bk9uY2VBbHJlYWR5ID09PSBmYWxzZSApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hOdW1iZXJPZkNvbXBvbmVudHMoIHRlc3RDb250ZXh0LCBrZXksIGxvZ2dlciApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhdGNoTnVtYmVyT2ZDb21wb25lbnRzOicsIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hOdW1iZXJPZkRlc2lnbnMoIHRlc3RDb250ZXh0LCBrZXksIGxvZ2dlciApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhdGNoTnVtYmVyT2ZEZXNpZ25zOicsIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZVNlcnZpY2Uud2F0Y2hOdW1iZXJPZlRlc3RCZW5jaGVzKCB0ZXN0Q29udGV4dCwga2V5LCBsb2dnZXIgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbiggZnVuY3Rpb24gKCBkYXRhICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coICd3YXRjaE51bWJlck9mVGVzdEJlbmNoZXM6JywgZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudHMoIHRlc3RDb250ZXh0LCBrZXksIGxvZ2dlciApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhdGNoQ29tcG9uZW50czonLCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goIGRhdGEuY29tcG9uZW50cywgZnVuY3Rpb24gKCB2LCBjS2V5ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFNlcnZpY2Uud2F0Y2hJbnRlcmZhY2VzKCB0ZXN0Q29udGV4dCwgY0tleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnd2F0Y2hDb21wb25lbnREZXRhaWxzOicsIGRhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzaWduU2VydmljZS53YXRjaERlc2lnbnMoIHRlc3RDb250ZXh0LCBrZXksIGxvZ2dlciApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhdGNoRGVzaWduczonLCBkYXRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjS2V5IGluIGRhdGEuY29tcG9uZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTZXJ2aWNlLndhdGNoQ29tcG9uZW50RGV0YWlscyh0ZXN0Q29udGV4dCwgY0tleSwgbG9nZ2VyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ3dhdGNoQ29tcG9uZW50RGV0YWlsczonLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RCZW5jaFNlcnZpY2Uud2F0Y2hUZXN0QmVuY2hlcyggdGVzdENvbnRleHQsIGtleSwgbG9nZ2VyIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybiggJ3dhdGNoVGVzdEJlbmNoZXM6JywgZGF0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY0tleSBpbiBkYXRhLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50U2VydmljZS53YXRjaENvbXBvbmVudERldGFpbHModGVzdENvbnRleHQsIGNLZXksIGxvZ2dlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCd3YXRjaENvbXBvbmVudERldGFpbHM6JywgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYnJlYWs7IC8vIENhbiBvbmx5IHdhdGNoIHRoZSBhYm92ZSBmb3Igb25lIHdvcmstc3BhY2UgKHVubGVzcyBjb250ZXh0IGlzIG1vZGlmaWVkKS5cblxuICAgICAgICAgICAgICAgICAgICAgICAgcnVuT25jZUFscmVhZHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG4gICAgfSApOyJdfQ==
