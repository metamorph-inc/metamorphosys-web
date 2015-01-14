/*globals angular, require*/
'use strict';

var components = [
  {
    name: 'decisionTable',
    sources: [ 'demo.html', 'demo.js']
  },
  {
    name: 'valueWidgets',
    sources: [ 'demo.html', 'demo.js']
  },
  {
    name: 'searchBox',
    sources: [ 'demo.html', 'demo.js']
  },
  {
    name: 'itemList',
    sources: [ 'demo.html', 'newItemTemplate.html', 'demo.js']
  },
  {
    name: 'simpleDialog',
    sources: [ 'demo.html', 'demo.js']
  },
  {
    name: 'hierarchicalMenu',
    sources: [ 'demo.html', 'demo.js']
  },
  {
    name: 'contextmenu',
    sources: [ 'demo.html', 'demo.js']
  },
  {
    name: 'dropdownNavigator',
    sources: [ 'demo.html', 'demo.js']
  },
  {
    name: 'treeNavigator',
    sources: [ 'demo.html', 'demo.js']
  }
];

require( '../library/simpleDialog/docs/demo.js' );
require( '../library/hierarchicalMenu/docs/demo.js' );
require( '../library/contextmenu/docs/demo.js' );
require( '../library/dropdownNavigator/docs/demo.js' );
require( '../library/treeNavigator/docs/demo.js' );
require( '../library/itemList/docs/demo.js' );
require( '../library/searchBox/docs/demo.js' );
require( '../library/valueWidgets/docs/demo.js' );
require( '../library/decisionTable/docs/demo.js' );

require( 'angular-sanitize' );
window.Showdown = require( 'showdown' );
require( 'angular-markdown-directive' );

require( 'codemirror-css' );
window.CodeMirror = require( 'codemirror' );

require( 'codemirror/mode/htmlmixed/htmlmixed' );
require( 'codemirror/mode/xml/xml' );
require( 'codemirror/mode/javascript/javascript' );

require( 'angular-ui-codemirror' );
require( 'ng-grid' );
require( 'ng-grid-css');
require( 'ui-utils');


var demoApp = angular.module(
'isis.ui.demoApp', [
  'isis.ui.demoApp.templates',
  'btford.markdown',
  'ui.codemirror',
  'ui.bootstrap'
].concat( components.map( function ( e ) {
  return 'isis.ui.' + e.name + '.demo';
} ) )
);

demoApp.run( function () {
  console.log( 'DemoApp run...' );
} );

demoApp.controller(
'UIComponentsDemoController',
function ( $scope, $templateCache ) {

  var fileExtensionRE,
    codeMirrorModes;

  fileExtensionRE = /(?:\.([^.]+))?$/;

  codeMirrorModes = {
    'js': 'javascript',
    'html': 'htmlmixed'
  };

  $scope.components = components.map( function ( component ) {
    var sources,
    viewerOptions,
    fileExtension;

    if ( angular.isArray( component.sources ) ) {
      sources = component.sources.map( function ( sourceFile ) {

        fileExtension = fileExtensionRE.exec( sourceFile );

        viewerOptions = {
          lineWrapping: true,
          lineNumbers: true,
          readOnly: true,
          mode: codeMirrorModes[fileExtension[1]] || 'xml'
        };

        return {
          fileName: sourceFile,
          code: $templateCache.get( '/library/' + component.name + '/docs/' + sourceFile ),
          viewerOptions: viewerOptions
        };
      } );
    }

    return {
      name: component.name,
      template: '/library/' + component.name + '/docs/demo.html',
      docs: '/library/' + component.name + '/docs/readme.md',
      sources: sources
    };
  } );

} );