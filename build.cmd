SetLocal EnableDelayedExpansion

rem npm install || exit /b !ERRORLEVEL!
node src\plugins\ADMEditor\TestBenchRunner\Templates\combine_templates.js || exit /b !ERRORLEVEL!
node test\models\combine_templates.js || exit /b !ERRORLEVEL!
node ./node_modules/requirejs/bin/r.js -o ./utils/build/webcyphy.plugins/cbuild.js || exit /b !ERRORLEVEL!
gulp compile-all
