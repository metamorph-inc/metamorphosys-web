Contains exported snapshots of meta models.
Applications can load and import these meta models if the projects do not exist in the database.

# How to Update the Metamodel
1. Import meta/ADMEditor_metaOnly.json
2. Make changes
3. Export the project back to meta/ADMEditor_metaOnly.json
4. node utils/update_meta.js and update test/models/SimpleModelica.json manually (through import, refresh lib, export)
5. You may need to update the regression data: 
uncomment // writeRegressionJson(); x2, run the tests, copy the .json files to test\models\acm\unit and adm\unit, then run node test\models\combine_templates.js
6. Wipe out your mongodb
7. mongorestore
8. using classic WebGME interface, update the metalib for the *Template_Module_1x2*
9. mongodump