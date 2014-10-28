/*globals angular, console, document, require*/

/**
 * @author pmeijer / https://github.com/pmeijer
 * @author lattmann / https://github.com/lattmann
 */

angular.module('cyphy.components')
    .controller('DesignTreeController', function ($scope, designService) {
        'use strict';
        var self = this,
            items = [],
            config;

        console.log('DesignTreeController');
        console.log($scope.designId);

        $scope.treeData = {};

        designService.watchDesignStructure(null, $scope.designId, function (err, structure) {
            $scope.treeData = structure;
        });

    })
    .directive('designTree', function () {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                designId: '=designId'
            },
            replace: true,
            templateUrl: '/cyphy-components/templates/DesignTree.html',
            controller: 'DesignTreeController'
        };
    });
