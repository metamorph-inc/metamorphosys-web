'use strict';

describe( 'webgme-cyphy.workspaceList module', function () {

    beforeEach( module( 'webgme-cyphy.workspaceList' ) );

    describe( 'workspaceList controller', function () {

        it( 'should exist', inject( function ( $controller ) {
            //spec body
            var workspaceListController = $controller( 'WorkspaceListController' );
            expect( workspaceListController )
                .toBeDefined();
        } ) );

    } );
} );