/*globals angular*/

'use strict';

var glMatrix = require('glMatrix');

var ComponentPort = function (descriptor) {

  angular.extend(this, descriptor);

};

ComponentPort.prototype.getGridPosition = function() {

  var position,
    positionVector;

  if (angular.isObject(this.portSymbol) && angular.isObject(this.parentComponent)) {

    positionVector = glMatrix.vec2.create();
    glMatrix.vec2.set(positionVector, this.portSymbol.x, this.portSymbol.y);

    glMatrix.vec2.transformMat3(positionVector, positionVector, this.parentComponent.getTransformationMatrix());

    position = {

      x: positionVector[0],
      y: positionVector[1]

    };

  }

  return position;

};

module.exports = ComponentPort;