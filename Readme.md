# Getting started #


1. Install [nodejs](http://nodejs.org/download/)
2. Install [mongodb](http://www.mongodb.org/downloads) if you use a local database
3. Using command line install dependencies: `npm install`
4. Run the application by `node app.js` or `npm start`
5. Open a web browser and visit [localhost:8855](http://localhost:8855) using Chrome or Safari

# Notes #

- The default database is `CyPhy` instead of `multi` (default webgme database)

- On Windows `"C:\Program Files\MongoDB 2.6 Standard\bin\mongod" --dbpath mongodatabase`

- Run `node app.js`
- Visit [localhost:8855](http://localhost:8855) to open the WebGME editor
- Visit [http://localhost:8855/extlib/src/client/](http://localhost:8855/extlib/src/client/) to open CyPhy UI.
- Click on the first icon in the toolbar `Projects`
- Create new project from file
- Name the project as `ADMEditor`
- Drag and drop or select the `meta/ADMEditor_metaOnly.json` file
- After you see `Initializing tree ...` in the tree browser then refresh the page and reopen the project. 

- Adding a full directory to the local blob `node add_dir_to_blob.js samples\RollingWheel`





