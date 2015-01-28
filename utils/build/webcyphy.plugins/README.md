# Building guidelines

## webcyphy.plugins.build

   * webcyphy.plugins.build.js is currently not generated automatically during npm updates so whenever you update libraries run it.
   * The makefile to build webcyphy.plugins.build.js is build\cbuild.js. To build you have to use the requirejs's optimizer with the cbuild.js make file.
```
    //example executing from build directory - works on 
    node ./node_modules/requirejs/bin/r.js -o ./utils/build/webcyphy.plugins/cbuild.js
```
   * Please note that in some cases you may also update the cbuild.js (with the new paths for example).
   * To provide a new class through this module you have to update webcyphy.plugins.build.js module

