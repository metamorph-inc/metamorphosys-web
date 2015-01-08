/*globals angular */

'use strict';

angular.module('mms.projectHandling', [])
    .service('projectHandling', function ($q, $log, branchService, connectionHandling, $http) {

        this.copyProject = function() {
            return $http.get('/rest/external/copyproject/noredirect');

        };


        this.findFirstBranch = function() {

            var deferred,
                connectionId;

            deferred = $q.defer();

            connectionId = connectionHandling.getMainGMEConnectionId();

            branchService.getBranches(connectionId)
                .then(function(branches) {

                    $log.debug('Available branches', branches);

                    if (!branches.length) {

                        $log.error('No branches, what now?');
                        deferred.reject();

                    } else {

                        deferred.resolve(branches[0].name);

                    }

                });

            return deferred.promise;

        };


    });
