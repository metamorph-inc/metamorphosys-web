/*globals angular, console */

angular.module('CyPhyApp')
    .controller('DesignSpaceController', function ($scope, $state, $timeout, $modal, growl, desertService, designService) {
        'use strict';
        var self = this,
            context,
            workspaceId = $state.params.workspaceId.replace(/-/g, '/'),
            designId = $state.params.designId.replace(/-/g, '/');

        console.log('DesignSpaceController');
        $scope.connectionId = 'my-db-connection-id';
        $scope.workspaceId = workspaceId;
        $scope.designId = designId;

        // Check for valid connectionId and register clean-up on destroy event.
//        if ($scope.connectionId && angular.isString($scope.connectionId)) {
//            context = {
//                db: $scope.connectionId,
//                regionId: 'DesignSpaceController' + (new Date()).toISOString()
//            };
//            $scope.$on('$destroy', function () {
//                designService.cleanUpAllRegions(context);
//            });
//        } else {
//            throw new Error('connectionId must be defined and it must be a string');
//        }

        $scope.state = {
            designNodeLoaded: false,
            designTreeLoaded: false,
            desertInputAvaliable: false,
            configurationStatus: 'Select an action above...',
            hasComponents: true
        };

        $scope.dataModels = {
            avmIds: {},
            desertInput: {},
            configurations: [],
            setName: null,
            design: {
                name: null,
                description: null,
                node: null
            }
        };

        $scope.$on('designTreeLoaded', function (event, data) {
            $scope.dataModels.avmIds = data;
            $scope.state.hasComponents = Object.keys(data).length > 0;
            $scope.state.designTreeLoaded = true;
        });

        $scope.$on('selectedInstances', function (event, data) {
            growl.info(data.name + ' has ' + data.ids.length + ' instance(s).');
            $scope.$broadcast('setSelectedNodes', data.ids);
        });

        $scope.$on('configurationClicked', function (event, data) {
            var i,
                ids = [];
            for (i = 0; i < data.alternativeAssignments.length; i += 1) {
                ids.push(data.alternativeAssignments[i].selectedAlternative);
            }
            $scope.$broadcast('setSelectedNodes', ids);
        });

        $scope.$on('desertInputReady', function (event, data) {
            $scope.dataModels.desertInput = data;
            $scope.state.desertInputAvaliable = true;
            console.log(data);
        });

        $scope.$on('configurationsLoaded', function (event, data) {
            $scope.dataModels.configurations = [];
            $timeout(function () {
                $scope.dataModels.setName = data.setName;
                $scope.dataModels.configurations = data.configurations;
                console.log(data);
                if (data.configurations.length === 0) {
                    growl.warning('There were no configurations in ' + data.setName);
                    $scope.state.configurationStatus = 'Select an action above...';
                }
            });
        });

        $scope.calculateConfigurations = function () {
            growl.info('Calculating configurations. Please wait..');
            $scope.state.configurationStatus = 'Calculating..';
            $scope.dataModels.configurations = [];
            desertService.calculateConfigurations($scope.dataModels.desertInput)
                .then(function (configurations) {
                    console.log(configurations);
                    $scope.dataModels.configurations = configurations;
                    $scope.dataModels.setName = 'calculated';
                });
        };

        $scope.saveConfigurations = function () {
            $scope.$broadcast('exposeSelection');
        };

        $scope.$on('selectionExposed', function (event, data) {
            var modalInstance;
            if (data.length < 1) {
                growl.warning('No selected configurations!');
                return;
            }

            modalInstance = $modal.open({
                templateUrl: '/default/templates/SaveConfigurationSet.html',
                controller: 'SaveConfigurationSetController',
                //size: size,
                resolve: { data: function () {
                    return data;
                } }
            });
            modalInstance.result.then(function (result) {
                var attrs = {
                    'name': result.name,
                    'INFO': result.description
                };
                growl.warning('Would save ' + result.name);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        });

//        designService.registerWatcher(context, function (destroyed) {
//
//            if (destroyed) {
//                console.warn('destroy event raised');
//                // Data not (yet) avaliable.
//                // TODO: display this to the user.
//                return;
//            }
//            console.info('initialize event raised');
//
//            designService.getDesignNode(context, $scope.designId)
//                .then(function (designNode) {
//
//                });
//        });
    })
    .controller('SaveConfigurationSetController', function ($scope, $modalInstance, data) {
        'use strict';
        $scope.data = {
            description: null,
            name: null,
            nbrOfConfigurations: data.length
        };

        $scope.ok = function () {
            $modalInstance.close($scope.data);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });