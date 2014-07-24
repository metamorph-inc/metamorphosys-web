# WebGME-CyPhy #

[WebGME](https://github.com/webgme/webgme) is a collaborative meta-modeling environment which allows multiple users to simulataneously create and edit models within a single project. It stores the model objects in a Mongo database. WebCyPhy utilizes WebGME, and uses a meta-model similar to that used in the [META toolchain](http://www.isis.vanderbilt.edu/sites/default/files/u352/META_poster_48x36_Clean.pdf) developed by ISIS at Vanderbilt University.

# Starting from Scratch #

1. Install [nodejs](http://nodejs.org/download/)
2. Install [mongodb](http://www.mongodb.org/downloads) if you want to use a local database (recommended for initial use)
3. Clone this webgme-cyphy repository, and change to that directory
4. Install dependencies from command line: `npm install`
5. In a separate process, run `launch_database.cmd` to start a Mongo database (or edit the config.json file to point to an existing mongoip - default is 127.0.0.1)
6. Run `launch_app.cmd` to start a webgme server (or run the application using `node app.js` or `npm start` from command line)

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
- Adding a full directory to the local blob:  While models/objects are stored in the Mongo database, resource files are stored on the server in a 'blob.' When importing a project, it is sometimes necessary to upload several files, and using `node add_dir_to_blob.js samples\RollingWheel` is the way to achieve this.


 


