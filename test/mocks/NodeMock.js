/*globals define*/
/*
 * Copyright (C) 2014 Vanderbilt University, All rights reserved.
 *
 * Author: Zsolt Lattmann
 */


define([], function () {
    'use strict';
    function generateGUID() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    var NodeMock = function (core, options) {

        NodeMock._nodes.push(this);

        this.ID = NodeMock._nodes.length;
        if (options.attr) {
            this.attributes = options.attr;
        } else {
            this.attributes = {
                name: ''
            };
        }

        this.registry = {
            DisplayFormat: '',
            PortSVGIcon: '',
            SVGIcon: '',
            decorator: '',
            isAbstract: '',
            isPort: '',
            position: {
                x: 0,
                y: 0
            }
        };

        this.pointers = {
            base: null
        };

        if (options.base) {
            this.pointers.base = core.getPath(options.base);
            if (this.pointers.base) {
            } else {
                throw new Error(options.base + " not found");
            }
        }

        this.collection = {};
        this.path = options.parent ? core.getPath(options.parent) + '/' + this.ID : '/' + this.ID;
        this.guid = generateGUID();
        this.parent = options.parent ? core.getPath(options.parent) : null;
        this.children = [];

        if (options.parent) {
            core.addChild(options.parent, this);
        }
    };

    NodeMock.prototype.clone = function (core, parent, nodes) {
        var orig = this;
        var Temp = function () {
            NodeMock._nodes.push(this);

            this.ID = NodeMock._nodes.length;
            this.guid = generateGUID();
            this.parent = core.getPath(parent);
            this.path = this.parent + '/' + this.ID;
            nodes[this.path] = this;

            this.children = [];
            for (var i = 0; i < orig.children.length; i++) {
                var child = nodes[orig.children[i]].clone(core, this, nodes);
            }

            var copy = JSON.parse(JSON.stringify(orig));
            for (var key in copy) {
                if (orig.hasOwnProperty(key) && !this.hasOwnProperty(key)) {
                    this[key] = copy[key];
                }
            }
        };
        Temp.prototype = NodeMock.prototype;

        var that = new Temp;
        // FIXME: fix pointers
        parent.children.push(that.path);
        return that;
    };

    NodeMock._nodes = [];

    return NodeMock;
});
