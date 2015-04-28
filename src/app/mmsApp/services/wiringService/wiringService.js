/*globals angular*/

'use strict';

var wiringServicesModule = angular.module(
    'mms.designVisualization.wiringService', []);

wiringServicesModule.service('wiringService', ['$log', '$rootScope', '$timeout',
    function () {

        var self = this,
            SimpleRouter = require('./classes/SimpleRouter.js'),
            ElbowRouter = require('./classes/ElbowRouter.js'),
            OrthogonalRouter = require('./classes/OrthogonalRouter.js'),            
            routers = {

                SimpleRouter: new SimpleRouter(),
                ElbowRouter: new ElbowRouter(),
                OrthogonalRouter: new OrthogonalRouter()                

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

        this.routeDiagram = function(diagram, routerType, params) {

            var router = routers[routerType];

            if (router && angular.isFunction(router.routeDiagram)) {
                router.routeDiagram(diagram, params);
            }

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

                    wire.makeSegmentsFromParameters(s1.concat(s2).concat(s3));

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
                newSegmentParameters,
                segmentParams,
                router,
                pos;

            if (Array.isArray(segments) && segments.length > 1) {
                
                // If this wire has more than one segments

                // Creating new begining for wire

                firstSegment = segments[0];
                segmentParams = firstSegment.getParameters();
                router = segmentParams.router;                

                if (router && router.type === 'ElbowRouter') {

                    secondSegment = segments[1];
                    segmentParams = secondSegment.getParameters();

                    pos = {
                        x: segmentParams.x2,
                        y: segmentParams.y2
                    };

                } else {

                    // Use SimpleRouter

                    pos = {
                        x: segmentParams.x2,
                        y: segmentParams.y2
                    };

                }

                newSegmentParameters = self.getSegmentsBetweenPositions(
                    {
                        end1: endPositions.end1,
                        end2: pos
                    }, 
                    router.type, 
                    router.params
                );

                wire.replaceSegmentsFromPropertiesArray(0, newSegmentParameters);


                // Creating new end for wire

                lastSegment = segments[segments.length - 1];
                segmentParams = lastSegment.getParameters();
                router = segmentParams.router;

                if (router && router.type === 'ElbowRouter') {

                    secondToLastSegment = segments[segments.length - 2];
                    segmentParams = secondToLastSegment.getParameters();

                    pos = {
                        x: segmentParams.x1,
                        y: segmentParams.y1
                    };

                } else {

                    // Use SimpleRouter                    

                    pos = {
                        x: segmentParams.x1,
                        y: segmentParams.y1
                    };

                }

                newSegmentParameters = self.getSegmentsBetweenPositions(
                    {
                        end1: pos,
                        end2: endPositions.end2
                    }, 
                    router.type, 
                    router.params
                );

                wire.replaceSegmentsFromPropertiesArray(segments.length - newSegmentParameters.length, newSegmentParameters);

            } else {

                //Simple-routing

                self.routeWire(wire, null, null, true);
            }

        };

    }
]);
