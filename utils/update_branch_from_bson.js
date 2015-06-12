'use strict';

var BSON_FILE = 'dump/CyPhy/Template_Module_1x2.bson';
var projectName = 'Template_Module_1x2';
var branchIds = ['*master'];
var mongoUri = 'mongodb://localhost/CyPhy'/*CONFIG.mongo.uri*/;


var BSONStream = require('bson-stream');
var mongodb = require('mongodb');
var path = require('path');
var fs = require('fs');

var rs = fs.createReadStream(BSON_FILE);
var fatal = function (err) {
    console.log('Fatal error ' + err);
    process.exit(1);
};

mongodb.MongoClient.connect(mongoUri, {
    db: {
        'w': 1,
        'native_parser': true
    },
    server: {
        'auto_reconnect': true,
        'poolSize': 20,
        socketOptions: {
            keepAlive: 1
        }
    }
}, function (err, db) {
    if (err) {
        return fatal(err);
    }
    var oldFatal = fatal;
    fatal = function (err) {
        db.close();
        if (err) {
            oldFatal(err);
        }
    };

    db.createCollection(projectName, {}, function (err, collection) {
        if (err) {
            return fatal(err);
        }
        var bsons = rs.pipe(new BSONStream());
        var pending = 1;
        var done = function (err) {
            if (err) {
                done = function () {
                };
                return fatal(err);
            }
            pending--;
            if (pending === 0) {
                //callback(null, projectName);
                db.close();
                console.log('Success');
                process.exit(0);
            }
        };
        bsons.on('data', function (obj) {
            if (branchIds.indexOf(obj._id) !== -1) {
                pending++;
                console.log(JSON.stringify(obj));
                collection.update({_id: obj._id}, obj, function (err) {
                    done(err);
                });
            }
        });
        bsons.on('end', function (err) {
            done(err);
        });
    });
});
