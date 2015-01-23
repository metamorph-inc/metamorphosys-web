/*globals angular, console, window, require*/

angular.module( 'CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.default.templates'
] )
    .config( function ( $stateProvider, $urlRouterProvider ) {
        'use strict';
        // For any unmatched url, redirect to /workspaces
        $urlRouterProvider.otherwise( '/workspaces' );
        //
        // Now set up the states
        $stateProvider
            .state( 'index', {
                url: '/index'
            } )
            .state( 'workspaces', {
                url: '/workspaces',
                templateUrl: '/default/templates/Workspaces.html',
                controller: 'WorkspacesController'
            } )
            .state( 'workspaceDetails', {
                url: '/workspaceDetails/:workspaceId',
                templateUrl: '/default/templates/WorkspaceDetails.html',
                controller: 'WorkspaceDetailsController'
            } )
            .state( 'designSpace', {
                url: '/designSpace/:workspaceId/:designId',
                templateUrl: '/default/templates/DesignSpace.html',
                controller: 'DesignSpaceController'
            } )
            .state( 'testBench', {
                url: '/testBench/:workspaceId/:testBenchId',
                templateUrl: '/default/templates/TestBench.html',
                controller: 'TestBenchController'
            } );
    } )
    .controller( 'MainNavigatorController', function ( $rootScope, $scope ) {
        'use strict';
        $scope.navigator = {};
        $scope.navigator.items = [ {
            id: 'root',
            label: 'ADMEditor',
            itemClass: 'cyphy-root'
        } ];
        $rootScope.mainNavigator = $scope.navigator;
    } )
    .run( function ( $state, growl, dataStoreService, projectService, branchService ) {
        'use strict';
        var connectionId = 'my-db-connection-id';

        dataStoreService.connectToDatabase( connectionId, {
            host: window.location.basename
        } )
            .then( function () {
                // select default project and branch (master)
                return projectService.selectProject( connectionId, 'ADMEditor' );
            } )
            .then( function () {
                dataStoreService.watchConnectionState( connectionId, function ( eventType ) {
                    console.log( 'watchConnectionState: ' + eventType );
                } );
                return branchService.selectBranch( connectionId, 'master' );
            } )
            .then( function () {
                branchService.watchBranchState( 'my-db-connection-id', function ( eventType ) {
                    console.log( 'watchBranchState: ' + eventType );
                } );
            } )
            .
        catch ( function ( reason ) {
            growl.error( 'ADMEditor does not exist. Create and import it using the <a href="' +
                window.location.origin + '"> webgme interface</a>.' );
            console.error( reason );
        } );
    } );


require( './views/Workspaces/WorkspacesController' );
require( './views/WorkspaceDetails/WorkspaceDetailsController' );
require( './views/DesignSpace/DesignSpaceController' );
require( './views/TestBench/TestBenchController' );