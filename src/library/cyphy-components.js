/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
 * @author pmeijer / https://github.com/pmeijer
 */
// External dependencies
require( '../../bower_components/ng-file-upload/angular-file-upload-shim' );
require( '../../bower_components/ng-file-upload/angular-file-upload' );
require( '../../bower_components/angular-growl/build/angular-growl.min' );
require( '../../bower_components/angular-sanitize/angular-sanitize' );
require( '../../bower_components/adapt-strap/dist/adapt-strap' );
require( '../../bower_components/adapt-strap/dist/adapt-strap.tpl' );

// Internal dependencies
require( './services/cyphy-services' );

angular.module( 'cyphy.components', [
    'cyphy.services',
    'cyphy.components.templates',
    'angularFileUpload',
    'angular-growl',
    'ngSanitize',
    'adaptv.adaptStrap',
    'gme.services'

] )
    .config( [ 'growlProvider',
        function ( growlProvider ) {
            growlProvider.globalTimeToLive( {
                success: 5000,
                error: -1,
                warning: 20000,
                info: 5000
            } );
        }
    ] );

require( './SimpleModal/SimpleModal' );

require( './WorkspaceList/WorkspaceList' );

require( './ComponentList/ComponentDetails' );
require( './ComponentList/ComponentList' );

require( './DesignList/DesignDetails' );
require( './DesignList/DesignList' );
require( './DesignTree/DesignTree' );

require( './TestBenchList/TestBenchDetails' );
require( './TestBenchList/TestBenchList' );

require( './ConfigurationTable/ConfigurationTable' );
require( './ConfigurationSetSelector/ConfigurationSetSelector' );

require( './WorkersList/WorkersList' );