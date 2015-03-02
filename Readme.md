# Metamorphosys-Web #
The **Metamorphosys** tools are used for electronics design and analysis.

Development of the web interface is still in progress; we recommend accessing the [*live technology demo*](http://mmsapp.metamorphsoftware.com/dispatch/mmsapp) to take the prototype for a spin.

# Deploying from Scratch #
If you want to get the web server running your own machine, follow the instructions below.

1. Install [nodejs](http://nodejs.org/download/)
2. Install [mongodb](http://www.mongodb.org/downloads) if you want to use a local database (recommended for initial use)
3. Clone this repository, and navigate
4. Install *node-js* dependencies with `npm install`
5. run `gulp compile-all`
6. In a separate process, start the *MongoDB* server with `mongod --dbpath mongodatabase`, and leave it running
7. Preload the *MongoDB* by running `mongorestore`
8. Start the server with `node app.js` or `npm start`
9. _(optional):_ To set up a worker (needed for running analysis), install or compile the *metamorphosys-desktop* tools, and then follow the README.md at `/node_modules/webgme-domain-tools/executor_worker`.
10. Open the example project at http://localhost:8855/extlib/public/apps/mmsApp/#/createDesign/Template_Module_1x2

### Launching the Editor Interface ###
Create a new project by visiting [localhost:8855/rest/external/copyproject/](http://localhost:8855/rest/external/copyproject)

Each project has a unique URL. Save that URL to return to the project later.