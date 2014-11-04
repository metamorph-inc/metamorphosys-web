/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

//// ========== initialize documentation app module ========== //
//angular.module('adaptv.adaptStrapDocs', [
//    'ngSanitize',
//    'adaptv.adaptStrap'
//])

angular.module('cyphy.components')
    .controller('ConfigurationTableController', function ($scope) {
        'use strict';
        $scope.models = {
            changeInfo: [],
            selectedCars: [
                {
                    id: 1,
                    name: 'Audi A4',
                    modelYear: 2009,
                    price: 34000
                }
            ],
            carsForSale: [
                {
                    id: 1,
                    name: 'Audi A4',
                    modelYear: 2009,
                    price: 34000
                },
                {
                    id: 2,
                    name: 'BMW 328i',
                    modelYear: 2012,
                    price: 39000
                },
                {
                    id: 3,
                    name: 'Audi A6',
                    modelYear: 2012,
                    price: 44000
                },
                {
                    id: 4,
                    name: 'Audi S8',
                    modelYear: 2014,
                    price: 100000
                },
                {
                    id: 5,
                    name: 'Audi A4',
                    modelYear: 2009,
                    price: 34000
                },
                {
                    id: 6,
                    name: 'BMW 328i',
                    modelYear: 2012,
                    price: 39000
                },
                {
                    id: 7,
                    name: 'Audi A6',
                    modelYear: 2012,
                    price: 44000
                },
                {
                    id: 8,
                    name: 'Audi S8',
                    modelYear: 2014,
                    price: 100000
                },
                {
                    id: 9,
                    name: 'Audi A6',
                    modelYear: 2012,
                    price: 44000
                },
                {
                    id: 10,
                    name: 'Audi S8',
                    modelYear: 2014,
                    price: 100000
                },
                {
                    id: 11,
                    name: 'Audi A6',
                    modelYear: 2012,
                    price: 44000
                },
                {
                    id: 12,
                    name: 'Audi S8',
                    modelYear: 2014,
                    price: 100000
                }
            ]
        };

        $scope.carsTableColumnDefinition = [
            {
                columnHeaderDisplayName: 'Name',
                templateUrl: 'tableCell.html',
                sortKey: 'name'
            }
        ];

        // ========== ui handlers ========== //
        $scope.buyCar = function (car) {
            alert(car.name);
        };
    })
    .directive('configurationTable', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                workspaceId: '=workspaceId',
                connectionId: '=connectionId',
                avmIds: '=avmIds'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/ConfigurationTable.html',
            controller: 'ConfigurationTableController'
        };
    });
