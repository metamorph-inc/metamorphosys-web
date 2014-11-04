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
        $scope.dataModel = {
            changeInfo: [],
            selected: [],
            configurations: [
                {
                    id: 1,
                    name: "Conf. no: 1",
                    alternativeAssignments: [
                        {
                            selectedAlternative: "/2130017834/542571494/1646059422/564312148/91073815",
                            alternativeOf: "/2130017834/542571494/1646059422/564312148"
                        }
                    ]
                },
                {
                    id: 2,
                    name: "Conf. no: 2",
                    alternativeAssignments: [
                        {
                            selectedAlternative: "/2130017834/542571494/1646059422/564312148/1433471789",
                            alternativeOf: "/2130017834/542571494/1646059422/564312148"
                        }
                    ]
                },
                {
                    id: 3,
                    name: "Conf. no: 3",
                    alternativeAssignments: [
                        {
                            selectedAlternative: "/2130017834/542571494/1646059422/564312148/1493907264",
                            alternativeOf: "/2130017834/542571494/1646059422/564312148"
                        }
                    ]
                },
                {
                    id: 4,
                    name: "Conf. no: 4",
                    alternativeAssignments: [
                        {
                            selectedAlternative: "/2130017834/542571494/1646059422/564312148/1767521621",
                            alternativeOf: "/2130017834/542571494/1646059422/564312148"
                        }
                    ]
                }
            ]
        };

        $scope.tableColumnDefinition = [
            {
                columnHeaderDisplayName: 'Name',
                templateUrl: 'tableCell.html',
                sortKey: 'name'
            }
        ];

        $scope.cfgClicked = function (cfg) {
            $scope.$emit('configurationClicked', cfg);
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
