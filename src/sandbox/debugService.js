/*globals angular, console*/
/**
 * Created by pmeijer on 9/18/2014.
 */

var debugModule = angular.module( 'debugModule', [] )
    .factory( 'DebugService', function () {
        'use strict';
        var logObjOfObjAsTable = function ( anObject ) {
            var key,
                arr = [];
            for ( key in anObject ) {
                if ( anObject.hasOwnProperty( key ) ) {
                    if ( typeof anObject[ key ] === 'object' ) {
                        arr.push( anObject[ key ] );
                    } else {
                        console.error( 'Given object is not an object of objects!', anObject[ key ] );
                    }
                }
            }
            console.table( arr );
        };
        return {
            logObj: logObjOfObjAsTable
        };
    } )
    .service( 'DebugServiceS', function () {
        'use strict';
        this.logObj = function ( anObject ) {
            var key,
                arr = [];
            for ( key in anObject ) {
                if ( anObject.hasOwnProperty( key ) ) {
                    if ( typeof anObject[ key ] === 'object' ) {
                        arr.push( anObject[ key ] );
                    } else {
                        console.error( 'Given object is not an object of objects!', anObject[ key ] );
                    }
                }
            }
            console.table( arr );
        };
    } )
    .controller( 'DebugController', function ( $scope, DebugService ) {
        'use strict';
        var myObj = {},
            i;
        $scope.title = 'From DebugController';
        for ( i = 0; i < 42; i += 1 ) {
            myObj[ i ] = {
                id: i,
                name: 'property' + i.toString(),
                value: 2 * i,
                description: 'This i number ' + i.toString(),
                aFunc: function () {},
                innerObj: {
                    someInnerStuff: 'hey' + i.toString(),
                    someOtherInnerStuff: 'hey' + i.toString() + 'hey'
                }
            };
            console.count( 'Added object to myObj' );
        }
        DebugService.logObj( myObj );
    } )
    .controller( 'DebugControllerS', function ( $scope, DebugServiceS ) {
        'use strict';
        var myObj = {},
            i;
        $scope.title = 'From DebugControllerS';
        for ( i = 0; i < 42; i += 1 ) {
            myObj[ i ] = {
                id: i,
                name: 'property' + i.toString(),
                value: 2 * i,
                description: 'This i number ' + i.toString(),
                aFunc: function () {},
                innerObj: {
                    someInnerStuff: 'hey' + i.toString(),
                    someOtherInnerStuff: 'hey' + i.toString() + 'hey'
                }
            };
            console.count( 'Added object to myObj' );
        }
        DebugServiceS.logObj( myObj );
    } );