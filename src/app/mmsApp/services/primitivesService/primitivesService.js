/*globals angular, console*/

'use strict';

angular.module('mms.primitivesService', [])
    .service('primitivesService', function ($q, $http) {
    
    var self = this,
        primitives = [],
        primitiveDirectives = {},
        primitiveDescriptions = {};

    this.getPrimitives = function() {
        var defer = $q.defer();

        $http.get('primitivesList.json').then(function(data) {
            primitives = data;
            defer.resolve(data);
        });

        return defer.promise;
    };
    
});
