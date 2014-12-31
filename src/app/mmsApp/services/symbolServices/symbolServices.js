/*globals angular*/

'use strict';

var symbolServicesModule = angular.module(
    'mms.designVisualization.symbolServices', [] );

symbolServicesModule.provider( 'symbolManager', function SymbolManagerProvider() {
    var availableSymbols = {};

    this.registerSymbol = function ( symbolDescriptor ) {

        if ( angular.isObject( symbolDescriptor ) &&
            angular.isString( symbolDescriptor.type ) ) {
            availableSymbols[ symbolDescriptor.type ] = symbolDescriptor;
        }
    };

    this.$get = [

        function () {

            var SymbolManager;

            SymbolManager = function () {

                this.getAvailableSymbols = function () {
                    return availableSymbols;
                };

                this.getSymbol = function ( symbolType ) {
                    return availableSymbols[ symbolType ];
                };

//                this.getSymbolElementForType = function ( symbolType ) {
//
//                    var result = availableSymbols[ symbolType ] && availableSymbols[ symbolType ].directive;
//
//                    if ( !result ) {
//                        result = 'resistor';
//                    }
//
//                    return result;
//                };
            };

            return new SymbolManager();

        }
    ];
} );