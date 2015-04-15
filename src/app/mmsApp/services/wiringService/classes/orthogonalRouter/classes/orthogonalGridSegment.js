/**
 * Created by robertboyles on 4/14/15.
 */

'use strict';

var Point = require("./Point.js");

var OrthogonalGridSegment = function(x1, y1, x2, y2, port) {

    // If one endpoint of segment is at a component port, store the port location in "port".

    if ( x1 !== null ) {
        this.x1 = x1;
    }
    if ( y1 !== null ) {
        this.y1 = y1;
    }
    if ( x2 !== null ) {
        this.x2 = x2;
    }
    if ( y2 !== null ) {
        this.y2 = y2;
    }
    if ( port !== undefined ) {
        this.port = port;
    }

};

OrthogonalGridSegment.prototype.getIndexUsingX = function( arr ) {

    for ( var i = 0; i < arr.length; i++ ) {
        if (arr[i].x1 === this.x1 && arr[i].x2 === this.x2) {
            return i;
        }
    }
    return -1;

};

OrthogonalGridSegment.prototype.getIndexUsingY = function( arr ) {

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].y1 === this.y1 && arr[i].y2 === this.y2) {
            return i;
        }
    }
    return -1;

};

OrthogonalGridSegment.prototype.inSetAndLessThanOrEqual = function ( arr, min, max ) {

    // Checks if segments with same starting point have same ending point. If segments do not have
    // matching starting points, return -1.
    for (var i = 0; i < arr.length; i++) {

        if (this[max] < arr[i][max] && this[min] === arr[i][min]) {
            return {"idx": i, "equal": false};
        }

        if (this[max] === arr[i][max] && this[min] === arr[i][min]) {
            return {"idx": i, "equal": true};
        }
    }

    return -1;

};

OrthogonalGridSegment.prototype.getSharedEndPoint = function ( seg2 ) {

    // If and endpoint is shared, return this point. Otherwise, return null.

    if ( this.isPointOnLine( {x: seg2.x1, y: seg2.y1} ) ) {
        return new Point( seg2.x1, seg2.y1 );
    }

    else if ( this.isPointOnLine( {x: seg2.x2, y: seg2.y2} ) ) {
        return new Point( seg2.x2, seg2.y2 );
    }

    else if ( seg2.isPointOnLine( {x: this.x1, y: this.y1} ) ) {
        return new Point( this.x1, this.y1 );
    }

    else if ( seg2.isPointOnLine( {x: this.x2, y: this.y2} ) ) {
        return new Point( this.x2, this.y2 );
    }

    else {
        return null;
    }

};

OrthogonalGridSegment.prototype.isPointOnLine = function ( pt ) {

    var slope = ( this.y2 - this.y1 ) / (this.x2 - this.x1 );

    if (slope === Number.POSITIVE_INFINITY) {

        if (pt.y < this.y1 || pt.y > this.y2) {
            // Out of range
            return false;
        }

        return (pt.x === this.x1);
    }
    else if (slope === 0) {

        if (pt.x < this.x1 || pt.x > this.x2) {
            // Out of range
            return false;
        }

        return (pt.y === this.y1);
    }

    return ((pt.y - this.y1) === (pt.x - this.x1));
};


module.exports = OrthogonalGridSegment;


