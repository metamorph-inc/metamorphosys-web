echo off
where node
if %ERRORLEVEL% == 0 (
    node app.js
    if %ERRORLEVEL% == 0 (
        echo Application was stopped.
    ) else (
        echo ERROR: Please try to ypdate the libraries by running update_libraries.cmd first.
        pause
    )
) else (
	echo ERROR: node is not in path! Make sure to install node and append it to Path.
	pause
)
