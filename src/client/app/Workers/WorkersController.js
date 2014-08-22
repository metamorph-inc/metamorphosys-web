/*globals define, console, window*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */

define([], function () {
    'use strict';

    var WorkersController = function ($scope, $rootScope, $moment, $routeParams, smartClient, Chance, growl) {
        var self = this;

        self.$scope = $scope;
        self.$moment = $moment;
        self.$routeParams = $routeParams;
        self.growl = growl;
        self.smartClient = smartClient;
        self.initialize();
    };

    WorkersController.prototype.update = function () {
        if (!this.$scope.$$phase) {
            this.$scope.$apply();
        }
    };

    WorkersController.prototype.initialize = function () {
        var self = this;
        // initialization of methods
        self.$scope.dataModel = {
            workers: {}
        };

        self.$scope.mainNavigator.items = self.getNavigatorStructure();
        self.$scope.mainNavigator.separator = true;
        self.intervalID = 0;
        self.$scope.$on('$destroy', function () {
            window.clearInterval(self.intervalID);
            self.intervalID = 0;
        });
        if (self.smartClient) {
            // if smartClient exists
            // self.initWithSmartClient();
            self.initWithSmartClient();
        } else {
            console.warn('Data is not linked to the WebGME database.');
            self.initTestData();
        }
    };

    WorkersController.prototype.initTestData = function () {
        var self = this,
            rawResponse;
        rawResponse = '{"pmeijer-PC_5336":{"clientId":"pmeijer-PC_5336","lastSeen":1408737168.284,"labels":' +
            '["Dymola","META_14.09"],"jobs":[{"hash":"796df3352f5df33656e76ad48d0faa72c15c2949","resultHashes":[]' +
            ',"resultSuperSet":null,"userId":[],"status":"RUNNING","createTime":"2014-08-22T19:52:45.329Z","start' +
            'Time":null,"finishTime":null,"worker":"pmeijer-PC_5336","labels":["META_14.09"]}]},"patrik-PC_1132":' +
            '{"clientId":"patrik-PC_1132","lastSeen":1408737167.951,"labels":[],"jobs":[]}}';
        self.$scope.dataModel.workersInfo = JSON.parse(rawResponse);
        self.update();
    };

    WorkersController.prototype.initWithSmartClient = function () {
        var self = this;
        if (self.intervalID === 0) {
            self.intervalID = window.setInterval(function () {
                self.smartClient.executorClient.getWorkersInfo(function (err, response) {
                    console.log('I am alive :P');
                    if (err) {
                        self.growl.error('Problems getting workers info!');
                        self.console.error(err);
                    } else {
                        self.$scope.dataModel.workers = response;
                        self.update();
                    }
                });
            }, 1000);
        }
    };

    WorkersController.prototype.getNavigatorStructure = function () {
        var self = this,
            firstMenu,
            secondMenu;

        firstMenu = {
            id: 'root',
            label: 'ADMEditor',
            itemClass: 'cyphy-root',
            action: function () {
                window.location.href = '#/workspace';
            },
            actionData: {},
            menu: []
        };

        secondMenu = {
            id: 'workers',
            label: 'Workers',
            itemClass: 'workers',
            menu: []
        };

        return [ firstMenu, secondMenu];
    };

    return WorkersController;
});

