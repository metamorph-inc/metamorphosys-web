# WebGME-CyPhy #

[WebGME](https://github.com/webgme/webgme) is a collaborative meta-modeling environment which allows multiple users to simulataneously create and edit models within a single project. It stores the model objects in a Mongo database. WebCyPhy utilizes WebGME, and uses a meta-model similar to that used in the [META toolchain](http://www.isis.vanderbilt.edu/sites/default/files/u352/META_poster_48x36_Clean.pdf) developed by ISIS at Vanderbilt University.

# Starting from Scratch #

1. Install [nodejs](http://nodejs.org/download/)
2. Install [mongodb](http://www.mongodb.org/downloads) if you want to use a local database (recommended for initial use)
3. Clone this webgme-cyphy repository, and change to that directory
4. Install dependencies from command line: `npm install`
5. In a separate process, run `launch_database.cmd` to start a Mongo database (or edit the config.json file to point to an existing mongoip - default is 127.0.0.1)
6. Run `launch_app.cmd` to start a webgme server (or run the application using `node app.js` or `npm start` from command line)
7. Open a web browser and visit [localhost:8855](http://localhost:8855) (Developers test using Chrome and Safari)

# Notes #

## Database ##
- The default database is `CyPhy` instead of `multi` (default webgme database)
- On Windows `"C:\Program Files\MongoDB 2.6 Standard\bin\mongod" --dbpath mongodatabase`

## App ##
- Run `node app.js`

### Option A ###
Visit [http://localhost:8855/extlib/src/client/](http://localhost:8855/extlib/src/client/) to open CyPhy UI. __This site is still under  development__
- as you visit the page the meta model is automatically imported for you and `ADMEditor` project is created.

### Option B ###
Visit [localhost:8855](http://localhost:8855) to open the WebGME editor
- Click on the first icon in the toolbar `Projects`
- Create new project from file
- Name the project as `ADMEditor`
- Drag and drop or select the `meta/ADMEditor_metaOnly.json` file

## Utils ##
- Adding a full directory to the local blob `node add_dir_to_blob.js samples\RollingWheel`





