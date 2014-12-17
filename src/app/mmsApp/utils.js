'use strict';

require('Array.prototype.find');

if (!Array.prototype.findById) {
  Array.prototype.findById = function(id) {
    return this.find(function(a) {
      return a.id !== undefined && a.id === id;
    });
  };
}

if (!Array.prototype.getRandomElement) {
  Array.prototype.getRandomElement = function() {
    return this[ Math.round(Math.random() * (this.length -1 ))];
  };
}

if (!Array.prototype.shuffle) {
  Array.prototype.shuffle = function() {
    var currentIndex = this.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = this[currentIndex];
      this[currentIndex] = this[randomIndex];
      this[randomIndex] = temporaryValue;
    }

    return this;
  };
}