# Metamorphosys-Web #
The **Metamorphosys** tools are used for electronics design and analysis.

Development of the web interface is still in progress; we recommend accessing the [*live technology demo*](http://mmsapp.metamorphsoftware.com/dispatch/mmsapp) to take the prototype for a spin.

# Live Technology Demo #
[*Click here to launch the demo*](http://mmsapp.metamorphsoftware.com/dispatch/mmsapp)

Starting from a 1x2 [Ara Module](http://www.projectara.com) template, the technology demo allows you to easily add components to your design and automatically generate a printed circuit board (PCB), with automatic PCB component placement and signal routing.

## Limited Functionality ##
The web interface is still early in development. Check out the [metamorphosys-desktop](https://github.com/metamorph-inc/metamorphosys-desktop) project to use the full capabilities of the **Metamorphosys** tools, including:
- analog and digital behavior simulation
- export-for-manufacturing
- app-to-firmware comms prototyping
- parts cost estimation
- much larger component library (thousands of components)

# Deploying from Scratch #
Alternatively, if you want to get the web interface running your own machine, follow the instructions below.

1. Install [nodejs](http://nodejs.org/download/)
2. Install [mongodb](http://www.mongodb.org/downloads) if you want to use a local database (recommended for initial use)
3. Clone this repository, and navigate
4. Install *nods-js* dependencies with `npm install`
5. In a separate process, start the *MongoDB* server with `mongod --dbpath mongodatabase`, and leave it running
6. Preload the *MongoDB* by running `mongorestore`
7. Start the server with `node app.js` or `npm start`
8. _(optional):_ To set up a worker (needed for running analysis), install or compile the *metamorphosys-desktop* tools, and then follow the README.md at `/node_modules/webgme-domain-tools/executor_worker`.

### Launching the Editor Interface ###
Create a new project by visiting [localhost:8855/rest/external/copyproject/](http://localhost:8855/rest/external/copyproject)

Each project has a unique URL. Save that URL to return to the project later.
