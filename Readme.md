# Metamorphosys-Web #
The **Metamorphosys** tools are used for electronics design and analysis.

Development of the web interface is still in progress; we recommend accessing the [*live technology demo*](http://mmsapp.metamorphsoftware.com/dispatch/mmsapp) to take the prototype for a spin.

# Deploying from Scratch #
If you want to get the web server running your own machine, follow the instructions below.

1. Install [nodejs](http://nodejs.org/download/)
2. Install [mongodb](http://www.mongodb.org/downloads) if you want to use a local database (recommended for initial use)
3. Clone this repository, and navigate to your local copy
4. Recommended: update npm. On Windows, with an elevated command prompt ("Run as Administrator"): `pushd C:\Program Files\nodejs & npm install npm@latest & popd`
5. Install `gulp` globally: `npm install -g gulp@~3.8.7` (must be elevated on Windows)
6. Install *node-js* dependencies with `npm install`
7. run `gulp compile-all`
8. In a separate process, start the *MongoDB* server with `mongod --dbpath mongodatabase`, and leave it running
9. Preload the *MongoDB* by running `mongorestore`
10. Start the server with `node app.js` or `npm start`
11. _(optional):_ To set up a worker (needed for running analysis), install or compile the *metamorphosys-desktop* tools, and then follow the README.md at `/node_modules/webgme/src/server/middleware/executor/worker`.
12. Open the example project at http://localhost:8855/#/editor/Template_Module_1x2

(To access the original webgme interface, go to http://localhost:8855/extlib/node_modules/webgme/src/client/ )

### Launching the Editor Interface ###
Create a new project by visiting [http://localhost:8855/#/editor/Template_Module_1x2](http://localhost:8855/#/editor/Template_Module_1x2)

Each project has a unique URL. Save that URL to return to the project later.

### Running Tests ###
`npm run test_all`

##### Protractor Tests #####
1. Start `mms-webcyphy` using the instructions above
2. `webdriver-manager start` (and leave running in background)
3. `protractor protractor_conf.js`