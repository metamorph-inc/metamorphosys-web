/**
 * Created by robertboyles on 4/15/15.
 */

'use strict';

/**
 *
 * @param x
 * @param y
 * @param port  - True if point represents a component port
 * @param direction - N/S/W/E direction of port
 * @param portLocation  - Ports are either on or inside a component bounding box. The  "Point"
 *                        coordinate is the location of the port projected onto the bounding box edge.
 *                        portLocation stores the actual <X,Y> location.
 */
var Point = function ( x, y, port, direction, portLocation ) {

    this.x = x;
    this.y = y;

    if ( port !== undefined ) {
        this.isPort = port;
    }

    if ( direction !== undefined ) {
        this.direction = direction;
    }

    if ( portLocation !== undefined ) {
        this.portLocation = portLocation;
    }

};

Point.prototype.myIndexOfPoint = function ( arr ) {

    for (var i = 0; i < arr.length; i++) {

        if (arr[i].x === this.x && arr[i].y === this.y) {
            return i;
        }

    }

    return -1;
};

Point.prototype.comparePointsByXorY = function ( comparePt, order ) {
    if ( order === 1 ) {
        // Sort by X then Y
        if ( this.x > comparePt.x ) {
            return 1;
        }
        if ( this.x < comparePt.x ) {
            return -1;
        }
        if ( this.y > comparePt.y ) {
            return 1;
        }
        if ( this.y < comparePt.y ) {
            return -1;
        }
    }
    else {
        // Sort by Y then X
        if ( this.y > comparePt.y ) {
            return 1;
        }
        if ( this.y < comparePt.y ) {
            return -1;
        }
        if ( this.x > comparePt.x ) {
            return 1;
        }
        if ( this.x < comparePt.x ) {
            return -1;
        }
    }
    return 0; // Same point
};


module.exports = Point;
