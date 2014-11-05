/*globals angular, WebGMEGlobal, console*/


/**
 * @author pmeijer / https://github.com/pmeijer
 */

angular.module('cyphy.services')
    .service('executorService', function ($q) {
        'use strict';
        var self = this,
            executorClient = new WebGMEGlobal.classes.ExecutorClient();
    });