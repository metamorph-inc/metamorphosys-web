Contains exported snapshots of meta models.
Applications can load and import these meta models if the projects do not exist in the database.

# How to Update the Metamodel
1. Import meta/ADMEditor_metaOnly.json
2. Make changes
3. Export the project back to meta/ADMEditor_metaOnly.json
4. node utils/update_meta.js and update test/models/SimpleModelica.json manually (through import, refresh lib, export)
5. *If tests fail,* you may need to update the regression data: 
uncomment // writeRegressionJson(); from /test/lib/plugins/ADMEditor/AdmImporter/AdmImporterTestLib.js and /test/lib/plugins/ADMEditor/AcmImporter/AcmImporterTestLib.js, run the tests, copy the generated .json files from the repository root directory to test\models\acm\unit and adm\unit, then run node test\models\combine_templates.js. Then re-comment writeRegressionJson();
6. Wipe out your mongodb
7. mongorestore
8. using classic WebGME interface, update the metalib for the *Template_Module_1x2*
9. mongodump

# How to Update the Tests
1. Do the Metamodel stuff first if there's a meta change
2. Modify your input ADM and/or ACM files
3. node test\models\combine_templates.js
4. uncomment // writeRegressionJson(); from /test/lib/plugins/ADMEditor/AdmImporter/AdmImporterTestLib.js and /test/lib/plugins/ADMEditor/AcmImporter/AcmImporterTestLib.js
5. run the tests
6. Copy the generated .json files from the repository root directory to test\models\<acm or adm>\unit, as appropriate
7. Run node test\models\combine_templates.js again to update the combined regression data that the tests run against

