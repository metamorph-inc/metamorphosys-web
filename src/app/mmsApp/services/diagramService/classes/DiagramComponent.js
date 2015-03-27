/*globals angular*/

'use strict';

var glMatrix = require('glMatrix');

var DiagramComponent = function(descriptor) {

    if (!angular.isObject(descriptor.symbol)) {
        throw new Error('No symbol found for component ' + this.id);
    }

    angular.extend(this, descriptor);

    // For rotation
    this._centerOffset = [this.symbol.width / 2, this.symbol.height / 2];

};

DiagramComponent.prototype.isInViewPort = function(viewPort, padding) {

    //TODO: count width and height for orientation
    padding = padding || {
        x: 0,
        y: 0
    };

    return (
        angular.isObject(viewPort) &&
        this.x + this.symbol.width >= (viewPort.left + padding.x) &&
        this.x <= (viewPort.right - padding.x) &&
        this.y + this.symbol.height >= (viewPort.top + padding.y) &&
        this.y <= (viewPort.bottom - padding.y));
};

DiagramComponent.prototype.getTransformationMatrix = function() {

    if (!angular.isArray(this.transformationMatrix)) {
        this.updateTransformationMatrix();
    }

    return this.transformationMatrix;

};

DiagramComponent.prototype.getGridPosition = function() {

    var transformationMatrix = this.getTransformationMatrix();

    return {
        x: transformationMatrix[6],
        y: transformationMatrix[7]
    };

};

DiagramComponent.prototype.getGridBoundingBox = function() {

    var normRotation,
        localTopLeftCornerPosition,
        boundingBox,

        symbolHeight = this.symbol.height,
        symbolWidth = this.symbol.width;

    normRotation = this.rotation % 360;

    localTopLeftCornerPosition = this.getGridPosition();

    //TODO: Make it generic if we enable arbitrary rotation

    switch (normRotation) {

        case 90:
        case -270:

            boundingBox = {
                x: localTopLeftCornerPosition.x - symbolHeight,
                y: localTopLeftCornerPosition.y,
                width: symbolHeight,
                height: symbolWidth
            };

            break;

        case 180:
        case -180:

            boundingBox = {
                x: localTopLeftCornerPosition.x - symbolWidth,
                y: localTopLeftCornerPosition.y - symbolHeight,
                width: symbolWidth,
                height: symbolHeight
            };

            break;

        case 270:
        case -90:

            boundingBox = {
                x: localTopLeftCornerPosition.x,
                y: localTopLeftCornerPosition.y - symbolWidth,
                width: symbolHeight,
                height: symbolWidth
            };

            break;

        default:
        case 0:

            boundingBox = {
                x: localTopLeftCornerPosition.x,
                y: localTopLeftCornerPosition.y,
                width: symbolWidth,
                height: symbolHeight
            };


    }

    return boundingBox;

};

DiagramComponent.prototype.getSVGTransformationMatrix = function() {

    if (!angular.isArray(this.svgTransformationMatrix)) {
        this.updateTransformationMatrix();
    }

    return this.svgTransformationMatrix;

};

DiagramComponent.prototype.getSVGTransformationString = function() {

    var transMatrix = this.getSVGTransformationMatrix();

    return transMatrix.join(', ');
};

DiagramComponent.prototype.updateTransformationMatrix = function() {

    var rotationRad,
        //sinA, cosA,
        translation,
        transformMat3,
        result;

    if (angular.isNumber(this.rotation) &&
        angular.isNumber(this.x) &&
        angular.isNumber(this.y)) {

        rotationRad = this.rotation / 180 * Math.PI;

        transformMat3 = glMatrix.mat3.create();

        translation = glMatrix.vec2.create();

        glMatrix.vec2.set(translation, this.x + this._centerOffset[0], this.y + this._centerOffset[1]);

        glMatrix.mat3.translate(
            transformMat3,
            transformMat3,
            translation
        );

        glMatrix.mat3.rotate(
            transformMat3,
            transformMat3,
            rotationRad
        );

        glMatrix.vec2.set(translation, -this._centerOffset[0], -this._centerOffset[1]);

        glMatrix.mat3.translate(
            transformMat3,
            transformMat3,
            translation
        );

        this.transformationMatrix = transformMat3;

        this.svgTransformationMatrix = [
            transformMat3[0],
            transformMat3[1],
            transformMat3[3],
            transformMat3[4],
            transformMat3[6],
            transformMat3[7]
        ];

        result = this.transformationMatrix;

    }

    return result;

};

DiagramComponent.prototype.getPosition = function() {

    return {
        x: this.x,
        y: this.y
    };

};


DiagramComponent.prototype.setPosition = function(x, y) {

    if (angular.isNumber(x) && angular.isNumber(y)) {

        this.x = x;
        this.y = y;

        this.updateTransformationMatrix();

    } else {
        throw new Error('Coordinates must be numbers!');
    }
};

DiagramComponent.prototype.rotate = function(angle) {

    if (angular.isNumber(angle)) {

        this.rotation += angle;

        this.updateTransformationMatrix();

    } else {
        throw new Error('Angle must be number!');
    }
};

DiagramComponent.prototype.setRotation = function(newRotation) {

    if (angular.isNumber(newRotation)) {

        this.updateTransformationMatrix();

    } else {
        throw new Error('Angle must be number!');
    }
};

DiagramComponent.prototype.registerPortInstances = function(newPorts) {

    var self = this;

    this.portInstances = this.portInstances || [];

    angular.forEach(newPorts, function(newPort) {

        newPort.parentComponent = self;
        self.portInstances.push(newPort);

    });
};

DiagramComponent.prototype.getTransformedDimensions = function() {
    //  var width, height;
};

DiagramComponent.prototype.localToGlobal = function() {

    if (!this.transformationMatrix) {
        this.transformationMatrix = this.getTransformationMatrix();
    }



};

module.exports = DiagramComponent;
