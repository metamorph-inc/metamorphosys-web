/*globals angular*/

'use strict';

var glMatrix = require('glMatrix');

var ComponentPort = function (descriptor) {

    angular.extend(this, descriptor);

};

ComponentPort.prototype.getGridPosition = function (getLeadInPosition) {

    var position,
        positionVector,

        wireAngle,
        leadInTransformation,
        leadInVector;

    if (angular.isObject(this.portSymbol) && angular.isObject(this.parentComponent)) {

        positionVector = glMatrix.vec2.create();
        glMatrix.vec2.set(positionVector, this.portSymbol.x, this.portSymbol.y);

        glMatrix.vec2.transformMat3(positionVector, positionVector, this.parentComponent.getTransformationMatrix());

        position = {

            x: positionVector[0],
            y: positionVector[1]

        };

        if (this.portSymbol.wireLeadIn) {

            leadInVector = glMatrix.vec2.create();
            glMatrix.vec2.set(leadInVector, this.portSymbol.wireLeadIn, 0);

            leadInTransformation = glMatrix.mat2.create();

            if (isNaN(this.portSymbol.wireAngleRad)) {

                this.portSymbol.wireAngle = this.portSymbol.wireAngle || 0;
                this.portSymbol.wireAngleRad = this.portSymbol.wireAngle / 180 * Math.PI;

            }

            wireAngle = Math.PI * this.getGridWireAngle() / 180;


            glMatrix.mat2.rotate(leadInTransformation, leadInTransformation, wireAngle);

            glMatrix.vec2.transformMat2(leadInVector, leadInVector, leadInTransformation);

            glMatrix.vec2.add(leadInVector, leadInVector, positionVector);

            position.leadInPosition = {

                x: leadInVector[0],
                y: leadInVector[1]

            };
        }

    }
    if ( getLeadInPosition ) {
        return position.leadInPosition;
    }
    else {
        return position;
    }

};


ComponentPort.prototype.getGridWireAngle = function() {

    var result = 0;

    if (angular.isObject(this.portSymbol) && angular.isObject(this.parentComponent)) {

        this.portSymbol.wireAngle = this.portSymbol.wireAngle || 0;

        result = ( this.portSymbol.wireAngle + this.parentComponent.rotation ) % 360;
    }

    return result;

};

module.exports = ComponentPort;
