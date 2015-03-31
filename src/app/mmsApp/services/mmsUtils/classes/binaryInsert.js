'use strict';
/**
*
* 
* Exampe comperison function to pass:
* 
*   function compare(a, b) {
* 
*      return a.x - b.x;
* 
*   }
* 
*/

var binaryInsert = function(value, elems, comparator, startIndex, endIndex) {

    var median,
        diff,
        currentLength;


    if (elems.length === 0) {
        elems.push(value);
    } else {

        startIndex = startIndex == null ? 0 : startIndex;
        endIndex = endIndex == null ? elems.length - 1 : endIndex;

        currentLength = endIndex - startIndex;

        if (comparator(value, elems[startIndex]) <= 0) {

            elems.splice(startIndex, 0, value);

        } else if (comparator(value, elems[endIndex]) >= 0) {

            elems.splice(endIndex + 1, 0, value);

        } else {

            if (currentLength <= 2) {

                elems.splice(endIndex, 0, value);

            } else {

                median = Math.floor((startIndex + endIndex) / 2);

                diff = comparator(value, elems[median]);

                if (diff < 0) {

                    binaryInsert(value, elems, comparator, startIndex, median - 1);

                } else if (diff > 0) {

                    binaryInsert(value, elems, comparator, median + 1, endIndex);

                } else {

                    elems.splice(median, 0, value);

                }

            }
        }
    }

};

module.exports = binaryInsert;