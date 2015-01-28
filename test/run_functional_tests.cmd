Setlocal EnableDelayedExpansion

@rem n.b. npm scripts are .cmd files that call "exit", when they should be using "exit /b". Use cmd /c to isolate this script from them

cd %~dp0..

where forever || exit /b !ERRORLEVEL!

del cyphy_functional_server_*.log

set PATH=%PATH%;c:\Program Files\MongoDB 2.6 Standard\bin
mongo CyPhyFunctional --eval "printjson(db.dropDatabase())"

cmd /c forever stop cyphy_functional_server

cmd /c forever start --uid cyphy_functional_server -l %CD%\cyphy_functional_server_forever.log -o cyphy_functional_server_1.log -e cyphy_functional_server_2.log  app.js || exit /b !ERRORLEVEL!

cmd /c npm run test_functional
set TEST_ERRORLEVEL=%ERRORLEVEL%

cmd /c forever stop cyphy_functional_server || exit /b !ERRORLEVEL!

exit /b %TEST_ERRORLEVEL%
