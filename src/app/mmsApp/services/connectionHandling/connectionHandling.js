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

        this.$get = ['$q', 'dataStoreService',

            function ($q, dataStoreService) {

                var ConnectionHandling;

                ConnectionHandling = function() {

                    var dataStorePromise;

                    this.establishMainGMEConnection = function () {

                        var deferred;

                        deferred = $q.defer();

                        if (!dataStorePromise && !mainConnectionEstablished) {

                            dataStorePromise = dataStoreService.connectToDatabase(mainConnectionId, {
                                host: window.location.basename
                            }).then(function () {

                                mainConnectionEstablished = true;

                                deferred.resolve();

                            });

                        } else {
                            deferred.resolve();
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
