'use strict';

module.exports = {

    categories: [

        {
            title: 'Diagram manipulation',
            actions: [

                {
                    name: 'Draw-selection',
                    key: 'Shift + click'
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
