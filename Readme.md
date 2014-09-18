# WebGME-CyPhy #

[WebGME](https://github.com/webgme/webgme) is a collaborative meta-modeling environment which allows multiple users to simulataneously create and edit models within a single project. It stores the model objects in a Mongo database. WebCyPhy utilizes WebGME, and uses a meta-model similar to that used in the [META toolchain](http://www.isis.vanderbilt.edu/sites/default/files/u352/META_poster_48x36_Clean.pdf) developed by ISIS at Vanderbilt University.

# Starting from Scratch #

1. Install [nodejs](http://nodejs.org/download/)
2. Install [mongodb](http://www.mongodb.org/downloads) if you want to use a local database (recommended for initial use)
3. Clone this [webgme-cyphy repository](https://github.com/webgme/webgme-cyphy), and change to that directory on your machine
4. Install dependencies listed in [package.json](https://github.com/webgme/webgme-cyphy/blob/master/package.json)
 - From command line: `npm install`
 - [`install_script.cmd`](https://github.com/webgme/webgme-cyphy/blob/master/install_script.cmd) will also install the dependencies
5. In a separate process, run [`launch_database.cmd`](https://github.com/webgme/webgme-cyphy/blob/master/launch_database.cmd) to start a Mongo database 
 - Or: edit the [config.json](https://github.com/webgme/webgme-cyphy/blob/master/config.json) file to point the server to an existing mongoip - the default Mongo IP is 127.0.0.1
6. Start the WebGME server 
 - Run [`launch_app.cmd`](https://github.com/webgme/webgme-cyphy/blob/master/launch_app.cmd)
 - From command line: `node app.js` or `npm start`

For more details, consult the [documentation](https://github.com/webgme/webgme-cyphy/blob/master/doc/CyPhy-WebGME.md).

## 2 ways to visualize models using WebCyPhy ##
### Option A ###
__This interface is under development__. Visit [localhost:8855/extlib/src/client/](http://localhost:8855/extlib/src/client/) to open the domain-specific WebCyPhy UI. This option will automatically import the meta model as you visit the page and creates the 'ADMEditor project' 

### Option B ###
Visit [localhost:8855](http://localhost:8855) to open the default WebGME editor
- Click on the first icon in the toolbar `Projects`
- Create new project from file
- Name the project `ADMEditor`
- Select the `meta/ADMEditor_metaOnly.json` file - you can browse and select the file or drag-and-drop it to the dialogue box

# Notes #

## Database ##
- The default database is `CyPhy` instead of `multi` (default webgme database)
- On Windows `"C:\Program Files\MongoDB 2.6 Standard\bin\mongod" --dbpath mongodatabase`


## Utils ##
- Adding a full directory to the local blob:  While models/objects are stored in the Mongo database,their associated resource files are stored on the WebGME server in the 'blob.' When importing a project, it is sometimes necessary to upload multiple resource files for each object in the project, and using `node add_dir_to_blob.js samples\RollingWheel` is the way to achieve this.

# Building library #

`node_modules/gulp/bin/gulp.js compile-all`

Development mode `node_modules/gulp/bin/gulp.js dev`

Visit `dist/docs/cyphy-components-docs.html`


 


