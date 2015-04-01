'use strict';

module.exports = function(value, elems, compare) {

    var i,
        notPlaced = true;

    if (elems.length === 0) {

        elems.push(value);

    } else {

        for (i = 0; i < elems.length && notPlaced; i++) {

            if (compare(value, elems[i]) < 0) {
                elems.splice(i, 0, value);
                notPlaced = false;
            }

        }

        if (notPlaced) {
            elems.push(value);
            return elems.length;
        }
        return i;

    }

};
