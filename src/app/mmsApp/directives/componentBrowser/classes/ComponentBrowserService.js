/*globals angular, ga */

'use strict';

module.exports = function (symbolManager, $log, $rootScope, $q, componentLibrary) {

    var config,

        treeNavigatorData,
        treeNodesById,

        classNodes,
        componentNodes,

        initializeWithNodes,
        showNode,

        parseComponentNodes,
        parseComponentNode,

        parseClassNodeTree,
        parseClassNode,

        parseComponentNodeExtraInfo,
        findSymbolForClassNode,

        //organizeTree,

        getNodeContextmenu,
        getComponentById,

        mapFromClassNamesToSymbolTypes;

    mapFromClassNamesToSymbolTypes = require('./ClassNamesToSymbolTypes')();

    treeNodesById = {};
    componentNodes = {};

    $log.debug('In ComponentBrowserService');

    getNodeContextmenu = function (node) {

        var contextMenu;


        if (componentNodes[node.id]) {

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
        extraInfoTemplateUrl: '/mmsApp/templates/componentExtraInfo.html',

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

                            angular.forEach(classNodes, function (parentNode) {

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
                ]
            }
        ],

        loadChildren: function (e, node) {
            console.log( 'loadChildren called:', node );

            var childCategoriesDeferred = $q.defer(),
                childComponentsDeferred = $q.defer();

            if (node.childCategoriesCount) {

                componentLibrary.getClassificationTree(node.id)

                    .then(function(data){
                        parseClassNodeTree(node, data);
                        childCategoriesDeferred.resolve();
                    });

            } else {
                childCategoriesDeferred.resolve();
            }

            if (node.childComponentCount) {

                componentLibrary.getListOfComponents(node.id, 10, 0)

                    .then(function(data){
                        parseComponentNodes(node, data);
                        childComponentsDeferred.resolve();
                    });

            } else {
                childComponentsDeferred.resolve();
            }



            return $q.all([childCategoriesDeferred.promise, childComponentsDeferred.promise]);
        },


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

    parseComponentNodeExtraInfo = function(node) {

        var extraInfo;

        if (angular.isObject(node) && angular.isObject(node.interfaces)) {

            if (angular.isObject(node.interfaces.properties)) {

                extraInfo = extraInfo || {};

                extraInfo.properties = {};

                angular.forEach(node.interfaces.properties, function(property, key) {

                    extraInfo.properties[key] = property;

                });
            }

        }

        node.extraInfo = extraInfo;

    };

    parseComponentNodes = function(parentNode, children) {

        if (parentNode && Array.isArray(children)) {

            angular.forEach(children, function(child) {
                parseComponentNode(child, parentNode);
            });

        }

    };

    parseComponentNode = function (nodeDescriptor, parentNode) {

        var node;

        node = treeNodesById[ nodeDescriptor.id ];

        if (!angular.isObject(node)) {

            node = {
                id: nodeDescriptor.id,
                label: nodeDescriptor.name,
                classificationLabels: nodeDescriptor.classificationLabels,
                prominentProperties: nodeDescriptor.prominentProperties,
                otherProperties: nodeDescriptor.otherProperties,
                position: nodeDescriptor.position,
                parentNode: parentNode,
                draggable: true,
                dragChannel: 'component',
                dropChannel: 'noDrop'
            };

            parseComponentNodeExtraInfo(node);

            parentNode.children.push(node);
            componentNodes[node.id] = node;
            treeNodesById[node.id] = node;

        }

    };

    parseClassNodeTree = function(fromNode, children) {

        if (fromNode && Array.isArray(children)) {

            angular.forEach(children, function(child) {
                parseClassNode(child, fromNode);
            });

        }

    };

    parseClassNode = function (nodeDescriptor, parentNode) {

        var node;

        node = treeNodesById[ nodeDescriptor.id ];

        if (!angular.isObject(node)) {

            node = {
                id: nodeDescriptor.id,
                label: nodeDescriptor.label,
                description: null,
                parentNode: parentNode,
                draggable: false,
                childrenCount: nodeDescriptor.childCategoriesCount + nodeDescriptor.childComponentsCount,
                childCategoriesCount: nodeDescriptor.childCategoriesCount,
                childComponentCount: nodeDescriptor.childComponentsCount,
                categoryTotal: nodeDescriptor.categoryTotal
            };

            if (node.categoryTotal > 0) {

                node.extraInfo = node.extraInfo || {};
                node.extraInfo.categoryTotal = node.categoryTotal;
            }

            classNodes[node.id] = node;
            treeNodesById[node.id] = node;
            parentNode.children.push(node);

            if (node.childrenCount) {
                node.children = [];
            }

            if (Array.isArray(nodeDescriptor.subClasses)) {
                parseClassNodeTree(node, nodeDescriptor.subClasses);
            }

        }

    };

    initializeWithNodes = function (nodes) {

        var rootNode;

        treeNodesById = {};
        classNodes = {};
        componentNodes = {};

        rootNode = (
            'root',
            {
                label: 'Root node',
                children: []
            }
        );

        classNodes.root = rootNode;

        treeNavigatorData.data = rootNode;
        parseClassNodeTree(rootNode, nodes);

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

    getComponentById = function(nodeId) {

        return treeNodesById[nodeId];

    };


    treeNavigatorData = {
        data: {},
        config: config
    };


    this.treeNavigatorData = treeNavigatorData;

    this.initializeWithNodes = initializeWithNodes;
    this.showNode = showNode;

    this.getComponentById = getComponentById;

};
