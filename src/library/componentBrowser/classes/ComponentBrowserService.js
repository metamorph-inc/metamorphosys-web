/*globals angular, ga */

'use strict';

module.exports = function (symbolManager, $log, $rootScope) {

    var config,

        treeNavigatorData,
        treeNodesById,
        childNodes,

        initializeWithNodes,
        upsertItem,
        removeItem,
        showNode,
        upsertComponentInterface,

        parentNodes,

        createParentNode,
        parseClassifications,
        parseNode,
        parseNodeName,
        parseClassName,
        parseNodeExtraInfo,
        findSymbolForClassNode,

        organizeTree,

        getNodeContextmenu,
        getComponentById,

        mapFromClassNamesToSymbolTypes;

    mapFromClassNamesToSymbolTypes = require('./ClassNamesToSymbolTypes')();

    treeNodesById = {};

    childNodes = [];

    $log.debug('In ComponentBrowserService');

    getNodeContextmenu = function (node) {

        var contextMenu;


        if (childNodes.indexOf(node) > -1) {

            contextMenu = [
                {
                    items: [
                        {
                            id: 'addToDesign',
                            label: 'Add to design',
                            iconClass: 'fa fa-plus-circle',
                            action: function() {

                                ga('send', 'event', 'avmComponent', 'createFromContextmenu');

                                $rootScope.$emit('componentInstantiationMustBeDone', node);
                            }
                        }
                    ]
                }
            ];

        }

        return contextMenu;

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
        extraInfoTemplateUrl: '/cyphy-components/templates/componentExtraInfo.html',

        nodeClassGetter: function (node) {

            var result;

            result = '';

            if (node.childrenCount) {
                result = 'parent-node';
            } else {
                result = 'leaf-node';
            }

            if (node.symbol) {
                result += ' has-symbol';
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
                node.parentNode = parentNode;

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

    findSymbolForClassNode = function(classNode, rawClassName) {

        var symbolType,
            symbol;

        if (angular.isObject(symbolManager)) {

            symbolType = mapFromClassNamesToSymbolTypes[rawClassName];

            if (symbolType) {

                symbol = symbolManager.getSymbol(symbolType);

                classNode.symbol = symbol;
                classNode.extraInfo = classNode.extraInfo || {};

                classNode.extraInfo.symbol = symbol;

            }

        }


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
                    dropChannel: 'noDrop'
                },
                parentId
            );

            parentId = classId;

            findSymbolForClassNode(classNode, classes[i]);

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
                description: null,
                parentNode: parentNode,
                draggable: true,
                dragChannel: 'component',
                dropChannel: 'noDrop'
            };

            childNodes.push(node);

            treeNodesById[node.id] = node;

            parentNode.children.push(node);
            parentNode.childrenCount++;

        }

        //console.log(nodeDescriptor);

    };


    organizeTree = function (node) {

        var i,
            totalChildrenCount;


        if (node.childrenCount > 0) {
            totalChildrenCount = 0;
        } else {
            totalChildrenCount = 1;
        }

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
                totalChildrenCount += organizeTree( node.children[ i ] );
            }
            node.totalChildrenCount = totalChildrenCount;

            if (node.totalChildrenCount > 0) {

                node.extraInfo = node.extraInfo || {};

                node.extraInfo.totalChildrenCount = node.totalChildrenCount;
            }

        }

        return totalChildrenCount;

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

        organizeTree(treeNavigatorData.data);

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

    showNode = function(nodeId) {

        // TODO: make it part of TreeNaviagtor

        var node,
            parentNode;

        node = treeNodesById[nodeId];

        if (angular.isObject(node)) {

            parentNode = node.parentNode;

            while (parentNode) {

                if (treeNavigatorData.config.state.expandedNodes.indexOf(parentNode.id) === -1) {
                    treeNavigatorData.config.state.expandedNodes.push(parentNode.id);
                }

                parentNode = parentNode.parentNode;

            }

            treeNavigatorData.config.state.selectedNodes = [ nodeId ];
        }
    };

    parseNodeExtraInfo = function(node) {

        var extraInfo;

        if (angular.isObject(node) && angular.isObject(node.interfaces)) {

//            console.log(node.interfaces);

            if (angular.isObject(node.interfaces.properties)) {

                extraInfo = extraInfo || {};

                extraInfo.properties = {};

                angular.forEach(node.interfaces.properties, function(property, key) {

                    extraInfo.properties[key] = property;

                });

//                console.log(extraInfo.properties);

            }

        }

        node.extraInfo = extraInfo;

    };

    upsertComponentInterface = function(nodeId, interfaces) {

        var node;

        node = treeNodesById[nodeId];

        if (angular.isObject(node)) {

            interfaces = interfaces || {};

            node.interfaces = interfaces;

            parseNodeExtraInfo(node);

        }

    };

    getComponentById = function(nodeId) {

        return treeNodesById[nodeId];

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
    this.showNode = showNode;
    this.upsertComponentInterface = upsertComponentInterface;

    this.getComponentById = getComponentById;

};
