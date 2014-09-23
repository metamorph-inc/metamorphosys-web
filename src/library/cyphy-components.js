/*globals require, angular */
/**
 * @author lattmann / https://github.com/lattmann
 */

require('./services/cyphy-services');

angular.module('cyphy.components', ['cyphy.services']);

require('./WorkspaceList/WorkspaceList');
require('./ComponentList/ComponentList');
require('./DesignList/DesignList');
require('./TestBenchList/TestBenchList');



