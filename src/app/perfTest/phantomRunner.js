var system = require( 'system' );
var page = require( 'webpage' )
    .create();
var args = system.args;
var fs = require( 'fs' );

var consolelog = '';
page.onConsoleMessage = function ( msg, lineNum, sourceId ) {
    consolelog = consolelog + msg + "\n";
};

page.open( args[1] + '/extlib/src/app/perfTest/index.html', function ( status ) {
    if ( status !== 'success' ) {
        console.log( 'FAIL to load the address' );
        phantom.exit( 2 );
    }
    setInterval( function () {
        //page.render('example.png');
        var log = page.evaluate( function () {
            return document.getElementById( 'log' )
                .innerHTML;
        } );

        fs.write( 'phantom_' + args[2] + '.log', log + "\n\n" + consolelog, 'w' );

        if ( log.indexOf( 'PHANTOM DONE' ) !== -1 ) {
            //system.stdout.writeLine(log);
            system.stdout.writeLine( args[2] + ' success' );
            phantom.exit();
        }
    }, 150 );
} );