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
        //$http.get('/rest/external/copyproject/noredirect')
        //    .then(function(data) {
        //        //return data.data;
        //        return "NkLabsPrototype";
        //    }).then(
        future = ( function ( projectName ) {
            return dataStoreService.connectToDatabase( databaseId, {
                host: window.location.basename
            } )
                .then( function () {
                    // select default project and branch (master)
                    log( 'db open' );
                    return projectService.selectProject( databaseId, projectName );
                } )
                .
            catch ( function ( reason ) {
                log( 'ADMEditor does not exist. Create and import it using the <a href="' +
                    window.location.origin + '"> webgme interface</a>.' );
                fatal( reason );
            } );
        } )( "Template_Module_1x2" )
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
                return branchService.createBranch( databaseId, "branch" + ( Math.random() * 10000 | 0 ),
                    '#1e28896c0d52371d56cf725a1e76ffbdfd318637' );
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
                attiny = children.filter( function ( child ) {
                    return child.getAttribute( 'name' ) === 'R_0201_620k_0.05W_1%_Thick_Film';
                } )[ 0 ];
                return attiny.loadChildren();
            } );
        future = future.then(function (children) {
            log('children2: ' + children.length);
            var c = children.filter(function (child) {
                return child.getAttribute('name') === 'R';
            })[0];
            value = c;
            return c;
        });
        var count = 0;
        var value;
        var attiny;
        var setattr = function (c) {
            log('set');

            value.setAttribute('Value', Math.random() * 10000);
            var deferred = $q.defer();
            value.onUpdate(function () {
                    count++; log("done " + count);
                    if (count < 10) {
                        deferred.resolve($timeout(setattr, 2));
                        //deferred.resolve(setattr);
                        return;
                    }
                    log( 'PHANTOM DONE' );
                    deferred.resolve(null);
                });
            return deferred.promise;
        }
        future.then(setattr);
        //.catch ( fatal );
    } );
