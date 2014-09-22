/*globals console, angular, Chance*/

'use strict';

var demoApp = angular.module('cyphy.ui.WorkspaceList.demo', [
    'cyphy.components',
    'cyphy.components.templates'
]);

// overwrite WorkspaceService with dummy data
demoApp.service('WorkspaceService', function () {
    var self = this,
        workspaces = [],
        itemGenerator;

    itemGenerator = function (id) {
        return {
            id: id,
            title: self.chance.name(),
            toolTip: 'Open item',
            description: self.chance.sentence(),
            lastUpdated: {
                time: self.chance.date({year: (new Date()).getFullYear()}),
                user: self.chance.name()
            },
            stats: [
                {
                    value: self.chance.integer({min: 0, max: 5000}),
                    toolTip: 'Components',
                    iconClass: 'fa fa-puzzle-piece'
                },
                {
                    value: self.chance.integer({min: 0, max: 50}),
                    toolTip: 'Design Spaces',
                    iconClass: 'fa fa-cubes'
                },
                {
                    value: self.chance.integer({min: 0, max: 500}),
                    toolTip: 'Test benches',
                    iconClass: 'glyphicon glyphicon-saved'
                },
                {
                    value: self.chance.integer({min: 0, max: 20}),
                    toolTip: 'Requirements',
                    iconClass: 'fa fa-bar-chart-o'
                }
            ]
            //details    : 'Some detailed text. Lorem ipsum ama fea rin the poc ketofmyja cket.'
        };
    };

    this.getWorkspaces = function () {
        var numItems,
            i;

        console.log('Getting workspaces ...');

        self.chance = new Chance();
        numItems = self.chance.integer({min: 2, max: 15});

        for (i = 0; i < numItems; i += 1) {
            workspaces.push(itemGenerator(i));
        }

        console.log('Got workspaces ', workspaces.length);

        return workspaces;
    };

    this.createWorkspace = function (data, otherWorkspaceId) {
        var key,
            newWorkspace = itemGenerator();

        // TODO: if other workspace is defined then copy it and update with data
        for (key in data) {
            if (data.hasOwnProperty(key)) {
                newWorkspace[key] = data[key];
            }
        }

        workspaces.push(newWorkspace);
    };

    this.deleteWorkspace = function (id) {
        var index = workspaces.map(function (e) {
            return e.id;
        }).indexOf(id);
        if (index > -1) {
            workspaces.splice(index, 1);
        }
    };


    this.getComponents = function (workspaceId) {
        var generateComponent,
            numComps = self.chance.integer({min: 1, max: 5}),
            i,
            components = [];

        generateComponent = function (id) {
            return {
                id: id,
                title: self.chance.name(),
                toolTip: 'Open item',
                description: self.chance.sentence(),
                lastUpdated: {
                    time: self.chance.date({year: (new Date()).getFullYear()}),
                    user: self.chance.name()
                },
                stats: [
                    {
                        value: 'Modelica ' + self.chance.integer({min: 0, max: 5}),
                        toolTip: 'Modelica'
                        //iconClass: 'fa fa-puzzle-piece'
                    },
                    {
                        value: 'CAD ' + self.chance.integer({min: 0, max: 3}),
                        toolTip: 'CAD'
//                    iconClass: 'fa fa-cubes'
                    },
                    {
                        value: 'Manufacturing ' + self.chance.integer({min: 0, max: 1}),
                        toolTip: 'Manufacturing'
//                    iconClass: 'glyphicon glyphicon-saved'
                    }
                ]
                //details    : 'Some detailed text. Lorem ipsum ama fea rin the poc ketofmyja cket.'
            };
        };

        for (i = 0; i < numComps; i += 1) {
            components.push(generateComponent(i));
        }

        return components;
    };

    this.getDesigns = function (workspaceId) {
        throw new Error('Not implemented yet.');
    };

    this.getTestBenches = function (workspaceId) {
        throw new Error('Not implemented yet.');
    };
});