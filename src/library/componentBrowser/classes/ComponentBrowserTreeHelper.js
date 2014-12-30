/*globals angular */

'use strict';

module.exports = function ($log) {

    var config,

        treeNavigatorData,
        treeNodesById,
        childNodes,

        initializeWithNodes,
        upsertItem,
        removeItem,

        parentNodes,

        createParentNode,
        parseClassifications,
        parseNode,
        parseNodeName,
        parseClassName,

        sortNodeTree,

        getNodeContextmenu;

    treeNodesById = {};

    childNodes = [];

    getNodeContextmenu = function (node) {

        var defaultNodeContextmenu = [
            {
                items: [
                    {
                        id: 'create',
                        label: 'Create new',
                        disabled: true,
                        iconClass: 'fa fa-plus',
                        menu: []
                    },
                    {
                        id: 'dummy',
                        label: 'Just for test ' + node.id,

                        actionData: node,

                        action: function (data) {
                            $log.log('testing ', data);
                        }

                    },
                    {
                        id: 'rename',
                        label: 'Rename'
                    },
                    {
                        id: 'preferences 3',
                        label: 'Preferences 3',
                        menu: [
                            {
                                items: [
                                    {
                                        id: 'sub_preferences 1',
                                        label: 'Sub preferences 1'
                                    },
                                    {
                                        id: 'sub_preferences 2',
                                        label: 'Sub preferences 2',
                                        action: function (data) {
                                            $log.log('testing2 ', data);
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

        return defaultNodeContextmenu;

    };


    config = {

//        scopeMenu: [
//            {
//                items: [
//                    {
//                        id: 'project',
//                        label: 'Project Hierarchy',
//                        action: function () {
//                            config.state.activeScope = 'project';
//                            config.selectedScope = config.scopeMenu[ 0 ].items[ 0 ];
//                        }
//                    },
//                    {
//                        id: 'composition',
//                        label: 'Composition',
//                        action: function () {
//                            config.state.activeScope = 'composition';
//                            config.selectedScope = config.scopeMenu[ 0 ].items[ 1 ];
//                        }
//                    }
//                ]
//            }
//
//        ],
//
        nodeClassGetter: function (node) {

            var result;

            result = '';

            if (node.childrenCount) {
                result = 'parent-node';
            }

            return result;
        },

        preferencesMenu: [
            {
                items: [
                    {
                        id: 'expandAll',
                        label: 'Expand all',
                        iconClass: 'fa fa-plus-square',
                        action: function () {

                            treeNavigatorData.config.state = treeNavigatorData.config.state || {};
                            treeNavigatorData.config.state.expandedNodes = treeNavigatorData.config.state.expandedNodes || [];

                            angular.forEach(parentNodes, function (parentNode) {

                                if (treeNavigatorData.config.state.expandedNodes.indexOf(parentNode.id) === -1) {
                                    treeNavigatorData.config.state.expandedNodes.push(parentNode.id);
                                }

                            });

                        }
                    },

                    {
                        id: 'collapseAll',
                        label: 'Collapse all',
                        iconClass: 'fa fa-minus-square',
                        action: function () {

                            treeNavigatorData.config.state = treeNavigatorData.config.state || {};
                            treeNavigatorData.config.state.expandedNodes = [];

                        }
                    }
//
//                    {
//                        id: 'preferences 3',
//                        label: 'Preferences 3',
//                        menu: [
//                            {
//                                items: [
//                                    {
//                                        id: 'sub_preferences 1',
//                                        label: 'Sub preferences 1'
//                                    },
//                                    {
//                                        id: 'sub_preferences 2',
//                                        label: 'Sub preferences 2',
//                                        action: function (data) {
//                                            $log.log(data);
//                                        }
//                                    }
//                                ]
//                            }
//                        ]
//                    }
                ]
            }
        ],

        showRootLabel: false,

        // Tree Event callbacks

        nodeClick: function (/*e, node*/) {
            ///console.log('Node was clicked:', node);
        },

        nodeDblclick: function (/*e, node*/) {
            //console.log('Node was double-clicked:', node);
        },

        nodeContextmenuRenderer: function (e, node) {
            //console.log('Contextmenu was triggered for node:', node);

            return getNodeContextmenu(node);

        },

        nodeExpanderClick: function (/*e, node, isExpand*/) {
            //console.log('Expander was clicked for node:', node, isExpand);
        }

    };

    createParentNode = function (id, descriptor, parentId) {

        var node,
            parentNode;

        node = parentNodes[id];

        if (!angular.isObject(node)) {

            node = {
                id: id,
                children: [],
                childrenCount: 0
            };

            angular.extend(node, descriptor);

            treeNodesById[id] = node;
            parentNodes[id] = node;

            if (parentId) {

                parentNode = parentNodes[parentId];

                if (parentNode) {

                    parentNode.children.push(node);
                    parentNode.childrenCount++;

                }

            }

        }

        return node;
    };


    parseClassName = function (crappyName) {

        var result;

        result = crappyName.replace(/_/g, ' ');

        return result;

    };


    parseClassifications = function (classifications) {
        var classes,
            classId,
            classNode,
            parentId,
            i;

        if (classifications) {

            classes = classifications.split('.');

        } else {

            classes = [ 'unclassified' ];

        }

        parentId = treeNavigatorData.data.id;

        for (i = 0; i < classes.length; i++) {

            classId = parentId + '_' + classes[i];

            classNode = createParentNode(
                classId,
                {
                    label: parseClassName(classes[i]),
                    draggable: true
                },
                parentId
            );

            parentId = classId;

        }

        return classNode;

    };


    parseNodeName = function (crappyName) {

        var result;

        result = crappyName.replace(/_/g, ' ');

        return result;

    };


    parseNode = function (nodeDescriptor) {

        var node,
            parentNode,
            label;

        node = treeNodesById[ nodeDescriptor.id ];

        if (!angular.isObject(node)) {

            parentNode = parseClassifications(nodeDescriptor.classifications);

            label = parseNodeName(nodeDescriptor.name);

            node = {
                id: nodeDescriptor.id,
                label: label,
                description: null
            };

            childNodes.push(node);

            parentNode.children.push(node);
            parentNode.childrenCount++;

        }

        //console.log(nodeDescriptor);

    };


    sortNodeTree = function (node) {

        var i;

        if (angular.isArray(node.children)) {

            node.children.sort(function(a, b){

                if(a.label < b.label) {
                    return -1;
                }

                if(a.label > b.label) {
                    return 1;
                }

                return 0;
            });

            for (i=0; i < node.children.length; i++ ) {
                sortNodeTree( node.children[ i ] );
            }

        }

    };

    initializeWithNodes = function (nodes) {

        var rootNode;

        treeNodesById = {};
        parentNodes = {};
        childNodes = [];

        rootNode = createParentNode(
            'root',
            {
                label: 'Root node'
            }
        );

        treeNavigatorData.data = rootNode;
        treeNavigatorData.childNodes = childNodes;

        angular.forEach(nodes, function (node) {

            parseNode(node);

        });

        sortNodeTree(treeNavigatorData.data);

    };

    upsertItem = function (/*data*/) {

        //TODO: complete this

//        var treeNode;
//
//        console.log(data);
//
//        if (treeNodesById[ data.id ]) {
//
//            treeNode = treeNodesById[ data.id ];
////            listItem.title = data.name;
////            listItem.description = data.description;
////            listItem.data.resource = data.resource;
//
//        } else {
//
//            treeNode = {
//
//            };
//
//            treeNodesById[ data.id ] = treeNode;
//
//        }

    };

    removeItem = function () {
        // TODO: complete this
    };


    treeNavigatorData = {
        data: {},
        config: config,
        childNodes: childNodes
    };


    this.treeNavigatorData = treeNavigatorData;

    this.initializeWithNodes = initializeWithNodes;
    this.upsertItem = upsertItem;
    this.removeItem = removeItem;

};
