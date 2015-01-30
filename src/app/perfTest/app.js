/*globals angular, console*/

var TIMEOUT = 0;
// uncomment this and the meta nodes won't be loaded:
//TIMEOUT = 1000;

var fatal = function ( err ) {
    console.log( err );
};

var CyPhyApp = angular.module( 'CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.sample.templates'
] )
    .run( function () {

    } );

// TODO: require all of your controllers
//require('./views/MyView/MyViewController');


angular.module( 'CyPhyApp' )
    .controller( 'MyViewController', function ( $q, $scope, $timeout, $http, growl, dataStoreService, projectService,
        nodeService, branchService ) {
        'use strict';

        var future,
            log,
            databaseId,
            meta,
            context;

        $scope.logs = [ 'init' ];

        log = function ( message ) {
            $scope.logs.push( new Date() + " " + message );
            //$scope.$apply();
        };

        databaseId = 'my-db-connection-id';

        meta;
        context;
        future = ( function ( projectName ) {
            return dataStoreService.connectToDatabase( databaseId, {
                host: window.location.basename,
                storageKeyType: "rand160bytes"
            } )
                .then( function () {
                    // select default project and branch (master)
                    log( 'db open' );
                    return projectService.selectProject( databaseId, projectName );
                } )
                .
            catch ( function ( reason ) {
                log( 'Project "' + projectName + '" does not exist. Create and import it using the <a href="' +
                    window.location.origin + '"> webgme interface</a>.' );
                fatal( reason );
            } );
        } )( "SimpleModelica" )
            .then( function ( project ) {
                context = {
                    db: databaseId,
                    projectId: project,
                    branchId: 'master',
                    regionId: ( new Date() )
                        .toISOString() + 'x'
                };
                return $timeout( function () {
                    return project;
                }, TIMEOUT );
            } )
            .then( function () {
                return branchService.getBranches( databaseId);
            })
            .then( function (branches) {
                return branchService.createBranch( databaseId, "branch" + ( Math.random() * 10000 | 0 ),
                    branches.filter(function (o) { return o.name === 'master'; })[0].commitId );
            } )
            .then( function ( branchId ) {
                return $timeout( function () {
                    return branchId;
                }, TIMEOUT );
            } )
            .then( function ( branchId ) {
                return branchService.selectBranch( databaseId, branchId );
            } )
            .then( function ( project ) {
                return nodeService.getMetaNodes( context );
            } )
            .then( function ( metaNodes ) {
                meta = metaNodes;
                log( 'meta loaded' );
                return nodeService.loadNode( context, '' );
            } )
            .then( function ( root ) {
                return root.loadChildren();
            } )
            .then( function ( children ) {
                log( 'children: ' + children.length );
                return children.filter( function ( child ) {
                    return child.getAttribute( 'name' ) === 'WorkSpace';
                } )[ 0 ].loadChildren();
            } )
            .then( function ( children ) {
                log( 'children: ' + children.length );
                return children.filter( function ( child ) {
                    return child.getAttribute( 'name' ) === 'ACMFolder';
                } )[ 0 ].loadChildren();
            } )
            .then( function ( children ) {
                log( 'children: ' + children.length );
                acm = children.filter( function ( child ) {
                    return child.getAttribute( 'name' ) === 'Modelica';
                } )[ 0 ];
                return acm.loadChildren();
            } );
        future = future.then(function (children) {
            log('children2: ' + children.length);
            var prop = children.filter(function (child) {
                return child.getAttribute('name') === 'Prop';
            })[0];
            value = prop;
            return prop;
        });
        var count = 0;
        var value;
        var acm;
        var setattr = function (c) {
            log('set');

            var deferred = $q.defer();
            value.onUpdate(function () {
                    count++; log("done " + count);
                    if (count < 15) {
                        deferred.resolve($timeout(setattr, 2));
                        //deferred.resolve(setattr);
                        return;
                    }
                    log( 'PHANTOM DONE' );
                    deferred.resolve(null);
                });
            value.setAttribute('Value', Math.random() * 10000);
            return deferred.promise;
        };
        var j = 0;
        setattr = function (c) {
            var i,
                deferreds = [],
                deferred = $q.defer();
            value.onUpdate(function () {
                log('set ' + i);
                console.log('set ' + i + ' ' + j);
                if (j > 40 * 20) {
                    deferred.resolve();
                    deferred = $q.defer();
                    log( 'PHANTOM DONE' );
                } else {
                    deferred.resolve($timeout(setattr, 10));
                    deferred = $q.defer();
                }
            });
            value.onUnload(function () {
                debugger;
            });
            for (i = 0; i < 20; i++) {
                j++;
                value.setAttribute('Value', j);
            }
            return deferred;
        };
        future.then(setattr);
        //.catch ( fatal );
    } );
