/*globals console, angular, Chance*/

var demoApp = angular.module('cyphy.ui.ComponentDetails.demo', [
    'cyphy.components',
    'cyphy.components.templates'
]);

// overwrite ComponentService with dummy data
demoApp.service('ComponentService', function ($q) {
    'use strict';

    var self = this;

    this.watchComponents = function (parentContext, workspaceId, updateListener) {
        var deferred = $q.defer(),
            numComps,
            i,
            data = {
                regionId: parentContext.regionId  + '_dummy_region',
                components: {} // component {id: <string>, name: <string>, description: <string>,
                //            avmId: <string>, resource: <hash|string>, classifications: <string> }
            };

        self.chance = new Chance();
        numComps = 3;
        for (i = 0; i < numComps; i += 1) {
            data.components[i] = {
                id: workspaceId + '/' + i.toString(),
                name: self.chance.last(),
                description: self.chance.sentence(),
                avmId: self.chance.guid(),
                resource: self.chance.hash(),
                classifications: self.chance.gender()
            };
        }

        deferred.resolve(data);

        return deferred.promise;
    };

    this.watchComponentDetails = function (parentContext, componentId, updateListener) {
        var deferred = $q.defer(),
            num,
            i,
            data = {
                regionId: parentContext.regionId + '_dummy_details_' + componentId,
                id: componentId,
                domainModels: {},   //domainModel: id: <string>, type: <string>
                interfaces: {
                    properties: {}, //property: {id: <string>, name: <string>, dataType: <string>, valueType <string>}
                    connectors: {}  //connector: {id: <string>, name: <string>, domainPorts: <object> }
                }
            };

        self.chance = new Chance();
        num = 4;
        for (i = 0; i < num; i += 1) {
            data.interfaces.properties[i] = {
                id: componentId + '/' + i.toString(),
                name: self.chance.last(),
                dataType: 'String',
                valueType: 'Fixed'
            };
        }
        num = 3;
        for (i = 0; i < num; i += 1) {
            data.interfaces.connectors[i] = {
                id: componentId + '/' + i.toString(),
                name: self.chance.last(),
                domainPorts: {}
            };
        }

        deferred.resolve(data);

        return deferred.promise;
    };

    this.cleanUpRegion = function (parentContext, regionId) {
        console.log('cleanUpRegion');
    };

    this.cleanUpAllRegions = function (parentContext) {
        console.log('cleanUpAllRegions');
    };

    this.registerWatcher = function (parentContext, fn) {
        fn(false);
    };
});