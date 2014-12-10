/*globals angular, console*/

var TIMEOUT = 0;
// uncomment this and the meta nodes won't be loaded:
//TIMEOUT = 1000;

var fatal = function (err) {
    console.log(err);
};

var CyPhyApp = angular.module('CyPhyApp', [
    'ui.router',

    'gme.services',

    'isis.ui.components',

    'cyphy.components',

    // app specific templates
    'cyphy.sample.templates'
])
    .run(function () {

    });

// TODO: require all of your controllers
//require('./views/MyView/MyViewController');


angular.module('CyPhyApp')
    .controller('MyViewController', function ($scope, $timeout, $http, growl, dataStoreService, projectService, nodeService, branchService) {
        'use strict';

        $scope.logs = ['init'];

        var log = function (message) {
            $scope.logs.push(message);
        };

        var databaseId = 'my-db-connection-id';

        var meta;
        var context;
        //$http.get('/rest/external/copyproject/noredirect')
        //    .then(function(data) {
        //        //return data.data;
        //        return "NkLabsPrototype";
        //    }).then(
        (function(projectName) {
                return dataStoreService.connectToDatabase(databaseId, {host: window.location.basename})
                    .then(function () {
                        // select default project and branch (master)
                        log('db open');
                        return projectService.selectProject(databaseId, projectName);
                    })
                    .catch(function (reason) {
                        log('ADMEditor does not exist. Create and import it using the <a href="' +
                        window.location.origin + '"> webgme interface</a>.');
                        fatal(reason);
                    });
            })("NkLabsPrototype").then(function (project) {
                context = {
                    db: databaseId,
                    projectId: project,
                    branchId: 'master',
                    regionId: (new Date()).toISOString() + 'x'
                };
                return $timeout(function () {
                    return project;
                }, TIMEOUT);
            }).then(function () {
                return branchService.createBranch(databaseId, "branch" + (Math.random() * 10000 | 0), '#22e1068eaacd75a6ab4f2588bf7b9f530d8b9c13');
            }).then(function (branchId) {
                return $timeout(function () {
                    return branchId;
                }, TIMEOUT);
            }).then(function (branchId) {
                return branchService.selectBranch(databaseId, branchId);
            }).then(function(project) {
                return nodeService.getMetaNodes(context);
            }).then(function (metaNodes) {
            meta = metaNodes;
            log('meta loaded');
            return nodeService.loadNode(context, '');
        }).then(function (root) {
            return root.loadChildren();
        }).then(function (children) {
            log('children: ' + children.length);
            return children.filter(function (child) { return child.getAttribute('name') === 'WorkSpace'; })[0].loadChildren();
        }).then(function (children) {
            log('children: ' + children.length);
            return children.filter(function (child) { return child.getAttribute('name') === 'ACMFolder'; })[0].loadChildren();
        }).then(function (children) {
            log('children: ' + children.length);
            return children.filter(function (child) { return child.getAttribute('name') === 'ATTiny-24'; })[0].loadChildren();
        }).then(function (children) {
            log('children: ' + children.length);
            var c = children.filter(function (child) { return child.getAttribute('name') === 'C'; })[0];
            c.setAttribute('Value', 0.12345);
        }).then(function (children) {
            log('PHANTOM DONE');
        }).catch(fatal);
    });
