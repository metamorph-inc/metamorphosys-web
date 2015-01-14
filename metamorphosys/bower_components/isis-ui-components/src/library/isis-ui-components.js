/*globals angular*/

require( './services/isisUIServices.js' );

require( './simpleDialog/simpleDialog.js' );
require( './hierarchicalMenu/hierarchicalMenu.js' );
require( './contextmenu/contextmenu.js' );
require( './dropdownNavigator/dropdownNavigator.js' );
require( './treeNavigator/treeNavigator.js' );
require( './itemList/itemList.js' );
require( './searchBox/searchBox.js' );
require( './valueWidgets/valueWidgets.js' );
require( './decisionTable/decisionTable.js' );
require( './taxonomyTerms/taxonomyTerms.js' );

angular.module( 'isis.ui.components', [
  'isis.ui.components.templates',
  'isis.ui.services',

  'isis.ui.simpleDialog',
  'isis.ui.hierarchicalMenu',
  'isis.ui.contextmenu',
  'isis.ui.dropdownNavigator',
  'isis.ui.treeNavigator',
  'isis.ui.itemList',
  'isis.ui.searchBox',
  'isis.ui.valueWidgets',
  'isis.ui.decisionTable'

] );