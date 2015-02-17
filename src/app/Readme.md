## CyPhy applications ##

This directory contains a few cyphy specific applications.

If you wish to create a new one the `sample` application is a good starting point for you.

1. serve webgme `node app.js`
2. visit `http://localhost:8855/extlib/src/app/sample/`
3. take a look at the source code at `src/app/sample/*`
    - `index.html` - main entry point downloads all libraries/scripts/css files
    - `app.js` - main javascript entry point for the application
    - `views/MyView` - an example how to create and organize views for your application

### Creating a new application ###

1. duplicate the entire `sample` directory as `my-new-app` for instance
2. Add your library dependencies (which you do not require with Browserify) in libs.json
3. use `gulp.js register-watchers` to continuously build your app, your app is compiled into the `public/app` directory
    - `public/apps//my-new-app-app/...`
   If you would not want to get your app built by this command, add your app's name to `doNotCompileApps` in gulfile.js.
4. change your application dependency in `app.js` from `'cyphy.sample.templates'` to `'cyphy.my-new-app.templates'`


### Developing an application ###
1. start the webgme server (provides client library and database connection) `node app.js` in the root directory
2. visit `http://localhost:8855/extlib/src/app/my-new-app/`
3. continue changing and developing your app in the source directory `src/app/my-new-app`

Notes:
- for more complex application see the `default` application
- use cyphy domain specific `ui-components` and `services` from `src/library/*`
- application specific views, services, directives, controllers should be within your application directory
