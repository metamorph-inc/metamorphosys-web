/*globals define, console, alert, window*/

/**
 * @author nabana / https://github.com/nabana
 * @author pmeijer / https://github.com/pmeijer
 */

define( [], function () {
    'use strict';

    var MainNavigatorController = function ( $scope ) {
        var firstMenu,
            self = this;
        self.$scope = $scope;
        firstMenu = {
            id: 'root',
            label: 'ADMEditor',
            itemClass: 'cyphy-root'
        };

        $scope.mainNavigator.items = [ firstMenu ];
        $scope.navigator = $scope.mainNavigator;
    };

    return MainNavigatorController;
} );