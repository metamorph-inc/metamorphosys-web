echo off
echo Updating WebGME libraries: > install.log
date /t >> install.log
echo %TIME% >> install.log
where npm >> install.log
where node >> install.log
if %ERRORLEVEL% == 0 (
    echo #### npm install #### >> install.log
	npm install >> install.log
    if %ERRORLEVEL% == 0 (
        echo #### npm install webgme #### >> install.log
        npm install webgme >> install.log
        if %ERRORLEVEL% == 0 (
            echo #### npm install webgme-domain-tools #### >> install.log
            npm install webgme-domain-tools >> install.log
        ) else (
            echo ERROR: npm install webgme failed!
            pause
        )
    ) else (
        echo ERROR: npm install failed!
        pause
    )
) else (
    echo ERROR: npm and/or node is not in path! Make sure to install node and select the npm option. >> install.log
	echo ERROR: npm and/or node is not in path! Make sure to install node and select the npm option.
	pause
)