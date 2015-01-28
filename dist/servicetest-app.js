(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*globals angular, console*/

angular.module( 'CyPhyApp', [
    'gme.services',
    'cyphy.components'
] )
    .service( '$modal', function () {} )
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
                dataStoreService.watchConnectionState( 'my-db-connection-id', function ( eventType ) {
                    console.log( 'watchConnectionState' + eventType );
                } );
                return branchService.selectBranch( 'my-db-connection-id', 'master' );
            } )
            .then( function () {
                branchService.watchBranchState( 'my-db-connection-id', function ( eventType ) {
                    console.log( 'watchBranchState' + eventType );
                } );
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

                    angular.forEach( data.workspaces, function ( v, key ) {

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


//# sourceMappingURL=servicetest-app.js.map