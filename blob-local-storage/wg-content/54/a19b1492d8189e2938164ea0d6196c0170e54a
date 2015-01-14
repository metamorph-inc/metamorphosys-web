echo off
pushd %~dp0
%SystemRoot%\SysWoW64\REG.exe query "HKLM\software\META" /v "META_PATH"
 
SET QUERY_ERRORLEVEL=%ERRORLEVEL%
 
IF %QUERY_ERRORLEVEL% == 0 (
    FOR /F "skip=2 tokens=2,*" %%A IN ('%SystemRoot%\SysWoW64\REG.exe query "HKLM\software\META" /v "META_PATH"') DO SET META_PATH=%%B)
)
IF %QUERY_ERRORLEVEL% == 1 (
    echo on
    echo "META tools not installed." >> _FAILED.txt
    echo "META tools not installed."
    exit /b %QUERY_ERRORLEVEL%
)

"%META_PATH%\bin\LayoutSolver.exe" layout-input.json layout.json %*
SET LAYOUT_ERRORLEVEL=%ERRORLEVEL%
IF %LAYOUT_ERRORLEVEL% neq 0 (
	echo on
	echo "Layout Solver Failed." >> _FAILED.txt
	echo "Layout Solver Failed."
	exit /b %LAYOUT_ERRORLEVEL%
)

"%META_PATH%\bin\BoardSynthesis.exe" schema.sch layout.json
SET SYNTH_ERRORLEVEL=%ERRORLEVEL%
IF %SYNTH_ERRORLEVEL% neq 0 (
	echo on
	echo "Board Synthesis Failed." >> _FAILED.txt
	echo "Board Synthesis Failed."
	exit /b %SYNTH_ERRORLEVEL%
)

popd
