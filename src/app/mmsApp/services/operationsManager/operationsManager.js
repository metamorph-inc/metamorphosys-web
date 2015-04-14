/*globals angular*/

'use strict';

var operationsManagerModule = angular.module(
    'mms.designVisualization.operationsManager', []);

operationsManagerModule.provider('operationsManager', function OperationsManagerProvider() {
    var self,
        availableOperations = {},
        commitHandlers = {},
        journal;

    self = this;

    journal = [];

    this.registerOperation = function (operationDescriptor) {

        if (angular.isObject(operationDescriptor) &&
            angular.isString(operationDescriptor.type)) {
            availableOperations[operationDescriptor.type] = operationDescriptor;
        }
    };

    this.registerCommitHandler = function (operationType, commitHandler) {

        if (angular.isFunction(commitHandler)) {

            commitHandlers[operationType] = commitHandlers[operationType] || [];
            commitHandlers[operationType].push(commitHandler);

        }
    };

    this.$get = [ '$q',

        function ($q) {

            var OperationsManager;

            OperationsManager = function () {

                this.registerOperation = self.registerOperation;
                this.registerCommitHandler = self.registerCommitHandler;

                this.getAvailableOperations = function () {
                    return availableOperations;
                };

                this.commitOperation = function (operationType, footPrint) {

                    var operation,
                        deferred,
                        handlerPromises,
                        result;

                    handlerPromises = [];
                    operation = availableOperations[operationType];

                    if (angular.isObject(operation) && angular.isArray(commitHandlers[operationType])) {

                        angular.forEach(commitHandlers[operationType], function(commitHandler) {
                            handlerPromises.push(commitHandler(footPrint));
                        });

                        result = $q.all(handlerPromises);

                    } else {

                        deferred = $q.defer();
                        result = deferred.promise;
                        deferred.resolve();

                    }

                    return result;

                };

                this.logOperation = function (operationType, footPrint) {

                    journal.push({
                        type: operationType,
                        footPrint: footPrint,
                        timeStamp: Date.now()
                    });

                };

                this.initNew = function (operationType) {

                    var OperationClass,
                        operationInstance;

                    OperationClass = availableOperations[operationType].operationClass;

                    if (angular.isFunction(OperationClass)) {

                        operationInstance = new OperationClass();

                        Array.prototype.shift.call(arguments);

                        operationInstance.init.apply(operationInstance, arguments);

                    }

                    return operationInstance;
                };

            };

            return new OperationsManager();

        }
    ];
});
