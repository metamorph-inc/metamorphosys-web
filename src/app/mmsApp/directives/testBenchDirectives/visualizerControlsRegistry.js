'use strict';

module.exports = {

    categories: [

        {
            title: 'Main Chart Controls',
            actions: [

                {
                    name: 'Pan',
                    key: 'Left mouse button click + drag'
                },

                {
                    name: 'Zoom In/Out',
                    key: 'Mousewheel'
                },

                {
                    name: 'Zoom Reset',
                    key: 'Left mouse button double-click'
                }

            ]
        }, {
            title: 'Navigator Chart Controls',
            actions: [

                {
                    name: 'Create/Resize/Move Zoom Window',
                    key: 'Left mouse button click + drag'
                },

                {
                    name: 'Clear Zoom Window',
                    key: 'Left mouse button click outside window'
                }

            ]
        }

    ]
};