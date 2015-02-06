/*globals angular, console*/

var TIMEOUT = 0;
//TIMEOUT = 1000;

var CyPhyApp = angular.module( 'CyPhyApp', [
    'ui.router',

    'gme.services'
] )
    .run( function () {

    } );

var CyPhyApp = angular.module( 'CyPhyApp',
    [
        'ui.router',
        'gme.services',
] );

CyPhyApp.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/test?iterations=10');

    $stateProvider
        .state('test', {
            url: '/test?iterations',
            controller: 'PerfController',
            template: '<div class="main-navigator-container"><ul id="log"><li ng-repeat="log in logs track by $index"> <span>{{log}}</span> </li> </ul></div>'
    });
});

CyPhyApp.controller( 'PerfController', function ( $q, $scope, $timeout, $http, $stateParams, dataStoreService, projectService,
        nodeService, branchService ) {
        'use strict';

        var future,
            log,
            progress,
            fail,
            succeed,
            databaseId,
            meta,
            context,
            failed = false,
            branchId,
            iterations = $stateParams['iterations'] || 10;

        $scope.logs = [ 'init' ];

        log = function ( message ) {
            $scope.logs.push( new Date() + ' ' + message );
            //$scope.$apply();
        };
        progress = function (count) {
            document.getElementById('result_container').innerHTML += '<div id="progress_' + count + '"></div>';
        };
        fail = function (message) {
            failed = true;
            log('FAILED: ' + message);
            document.getElementById('result_container').innerHTML += '<div id="result">FAILED: ' + message + '</div>';
        };
        succeed = function (message) {
            if (failed === false) {
                log('SUCCESS');
                document.getElementById('result_container').innerHTML += '<div id="result">SUCCESS</div>';
            }
        };

        databaseId = 'my-db-connection-id';

        meta;
        context;
        future = ( function ( projectName ) {
            return dataStoreService.connectToDatabase( databaseId, {
                host: window.location.basename,
                storageKeyType: 'rand160Bits'
            } )
                .then( function () {
                    // select default project and branch (master)
                    log( 'db open' );
                    return projectService.selectProject( databaseId, projectName );
                } )
                .
            catch ( function ( reason ) {
                if (reason.message.indexOf('Project does not exist') !== -1) {
                    return $http.get('/extlib/test/models/SimpleModelica.json')
                        .then(function (res) {
                            var deferred = $q.defer();
                            var client = dataStoreService.getDatabaseConnection(databaseId).client;
                            client.createProjectFromFileAsync(projectName, res.data, function(err) {
                                if (err) {
                                    return deferred.reject(err);
                                }
                                log('project imported');
                                deferred.resolve();
                            });
                            return deferred.promise;
                        }).catch(fail);
                }
                log( 'Project "' + projectName + '" does not exist. Create and import it using the <a href="' +
                    window.location.origin + '"> webgme interface</a>.' );
                fail( reason );
            } );
        } )( 'SimpleModelica' )
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
            .then( function ( branchId_ ) {
                return $timeout( function () {
                    branchId = branchId_;
                    return branchId;
                }, TIMEOUT );
            } )
            .then( function ( branchId ) {
                return branchService.selectBranch( databaseId, branchId );
            } )
            .then( function ( project ) {
                branchService.watchBranchState(databaseId, function (state) {
                    if (state === 'forked') {
                        fail('forked');
                    }
                });
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
                    succeed();
                    deferred.resolve(null);
                });
            value.setAttribute('Value', Math.random() * 10000);
            return deferred.promise;
        };
        var step = 40;
        var j = 0;
        var latest = 0;
        setattr = function () {
            var i,
                deferred = $q.defer();
            value.onUpdate(function () {
                log('set ' + i + ' ' + j);
                // console.log('set ' + i + ' ' + j);
                progress(j);
                var valuePath = value.getId();
                if (value.getAttribute('Value') === j && latest < j) {
                    latest = j;
                    if (j >= step * iterations) {
                        return (function () {
                            var getBranchTries = 0,
                                testBranchResult = function () {
                                    return branchService.getBranches(databaseId).then(function (branches) {
                                        var client = dataStoreService.getDatabaseConnection(databaseId).client,
                                            clientCommit = client.getActualCommit(),
                                            serverCommit = branches.filter(function (b) {
                                            return b.name === branchId;
                                        })[0];
                                        if (client.getActualBranchStatus() !== client.branchStates.SYNC) {
                                            fail('Forked at end');
                                        } else if (serverCommit.commitId !== clientCommit) {
                                            if (getBranchTries++ > 200) {
                                                fail('Branch mismatch: server has ' + serverCommit.commitId + '; client has ' + clientCommit);
                                            } else {
                                               return $timeout(testBranchResult, 100);
                                            }
                                        } else {
                                            succeed();
                                        }
                                    });
                                };
                            deferred.resolve;
                            return testBranchResult();
                        })();

                        /*
                            $timeout(400,
                            branchService.selectBranch( databaseId, 'master' )
                            .then(function () {
                                return branchService.getBranches(databaseId);
                            })
                            .then(function (branches) {
                                console.log(JSON.stringify(branches, null, 4));
                                return branchService.selectBranch( databaseId, branchId );
                            }).then(function () {
                                return nodeService.loadNode(context, valuePath);
                            }).then(function (value) {
                                fail(value.getAttribute('Value'));

                            }))
                        */
                    } else {
                        if (!failed) {
                            deferred.resolve($timeout(setattr, 40));
                        }
                    }
                }
            });
            value.onUnload(function () {
                fail('unloaded');
                debugger;
            });
            j += step;
            for (i = 1; i <= step; i++) {
                value.setAttribute('Value', i + j - step);
            }
            return deferred;
        };
        future.catch(fail);
        future.then(setattr);
    } );
