/*globals angular, GME*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module( 'cyphy.services' )
    .service( 'executorService', function ( $q ) {
        'use strict';
        var executorClient = new GME.classes.ExecutorClient();

        this.createJob = function ( jobData ) {
            var deferred = $q.defer();
            executorClient.createJob( jobData, function ( err, jobInfo ) {
                if ( err ) {
                    deferred.reject( err );
                } else {
                    deferred.resolve( jobInfo );
                }
            } );

            return deferred.promise;
        };

        this.getInfo = function ( jobHash ) {
            var deferred = $q.defer();
            executorClient.getInfo( jobHash, function ( err, jobInfo ) {
                if ( err ) {
                    deferred.reject( err );
                } else {
                    deferred.resolve( jobInfo );
                }
            } );

            return deferred.promise;
        };

        this.getWorkersInfo = function () {
            var deferred = $q.defer();
            executorClient.getWorkersInfo( function ( err, response ) {
                if ( err ) {
                    deferred.reject( err );
                } else {
                    deferred.resolve( response );
                }
            } );

            return deferred.promise;
        };
    } );