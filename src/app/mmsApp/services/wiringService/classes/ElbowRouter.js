/*globals angular*/

'use strict';

var ElbowRouter = function() {

  var self = this;

  this.name = 'ElbowRouter';

  this.makeSegments = function(points, method) {

    var i,
    point1, elbow, point2,
    segments;

    method = method || 'verticalFirst';

    if (angular.isArray(points) && points.length >= 2) {

      segments = [];

      for (i=0; i<points.length-1; i++) {

        point1 = points[i];
        point2 = points[i+1];

        if (method === 'verticalFirst') {

          elbow = {
            x: point1.x,
            y: point2.y
          };

        } else {

          elbow = {
            x: point1.y,
            y: point2.x
          };

        }

        segments.push({

          type: 'line',

          x1: point1.x,
          y1: point1.y,

          x2: elbow.x,
          y2: elbow.y,

          router: self.name,
          orientation: (method === 'verticalFirst') ? 'vertical' : 'horizontal'

        },{

          type: 'line',

          x1: elbow.x,
          y1: elbow.y,

          x2: point2.x,
          y2: point2.y,

          router: self.name,
          orientation: (method === 'verticalFirst') ? 'horizontal' : 'vertical'

        });

      }

    }

    return segments;

  };

};

module.exports = ElbowRouter;