/*globals console, angular, Chance*/

var demoApp = angular.module('cyphy.ui.ComponentList.demo', [
    'cyphy.components',
    'cyphy.components.templates'
]);

// overwrite ComponentService with dummy data
demoApp.service('ComponentService', function () {
    'use strict';

    var self = this,
        components = [];

    this.watchComponents = function (parentContext, workspaceId, updateListener) {
        var generateComponent,
            numComps = self.chance.integer({min: 1, max: 5}),
            i;

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

        updateListener(null, components);

    };

});