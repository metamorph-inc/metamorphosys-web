/*globals angular */

'use strict';

angular.module('mms.projectHandling', [])
    .service('projectHandling', function ($q, $log, branchService, connectionHandling, $http) {

        var randomString;

        randomString = function(length) {
            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

            if (! length) {
                length = Math.floor(Math.random() * chars.length);
            }

            var str = '';
            for (var i = 0; i < length; i++) {
                str += chars[Math.floor(Math.random() * chars.length)];
            }
            return str;
        };

        this.copyProject = function () {
            return $http.get('/rest/external/copyproject/noredirect');

        };

        this.cloneMaster = function () {

            var deferred,
                connectionId;

            deferred = $q.defer();

            connectionHandling.establishMainGMEConnection()
                .then(function () {

                    connectionId = connectionHandling.getMainGMEConnectionId();

                    branchService.getBranches(connectionId)
                        .then(function (branches) {

                            var newBranchId,
                                hashId,
                                i;

                            $log.debug('Available branches', branches);

                            if (!branches.length) {

                                $log.error('No branches, what now?');
                                deferred.reject();

                            } else {

                                for (i=0; i < branches.length; i++) {

                                    if (branches[i].name === 'master') {
                                        hashId = branches[i].commitId;
                                    }
                                }

                                if (!hashId) {
                                    deferred.reject('Could not find master branch!');
                                }

                                newBranchId = randomString(6) + (new Date()).getTime();

                                branchService.createBranch(
                                    connectionId,
                                    newBranchId,
                                    hashId
                                )
                                    .then(function () {
                                        deferred.resolve(newBranchId);
                                    })
                                    .catch(function (err) {
                                        deferred.reject(err);
                                    });


                            }

                        })
                        .catch(function (error) {
                            deferred.reject(error);
                        });

                });

            return deferred.promise;

        };

        this.findFirstBranch = function () {

            var deferred,
                connectionId;

            deferred = $q.defer();

            connectionId = connectionHandling.getMainGMEConnectionId();

            branchService.getBranches(connectionId)
                .then(function (branches) {

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
