(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require( './services/gmeServices.js' );
require( './services/gmeTestServices.js');
require( './directives/gmeDirectives.js' );

},{"./directives/gmeDirectives.js":2,"./services/gmeServices.js":9,"./services/gmeTestServices.js":10}],2:[function(require,module,exports){
/*globals angular*/
'use strict';

require( './projectBrowser/projectBrowser.js' );

angular.module( 'gme.directives', [
  'gme.templates',
  'gme.directives.projectBrowser'
] );
},{"./projectBrowser/projectBrowser.js":3}],3:[function(require,module,exports){
/*globals angular, chance*/
'use strict';

require( '../termFilter/termFilter.js' );

angular.module( 'gme.directives.projectBrowser', [
  'gme.templates',
  'isis.ui.itemList',
  'gme.directives.termFilter',
  'ngTagsInput',
  'gme.testServices'
] )
.run( function () {

} )
.controller( 'ProjectBrowserController', function ( $scope, $log, $filter, projectServiceTest, projectService ) {

  var config,
  dummyProjectGenerator,

  projectDescriptorMapper,

  filterItems,
  projectList,
  availableTerms;

  availableTerms = $scope.availableTerms = [];

//  availableTerms = $scope.availableTerms = [
//    {
//      id: 'tag1',
//      name: 'Tag A',
//      url: 'http://vanderbilt.edu'
//    },
//    {
//      id: 'tag2',
//      name: 'Tag B',
//      url: 'http://vanderbilt.edu'
//    },
//    {
//      id: 'tag3',
//      name: 'Tag C',
//      url: 'http://vanderbilt.edu'
//    },
//    {
//      id: 'tag4',
//      name: 'Tag D',
//      url: 'http://vanderbilt.edu'
//    },
//    {
//      id: 'tag5',
//      name: 'Tag E',
//      url: 'http://vanderbilt.edu'
//    },
//    {
//      id: 'tag6',
//      name: 'Tag F',
//      url: 'http://vanderbilt.edu'
//    }
//  ];


  $scope.filtering = {
    selectedTermIds: [

    ]
  };

  projectList = $scope.projectList = {
    items: []
  };

  $scope.filteredProjectList = {
    items: []
  };


  filterItems = function () {
    $scope.filteredProjectList.items = $filter( 'termFilter' )( $scope.projectList.items,
    $scope.filtering.selectedTermIds );
  };

  $scope.$watch( function () {

    return $scope.filtering.selectedTermIds;
  }, function () {
    filterItems();
  },
  true );


  $scope.$watch( 'filtering.selectedTermIds', function () {
    filterItems();
  } );

  $scope.$watch( 'projectList.items', function () {
    filterItems();
  } );

  dummyProjectGenerator = function ( id ) {

    var projectDescriptor, i;

    projectDescriptor = {
      id: id,
      title: chance.paragraph( {
        sentences: 1
      } ),
      cssClass: 'project-item',
      toolTip: 'Open project',
      description: chance.paragraph( {
        sentences: 2
      } ),
      lastUpdated: {
        time: Date.now(),
        user: 'N/A'

      },
      taxonomyTerms: [],
      stats: [
        {
          value: id,
          toolTip: 'Commits',
          iconClass: 'fa fa-cloud-upload'
        },
        {
          value: id,
          toolTip: 'Users',
          iconClass: 'fa fa-users'
        }
      ],
      details: chance.paragraph( {
        sentences: 3
      } )
    };

    for ( i = 0; i < $scope.availableTerms.length - 1; i++ ) {

      if ( Math.random() > 0.5 ) {
        projectDescriptor.taxonomyTerms.push( $scope.availableTerms[ i ] );
      }
    }

    return projectDescriptor;

  };

//  for (i = 0; i < 20; i++) {
//    $scope.projectList.items.push(dummyProjectGenerator(i));
//  }

  projectDescriptorMapper = function(projectDescriptors) {

    var result = [];

    angular.forEach(projectDescriptors, function(projectDescriptor) {

        result.push({

          id: projectDescriptor.id,
          description: projectDescriptor.description,
          title: projectDescriptor.visibleName,
          taxonomyTerms: projectDescriptor.tags

        });

      });

    return result;

  };

  // Making sure we have test project in DB

  projectServiceTest.startTest().then( function () {


    projectService.getAvailableProjectTags( 'multi' ).then( function(tagList) {

      $scope.availableTerms = tagList;

    });

    projectService.getProjects( 'multi' ).then( function ( gmeProjectDescriptors ) {
      $log.debug(gmeProjectDescriptors);

      $scope.projectList.items = [];
      $scope.projectList.items = projectDescriptorMapper(gmeProjectDescriptors);

      //$scope.projectList.items = results;
    });

  });

  $scope.config = config = {

    sortable: true,
    secondaryItemMenu: true,
    detailsCollapsible: true,
    showDetailsLabel: 'Show details',
    hideDetailsLabel: 'Hide details',
    filter: {},

    // Event handlers

    itemSort: function ( jQEvent, ui ) {
      console.log( 'Sort happened', jQEvent, ui );
    },

    itemClick: function ( event, item ) {
      console.log( 'Clicked: ' + item );
    },

    itemContextmenuRenderer: function ( e, item ) {
      console.log( 'Contextmenu was triggered for node:', item );

      return [
        {
          items: [

            {
              id: 'open',
              label: 'Open Project',
              disabled: true,
              iconClass: ''
            },
            {
              id: 'edit',
              label: 'Edit Project Details',
              disabled: true,
              iconClass: ''
            },
            {
              id: 'delete',
              label: 'Delete Project',
              disabled: true,
              iconClass: ''
            }
          ]
        }
      ];
    },

    detailsRenderer: function ( item ) {
      item.details = 'My details are here now!';
    },

    newItemForm: {
      title: 'Create new Project',
      itemTemplateUrl: '/ng-gme/templates/newProjectTemplate.html',
      expanded: false,
      controller: function ( $scope ) {

        $scope.newItem = {};

        $scope.tags = angular.copy( availableTerms );

        $scope.createItem = function ( newItem ) {

          newItem.id = newItem.title;
          console.log(newItem.tags);
          projectList.items.push( newItem );
          console.log( projectList.items );

          $scope.newItem = {};

          config.newItemForm.expanded = false; // this is how you close the form itself

        };

      }
    }

  };


} )
.directive( 'projectBrowser', function () {

  return {
    scope: false,
    restrict: 'E',
    controller: 'ProjectBrowserController',
    replace: true,
    templateUrl: '/ng-gme/templates/projectBrowser.html'
  };
} );

},{"../termFilter/termFilter.js":4}],4:[function(require,module,exports){
/*globals angular*/
'use strict';

angular.module(
  'gme.directives.termFilter', [
    'isis.ui.taxonomyTerm'
  ]

)
  .filter( 'isSelected', [
    function () {
      return function ( input, selectedTermIds, direction ) {
        var output = [];

        angular.forEach( input, function ( term ) {

          if ( direction === -1 ) {

            if ( selectedTermIds.indexOf( term.id ) === -1 ) {
              output.push( term );
            }

          } else {

            if ( selectedTermIds.indexOf( term.id ) > -1 ) {
              output.push( term );
            }

          }
        } );

        return output;

      };
    }
  ] )
  .filter( 'termFilter', function () {
    return function ( input, selectedTermIds ) {

      var output = [], countOfTermHits;

      if ( angular.isArray( selectedTermIds ) && selectedTermIds.length ) {

        angular.forEach( input, function ( elem ) {

          countOfTermHits = 0;

          angular.forEach( elem.taxonomyTerms, function ( aTerm ) {

            countOfTermHits = countOfTermHits && countOfTermHits;

            if ( selectedTermIds.indexOf( aTerm.id ) > -1 ) {
              countOfTermHits += 1;
            }

          } );

          if (countOfTermHits === selectedTermIds.length) {
            output.push( elem );
          }

        } );

      } else {
        output = input;
      }

      return output;

    };
  } )
  .controller( 'TermFilterController', function ( $scope ) {

    $scope.toggle = function ( term ) {

      var index;

      index = $scope.selectedTermIds.indexOf( term.id );

      if ( index === -1 ) {
        $scope.selectedTermIds.push( term.id );
      } else {
        $scope.selectedTermIds.splice( index, 1 );
      }
    };

  } )
  .directive(
    'termFilter',
    function () {

      return {
        scope: {
          availableTerms: '=',
          selectedTermIds: '='
        },
        controller: 'TermFilterController',
        restrict: 'E',
        replace: true,
        templateUrl: '/ng-gme/templates/termFilter.html'
      };
    } );
},{}],5:[function(require,module,exports){
'use strict';

module.exports = function ( $q, dataStoreService, projectService ) {

  this.selectBranch = function ( databaseId, branchId ) {
    var dbConn = dataStoreService.getDatabaseConnection( databaseId ),
      deferred = new $q.defer();

    dbConn.branchService = dbConn.branchService || {};

    dbConn.client.selectBranchAsync( branchId,
      function ( err ) {
        if ( err ) {
          deferred.reject( err );
          return;
        }

        dbConn.branchService.branchId = branchId;

        deferred.resolve( branchId );
      } );

    return deferred.promise;
  };

  this.getSelectedBranch = function ( /*databaseId*/) {
    throw new Error( 'Not implemented yet.' );
  };

  this.watchBranches = function ( /*databaseId*/) {
    // TODO: register for branch events
    // TODO: SERVER_BRANCH_CREATED
    // TODO: SERVER_BRANCH_UPDATED
    // TODO: SERVER_BRANCH_DELETED

    throw new Error( 'Not implemented yet.' );
  };

  this.watchBranchState = function ( /*databaseId*/) {
    // TODO: register for branch state events
    // TODO: SYNC
    // TODO: FORKED
    // TODO: OFFLINE

    // TODO: BRANCHSTATUS_CHANGED

    throw new Error( 'Not implemented yet.' );
  };

  this.on = function ( databaseId, eventName, fn ) {
    var dbConn,
      i;

    console.assert( typeof databaseId === 'string' );
    console.assert( typeof eventName === 'string' );
    console.assert( typeof fn === 'function' );

    dbConn = dataStoreService.getDatabaseConnection( databaseId );
    dbConn.branchService = dbConn.branchService || {};

    dbConn.branchService.isInitialized = dbConn.branchService.isInitialized || false;

    if ( typeof dbConn.branchService.events === 'undefined' ) {
      // register for project events
      projectService.on( databaseId, 'initialize', function ( dbId ) {
        var dbConnEvent = dataStoreService.getDatabaseConnection( dbId ),
          i;

        if ( dbConnEvent.branchService &&
          dbConnEvent.branchService.events &&
          dbConnEvent.branchService.events.initialize ) {

          dbConnEvent.branchService.isInitialized = true;

          for ( i = 0; i < dbConnEvent.branchService.events.initialize.length; i += 1 ) {
            dbConnEvent.branchService.events.initialize[ i ]( dbId );
          }
        }
      } );

      projectService.on( databaseId, 'destroy', function ( dbId ) {
        var dbConnEvent = dataStoreService.getDatabaseConnection( dbId ),
          i;

        if ( dbConnEvent.branchService &&
          dbConnEvent.branchService.events &&
          dbConnEvent.branchService.events.destroy ) {

          dbConnEvent.branchService.isInitialized = false;

          for ( i = 0; i < dbConnEvent.nodeService.events.destroy.length; i += 1 ) {
            dbConnEvent.branchService.events.destroy[ i ]( dbId );
          }
        }
      } );

      dbConn.client.addEventListener( dbConn.client.events.BRANCH_CHANGED,
        function ( projectId /* FIXME */ , branchId ) {

          if ( dbConn.branchService.branchId !== branchId ) {

            dbConn.branchService.branchId = branchId;

            console.log( 'There was a BRANCH_CHANGED event', branchId );
            if ( branchId ) {
              // initialize
              if ( dbConn.branchService &&
                dbConn.branchService.events &&
                dbConn.branchService.events.initialize ) {

                dbConn.branchService.isInitialized = true;

                for ( i = 0; i < dbConn.branchService.events.initialize.length; i += 1 ) {
                  dbConn.branchService.events.initialize[ i ]( databaseId );
                }
              }
            } else {
              // branchId is falsy, empty or null or undefined
              // destroy
              if ( dbConn.branchService &&
                dbConn.branchService.events &&
                dbConn.branchService.events.destroy ) {

                dbConn.branchService.isInitialized = false;
                delete dbConn.branchService.branchId;

                for ( i = 0; i < dbConn.branchService.events.destroy.length; i += 1 ) {
                  dbConn.branchService.events.destroy[ i ]( databaseId );
                }
              }
            }
          }
        } );
    }

    dbConn.branchService.events = dbConn.branchService.events || {};
    dbConn.branchService.events[ eventName ] = dbConn.branchService.events[ eventName ] || [];
    dbConn.branchService.events[ eventName ].push( fn );

    if ( dbConn.branchService.isInitialized ) {
      if ( eventName === 'initialize' ) {
        fn( databaseId );
      }
    } else {
      if ( eventName === 'destroy' ) {
        fn( databaseId );
      }
    }

    // TODO: register for branch change event OR BranchService onInitialize
  };
};
},{}],6:[function(require,module,exports){
/*globals WebGMEGlobal*/

'use strict';

module.exports = function($q) {
    var dataStores = {},
        connectQueue = [],
        queueProcessing = false,
        connectNextInQueue,
        processQueue;

    /*isAnotherThreadConnecting = function(databaseId) {
        if (connectingProgress.indexOf(databaseId) !== -1) {
            return true;
        }
        return false;
    };

    connect = function(databaseId, options, deferred) {
        var client;

        connectingProgress.push(databaseId);

        if (dataStores.hasOwnProperty(databaseId)) {
            console.log('connection already exists, remove from connecting phase');
            connectingProgress.splice(connectingProgress.indexOf(databaseId), 1);

            // FIXME: this may or may not ready yet...
            deferred.resolve();
        } else {


            client = new WebGMEGlobal.classes.Client(options);

            // hold a reference to the client instance
            dataStores[databaseId] = {
                client: client
            };

            // TODO: add event listeners to client

            // FIXME: deferred should not be used from closure
            client.connectToDatabaseAsync({}, function(err) {
                console.log('connected, remove from connecting phase');
                connectingProgress.splice(connectingProgress.indexOf(databaseId), 1);
                if (err) {
                    deferred.reject(err);
                    return;
                }

                deferred.resolve();
            });
        }
    };

    waitForAnotherThread = function(databaseId, options, deferred, maxTry) {
        if (isAnotherThreadConnecting(databaseId)) {
            console.log('another thread is connecting: ' + maxTry);
            timer = setTimeout(function() {
                clearTimeout(timer);
                if (maxTry-- > 0) {
                    waitForAnotherThread(databaseId, options, deferred, maxTry);
                }
            }, 100);
        } else {
            console.log('connecting, remaining tries' + maxTry);
            connect(databaseId, options, deferred);
        }
    };*/


    // Picks up the next connectionmeta and tries to connect
    // After a(n) (un)successful connection, the defered resolve/promise is called
    // and the function picks up the next item from the queue
    connectNextInQueue = function() {
        if (connectQueue.length > 0) {
            var currentItem = connectQueue[0];

            if (dataStores.hasOwnProperty(currentItem.databaseId)) {
                // FIXME: this may or may not ready yet...
                currentItem.deferred.resolve();
                connectQueue.splice(0, 1);
                connectNextInQueue();
            } else {
                var client = new WebGMEGlobal.classes.Client(currentItem.options);

                // hold a reference to the client instance
                dataStores[currentItem.databaseId] = {
                    client: client
                };

                // TODO: add event listeners to client
                // FIXME: deferred should not be used from closure
                client.connectToDatabaseAsync({}, function(err) {
                    if (err) {
                        currentItem.deferred.reject(err);
                    } else {
                      currentItem.deferred.resolve();
                    }

                    connectQueue.splice(0, 1);
                    connectNextInQueue();
                });
            }
        } else {
            queueProcessing = false;
            if (connectQueue.length > 0) {
              processQueue();
            }
        }
    };

    // Check if there are any processing phase
    // No simultaneous processing
    processQueue = function() {
        if (!queueProcessing) {
            queueProcessing = true;
            connectNextInQueue();
        }
    };

    // Just one connection phase at one time.
    // Multiple connection phase may cause 'unexpected results'
    this.connectToDatabase = function(databaseId, options) {
        var deferred = $q.defer();

        // Put the connection metadata into a queue
        connectQueue.push({
            databaseId: databaseId, // Where to connect? Default: 'multi'
            deferred: deferred,     // defered object, where the notifications are sent if the connection succesful (or not)
            options: options        // Connection oprtions
        });

        processQueue();

        return deferred.promise;
    };

    this.getDatabaseConnection = function(databaseId) {
        if (dataStores.hasOwnProperty(databaseId) && typeof dataStores[databaseId] === 'object') {
            return dataStores[databaseId];
        }

        console.error(databaseId + ' does not have an active database connection.');
    };

    this.watchConnection = function( /*databaseId*/ ) {
        // TODO: handle events
        // TODO: CONNECTED
        // TODO: DISCONNECTED

        // TODO: NETWORKSTATUS_CHANGED

        throw new Error('Not implemented yet.');
    };

    // TODO: on selected project changed, on initialize and on destroy (socket.io connected/disconnected)
};

},{}],7:[function(require,module,exports){
'use strict';

module.exports = function ( $q, dataStoreService, branchService ) {

  var self = this,
    NodeObj,
    getIdFromNodeOrString;

  /**
   * Loads the meta nodes from the context (will create a node-service on the dbConn with regions if not present when invoked).
   * @param {object} context - From where to load the nodes.
   * @param {string} context.db - Database where the nodes will be loaded from.
   * @param {string} context.regionId - Region where the NodeObjs will be stored.
   * @returns {Promise} - Returns an array of NodeObjs when resolved.
   */
  this.getMetaNodes = function ( context ) {
    var deferred = $q.defer();
    self.loadNode( context, '' )
      .then( function ( rootNode ) {
        var metaNodeIds = rootNode.getMemberIds( 'MetaAspectSet' ),
          queueList = [],
          i;
        //console.log(metaNodeIds);
        for ( i = 0; i < metaNodeIds.length; i += 1 ) {
          queueList.push( self.loadNode( context, metaNodeIds[ i ] ) );
        }
        $q.all( queueList )
          .then( function ( metaNodes ) {
            var key,
              metaNode,
              meta = {};
            for ( key in metaNodes ) {
              if ( metaNodes.hasOwnProperty( key ) ) {
                metaNode = metaNodes[ key ];
                meta[ metaNode.getAttribute( 'name' ) ] = metaNode;
              }
            }
            deferred.resolve( meta );
          } );
      } );

    return deferred.promise;
  };

  /**
   * Loads a node from context (will create a node-service on the dbConn with regions if not present when invoked).
   * @param {object} context - From where to look for the node.
   * @param {string} context.db - Database where the node will be looked for.
   * @param {string} context.regionId - Region where the NodeObj will be stored.
   * @param {string} id - Path to the node.
   * @returns {Promise} - Returns a NodeObj when resolved.
   */
  this.loadNode = function ( context, id ) {
    var deferred = $q.defer(),
      dbConn = dataStoreService.getDatabaseConnection( context.db ),
      territoryId,
      territoryPattern = {},
      nodes;

    console.assert( typeof context.regionId === 'string' );

    territoryId = context.regionId + '_' + id;
    dbConn.nodeService = dbConn.nodeService || {};
    dbConn.nodeService.regions = dbConn.nodeService.regions || {};
    dbConn.nodeService.regions[ context.regionId ] = dbConn.nodeService.regions[ context.regionId ] || {
      regionId: context.regionId,
      nodes: {}
    };

    nodes = dbConn.nodeService.regions[ context.regionId ].nodes;
    //console.log('territoryId', territoryId);
    if ( nodes.hasOwnProperty( id ) ) {
      console.log( 'Node already loaded..', id );
      deferred.resolve( nodes[ id ] );
    } else {
      dbConn.client.addUI( {}, function ( events ) {
        var i,
          event;

        for ( i = 0; i < events.length; i += 1 ) {
          event = events[ i ];
          if ( id !== event.eid ) {
            continue;
          }
          if ( event.etype === 'load' ) {
            nodes[ id ] = new NodeObj( context, id );
            nodes[ id ].territories.push( territoryId );
            deferred.resolve( nodes[ id ] );
          } else if ( event.etype === 'update' ) {
            nodes[ id ]._onUpdate( event.eid );
            nodes[ id ].__onUpdate( event.eid );
          } else if ( event.etype === 'unload' ) {
            nodes[ id ]._onUnload( event.eid );
            nodes[ id ].__onUnload();
          } else {
            throw 'Unexpected event type' + events[ i ].etype;
          }
        }
      }, territoryId );

      territoryPattern[ id ] = {
        children: 0
      };
      dbConn.client.updateTerritory( territoryId, territoryPattern );
    }

    return deferred.promise;
  };

  /**
   * Creates a new node in the database and returns with the NodeObj.
   * @param {object} context - Where to create the node.
   * @param {string} context.db - Database where the node will be created.
   * @param {string} context.regionId - Region where the NodeObj will be stored.
   * @param {NodeObj|string} parent - model where the node should be created.
   * @param {NodeObj|string} base - base, e.g. meta-type, of the new node.
   * @param {string} [msg] - optional commit message.
   * @returns {Promise} - Evaluates to the newly created node (inside context).
   */
  this.createNode = function ( context, parent, base, msg ) {
    var deferred = $q.defer(),
      dbConn = dataStoreService.getDatabaseConnection( context.db ),
      parentId = getIdFromNodeOrString( parent ),
      baseId = getIdFromNodeOrString( base ),
      id;

    id = dbConn.client.createChild( {
      parentId: parentId,
      baseId: baseId
    }, msg );

    self.loadNode( context, id )
      .then( function ( node ) {
        deferred.resolve( node );
      } );

    return deferred.promise;
  };

  /**
   * Creates a new node in the database and returns with its assigned id (path).
   * @param {object} context - Where to create the node.
   * @param {string} context.db - Database where the node will be created.
   * @param {object} parameters - as in client.createChild (see this.createNode for example).
   * @param {string} [msg] - optional commit message.
   * @returns {string} - id (path) of new node.
   */
  this.createChild = function ( context, parameters, msg ) {
    var dbConn = dataStoreService.getDatabaseConnection( context.db );
    return dbConn.client.createChild( parameters, msg );
  };

  /**
   * Updates the attribute of the given node
   * @param {object} context - Where to create the node.
   * @param {string} context.db - Database where the node will be created.
   * @param {string} id - Path to node to update.
   * @param {string} name - Name of Attribute.
   * @param {string} value - New value for Attribute.
   * @param {string} [msg] - optional commit message.
   * @returns {string} - id (path) of new node.
   */
  this.setAttributes = function ( context, id, name, value, msg ) {
    var dbConn = dataStoreService.getDatabaseConnection( context.db );
    return dbConn.client.setAttributes( id, name, value, msg );
  };

  /**
   * Removes the node from the data-base connection.
   * @param {object} context - From where to delete the node.
   * @param {string} context.db - Database from where the node will be deleted.
   * @param {NodeObj|string} nodeOrId - node that should be deleted (the NodeObj(s) will be removed from all regions through __OnUnload()).
   * @param {string} [msg] - optional commit message.
   */
  this.destroyNode = function ( context, nodeOrId, msg ) {
    var dbConn = dataStoreService.getDatabaseConnection( context.db ),
      id = getIdFromNodeOrString( nodeOrId ),
      nodeToDelete = dbConn.client.getNode( id );
    if ( nodeToDelete ) {
      dbConn.client.delMoreNodes( [ id ], msg );
    } else {
      console.warn( 'Requested deletion of node that does not exist in context! (id, context) ',
        id,
        context );
    }
  };

  /**
   * Removes all references and listeners attached to any NodeObj in the region.
   * N.B. This function must be invoked for all regions that a "user" created.
   * This is typically done in the "$scope.on($destroy)"-function of a controller.
   * @param {string} databaseId - data-base connection from where the region will be removed.
   * @param {string} regionId - Region to clean-up.
   */
  this.cleanUpRegion = function ( databaseId, regionId ) {
    var key,
      dbConn = dataStoreService.getDatabaseConnection( databaseId ),
      nodes = dbConn.nodeService.regions[ regionId ].nodes;
    // Go through all nodes and remove the territories associated with each node.
    for ( key in nodes ) {
      if ( nodes.hasOwnProperty( key ) ) {
        nodes[ key ].cleanUpNode();
      }
    }
    // Remove the reference to the region (includes) nodes.
    delete dbConn.nodeService.regions[ regionId ];
  };


  this.cleanUpAllRegions = function ( databaseId ) {
    var dbConn = dataStoreService.getDatabaseConnection( databaseId ),
      regionId;

    if ( dbConn.nodeService ) {
      //                console.log(dbConn.nodeService.regions);
      for ( regionId in dbConn.nodeService.regions ) {
        if ( dbConn.nodeService.regions.hasOwnProperty( regionId ) ) {
          self.cleanUpRegion( databaseId, regionId );
        }
      }
      //                console.log(dbConn.nodeService.regions);
    }
  };

  /**
   * Logs the regions of the database connection.
   * @param {string} databaseId - Id of database to log.
   */
  this.logContext = function ( databaseId ) {
    var dbConn = dataStoreService.getDatabaseConnection( databaseId );
    console.log( 'logContext: ', dbConn );
  };

  NodeObj = function ( context, id ) {
    var thisNode = this;
    this.id = id;
    this.territories = [];
    this.context = context;
    this.databaseConnection = dataStoreService.getDatabaseConnection( context.db );
    // TODO: Should these be arrays of functions? The controller may want to add more methods.
    this._onUpdate = function ( /*id*/) {};
    this.__onUpdate = function ( /*id*/) {};
    this._onUnload = function ( /*id*/) {};
    // This will always be called on unload.
    this.__onUnload = function () {
      thisNode.cleanUpNode();
      delete thisNode.databaseConnection.nodeService.regions[ context.regionId ].nodes[ thisNode.id ];
    };
  };

  NodeObj.prototype.cleanUpNode = function () {
    var i;
    // This ought to remove all references to event handlers in the client.
    for ( i = 0; i < this.territories.length; i += 1 ) {
      this.databaseConnection.client.removeUI( this.territories[ i ] );
    }
  };

  NodeObj.prototype.getAttribute = function ( name ) {
    return this.databaseConnection.client.getNode( this.id )
      .getAttribute( name );
  };

  NodeObj.prototype.setAttribute = function ( name, value, msg ) {
    var self = this,
      deferred = $q.defer();
    this.__onUpdate = function (id) {
      if (self.getAttribute(name) === value) {  // FIXME: This won't work for non-primitive attributes.
        self.__onUpdate = function () {};
        deferred.resolve();
      }
    };
    this.databaseConnection.client.setAttributes( this.id, name, value, msg );
    return deferred.promise;
  };

  NodeObj.prototype.getRegistry = function ( /*name*/) {

  };

  NodeObj.prototype.setRegistry = function ( /*name, value*/) {

  };

  /** Gets nodeIds of nodes this node points 'to' and is pointed to 'from'.
   * @param {string} name - name of pointer, e.g. 'src', 'dst'.
   * @returns {object} pointers - object with ids.
   * @returns {string} pointers.to - node id the pointer of this NodeObj points to.
   * @returns {[string]} pointers.from - node ids of nodes that points to this NodeObj through the pointer.
   */
  NodeObj.prototype.getPointer = function ( name ) {
    return this.databaseConnection.client.getNode( this.id )
      .getPointer( name );
  };

  /**
   * Sets pointer named pointer from this node to given node.
   * @param {string} name - name of pointer, e.g. 'src', 'dst'.
   * @param {string} toId - id of node to point to
   * @param {string} [msg] - optional commit message.
   */
  NodeObj.prototype.makePointer = function ( name, toId, msg ) {
    this.databaseConnection.client.makePointer( this.id, name, toId, msg );
  };

  // TODO: add sets

  NodeObj.prototype.getCollectionPaths = function ( name ) {
    return this.databaseConnection.client.getNode( this.id )
      .getCollectionPaths( name );
  };

  NodeObj.prototype.getBaseNode = function () {
    // TODO: add proper error handling
    return self.loadNode( this.context, this.getBaseId() );
  };

  NodeObj.prototype.getParentId = function () {
    return this.databaseConnection.client.getNode( this.id )
      .getParentId();
  };

  NodeObj.prototype.getParentNode = function () {
    // TODO: add proper error handling
    return self.loadNode( this.context, this.getParentId() );
  };

  NodeObj.prototype.getId = function () {
    return this.id;
  };

  NodeObj.prototype.getBaseId = function () {
    return this.databaseConnection.client.getNode( this.id )
      .getBaseId();
  };

  NodeObj.prototype.getGuid = function () {
    return this.databaseConnection.client.getNode( this.id )
      .getGuid();
  };

  NodeObj.prototype.getChildrenIds = function () {
    return this.databaseConnection.client.getNode( this.id )
      .getChildrenIds();
  };

  NodeObj.prototype.loadChildren = function () {
    var childrenIds = this.getChildrenIds(),
      queueList = [],
      i;

    for ( i = 0; i < childrenIds.length; i += 1 ) {
      queueList.push( self.loadNode( this.context, childrenIds[ i ] ) );
    }

    return $q.all( queueList );
  };

  NodeObj.prototype.createChild = function ( /*baseNodeOrId, name*/) {

  };

  /**
   * Removes the node from the data-base. (All regions within the same context should get onUnload events).
   * @param [msg] - Optional commit message.
   */
  NodeObj.prototype.destroy = function ( msg ) {
    // TODO: Perhaps remove the node from its context/region at this point? Now it waits for the unload event
    self.destroyNode( this.context, this.id, msg );
  };

  NodeObj.prototype.getMemberIds = function ( name ) {
    return this.databaseConnection.client.getNode( this.id )
      .getMemberIds( name );
  };

  NodeObj.prototype.getMetaType = function () {

  };

  NodeObj.prototype.isMetaTypeOf = function ( metaNode ) {
    var /*idWasGiven = false,*/
    node = this.databaseConnection.client.getNode( this.id );

    while ( node ) {
      if ( node.getId() === metaNode.getId() ) {
        return true;
      }
      node = this.databaseConnection.client.getNode( node.getBaseId() );
    }
    return false;
  };

  NodeObj.prototype.onUpdate = function ( fn ) {
    console.assert( typeof fn === 'function' );
    this._onUpdate = fn;
  };

  NodeObj.prototype.onUnload = function ( fn ) {
    console.assert( typeof fn === 'function' );
    this._onUnload = fn;
  };

  NodeObj.prototype.onNewChildLoaded = function ( fn ) {
    var dbConn = this.databaseConnection,
      context = this.context,
      territoryPattern = {},
      id = this.id,
      terrId = context.regionId + '_' + id + '_new_children_watch',
      initializeNewNode;

    initializeNewNode = function ( newNode ) {
      fn( newNode );
      //console.log('Added new territory through onNewChildLoaded ', event.eid);
    };

    //console.log(dbConn);
    if ( this.territories.indexOf( terrId ) > -1 ) {
      console.warn( 'Children are already being watched for ', terrId );
    } else {
      this.territories.push( terrId );
      dbConn.client.addUI( {}, function ( events ) {
        var i,
          event;
        for ( i = 0; i < events.length; i += 1 ) {
          event = events[ i ];
          if ( event.etype === 'load' ) {
            if ( dbConn.nodeService.regions[ context.regionId ].nodes.hasOwnProperty( event.eid ) ===
              false ) {
              self.loadNode( context, event.eid )
                .then( initializeNewNode );
            } else {
              //console.info('Node ' + event.eid + ' was loaded in ' + terrId + ' but it already' +
              //    ' existed in the nodes of the region: ' + context.regionId);
            }
          } else {
            // These node are just watched for loading..
          }
        }
      }, terrId );

      territoryPattern[ id ] = {
        children: 1
      };
      dbConn.client.updateTerritory( terrId, territoryPattern );
    }
  };

  getIdFromNodeOrString = function ( nodeOrId ) {
    if ( typeof nodeOrId === 'string' ) {
      return nodeOrId;
    }

    if ( typeof nodeOrId === 'object' ) {
      if ( typeof nodeOrId.getId === 'function' ) {
        return nodeOrId.getId();
      } else {
        console.error( nodeOrId, ' does not have a getId function' );
      }
    } else {
      console.error( nodeOrId, ' is not a string nor an object.' );
    }
  };

  this.on = function ( databaseId, eventName, fn ) {
    var dbConn;

    console.assert( typeof databaseId === 'string' );
    console.assert( typeof eventName === 'string' );
    console.assert( typeof fn === 'function' );

    dbConn = dataStoreService.getDatabaseConnection( databaseId );
    dbConn.nodeService = dbConn.nodeService || {};

    dbConn.nodeService.isInitialized = dbConn.nodeService.isInitialized || false;

    if ( typeof dbConn.nodeService.events === 'undefined' ) {
      branchService.on( databaseId, 'initialize', function ( dbId ) {
        var dbConnEvent = dataStoreService.getDatabaseConnection( dbId ),
          i;

        self.cleanUpAllRegions( dbId );

        if ( dbConnEvent.nodeService &&
          dbConnEvent.nodeService.events &&
          dbConnEvent.nodeService.events.initialize ) {
          // NodeService requires a selected branch.
          if ( dbConn.branchService.branchId ) {
            dbConnEvent.nodeService.isInitialized = true;

            for ( i = 0; i < dbConnEvent.nodeService.events.initialize.length; i += 1 ) {
              dbConnEvent.nodeService.events.initialize[ i ]( dbId );
            }
          }
        }
      } );

      branchService.on( databaseId, 'destroy', function ( dbId ) {
        var dbConnEvent = dataStoreService.getDatabaseConnection( dbId ),
          i;

        self.cleanUpAllRegions( dbId );

        if ( dbConnEvent.nodeService &&
          dbConnEvent.nodeService.events &&
          dbConnEvent.nodeService.events.destroy ) {

          dbConnEvent.nodeService.isInitialized = false;

          for ( i = 0; i < dbConnEvent.nodeService.events.destroy.length; i += 1 ) {
            dbConnEvent.nodeService.events.destroy[ i ]( dbId );
          }
        }
      } );
    }

    dbConn.nodeService.events = dbConn.nodeService.events || {};
    dbConn.nodeService.events[ eventName ] = dbConn.nodeService.events[ eventName ] || [];
    dbConn.nodeService.events[ eventName ].push( fn );

    if ( dbConn.nodeService.isInitialized ) {
      if ( eventName === 'initialize' ) {
        dbConn.nodeService.isInitialized = true;
        fn( databaseId );
      }
    } else {
      if ( eventName === 'destroy' ) {
        dbConn.nodeService.isInitialized = false;
        fn( databaseId );
      }
    }
  };
};
},{}],8:[function(require,module,exports){
/*globals angular*/

'use strict';

module.exports = function($q, dataStoreService) {

    this.getAvailableProjectTags = function(databaseId) {
        var dbConn = dataStoreService.getDatabaseConnection(databaseId),
            deferred = $q.defer();
        dbConn.projectService = dbConn.projectService || {};
        dbConn.client.getAllInfoTagsAsync(function(err, results) {
            var tagKeys,
                tags = [];
            if (err) {
                deferred.reject(err);
                return;
            }

            tagKeys = Object.keys(results);
            for (var i = tagKeys.length - 1; i >= 0; i--) {
                tags.push({
                    id: tagKeys[i],
                    name: results[tagKeys[i]]
                });
            }

            deferred.resolve(tags);
        });

        return deferred.promise;
    };

    this.applyTagsOnProject = function(databaseId, projectId, newTags) {
        var dbConn = dataStoreService.getDatabaseConnection(databaseId),
            deferred = $q.defer(),
            mappedTags = {},
            tagMapper = function(tag){
              mappedTags[tag.id] = tag.name;
            };
        dbConn.projectService = dbConn.projectService || {};
        dbConn.client.getProjectInfoAsync(projectId, function(err, existingInfo) {
            if (err) {
                deferred.reject(err);
                return;
            }
            // Transform the tags to key-value format
            angular.forEach(newTags, tagMapper);
            existingInfo.tags = mappedTags;
            dbConn.client.setProjectInfoAsync(projectId, existingInfo, function(errInfo) {
                if (errInfo) {
                    deferred.reject(errInfo);
                    return;
                }
                deferred.resolve();
            });
        });

        return deferred.promise;
    };

    this.getAvailableProjects = function(databaseId) {
        var dbConn = dataStoreService.getDatabaseConnection(databaseId),
            deferred = $q.defer();
        dbConn.projectService = dbConn.projectService || {};
        dbConn.client.getAvailableProjectsAsync(function(err, projects) {
            if (err) {
                deferred.reject(err);
                return;
            }

            deferred.resolve(projects);
        });

        return deferred.promise;
    };

    this.getProjects = function(databaseId) {
        var dbConn = dataStoreService.getDatabaseConnection(databaseId),
            deferred = new $q.defer();

        dbConn.projectService = dbConn.projectService || {};

        dbConn.client.getFullProjectsInfoAsync(function(err, result) {
            var projectTags,
                branches,
                projects = [],
                projectMapper,
                projectTagsMapper,
                branchMapper;

            projectTagsMapper = function(tagName, tagId) {
                projectTags.push({
                    id: tagId,
                    name: tagName
                });
            };

            branchMapper = function(commitId, branchId) {
                branches.push({
                    branchId: branchId,
                    commitId: commitId
                });
            };

            projectMapper = function(project, projectId) {
              projectTags = [];
              branches = [];

              project.info = project.info || {};

              // Transform tags
              angular.forEach(project.info.tags, projectTagsMapper);
              project.info.tags = projectTags;

              // Transform branches
              angular.forEach(project.branches, branchMapper);

              // Transform project
              projects.push({
                id: projectId,
                branches: branches,
                info: project.info,
                rights: project.rights
              });
            };

            if (err) {
                deferred.reject(err);
                return;
            }

            angular.forEach(result, projectMapper);
            deferred.resolve(projects);
        });
        return deferred.promise;
    };

    this.getProjectsIds = function(databaseId) {
        var dbConn = dataStoreService.getDatabaseConnection(databaseId),
            deferred = new $q.defer();

        dbConn.projectService = dbConn.projectService || {};

        dbConn.client.getAvailableProjectsAsync(function(err, projectIds) {
            if (err) {
                deferred.reject(err);
                return;
            }

            deferred.resolve(projectIds);
        });

        return deferred.promise;
    };

    this.createProject = function(databaseId, projectname, projectInfo) {
        var dbConn = dataStoreService.getDatabaseConnection(databaseId),
            deferred = new $q.defer();

        dbConn.client.createProjectAsync(projectname, projectInfo, function(err) {
            if (err) {
                deferred.reject(err);
                return;
            } else {
                deferred.resolve();
            }
        });

        return deferred.promise;
    };

    this.deleteProject = function(databaseId, projectname) {
        var dbConn = dataStoreService.getDatabaseConnection(databaseId),
            deferred = new $q.defer();

        dbConn.client.deleteProjectAsync(projectname, function(err) {
            if (err) {
                deferred.reject(err);
                return;
            } else {
                deferred.resolve();
            }
        });

        return deferred.promise;
    };

    this.selectProject = function(databaseId, projectId) {
        var dbConn = dataStoreService.getDatabaseConnection(databaseId),
            deferred = new $q.defer();

        dbConn.projectService = dbConn.projectService || {};

        this.getProjectsIds(databaseId)
            .then(function(projectIds) {
                if (projectIds.indexOf(projectId) > -1) {
                    dbConn.client.selectProjectAsync(projectId, function(err) {
                        if (err) {
                            deferred.reject(err);
                            return;
                        }

                        dbConn.projectService.projectId = projectId;

                        deferred.resolve(projectId);
                    });
                } else {
                    deferred.reject(new Error('Project does not exist. ' + projectId + ' databaseId: ' +
                        databaseId));
                }
            })
            .
        catch(function(reason) {
            deferred.reject(reason);
        });

        return deferred.promise;
    };

    this.watchProjects = function( /*databaseId*/ ) {
        // TODO: register for project events
        // TODO: SERVER_PROJECT_CREATED
        // TODO: SERVER_PROJECT_DELETED

        throw new Error('Not implemented yet.');
    };

    this.on = function(databaseId, eventName, fn) {
        var dbConn,
            i;

        console.assert(typeof databaseId === 'string');
        console.assert(typeof eventName === 'string');
        console.assert(typeof fn === 'function');

        dbConn = dataStoreService.getDatabaseConnection(databaseId);
        dbConn.projectService = dbConn.projectService || {};

        dbConn.projectService.isInitialized = dbConn.projectService.isInitialized || false;

        if (typeof dbConn.projectService.events === 'undefined') {
            // this should not be an inline function

            dbConn.client.addEventListener(dbConn.client.events.PROJECT_OPENED,
                function(dummy /* FIXME */ , projectId) {

                    if (dbConn.projectService.projectId !== projectId) {
                        dbConn.projectService.projectId = projectId;

                        console.log('There was a PROJECT_OPENED event', projectId);
                        if (projectId) {
                            // initialize
                            if (dbConn.projectService &&
                                dbConn.projectService.events &&
                                dbConn.projectService.events.initialize) {

                                dbConn.projectService.isInitialized = true;

                                for (i = 0; i < dbConn.projectService.events.initialize.length; i += 1) {
                                    dbConn.projectService.events.initialize[i](databaseId);
                                }
                            }
                        } else {
                            // branchId is falsy, empty or null or undefined
                            // destroy
                            if (dbConn.projectService &&
                                dbConn.projectService.events &&
                                dbConn.projectService.events.destroy) {

                                dbConn.projectService.isInitialized = false;

                                for (i = 0; i < dbConn.projectService.events.destroy.length; i += 1) {
                                    dbConn.projectService.events.destroy[i](databaseId);
                                }
                            }
                        }
                    }
                });

            dbConn.client.addEventListener(dbConn.client.events.PROJECT_CLOSED,
                function( /*dummy*/ /* FIXME */ ) {
                    console.log('There was a PROJECT_CLOSED event', dbConn.projectService.projectId);

                    delete dbConn.projectService.projectId;

                    // destroy
                    if (dbConn.projectService &&
                        dbConn.projectService.events &&
                        dbConn.projectService.events.destroy) {

                        dbConn.projectService.isInitialized = false;

                        for (i = 0; i < dbConn.projectService.events.destroy.length; i += 1) {
                            dbConn.projectService.events.destroy[i](databaseId);
                        }
                    }

                });
        }

        dbConn.projectService.events = dbConn.projectService.events || {};
        dbConn.projectService.events[eventName] = dbConn.projectService.events[eventName] || [];
        dbConn.projectService.events[eventName].push(fn);

        if (dbConn.projectService.isInitialized) {
            if (eventName === 'initialize') {
                fn(databaseId);
            }
        } else {
            if (eventName === 'destroy') {
                fn(databaseId);
            }
        }
    };
};

},{}],9:[function(require,module,exports){
/*globals angular, require*/

'use strict';

var DataStoreServiceClass = require( './DataStoreService.js' ),
  ProjectServiceClass = require( './ProjectService/ProjectService.js' ),
  BranchServiceClass = require( './BranchService.js' ),
  NodeServiceClass = require( './NodeService.js' );

angular.module( 'gme.services', [] )
  .service( 'dataStoreService', DataStoreServiceClass )
  .service( 'projectService', ProjectServiceClass )
  .service( 'branchService', BranchServiceClass )
  .service( 'nodeService', NodeServiceClass );
},{"./BranchService.js":5,"./DataStoreService.js":6,"./NodeService.js":7,"./ProjectService/ProjectService.js":8}],10:[function(require,module,exports){
/*globals angular, require*/

'use strict';

var ProjectServiceTestClass = require( './tests/ProjectServiceTest.js' );

angular.module( 'gme.testServices', [] )
  .service( 'projectServiceTest', ProjectServiceTestClass );

},{"./tests/ProjectServiceTest.js":11}],11:[function(require,module,exports){
'use strict';

require('../gmeServices.js');

module.exports = function($q, dataStoreService, projectService) {
    var testProjects = [{
        projectName: 'ProjectServiceTest1',
        projectInfo: {
            visibleName: 'ProjectServiceTest1',
            description: 'project in webGME',
            tags: {
                tag1: 'Master'
            }
        }
    }, {
        projectName: 'ProjectServiceTest2',
        projectInfo: {
            visibleName: 'ProjectServiceTest2',
            description: 'project in webGME',
            tags: {
                tag1: 'Master'
            }
        }
    }];

    this.startTest = function() {
        var deferred = new $q.defer(),
            index = 0;

        dataStoreService.connectToDatabase('multi', {
                host: window.location.basename
            })
            .then(function() {
              //projectService.applyTagsOnProject('multi','ProjectServiceTest2',[{id:'t1', name:'alma1'},{id:'t2', name:'korte2'}]);
                //projectService.deleteProject('multi', 'ProjectServiceTest1').then(function() {
                    projectService.getAvailableProjects('multi').then(function(names) {
                        if (names) {
                            var createProjectPromises = [];

                            for (index = 0; index < testProjects.length; index++) {
                                // If testProject doesn't exist
                                if (names.indexOf(testProjects[index].projectName) === -1) {
                                    createProjectPromises.push(projectService.createProject('multi', testProjects[index].projectName,
                                        testProjects[index].projectInfo));
                                }
                            }

                            // Waiting for the createProject promise
                            if (createProjectPromises.length > 0) {
                                $q.all(createProjectPromises).then(function() {
                                    deferred.resolve();
                                });
                            } else {
                                deferred.resolve();
                            }
                        }
                    });
                //});
            });

        return deferred.promise;
    };
};

},{"../gmeServices.js":9}]},{},[1]);
