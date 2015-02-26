/*globals define*/
/*
 * Copyright (C) 2014 Vanderbilt University, All rights reserved.
 *
 * Author: Zsolt Lattmann
 */


define(['./NodeMock'], function (NodeMock) {
    'use strict';
    var CoreMock = function (timeOut) {
        this._nodes = {};
        this._timeOut = timeOut || 0;
        var options = {};
        var node = new NodeMock(this, options);
        this._nodes[this.getPath(node)] = node;
        this._rootNode = node;
    };

    CoreMock.prototype.createNode = function (options) {
        // FIXME: add error handling

        var node = new NodeMock(this, options);

        this._nodes[this.getPath(node)] = node;

        return node;
    };

    CoreMock.prototype.copyNode = function (node, parentNode) {
        var newNode = node.clone(this, parentNode, this._nodes);

        return newNode;
    }

    CoreMock.prototype.addChild = function (node, child) {
        node.children.push(this.getPath(child));
    };

    CoreMock.prototype.getPath = function (node) {
        return node.path;
    };

    CoreMock.prototype.getName = function (node) {
        return node.attributes.name;
    };

    CoreMock.prototype.getRelid = function (node) {
        return node.ID;
    };

    CoreMock.prototype.setAttribute = function (node, name, value) {
        node.attributes[name] = value;
    };

    // TODO: should attribute look up be inherited?
    CoreMock.prototype.getAttribute = function (node, name) {
        var self = this;
        do {
            if (node.attributes[name] !== undefined) {
                return node.attributes[name];
            }
            node = self.getBase(node);
        } while (node);
    };
    // TODO: Here it does not look for inheritance.
    CoreMock.prototype.getAttributeNames = function (node) {
        return Object.keys(node.attributes);
    };
    CoreMock.prototype.getOwnAttributeNames = CoreMock.prototype.getAttributeNames;

    CoreMock.prototype.setRegistry = function (node, name, value) {
        node.registry[name] = value;
    };

    CoreMock.prototype.getRegistry = function (node, name) {
        return node.registry[name];
    };

    CoreMock.prototype.getRegistryNames = function getRegistryNames(node) {
        return Object.keys(node.registry);
    }

    CoreMock.prototype.getOwnRegistryNames = CoreMock.prototype.getRegistryNames;

    CoreMock.prototype.getPointerNames = function (node) {
        return Object.keys(node.pointers);
    };

    CoreMock.prototype.getOwnPointerNames = CoreMock.prototype.getPointerNames;

    CoreMock.prototype.setPointer = function (node, name, target) {
        node.pointers[name] = target.path;
        if (target.collection[name]) {
            target.collection[name].push(node.path);
        } else {
            target.collection[name] = [node.path];
        }
    };

    CoreMock.prototype.hasPointer = function (node, name) {
        // TODO: Should this return true for null pointers?
        return node.pointers.hasOwnProperty(name);
    };

    CoreMock.prototype.addMember = function (node, name, member) {
        node.pointers[name] = node.pointers[name] || [];
        node.pointers[name].push(member.path);
    };

    CoreMock.prototype.getMemberPaths = function (node, name) {
        return node.pointers[name] || [];
    };

    CoreMock.prototype.getBase = function (node) {
        if (node.pointers.base === null) {
            return null;
        }
        return this._nodes[node.pointers.base];
    };

    CoreMock.prototype.getParent = function (node) {
        return this._nodes[node.parent];
    };

    CoreMock.prototype.getChildrenPaths = function (node) {
        return Object.keys(node.children);
    };

    CoreMock.prototype.getGuid = function (node) {
        return node.guid;
    };

    CoreMock.prototype.getCollectionNames = function (node) {
        return Object.keys(node.collection);
    };

// ------------------------- Asynchronous methods ---------------------------------

    CoreMock.prototype.loadByPath = function (node, pathToObject, callback) {
        var self = this,
            timeOutFunction = function () {
                var err,
                    node;

                if (self._nodes.hasOwnProperty(pathToObject)) {
                    node = self._nodes[pathToObject];
                } else {
                    err = 'Given path : ' + pathToObject + 'does not exist!';
                }

                callback(err, node);
            };
        setTimeout(timeOutFunction, Math.random() * self._timeOut);
    };


    CoreMock.prototype.loadChildren = function (node, callback) {
        var self = this,
            timeOutFunction = function () {
                var err,
                    childNodes = [],
                    i;
                for (i = 0; i < node.children.length; i += 1) {
                    childNodes.push(self._nodes[node.children[i]]);
                }

                callback(err, childNodes);
            };

        setTimeout(timeOutFunction, Math.random() * this._timeOut);
    };

    CoreMock.prototype.loadPointer = function (node, name, callback) {
        var self = this,
            timeOutFunction = function () {
                var err,
                    pointer;
                if (self.hasPointer(node, name)) {
                    pointer = self._nodes[node.pointers[name]];
                } else {
                    err = self.getAttribute(node, 'name') + ' does not have a pointer ' + name;
                }
                callback(err, pointer);
            };

        setTimeout(timeOutFunction, Math.random() * self._timeOut);
    };

    CoreMock.prototype.loadCollection = function (node, name, callback) {
        var self = this,
            timeOutFunction = function () {
                var colNodes = [],
                    err,
                    i,
                    nodeIds = node.collection[name];
                if (nodeIds) {
                    for (i = 0; i < nodeIds.length; i += 1) {
                        colNodes.push(self._nodes[nodeIds[i]]);
                    }
                } else {
                    err = self.getAttribute(node, 'name') + ' does not have a collection ' + name;
                }
                callback(err, colNodes);
            };
        setTimeout(timeOutFunction, Math.random() * self._timeOut);
    };

    return CoreMock;
});
