/**
 * Created by robertboyles on 4/14/15.
 */

'use strict';

var OrthogonalGridNode = function ( position, north, south, west, east ) {

    this.v = {
        x: position.x,
        y: position.y
    };
    if ( north !== undefined ) {
        this.north = north;
    }
    if ( south !== undefined ) {
        this.south = south;
    }
    if ( east !== undefined ) {
        this.east = east;
    }
    if ( west !== undefined ) {
        this.west = west;
    }

};

OrthogonalGridNode.prototype.resetNode = function() {

    this.heuristic = 0;
    this.bends = 0;
    this.remBends = 0;
    this.score = 0;
    this.dir = 0;
    this.visited = false;
    this.closed = false;
    this.cost = null;
    this.parent = null;

};

OrthogonalGridNode.prototype.compareY = function ( otherNode ) {

    return this.v.y - otherNode.v.y;

};

OrthogonalGridNode.prototype.compareX = function ( otherNode ) {

    return this.v.x - otherNode.v.x;

};

OrthogonalGridNode.prototype.compareScore = function ( otherNode ) {

    return this.score - otherNode.score;

};

OrthogonalGridNode.prototype.manhattanDistance = function ( otherNode ) {

    return Math.abs(this.v.x - otherNode.v.x) + Math.abs(this.v.y - otherNode.v.y);

};

OrthogonalGridNode.prototype.getNeighbors = function ( node ) {

    // Return neighbors in a sorted order, with preference to neighbor in same direction,
    //  followed by the right neighbor, left neighbor, and reverse neighbor.

    // Since order of neighbors is based on [N, S, W, E] index, need to return index map so that
    // when currentNode is updated, the direction can be updated correctly, rather than relying
    // on the index of the for loop.

    if ( node.dir === 0 ) {
        // Going North
        return { "neighbors": [node.north, node.east, node.west, node.south], "map": [0, 3, 2, 1] };
    }

    if ( node.dir === 1 ) {
        // Going South
        return { "neighbors": [node.south, node.west, node.east, node.north], "map": [1, 2, 3, 0] };
    }

    if ( node.dir === 2 ) {
        // Going West
        return { "neighbors": [node.west, node.north, node.south, node.east], "map": [2, 0, 1, 3] };
    }

    if ( node.dir === 3 ) {
        // Going East
        return { "neighbors": [node.east, node.south, node.north, node.west], "map": [3, 1, 0, 2] };
    }

};

OrthogonalGridNode.prototype.areAllNeighborsDefined = function () {
    return this.hasOwnProperty('north') && this.hasOwnProperty('south') &&
            this.hasOwnProperty('west') && this.hasOwnProperty('east');
};

OrthogonalGridNode.prototype.findClosestObject = function( direction ) {

    var node = this;

    // TODO: Should invalid neighbors take same object as current node? Have function to check, no need to check type
    while ( typeof node[direction] === "object" ) {
        node = node[direction];
    }

    if ( typeof node[direction] === "undefined" && (direction === "west" || direction === "east")) {
        return node.x;
    }
    if ( typeof node[direction] === "undefined" && (direction === "north" || direction === "south")) {
        return node.y;
    }
    else {
        return node[direction];  // Node neighbor in this direction is a number, aka wall.
    }

    // If to do above was done..
    //var dirNode = node[direction];
    //
    //if ( node.compareX(this, dirNode) === 0 && node.compareY(this, dirNode) === 0 ) {
    //    // Same node
    //    return dirNode;
    //}
    //else {
    //    return dirNode.findClosestNeighbor( direction );
    //}

};

module.exports = OrthogonalGridNode;

