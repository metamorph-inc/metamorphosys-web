/*globals angular*/

'use strict';

var SimpleRouter = function () {

    this.makeSegments = function ( points ) {

        var i,
            point1, point2,
            segment;

        if ( angular.isArray( points ) && points.length >= 2 ) {

            for ( i = 0; i < points.length - 1; i++ ) {

                point1 = points[ i ];
                point2 = points[ i + 1 ];

                segment = {

                    router: {
                        type: 'SimpleRouter'
                    },

                    type: 'line',

                    x1: point1.x,
                    y1: point1.y,

                    x2: point2.x,
                    y2: point2.y

                };

                if ( point1.x === point2.x ) {
                    segment.orientation = 'vertical';
                } else if ( point1.y === point2.y ) {
                    segment.orientation = 'horizontal';
                }

            }

        }

        return [ segment ];

    };

};

module.exports = SimpleRouter;