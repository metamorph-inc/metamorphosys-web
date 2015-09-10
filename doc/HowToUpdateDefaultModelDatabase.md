set PATH=%PATH%;c:\Program Files\MongoDB 2.6 Standard\bin\

Step 1: Clean repo and restore default database.
    
    git clean -xdf blob-local-storage
    mongorestore --drop --db CyPhy --collection Template_Module_1x2 dump/CyPhy/Template_Module_1x2.bson

Run mms-webcyphy

Only if you're importing platform from desktop model

    Run tonkalib/utils/export_for_web.py on your .mga file

    Open Template_Module_1x2 at http://localhost:8855/extlib/node_modules/webgme/src/client/
    If you're replacing stuff, delete the stuff you're going to be replacing
    Run plugin ProjectImporter (if it doesn't appear in the plugin list, add ProjectImporter to the RootFolder plugin list and refresh)
    Select all files in [.mga folder]/export, drag-n-drop to the plugin config
    Run plugin
    Delete Components folder

    Move each testbench into a folder named after the design
    Rename each testbench based on type: ["Analog Electronic Simulation", "Place and Route", "Cost Estimation", "CAD PCB"]

Lay out your stuff: localhost:8855/#/editor/Template_Module_1x2/master

Squash and clean up WebGME database's commit history

    git clone https://github.com/ksmyth/webgme_cleanup
    cd webgme_cleanup
    npm install
    node index.js --db CyPhy --collection Template_Module_1x2 --squash
    cd ..
    
Remove non-master branches from mongo database (if there are any)

    mongo CyPhy
    db.Template_Module_1x2.remove({_id: /^\*(?!(master|info))/})
    exit

    mongodump

Add all the stuff

    git add -f dump/CyPhy/Template_Module_1x2.bson
    git add -f --all blob-local-storage


Test everything

mongorestore --drop --db CyPhy --collection Template_Module_1x2 dump/CyPhy/Template_Module_1x2.bson
^^^ if you have to go back and fix anything

commit mms-webcyphy changes