/*globals angular */

'use strict';

angular.module('mms.connectionHandling', [])
    .service('connectionHandling', function ($q, dataStoreService) {

        var mainConnectionId,
            mainConnectionEstablished,

            dataStorePromise;

        mainConnectionId = 'main-db-connection-id';
        mainConnectionEstablished = false;

        this.establishMainGMEConnection = function() {

            var deferred;

            deferred = $q.defer();

            if (!dataStorePromise && !mainConnectionEstablished) {

                dataStorePromise = dataStoreService.connectToDatabase(mainConnectionId, {
                    host: window.location.protocol + "//" + window.location.host,
                    storageKeyType: "rand160Bits"
                }).then(function () {

                    mainConnectionEstablished = true;

                    deferred.resolve();

                });

            } else {
                deferred.resolve();
            }

            return deferred.promise;

        };

        this.getMainGMEConnectionId = function(){
            return mainConnectionId;
        };

    });
