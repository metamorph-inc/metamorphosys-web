/*globals angular*/

/**
 * @author pmeijer / https://github.com/pmeijer
 */


angular.module('cyphy.services')
    .service('designLayoutService', function ($q, $timeout, nodeService, baseCyPhyService) {
        'use strict';
        var watchers;

        watchers = {};

        this.watchDiagramElements = function (parentContext, containerId, updateListener) {

            var deferred,
                regionId,
                context,

                data,

                metaNamesById,

                onChildUnload,
                onChildUpdate,

                parseNewChild,
                findChildForNode;

            deferred = $q.defer();
            regionId = parentContext.regionId + '_watchDiagramElements_' + containerId;
            context = {
                db: parentContext.db,
                regionId: regionId
            };

            data = {
                regionId: regionId,
                elements: {}
            };


            findChildForNode = function (node) {

                var baseName,
                    child;

                baseName = metaNamesById[ this.getBaseId() ];

                if (baseName) {

                    data.elements[ baseName ] = data.elements[ baseName ] || {};
                    child = data.elements[ baseName ][ node.getId() ];
                }

                return child;

            };

            onChildUpdate = function (id) {

                var newName,
                    newPos,
                    hadChanges,
                    child;

                // BaseName never changes, does it?

                child = findChildForNode(this);

                if (child) {

                    newName = this.getAttribute('name');
                    newPos = this.getRegistry('position');
                    hadChanges = false;

                    if (newName !== child.name) {
                        child.name = newName;
                        hadChanges = true;
                    }

                    if (newPos.x !== child.position.x || newPos.y !== child.position.y) {
                        child.position = newPos;
                        hadChanges = true;
                    }

                    if (hadChanges) {
                        $timeout(function () {
                            updateListener({
                                id: id,
                                type: 'update',
                                data: child
                            });
                        });
                    }


                }

            };

            onChildUnload = function (id) {

                var child;

                child = findChildForNode(this);

                if (child) {
                    delete data.elements[ child.baseName][ id ];
                }

                $timeout(function () {
                    updateListener({
                        id: id,
                        type: 'unload',
                        data: null
                    });
                });
            };


            parseNewChild = function (node) {

                var child;
                
                child = {
                    id: node.getId(),
                    name: node.getAttribute('name'),
                    position: node.getRegistry('position'),
                    baseId: node.getBaseId()
                };

                child.baseName = metaNamesById[ child.baseId ];

                if (child.baseName) {

                    data.elements[ child.baseName ] = data.elements[ child.baseName ] || {};
                    data.elements[ child.baseName ][ child.id ] = child;

                }

                node.onUpdate(onChildUpdate);
                node.onUnload(onChildUnload);

                return child;

            };

            watchers[ parentContext.regionId ] = watchers[ parentContext.regionId ] || {};
            watchers[ parentContext.regionId ][ regionId ] = context;

            nodeService.getMetaNodes(context)
                .then(function (meta) {

                    metaNamesById = {};

                    angular.forEach(meta, function (metaNode, name) {
                        metaNamesById[metaNode.id] = name;
                    });

                    nodeService.loadNode(context, containerId)
                        .then(function (rootNode) {
                            rootNode.loadChildren(context)
                                .then(function (childNodes) {
                                    var i,
                                        childId;

                                    for (i = 0; i < childNodes.length; i += 1) {
                                        parseNewChild(childNodes[i]);
                                    }

                                    rootNode.onNewChildLoaded(function (newNode) {

                                        var newChild;

                                        newChild = parseNewChild(newNode);

                                        $timeout(function () {
                                            updateListener({
                                                id: childId,
                                                type: 'load',
                                                data: newChild
                                            });
                                        });
                                    });

                                    deferred.resolve(data);
                                });
                        });
                });

            return deferred.promise;
        };

        /**
         * See baseCyPhyService.cleanUpAllRegions.
         */
        this.cleanUpAllRegions = function (parentContext) {
            baseCyPhyService.cleanUpAllRegions(watchers, parentContext);
        };

        /**
         * See baseCyPhyService.cleanUpRegion.
         */
        this.cleanUpRegion = function (parentContext, regionId) {
            baseCyPhyService.cleanUpRegion(watchers, parentContext, regionId);
        };

        /**
         * See baseCyPhyService.registerWatcher.
         */
        this.registerWatcher = function (parentContext, fn) {
            baseCyPhyService.registerWatcher(watchers, parentContext, fn);
        };
    });