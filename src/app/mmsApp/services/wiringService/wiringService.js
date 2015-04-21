/*globals angular*/

'use strict';

var wiringServicesModule = angular.module(
    'mms.designVisualization.wiringService', []);

wiringServicesModule.service('wiringService', ['$log', '$rootScope', '$timeout',
    function () {

        var self = this,
            SimpleRouter = require('./classes/SimpleRouter.js'),
            ElbowRouter = require('./classes/ElbowRouter.js'),
            routers = {

                SimpleRouter: new SimpleRouter(),
                ElbowRouter: new ElbowRouter()

            };

        this.getRouterTypes = function () {

            return [

                {
                    id: 'elbowHorizontal',
                    label: 'Elbow - horizontal first',
                    type: 'ElbowRouter',
                    params: 'horizontalFirst'
                },

                {
                    id: 'elbowVertical',
                    label: 'Elbow - vertical first',
                    type: 'ElbowRouter',
                    params: 'verticalFirst'
                },

                {
                    id: 'simpleRouter',
                    label: 'Straight wire',
                    type: 'SimpleRouter'
                }


            ];

        };

        this.getSegmentsBetweenPositions = function (endPositions, routerType, params) {

            var segments,
                router;

            router = routers[routerType] || 'SimpleRouter';

            if (angular.isObject(router) && angular.isFunction(router.makeSegments)) {
                segments = router.makeSegments(
                    [endPositions.end1, endPositions.end2],
                    params
                );
            }

            return segments;

        };

        this.routeWire = function (wire, routerType, params, ignoreLeadIn) {

            var router,
                simpleRouter,
                elbowRouter,

                endPositions,
                p1,
                p2,
                s1, s2, s3;


            simpleRouter = routers.SimpleRouter;
            elbowRouter = routers.ElbowRouter;

            router = routers[routerType] || simpleRouter;

            if (angular.isObject(router) && angular.isFunction(router.makeSegments)) {

                endPositions = wire.getEndPositions();

                if (endPositions) {

                    s1 = [];
                    s2 = [];
                    s3 = [];

                    if (endPositions.end1.leadInPosition && !ignoreLeadIn) {

                        s1 = elbowRouter.makeSegments([
                            endPositions.end1,
                            endPositions.end1.leadInPosition
                        ]);

                        p1 = endPositions.end1.leadInPosition;

                    } else {
                        p1 = endPositions.end1;
                    }


                    if (endPositions.end2.leadInPosition && !ignoreLeadIn) {

                        s3 = elbowRouter.makeSegments([
                            endPositions.end2.leadInPosition,
                            endPositions.end2
                        ]);

                        p2 = endPositions.end2.leadInPosition;

                    } else {
                        p2 = endPositions.end2;
                    }

                    s2 = router.makeSegments([
                        p1,
                        p2
                    ], params);


                    wire.setSegments(s1.concat(s2).concat(s3));

                }

            }

        };

        this.adjustWireEndSegments = function (wire) {

            var firstSegment,
                secondSegment,
                secondToLastSegment,
                lastSegment,
                endPositions = wire.getEndPositions(),
                segments = wire.getSegments(),
                newSegments,
                pos;

            if (Array.isArray(segments) && segments.length > 1) {

                firstSegment = segments[0];

                if (firstSegment.router && firstSegment.router.type === 'ElbowRouter') {

                    secondSegment = segments[1];

                    pos = {
                        x: secondSegment.x2,
                        y: secondSegment.y2
                    };

                    segments.splice(0, 2);

                } else {

                    // SimpleRouter

                    pos = {
                        x: firstSegment.x2,
                        y: firstSegment.y2
                    };

                    segments.splice(0, 1);
                }

                newSegments = self.getSegmentsBetweenPositions({
                    end1: endPositions.end1,
                    end2: pos
                }, firstSegment.router.type, firstSegment.router.params);

                wire.setSegments(newSegments.concat(segments));

                lastSegment = segments[segments.length - 1];

                if (lastSegment.router && lastSegment.router.type === 'ElbowRouter') {

                    secondToLastSegment = segments[segments.length - 2];

                    pos = {
                        x: secondToLastSegment.x1,
                        y: secondToLastSegment.y1
                    };

                    segments.splice(segments.length - 2, 2);

                } else {

                    pos = {
                        x: lastSegment.x1,
                        y: lastSegment.y1
                    };

                    segments.splice(segments.length - 1, 1);
                }

                newSegments = self.getSegmentsBetweenPositions({
                    end1: pos,
                    end2: endPositions.end2
                }, lastSegment.router.type, lastSegment.router.params);

                wire.setSegments(segments.concat(newSegments));

            } else {

                //Simple-routing

                self.routeWire(wire, null, null, true);
            }

        };

    }
]);
