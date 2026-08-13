@echo off
setlocal
set "PATH=C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs;%PATH%"
where npm.cmd >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  npm.cmd run dev
  exit /b %ERRORLEVEL%
)
set "VS_NPM=C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs\npm.cmd"
if exist "%VS_NPM%" (
  call "%VS_NPM%" run dev
  exit /b %ERRORLEVEL%
)
echo No se encontro npm. Instala la carga de trabajo de Node.js en Visual Studio.
exit /b 1
