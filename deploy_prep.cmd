Setlocal EnableDelayedExpansion
@echo on

rd /s/q node_modules
del npm-shrinkwrap.json
cmd /c npm install --production || exit /b !ERRORLEVEL! 
cmd /c npm shrinkwrap || exit /b !ERRORLEVEL! 
node munge_shrinkwrap.js || exit /b !ERRORLEVEL!
type npm-shrinkwrap_munge.json > npm-shrinkwrap.json
cmd /c npm install || exit /b !ERRORLEVEL!
gulp compile-all  || exit /b !ERRORLEVEL!
