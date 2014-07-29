echo off
where node
if %ERRORLEVEL% == 0 (
    echo See app.log file for more information.
    node app.js > app.log 2>&1
    for /f %%a in ('type app.log ^| find /c /i "Error: Cannot find module"') do set err=%%a
    
    if "%err%" GTR "0" (
        echo ERROR: Please try to update the libraries by running update_libraries.cmd first.
        pause
    )
) else (
	echo ERROR: node is not in path! Make sure to install node and append it to Path.
	pause
)
