:: The hash printed to the log should be:
::  - download: localhost:8855/rest/blob/download/ed3320752e9598774183d92a0600b9c53d85d3c2
:: If is is wrong, the new hash should be copied to ".\src\plugins\ADMEditor\GenerateDashboard\GenerateDashboard.js" line 32

echo off
where node
if %ERRORLEVEL% == 0 (
    node add_dir_to_blob.js blob-resources/dashboard
) else (
	echo ERROR: node is not in path! Make sure to install node and append it to Path.
	pause
)
