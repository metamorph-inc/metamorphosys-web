/*globals define, console*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

define([], function () {
    'use strict';

    var ServerInfoController = function ($scope, smartClient) {
        var self = this;
        self.$scope = $scope;
        self.smartClient = smartClient;
        self.$scope.model = {};
        self.getServerInfo(function (info) {
            self.$scope.model = info;
        });
    };

    ServerInfoController.prototype.getServerInfo = function (callback) {
        var self = this,
            info = {};
        self.smartClient.serverInfoClient.os(function (err, res) {
            if (err) {
                info.osName = 'N/A';
                console.error('Could not obtain os-info.');
            } else {
                info.osName = res.type;
            }

            self.smartClient.serverInfoClient.npm(function (err, res) {
                if (err) {
                    info.version = 'N/A';
                    console.error('Could not obtain webgme-cyphy version info.');
                } else {
                    info.version = res.version;
                }
                self.smartClient.serverInfoClient.node(function (err, res) {
                    if (err) {
                        info.node = 'N/A';
                        console.error('Could not obtain node version.');
                    } else {
                        info.node = res.version;
                    }
                    callback(info);
                });
            });
        });
    };

    return ServerInfoController;
});

