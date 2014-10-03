/*globals console, angular, Chance*/

var demoApp = angular.module('cyphy.ui.ComponentList.demo', [
    'cyphy.components',
    'cyphy.components.templates'
]);

// overwrite ComponentService with dummy data
//demoApp.service('ComponentService', function ($q) {
//    'use strict';
//
//    var self = this,
//        components = [];
//
//    this.watchComponents = function (parentContext, workspaceId, updateListener) {
//        var deferred = $q.defer(),
//            numComps,
//            i,
//            data = {
//                regionId: parentContext.regionId  + '_dummy_region',
//                components: {} // component {id: <string>, name: <string>, description: <string>,
//                //            avmId: <string>, resource: <hash|string>, classifications: <string> }
//            };
//
//        self.chance = new Chance();
//        numComps = self.chance.integer({min: 2, max: 8})
//        for (i = 0; i < numComps; i += 1) {
//            data.components[i] = {
//                id: workspaceId + '/' + i.toString(),
//                name: self.chance.last(),
//                description: self.chance.sentence(),
//                avmId: self.chance.guid(),
//                resource: self.chance.hash(),
//                classifications: self.chance.gender()
//            };
//        }
//
//        deferred.resolve(data);
//
//        return deferred.promise;
//    };
//
//    this.cleanUpRegion = function (parentContext, regionId) {
//        console.log('cleanUpRegion');
//    };
//
//    this.cleanUpAllRegions = function (parentContext) {
//        console.log('cleanUpAllRegions');
//    };
//
//    this.registerWatcher = function (parentContext, fn) {
//        fn(false);
//    };
//});