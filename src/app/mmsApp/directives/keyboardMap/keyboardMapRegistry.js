'use strict';

module.exports = {

    categories: [

        {
            title: 'Diagram manipulation',
            actions: [

                {
                    name: 'Draw-selection',
                    key: 'Shift + click'
                },

                {
                    name: 'Undo',
                    key: 'Cmd/Ctrl + Z'
                }

            ]
        }, {
            title: 'Component Operations',
            subTitle: 'When component(s) selected',
            actions: [

                {
                    name: 'Rotate CW',
                    key: 'R'
                },

                {
                    name: 'Rotate CCW',
                    key: 'Shift-R'
                },

                {
                    name: 'Destroy',
                    key: 'Del/Backspace'
                },

                {
                    name: 'Move',
                    key: 'Arrow keys'
                },

                {
                    name: 'Look inside',
                    key: 'Enter'
                }

            ]
        }, {
            title: 'Wire Operations',
            subTitle: 'When wire(s) selected',
            actions: [

                {
                    name: 'Destroy',
                    key: 'Del/Backspace'
                }

            ]
        }, {
            title: 'Wire Operations',
            subTitle: 'When drawing a wire',
            actions: [

                {
                    name: 'Cancel',
                    key: 'Esc'
                }

            ]
        },

        {
            title: 'Component Browser',
            actions: [{
                name: 'Start search',
                key: '/'
            }]
        }

    ]
};