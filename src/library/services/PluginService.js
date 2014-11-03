/*globals angular, WebGMEGlobal, console*/


/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.services')
    .service('pluginService', function ($q, dataStoreService) {
        'use strict';
        this.testRunPlugin = function (context, pluginName, config) {
            var dbConn = dataStoreService.getDatabaseConnection(context.db),
                interpreterManager = new WebGMEGlobal.classes.InterpreterManager(dbConn.client);

            interpreterManager.run('AdmExporter', {activeNode: '/1586421660/958919425/239534238'}, function (a, b, c) {
                console.log(a, b, c);
            });
        };
    });