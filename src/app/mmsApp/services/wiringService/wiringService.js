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

            return {

                'elbowVertical': {
                    label: 'Elbow - vertical first',
                    type: 'ElbowRouter',
                    params: 'verticalFirst'
                },

                'elbowHorizontal': {
                    label: 'Elbow - horizontal first',
                    type: 'ElbowRouter',
                    params: 'horizontalFirst'
                },

                'simpleRouter': {
                    label: 'Straight wire',
                    type: 'SimpleRouter'
                }


            };

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

        this.routeWire = function (wire, routerType, params) {

            var router,
                simpleRouter,
                endPositions,
                s,
                segments;


            simpleRouter = routers.SimpleRouter;

            router = routers[routerType] || simpleRouter;

            if (angular.isObject(router) && angular.isFunction(router.makeSegments)) {

                endPositions = wire.getEndPositions();

                if (endPositions) {

                    segments = [];

                    if (endPositions.end1.leadInPosition) {

                        s = simpleRouter.makeSegments([
                            endPositions.end1,
                            endPositions.end1.leadInPosition
                        ]);

                        s.isLeadin = true;

                        segments = segments.concat(s);

                    }

                    s = router.makeSegments([
                        endPositions.end1.leadInPosition || endPositions.end1,
                        endPositions.end2.leadInPosition || endPositions.end2
                    ], params);

                    segments = segments.concat(s);

                    if (endPositions.end2.leadInPosition) {

                        s = simpleRouter.makeSegments([
                            endPositions.end2.leadInPosition,
                            endPositions.end2
                        ]);

                        s.isLeadin = true;

                        segments = segments.concat(s);

                    }

                    //console.log(segments);

                    wire.segments = segments;

                }

            }

        };

        this.adjustWireEndSegments = function (wire) {

            var firstSegment,
                secondSegment,
                secondToLastSegment,
                lastSegment,
                endPositions,
                newSegments,
                pos;

            endPositions = wire.getEndPositions();

            if (angular.isArray(wire.segments) && wire.segments.length > 1) {

                firstSegment = wire.segments[0];

                if (firstSegment.router && firstSegment.router.type === 'ElbowRouter') {

                    secondSegment = wire.segments[1];

                    pos = {
                        x: secondSegment.x2,
                        y: secondSegment.y2
                    };

                    wire.segments.splice(0, 2);

                } else {

                    // SimpleRouter

                    pos = {
                        x: firstSegment.x2,
                        y: firstSegment.y2
                    };

                    wire.segments.splice(0, 1);
                }

                newSegments = self.getSegmentsBetweenPositions({
                    end1: endPositions.end1,
                    end2: pos
                }, firstSegment.router.type, firstSegment.router.params);

                wire.segments = newSegments.concat(wire.segments);

                lastSegment = wire.segments[wire.segments.length - 1];

                if (lastSegment.router && lastSegment.router.type === 'ElbowRouter') {

                    secondToLastSegment = wire.segments[wire.segments.length - 2];

                    pos = {
                        x: secondToLastSegment.x1,
                        y: secondToLastSegment.y1
                    };

                    wire.segments.splice(wire.segments.length - 2, 2);

                } else {

                    pos = {
                        x: lastSegment.x1,
                        y: lastSegment.y1
                    };

                    wire.segments.splice(wire.segments.length - 1, 1);
                }

                newSegments = self.getSegmentsBetweenPositions({
                    end1: pos,
                    end2: endPositions.end2
                }, lastSegment.router.type, lastSegment.router.params);

                wire.segments = wire.segments.concat(newSegments);

            } else {

                //Simple-routing

                self.routeWire(wire);
            }

        };

    }
]);
