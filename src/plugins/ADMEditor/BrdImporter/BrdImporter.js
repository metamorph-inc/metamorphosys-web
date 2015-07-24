/* global define */
define([
    'plugin/PluginConfig',
    'plugin/PluginBase',
    'plugin/AdmImporter/AdmImporter/meta',
    'jszip',
    'xmljsonconverter',
    'q',
    'plugin/PluginContext',
    'blob/BlobClient',
    'superagent'
], function (PluginConfig, PluginBase, MetaTypes, JSZip, Converter, Q, PluginContext, BlobClient, superagent) {
    'use strict';
    //<editor-fold desc="============================ Class Definition ================================">
    /**
     * Initializes a new instance of BrdImporter.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin BrdImporter.
     * @constructor
     */
    var BrdImporter = function () {
        PluginBase.call(this);
        this.meta = MetaTypes;
    };

    // Prototypal inheritance from PluginBase.
    BrdImporter.prototype = Object.create(PluginBase.prototype);
    BrdImporter.prototype.constructor = BrdImporter;

    /**
     * Gets the name of the BrdImporter.
     * @returns {string} The name of the plugin.
     * @public
     */
    BrdImporter.prototype.getName = function () {
        return "BRD Importer";
    };

    /**
     * Gets the description of the BrdImporter.
     * @returns {string} The description of the plugin.
     * @public
     */
    BrdImporter.prototype.getDescription = function () {
        return "Imports an brd file generated from EAGLE.";
    };

    /**
     * Gets the semantic version (semver.org) of the BrdImporter.
     * @returns {string} The version of the plugin.
     * @public
     */
    BrdImporter.prototype.getVersion = function () {
        return "0.1.0";
    };

    /**
     * Gets the configuration structure for the BrdImporter.
     * The ConfigurationStructure defines the configuration for the plugin
     * and will be used to populate the GUI when invoking the plugin from webGME.
     * @returns {object} The version of the plugin.
     * @public
     */
    BrdImporter.prototype.getConfigStructure = function () {
        return [
            {
                'name': 'brdFile',
                'displayName': 'BRD file',
                'description': 'Board file',
                'value': '',
                'valueType': 'asset',
                'readOnly': false
            }
        ];
    };

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always have to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    BrdImporter.prototype.main = function (callback) {
        var self = this,
            config = self.getCurrentConfig(),
            saveAndFinish = function (err) {
                if (err) {
                    self.createMessage(null, err, 'error');
                    self.result.setSuccess(false);
                    callback(null, self.result);
                    return;
                }

                self.save('imported brd file', function (err) {
                    if (err) {
                        callback(null, self.result);
                        return;
                    }
                    self.result.setSuccess(true);
                    callback(null, self.result);
                });
            };

        if (!self.activeNode) {
            self.createMessage(null, 'Active node is not present', 'error');
            callback('Active node is not present', self.result);
            return;
        }

        if (self.isMetaTypeOf(self.activeNode, self.META.Container) === false) {
            self.result.setSuccess(false);
            self.createMessage(null, 'This plugin must be called from a Container', 'error');
            callback(null, self.result);
            return;
        }
        if (!config.brdFile) {
            self.createMessage(null, 'No brd file provided', 'error');
            callback(null, self.result);
            return;
        }
        self.updateMETA(self.meta);
        var processBrdFile = function (err, brdFileContents) {
            if (err) {
                self.createMessage(null, '' + err, 'error');
                self.result.setSuccess(false);
                return callback(null, self.result);
            }

            // TODO

            saveAndFinish(null);
        };
        self.blobClient.getObject(config.brdFile, processBrdFile);
    };

    return BrdImporter;
});
