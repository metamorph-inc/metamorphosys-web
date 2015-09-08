/*globals angular, console*/

angular.module('cyphy.services')
    .service('gmeMapService', function ($q, $timeout, nodeService, baseCyPhyService, pluginService) {
        'use strict';

        this.mapGmeNode = function (parentContext, nodeId, mapping) {
            var GmeMapping = function GmeMappingConstructor(map, rootId) {
                var self = this;
                this.map = map;
                this.data = {};
                this.nodes = {};
                this.rootId = rootId;
                this.loaded = $q.defer();
                var regionId = parentContext.regionId + '_watch_' + rootId;
                var context = this.context = {
                    db: parentContext.db,
                    regionId: regionId
                };
                nodeService.getMetaNodes(context)
                    .then(function (meta) {
                        self.meta = meta;
                        return nodeService.loadNode(context, rootId);
                    })
                    .then(function (root) {
                        return self._processNode(root);
                    })
                    .then(function () {
                        self.loaded.resolve(self);
                    })
                    .catch(function (err) {
                        self.loaded.reject(err);
                    });
            };
            GmeMapping.prototype.destroy = function GmeMappingDestroy() {
                // TODO GmeMapping.prototype.destroy: unregister watchers, unload nodes
                // TODO does this work
                nodeService.cleanUpRegion(parentContext.db, this.regionId);
            };
            GmeMapping.prototype._setGmeAttributes = function GmeMapping_SetGmeAttributes(node, data) {
                var self = this,
                    attrs = (self.map[node.getMetaTypeName(self.meta)] || {}).attributes;
                for (var attr in attrs || {}) {
                    // data.name = node.getAttribute('name');
                    if (node.getAttribute(attr) !== data[attrs[attr]] && data[attrs[attr]]) {
                        // TODO inherit from meta if data[attrs[attr]]===undefined
                        node.setAttribute(attr, data[attrs[attr]]);
                    }
                }
            };
            GmeMapping.prototype.update = function GmeMappingUpdate() {
                // TODO: start tx
                var self = this;

                for (var nodeId in self.nodes) {
                    var node = self.nodes[nodeId];
                    var data = self._getNodeData(node);
                    if (data === undefined) {
                        // TODO: delete in gme
                        continue;
                    }
                    self._setGmeAttributes(node, data);
                }
                (function addNewGmeNodes() {
                    var q = [[self.data, undefined, self.nodes[self.rootId]]],
                        getEnqueueFn = function (kind, parent) {
                            return function (childData) {
                                q.push([childData, kind, parent]);
                            };
                        };
                    while (q.length) {
                        var popped = q.pop(),
                            data = popped[0],
                            kind = popped[1],
                            parent = popped[2],
                            recurse = function(data) {
                                for (var attr in data) {
                                    if (angular.isArray(data[attr])) {
                                        data[attr].forEach(getEnqueueFn(attr, self.nodes[data._id]));
                                    }
                                }
                            };
                        if (!data._id) {
                            data._id = nodeService.createChild(self.context,
                                {
                                    parentId: parent.getId(),
                                    baseId: self.meta.byName[kind].getId()
                                });
                            nodeService.loadNode(self.context, data._id)
                                .then(function () {
                                    self._setGmeAttributes(node, data);
                                    recurse(data);
                                });
                            //delete data.__promise;
                            //setNodeAttributes(node, data);
                            //recurse(data);
                            // self.nodes[data._id] = data;
                            //data._id = newNode.getId();
                            //self.nodes[data._id] = newNode;
                        } else {
                            recurse(data);
                        }
                    }
                })();
            };
            GmeMapping.prototype._onUnload = function GmeMappingOnUnload(id, kind) {
                var self = this;
                if (id === self.rootId) {
                    // TODO check this
                    angular.copy({}, self.data);
                    self.nodes = {};
                } else {
                    var ids = id.split('/');
                    ids.pop();
                    var parentId = ids.join('/');
                    var parent = self.nodes[parentId];
                    if (parent) { // could be deleted already
                        var parentData = self._getNodeData(parent);
                        parentData[kind] = parentData[kind].filter(function (child) {
                            return child._id !== id;
                        });
                    }
                    delete self.nodes[id];
                }

            };
            GmeMapping.prototype._getNodeData = function GmeMappingGetNodeData(node, create) {
                if (node.getId() === this.rootId) {
                    return this.data;
                }
                var self = this,
                    id = node.getId(),
                    subId = id.substr(this.rootId.length + '/'.length),
                    data = this.data,
                    parentsId = '';

                subId.split('/').forEach(function (parentId) {
                    if (data === undefined) {
                        return undefined;
                    }
                    parentsId += '/' + parentId;
                    var kind = self.nodes[self.rootId + parentsId].getMetaTypeName(self.meta);
                    data[kind] = data[kind] || [];
                    var childDatas = data[kind].filter(function (child) {
                        return child._id === self.rootId + '/' + parentId;
                    });
                    if (childDatas.length === 0) {
                        if (create) {
                            childDatas = [{}];
                            data[kind].push(childDatas[0]);
                        } else {
                            data = undefined;
                            return undefined;
                        }
                    }
                    data = childDatas[0];
                });
                return data;
            };
            GmeMapping.prototype._processNode = function GmeMappingProcessNode(node) {
                if (this.nodes[node.getId()]) {
                    // already loaded; first load can do this since loadChildren triggers onNewChildLoaded
                    return;
                }
                var self = this,
                    kind = node.getMetaTypeName(self.meta),
                    onUnload = function (id) {
                        self._onUnload(id, kind);
                    },
                    data;
                self.nodes[node.getId()] = node;
                data = this._getNodeData(node, true);
                data._id = node.getId();
                self._setGmeAttributes(node, data);  // if created thru GmeMapping, data may already have attributes
                self._setNodeAttributes(node, data);
                node.onNewChildLoaded(function (newChild) {
                    if (self.map[newChild.getMetaTypeName(self.meta)]) {
                        self._processNode(newChild);
                    }
                });
                node.onUnload(onUnload);
                node.onUpdate(function (id) {
                    self._setNodeAttributes(self.nodes[id], data); // TODO can the data reference become stale
                });
                return this._loadChildren(node);
            };
            GmeMapping.prototype._setNodeAttributes = function GmeMappingSetNodeAttributes(node, data) {
                var self = this,
                    attrs = (self.map[node.getMetaTypeName(self.meta)] || {}).attributes;
                for (var attr in attrs || {}) {
                    // data.name = node.getAttribute('name');
                    data[attrs[attr]] = node.getAttribute(attr);
                }
                // TODO registry
                // TODO pointers
            };
            GmeMapping.prototype._loadChildren = function GmeMappingLoadChildren(node) {
                var self = this;

                return node.loadChildren()
                    .then(function (children) {
                        var chillens = children.filter(function (child) {
                            return self.map[child.getMetaTypeName(self.meta)];
                        }).map(function (child) {
                            return self._processNode(child);
                        });
                        return $q.all(chillens);
                    });
            };

            var gmeMap = new GmeMapping(mapping, nodeId);
            return gmeMap.loaded.promise;
        };

    });
