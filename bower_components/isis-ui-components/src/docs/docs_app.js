/*globals angular, require*/
'use strict';

var components = [
  {
    name: 'searchBox',
    sources: [ 'demo.html', 'demo.js']
  },
  {
    name: 'itemList',
    sources: []
  },
  {
    name: 'simpleDialog',
    sources: []
  },
  {
    name: 'hierarchicalMenu',
    sources: []
  },
  {
    name: 'contextmenu',
    sources: [ 'demo.html', 'demo.js']
  },
  {
    name: 'dropdownNavigator',
    sources: []
  },
  {
    name: 'treeNavigator',
    sources: []
  }
];

require('../library/simpleDialog/docs/demo.js');
require('../library/hierarchicalMenu/docs/demo.js');
require('../library/contextmenu/docs/demo.js');
require('../library/dropdownNavigator/docs/demo.js');
require('../library/treeNavigator/docs/demo.js');
require('../library/itemList/docs/demo.js');
require('../library/searchBox/docs/demo.js');

require('angular-sanitize');
window.Showdown = require('showdown');
require('angular-markdown-directive');

require('codemirrorCSS');
window.CodeMirror = require('code-mirror');
require('angular-ui-codemirror');


var demoApp = angular.module(
'isis.ui.demoApp', [
  'isis.ui.demoApp.templates',
  'btford.markdown',
  'ui.codemirror'
].concat(components.map(function (e) {
  return 'isis.ui.' + e.name + '.demo';
}))
);

demoApp.run(function () {
  console.log('DemoApp run...');
});

demoApp.controller(
'UIComponentsDemoController',
function ($scope) {

  $scope.components = components.map(function (component) {
    var sourceTemplates;

    if (angular.isArray(component.sources)) {
      sourceTemplates = component.sources.map(function (sourceFile) {
        return {
          fileName: sourceFile,
          templateUrl: '/library/' + component.name + '/docs/' + sourceFile
        };
      });
    }

    return {
      name: component.name,
      template: '/library/' + component.name + '/docs/demo.html',
      docs: '/library/' + component.name + '/docs/readme.md',
      sources: sourceTemplates
    };
  });

  $scope.codeViewerOptions = {
    lineWrapping : true,
    lineNumbers: true,
    readOnly: 'nocursor'
  };

});