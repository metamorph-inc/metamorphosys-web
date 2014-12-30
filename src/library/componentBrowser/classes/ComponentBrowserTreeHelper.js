'use strict';

module.exports = function($log) {

    var config,
        data,

        getNodeContextmenu;


    data = {};

    getNodeContextmenu = function ( node ) {

        var defaultNodeContextmenu = [
            {
                items: [
                    {
                        id: 'create',
                        label: 'Create new',
                        disabled: true,
                        iconClass: 'fa fa-plus',
                        menu: []
                    },
                    {
                        id: 'dummy',
                        label: 'Just for test ' + node.id,

                        actionData: node,

                        action: function ( data ) {
                            $log.log( 'testing ', data );
                        }

                    },
                    {
                        id: 'rename',
                        label: 'Rename'
                    },
                    {
                        id: 'preferences 3',
                        label: 'Preferences 3',
                        menu: [
                            {
                                items: [
                                    {
                                        id: 'sub_preferences 1',
                                        label: 'Sub preferences 1'
                                    },
                                    {
                                        id: 'sub_preferences 2',
                                        label: 'Sub preferences 2',
                                        action: function ( data ) {
                                            $log.log( 'testing2 ', data );
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

        return defaultNodeContextmenu;

    };



    config = {

        scopeMenu: [
            {
                items: [
                    {
                        id: 'project',
                        label: 'Project Hierarchy',
                        action: function () {
                            config.state.activeScope = 'project';
                            config.selectedScope = config.scopeMenu[ 0 ].items[ 0 ];
                        }
                    },
                    {
                        id: 'composition',
                        label: 'Composition',
                        action: function () {
                            config.state.activeScope = 'composition';
                            config.selectedScope = config.scopeMenu[ 0 ].items[ 1 ];
                        }
                    }
                ]
            }

        ],

        preferencesMenu: [
            {
                items: [
                    {
                        id: 'preferences 1',
                        label: 'Preferences 1'
                    },

                    {
                        id: 'preferences 2',
                        label: 'Preferences 2'
                    },

                    {
                        id: 'preferences 3',
                        label: 'Preferences 3',
                        menu: [
                            {
                                items: [
                                    {
                                        id: 'sub_preferences 1',
                                        label: 'Sub preferences 1'
                                    },
                                    {
                                        id: 'sub_preferences 2',
                                        label: 'Sub preferences 2',
                                        action: function ( data ) {
                                            $log.log( data );
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],

        showRootLabel: true,

        // Tree Event callbacks

        nodeClick: function ( e, node ) {
            console.log( 'Node was clicked:', node );
        },

        nodeDblclick: function ( e, node ) {
            console.log( 'Node was double-clicked:', node );
        },

        nodeContextmenuRenderer: function ( e, node ) {
            console.log( 'Contextmenu was triggered for node:', node );

            return getNodeContextmenu( node );

        },

        nodeExpanderClick: function ( e, node, isExpand ) {
            console.log( 'Expander was clicked for node:', node, isExpand );
        }

    };

    this.config = config;
    this.data = data;

};
