/**
 * Created by robertboyles on 4/14/15.
 */

'use strict';

var OrthogonalGridNode = function ( x, y, north, south, west, east ) {

    this.x = x;
    this.y = y;

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

OrthogonalGridNode.compareY = function ( nodeA, nodeB ) {

    return nodeA.compareYTo(nodeB);

};

OrthogonalGridNode.prototype.compareYTo = function ( otherNode ) {

    return this.y - otherNode.y;

};

OrthogonalGridNode.compareX = function ( nodeA, nodeB ) {

    return nodeA.compareXTo(nodeB);

};

OrthogonalGridNode.prototype.compareXTo = function ( otherNode ) {

    return this.x - otherNode.x;

};

OrthogonalGridNode.compareScore = function ( nodeA, nodeB ) {

    return nodeA.compareScoreTo(nodeB);

};

OrthogonalGridNode.prototype.compareScoreTo = function ( otherNode ) {

    return this.score - otherNode.score;

};

OrthogonalGridNode.prototype.manhattanDistance = function ( otherNode ) {

    return Math.abs(this.x - otherNode.x) + Math.abs(this.y - otherNode.y);

};


/**
 * Return neighbors in a sorted order, with preference to neighbor in same direction,
 *   followed by the right neighbor, left neighbor, and reverse neighbor.
 *
 *   Since order of neighbors is based on [N, S, W, E] index, need to return index map so that
 *   when currentNode is updated, the direction can be updated correctly, rather than relying
 *   on the index of the for loop.
 *
 * @returns {{neighbors: *[], map: number[]}}
 */
OrthogonalGridNode.prototype.getNeighbors = function () {

    if ( this.dir === 0 ) {
        // Going North
        return { "neighbors": [this.north, this.east, this.west, this.south], "map": [0, 3, 2, 1] };
    }

    if ( this.dir === 1 ) {
        // Going South
        return { "neighbors": [this.south, this.west, this.east, this.north], "map": [1, 2, 3, 0] };
    }

    if ( this.dir === 2 ) {
        // Going West
        return { "neighbors": [this.west, this.north, this.south, this.east], "map": [2, 0, 1, 3] };
    }

    if ( this.dir === 3 ) {
        // Going East
        return { "neighbors": [this.east, this.south, this.north, this.west], "map": [3, 1, 0, 2] };
    }

};

OrthogonalGridNode.prototype.areAllNeighborsDefined = function () {

    return this.hasOwnProperty('north') && this.hasOwnProperty('south') &&
            this.hasOwnProperty('west') && this.hasOwnProperty('east');

};


/**
 * For a given node location, determine how far you can move in "direction" before you
 * come across another object (component wall or boundary edge).
 * @param direction - north, south, east, west.
 * @returns {*} - Coordinate of object in either X or Y (depending on direction).
 */
OrthogonalGridNode.prototype.findClosestObject = function( direction ) {

    var node = this,
        sameNode = false;

    // TODO: Should invalid neighbors take same object as current node? Have function to check, no need to check type
    while ( typeof node[direction] === "object" ) {
        if ( node.compareXTo(node[direction]) === 0 && node.compareYTo(node[direction]) === 0 ) {
            sameNode = true;
            break;
        }
        node = node[direction];
    }

    if ( (sameNode || typeof node[direction] === "undefined") && (direction === "west" || direction === "east")) {
        return node.x;
    }
    if ( (sameNode || typeof node[direction] === "undefined") && (direction === "north" || direction === "south")) {
        return node.y;
    }
    else {
        return node[direction];  // Node neighbor in this direction is a number, aka wall.
    }

    // If to do above was done..
    //var dirNode = node[direction];
    //
    //if ( node.compareXTo(dirNode) === 0 && node.compareYTo(dirNode) === 0 ) {
    //    // Same node
    //    return dirNode;
    //}
    //else {
    //    return dirNode.findClosestNeighbor( direction );
    //}

};






module.exports = OrthogonalGridNode;

