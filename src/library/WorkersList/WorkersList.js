/*globals angular, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.components' )
    .controller( 'WorkersListController', function ( $scope, $interval, growl, executorService ) {
        'use strict';
        var intervalPromise = null,
            consecutiveErrors = 0,
            maxConsecutiveErrors = 30;
        $scope.dataModel = {
            workers: null
        };
        $scope.$on( '$destroy', function () {
            if ( intervalPromise && $interval.cancel( intervalPromise ) ) {
                console.log( 'Workers interval cancelled' );
            } else {
                console.error( 'Could not cancel WorkersInterval.' );
                console.error( intervalPromise );
            }
        } );

        intervalPromise = $interval( function () {
            executorService.getWorkersInfo()
                .then( function ( responce ) {
                    consecutiveErrors = 0;
                    $scope.dataModel.workers = responce;
                } )
                .
            catch ( function ( err ) {
                console.error( err );
                consecutiveErrors += 1;
                if ( consecutiveErrors >= maxConsecutiveErrors ) {
                    $interval.cancel( intervalPromise );
                    growl.error( 'Workers did not respond after ' + maxConsecutiveErrors + ' requests.' );
                    intervalPromise = null;
                }
            } );
        }, 1000 );
    } )
    .directive( 'workersList', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {},
            replace: true,
            templateUrl: '/cyphy-components/templates/WorkersList.html',
            controller: 'WorkersListController'
        };
    } );