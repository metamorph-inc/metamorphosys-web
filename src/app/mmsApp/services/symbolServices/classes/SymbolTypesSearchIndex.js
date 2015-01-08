/*globals angular*/
'use strict';

module.exports = function() {
    var keywordsBySymbols,
        symbolsByKeywords;

    keywordsBySymbols = {
        'capacitor': [
            'capacitors',
            'c'
        ],
        'resistors': [
            'resistors',
            'r'
        ],
        'diodes': [
            'diodes',
            'led'
        ],
        'inductors': [
            'inductors',
            'l'
        ],
        'transistors': [
            'jFetP'
        ]
    };

    symbolsByKeywords = {};

    angular.forEach(keywordsBySymbols, function(symbol, keywords){

        angular.forEach(keywords, function(keyword) {

            symbolsByKeywords[ keyword ] = symbol;

        });

    });

    return symbolsByKeywords;
};
