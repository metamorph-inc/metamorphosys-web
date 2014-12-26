/*globals angular*/

'use strict';

var operationsManagerModule = angular.module(
    'mms.designVisualization.operationsManager', [] );

operationsManagerModule.service( 'operationsManager', function SymbolManagerProvider() {
    var availableOperations = {};

    this.registerOperation = function ( operationDescriptor ) {

        if ( angular.isObject( operationDescriptor ) &&
            angular.isString( operationDescriptor.id ) ) {
            availableOperations[ operationDescriptor.id ] = operationDescriptor;
        }
    };

    this.$get = [

        function () {

            var OperationsManager;

            OperationsManager = function () {

                this.getAvailableOperations = function () {
                    return availableOperations;
                };

                this.getOperation = function ( operationId ) {
                    return availableOperations[ operationId ];
                };

            };

            return new OperationsManager();

        }
    ];
} );