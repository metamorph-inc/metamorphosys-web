/*globals angular */

'use strict';

angular.module('mms.connectionHandling', [])

    .provider('connectionHandling', function ConnectionHandlingProvider() {

        var self,
            mainConnectionId,
            mainConnectionEstablished;

        self = this;

        mainConnectionId = 'main-db-connection-id';
        mainConnectionEstablished = false;

        this.getMainGMEConnectionId = function () {
            return mainConnectionId;
        };

        this.$get = ['$rootScope', '$q', 'dataStoreService', '$log', '$timeout',

            function ($rootScope, $q, dataStoreService, $log, $timeout) {

                var ConnectionHandling;

                ConnectionHandling = function() {

                    var dataStorePromise;

                    this.establishMainGMEConnection = function () {

                        var deferred;

                        deferred = $q.defer();

                        if (!dataStorePromise && !mainConnectionEstablished) {

                            GME.gmeConfig.host = window.location.protocol + "//" + window.location.host;
                            dataStorePromise = dataStoreService.connectToDatabase(mainConnectionId,
                                GME.gmeConfig
                            ).then(function () {

                                dataStoreService.watchConnectionState( mainConnectionId, function ( connectionEvent ) {

                                    $log.debug( 'watchConnectionState', connectionEvent );

                                    $timeout(function(){
                                        $rootScope.disconnected  = ( connectionEvent !== 'connected' );
                                    });


                                } );

                                mainConnectionEstablished = true;

                                deferred.resolve(mainConnectionId);

                            });

                        } else {

                            deferred.resolve(mainConnectionId);
                        }

                        return deferred.promise;

                    };

                    this.getMainGMEConnectionId = self.getMainGMEConnectionId;
                };

                return new ConnectionHandling();

            }
        ];

    }
);
