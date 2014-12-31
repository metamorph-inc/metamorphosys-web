/*globals angular*/

var demoApp = angular.module( 'cyphy.ui.DesignTree.demo', [
    'cyphy.components',
    'cyphy.components.templates'
] );

demoApp.service( 'designService', function () {
    'use strict';

    this.watchDesignStructure = function ( parentContext, designId, updateListener ) {
        var treeStructure;

        treeStructure = {
            id: '/1',
            label: 'Design space name',
            extraInfo: '',
            unCollapsible: true,
            children: [ {
                id: '/1/1',
                label: 'Container 1',
                extraInfo: 'Compound',

                children: [ {
                    id: '/1/1/1',
                    label: 'Sub Container 1',
                    extraInfo: 'Compound'
                }, {
                    id: '/1/1/2',
                    label: 'Sub Container 2',
                    extraInfo: 'Compound'
                }, {
                    id: '/1/1/3',
                    label: 'Sub Container 3',
                    extraInfo: 'Compound'
                } ],
                childrenCount: 3
            }, {
                id: '/1/2',
                label: 'Container 2',
                extraInfo: 'Alternative'
            }, {
                id: '/1/3',
                label: 'Container 3',
                extraInfo: 'Optional'
            } ],
            childrenCount: 3
        };

        updateListener( null, treeStructure );
    };

} );