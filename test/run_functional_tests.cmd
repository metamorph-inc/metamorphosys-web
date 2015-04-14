Setlocal EnableDelayedExpansion

@rem n.b. npm scripts are .cmd files that call "exit", when they should be using "exit /b". Use cmd /c to isolate this script from them

cd %~dp0..

set PATH=%PATH%;c:\Program Files\MongoDB 2.6 Standard\bin
mongo CyPhyFunctional --eval "printjson(db.dropDatabase())" || exit /b !ERRORLEVEL!

cmd /c npm run test_functional
exit /b %ERRORLEVEL%
